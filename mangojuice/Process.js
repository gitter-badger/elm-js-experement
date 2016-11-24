import React from 'react';
import ReactDOM from 'react-dom';
import { EventEmitter } from 'events';
import * as Cmd from './Cmd';
import Meta from './Meta';
import { ViewWrapper } from './View';
import { nextId } from './utils';


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
    const { args = [], meta } = elem;
    const res = elem.cmd.exec(meta, ...args);

    if (elem.cmd instanceof Cmd.BatchCmd) {
      execCmds.push(...res.map(cmd => ({ ...elem, cmd, args: [] })));
    } else if (elem.cmd instanceof Cmd.UpdateCmd && res) {
      meta.emitUpdate();
    } else if (elem.cmd instanceof Cmd.TaskCmd) {
      const exec = cmd => execChain(chain, { ...elem, cmd, args: [] });
      res.then(exec, exec);
    }
  }

  execCmds.forEach(x => execChain(chain, x));
};


const execView = (meta, View, chain = []) => {
  const nextChain = chain.concat(meta);

  const nest = (model, block) => {
    const subMeta = meta.children[model._id];
    return execView(subMeta, block.View, nextChain);
  }

  const exec = (cmd) => (...args) => {
    if (cmd.bindExec) {
      cmd.bindExec(cmd, ...args);
    } else {
      execChain(nextChain, { meta, cmd, args });
    }
  };

  return (
    <ViewWrapper
      key={meta.model._id} View={View} meta={meta}
      nest={nest} exec={exec}
    />
  );
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
    const commandsArr = Array.isArray(meta.bindCommands)
      ? meta.bindCommands : [ meta.bindCommands ];

    commandsArr.forEach(cmds => Object.keys(cmds).forEach(k => {
      cmds[k].bindExec = exec;
    }))
  }

  if (meta.command || meta.port) {
    const shared = meta.sharedModel;
    const model = meta.model;
    meta.command && exec(meta.command);
    meta.port && meta.port({ exec, model, shared, meta });
  }

  meta.makeSubsciptions(exec);
  Object.keys(meta.children).forEach(k =>
    execMeta(meta.children[k], nextChain)
  );
};


export const start = ({
  view, mount,
  shared: { init: sharedInit },
  app: { init: appInit, View }
}) => {
  const shared = new Meta(sharedInit);
  const app = new Meta(appInit, shared);
  execMeta(shared);
  execMeta(app);
  ReactDOM.render(execView(app, View), mount);
}
