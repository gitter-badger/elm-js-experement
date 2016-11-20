import React from 'react';
import ReactDOM from 'react-dom';
import { EventEmitter } from 'events';
import * as Cmd from './Cmd';
import { nextId } from './utils';


const logger = Cmd.middleware((props, cmdMod, cmd) => {
  console.log('Exec:', `${cmd.id} / ${cmd.name}`);
  return [ cmd ];
});


const runInit = (initFn, shared) => {
  const subscribe = (model, cmd) => ({
    model, cmd
  });

  const initRunner = (prevLeaf, middleware, subInit, ...args) => {
    const nextLeaf = Object.assign(
      new EventEmitter(),
      { shared, middleware, prevLeaf, children: {} }
    );
    const nest = initRunner.bind(null, nextLeaf);
    const res = subInit({ nest, shared, subscribe }, ...args);
    const data = res.model ? res : { model: res };
    Object.defineProperty(data.model, '_id', {
      value: nextId(),
      enumerable: false,
      configurable: false
    });
    nextLeaf.data = data;
    nextLeaf.nest = nest;
    nextLeaf.on('shortUpdate', (id) => nextLeaf.emit('fullUpdate', id));
    nextLeaf.on('fullUpdate', (id) => prevLeaf.emit('fullUpdate', id));
    prevLeaf.children[data.model._id] = nextLeaf;
    return data.model;
  };

  const rootNode = { children: {}, emit: () => {} };
  const model = initRunner(rootNode, logger, initFn);
  return { model, meta: rootNode.children[model._id] };
};


const execView = (meta, sharedMeta, View, chain = []) => {
  const nextChain = chain.concat(meta);

  const nest = (model, mid, subView) => {
    const subMeta = meta.children[model._id];
    return execView(subMeta, sharedMeta, subView, nextChain);
  }

  const exec = (cmd) => (...args) => {
    if (cmd.bindExec) {
      cmd.bindExec(cmd, ...args);
    } else {
      execChain(nextChain, { meta, cmd, args });
    }
  };

  class ViewComponent extends React.Component {
    updateView = () => {
      this.forceUpdate();
    };

    componentWillMount() {
      meta.on('shortUpdate', this.updateView);
      sharedMeta.on('fullUpdate', this.updateView);
    }

    componentWillUnmount() {
      meta.removeListener('shortUpdate', this.updateView);
      sharedMeta.removeListener('fullUpdate', this.updateView);
    }

    shuoldComponentUpdate() {
      return false;
    }

    render() {
      return (
        <View
          model={meta.data.model}
          shared={meta.shared}
          nest={nest}
          exec={exec}
        />
      );
    }
  }
  return <ViewComponent />
};


const execChain = (chain, elem) => {
  const queue = chain.map(x => ({
    meta: x,
    cmd: x.middleware,
    terminator: x.middleware
  }));
  queue.push(elem);

  const checkCommand = ({ meta, cmd, terminator }) => {
    let stopped = false;
    const childCmds = [];

    for (let i = 0; i < chain.length; i++) {
      const midMeta = chain[i];
      const mid = midMeta.middleware;
      if (mid === terminator) {
        break;
      }

      const res = mid.exec(
        midMeta.data.model, midMeta.shared, midMeta.nest,
        meta.data.model, cmd
      );
      const addCmds = res
        .filter(x => x.id !== cmd.id)
        .map(x => ({ cmd: x, meta: meta, terminator: meta.middleware }));

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
    const res = elem.cmd.exec(elem.meta.data.model, elem.meta.shared, elem.meta.nest);
    if (elem.cmd instanceof Cmd.BatchCmd) {
      execCmds.push(...res.map(x => ({ ...elem, cmd: x })));
    }
    if (elem.cmd instanceof Cmd.UpdateCmd) {
      elem.meta.emit('shortUpdate', elem.meta.data.model._id);
    }
  }

  execCmds.forEach(x => execChain(chain, x));
};


const execMeta = (meta, shared, chain = []) => {
  const nextChain = chain.concat(meta);
  const exec = (cmd, ...args) => {
    if (cmd.bindExec && cmd.bindExec !== exec) {
      cmd.bindExec(cmd, ...args)
    } else {
      execChain(nextChain, { meta, cmd, args });
    }
  };

  if (meta.data.bindCommands) {
    const commands = meta.data.bindCommands;
    Object.keys(commands).forEach(k => {
      commands[k].bindExec = exec;
    });
  }

  if (meta.data && (meta.data.command || meta.data.port)) {
    const shared = meta.shared;
    const model = meta.data.model;

    meta.data.command && exec(meta.data.command);
    meta.data.port && meta.data.port({ exec, model, shared });
  }

  if (meta.data.subs) {
    const subs = Array.isArray(meta.data.subs) ? meta.data.subs : [meta.data.subs];
    subs.forEach(sub => {
      exec(sub.cmd);
      shared.on('fullUpdate', id => id === sub.model._id && exec(sub.cmd));
    });
  }

  Object.keys(meta.children)
    .forEach((k) => execMeta(meta.children[k], shared, nextChain));
};


export const start = ({
  view, mount,
  shared: sharedInit,
  app: appInit
}) => {
  const shared = runInit(sharedInit);
  const app = runInit(appInit, shared.model);
  execMeta(shared.meta);
  execMeta(app.meta, shared.meta);
  ReactDOM.render(execView(app.meta, shared.meta, view), mount);
}
