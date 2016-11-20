import React from 'react';
import ReactDOM from 'react-dom';
import { EventEmitter } from 'events';
import * as Cmd from './Cmd';
import Meta from './Meta';
import { nextId } from './utils';


const logger = Cmd.middleware((props, cmdMod, cmd) => {
  console.log('Exec:', `${cmd.id} / ${cmd.name}`);
  return [ cmd ];
});


const execView = (meta, View, chain = []) => {
  const nextChain = chain.concat(meta);

  const nest = (model, mid, subView) => {
    const subMeta = meta.children[model._id];
    return execView(subMeta, subView, nextChain);
  }

  const exec = (cmd) => (...args) => {
    if (cmd.bindExec) {
      cmd.bindExec(cmd, ...args);
    } else {
      execChain(nextChain, { meta, cmd, args });
    }
  };

  class ViewComponent extends React.Component {
    componentWillMount() {
      this.stopLocal = meta.onLocalUpdate(this.updateView);
      this.stopGlobal = meta.shared.onGlobalUpdate(this.updateView);
    }

    componentWillUnmount() {
      this.stopLocal.stop();
      this.stopGlobal.stop();
    }

    shuoldComponentUpdate() {
      return false;
    }

    updateView = () => {
      this.forceUpdate();
    };

    render() {
      return (
        <View
          model={meta.model}
          shared={meta.sharedModel}
          nest={nest}
          exec={exec}
        />
      );
    }
  }
  return <ViewComponent />
};


const execChain = (chain, elem) => {
  const queue = chain.slice(1).map(x => ({
    ...x.middleware,
    terminator: x.middleware.cmd
  }));
  queue.push(elem);

  const checkCommand = ({ meta, cmd, terminator }) => {
    let stopped = false;
    const childCmds = [];

    for (let i = 0; i < chain.length; i++) {
      const chainMeta = chain[i];
      const middleware = chain[i].middleware || {};
      if (terminator && middleware.cmd === terminator) {
        break;
      }

      const res = chainMeta.execMiddleware(meta.model, cmd);
      const addCmds = res
        .filter(x => x.id !== cmd.id)
        .map(x => ({
          cmd: x,
          meta: middleware.meta,
          terminator: middleware.cmd
        }));

      childCmds.push(...addCmds);
      if (res.length === addCmds.length) {
        stopped = true;
        break;
      };
    }
    return { childCmds, stopped };
  };

  let stopped = false;
  const execCmds = [];
  while(queue.length) {
    const nextElem = queue.shift();
    const res = checkCommand(nextElem);
    execCmds.push(...res.childCmds);
    if (res.stopped) {
      stopped = true;
      break;
    }
  }

  if (!stopped) {
    const res = elem.cmd.exec(elem.meta.model, elem.meta.sharedModel, elem.meta.nest);
    if (elem.cmd instanceof Cmd.BatchCmd) {
      execCmds.push(...res.map(x => ({ ...elem, cmd: x })));
    }
    if (elem.cmd instanceof Cmd.UpdateCmd) {
      elem.meta.emitUpdate();
    }
  }

  execCmds.forEach(x => execChain(chain, x));
};


const execMeta = (meta, chain = []) => {
  const nextChain = chain.concat(meta);
  const exec = (cmd, ...args) => {
    if (cmd.bindExec && cmd.bindExec !== exec) {
      cmd.bindExec(cmd, ...args)
    } else {
      execChain(nextChain, { meta, cmd, args });
    }
  };

  if (meta.bindCommands) {
    const commands = meta.bindCommands;
    Object.keys(commands).forEach(k => {
      commands[k].bindExec = exec;
    });
  }

  if (meta.command || meta.port) {
    const shared = meta.sharedModel;
    const model = meta.model;
    meta.command && exec(meta.command);
    meta.port && meta.port({ exec, model, shared });
  }

  meta.makeSubsciptions(exec);
  Object.keys(meta.children).forEach(k =>
    execMeta(meta.children[k], nextChain)
  );
};


export const start = ({
  view, mount,
  shared: sharedInit,
  app: appInit
}) => {
  const shared = new Meta(sharedInit);
  const app = new Meta(appInit, shared);
  execMeta(shared);
  execMeta(app);
  ReactDOM.render(execView(app, view), mount);
}
