import React from 'react';
import ReactDOM from 'react-dom';
import * as Cmd from './Cmd';


const logger = Cmd.middleware((props, cmdMod, cmd) => {
  console.log('Exec: ', `${cmd.id} / ${cmd.name}`);
  return [cmd];
});

const runInit = (initFn, shared) => {
  const subscribe = (model, cmd) => ({
    model, cmd
  });

  const initRunner = (prevLeaf, middleware, subInit, ...args) => {
    const nextLeaf = { shared, middleware, prevLeaf, children: [] };
    const nest = initRunner.bind(null, nextLeaf);
    const res = subInit({ nest, shared, subscribe }, ...args);
    const data = res.model ? res : { model: res };
    nextLeaf.data = data;
    nextLeaf.nest = nest;
    prevLeaf.children.push(nextLeaf);
    return data.model;
  };

  const rootNode = { children: [] };
  return {
    model: initRunner(rootNode, logger, initFn),
    meta: rootNode.children[0]
  };
};

const runView = (model, view) => {
  return <div>Hello!</div>
};

const execChain = (chain, meta, cmd) => {
  let execCommands = [];
  let stop = false;

  for (let j = 1; j <= chain.length; j++) {
    const currCmd = j < chain.length ? chain[j].middleware : cmd;
    const currMeta = j < chain.length ? chain[j] : meta;

    for (let i = 0; i < j; i++) {
      const midMeta = chain[i];
      const res = midMeta.middleware.exec(
        midMeta.data.model, midMeta.shared, midMeta.nest,
        currMeta.data.model, currCmd
      );

      const addCmds = res.filter((x) => x.id !== currCmd.id);
      stop = res.length === addCmds.length;
      execCommands = execCommands.concat({ cmds: addCmds, meta: midMeta });
    }
    if (stop) break;
  }

  if (!stop) {
    execCommands.push({ meta, cmds: [cmd] });
  }

  for (let i = 0; i < execCommands.length; i++) {
    const data = execCommands[i];
    for (let j = 0; j < data.cmds.length; j++) {
      data.cmds[j].exec(data.meta.data.model, data.meta.shared, data.nest);
    }
  }
};

const execMeta = (meta, chain = []) => {
  const nextChain = chain.concat(meta);

  if (meta.data && (meta.data.command || meta.data.port)) {
    const exec = (cmd) => execChain(nextChain, meta, cmd);
    const shared = meta.shared;
    const model = meta.data.model;

    meta.data.command && exec(meta.data.command);
    meta.data.port && meta.data.port({ exec, model, shared });
  }

  meta.children.forEach((x) => execMeta(x, nextChain));
};

export const start = ({
  view, mount,
  shared: sharedInit,
  app: appInit
}) => {
  const shared = runInit(sharedInit);
  const app = runInit(appInit, shared.model);
  execMeta(shared.meta);
}
