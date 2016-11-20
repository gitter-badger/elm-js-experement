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
    nextLeaf.on('shortUpdate', () => nextLeaf.emit('fullUpdate'));
    nextLeaf.on('fullUpdate', () => prevLeaf.emit('fullUpdate'));
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

  const exec = (cmd) => (...args) => (
    execChain(nextChain, { meta, cmd })
  );

  class ViewComponent extends React.Component {
    componentWillMount() {
      this.forceUpdate = this.forceUpdate.bind(this);
      meta.on('shortUpdate', this.forceUpdate);
      sharedMeta.on('fullUpdate', this.forceUpdate);
    }

    componentWillUnmount() {
      meta.removeListener('shortUpdate', this.forceUpdate);
      sharedMeta.removeListener('fullUpdate', this.forceUpdate);
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
      elem.meta.emit('shortUpdate');
    }
  }

  execCmds.forEach(x => execChain(chain, x));
};


const execMeta = (meta, chain = []) => {
  const nextChain = chain.concat(meta);

  if (meta.data.bindCommands) {
    const commands = meta.data.bindCommands;
    Object.keys(commands).forEach(k => {
      commands[k].model = meta.data.model;
    });
  }

  if (meta.data && (meta.data.command || meta.data.port)) {
    const exec = (cmd) => execChain(nextChain, { meta, cmd });
    const shared = meta.shared;
    const model = meta.data.model;

    meta.data.command && exec(meta.data.command);
    meta.data.port && meta.data.port({ exec, model, shared });
  }

  Object.keys(meta.children)
    .forEach((k) => execMeta(meta.children[k], nextChain));
};


export const start = ({
  view, mount,
  shared: sharedInit,
  app: appInit
}) => {
  const shared = runInit(sharedInit);
  const app = runInit(appInit, shared.model);
  execMeta(shared.meta);
  execMeta(app.meta);
  ReactDOM.render(execView(app.meta, shared.meta, view), mount);
}
