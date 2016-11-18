import React from 'react';
import ReactDOM from 'react-dom';


export class Cmd {
  static middleware() {
    return {
      on: () => {
        return Cmd.middleware();
      }
    }
  }

  static subscription() {

  }

  static execLatest() {

  }

  static update() {

  }

  static batch() {

  }

  static nope() {

  }
}


export class Task {
  success() {

  }

  fail() {

  }
}


export class Process {
  static executor() {

  }

  static runInit(initFn, shared) {
    let currentLeaf = { children: [] };

    const subscribe = (model, cmd) => ({
      model, cmd
    });

    const nest = (middelware, subInit, ...args) => {
      const prevLeaf = currentLeaf;
      const nextLeaf = {
        middelware,
        children: [],
        prev: prevLeaf
      };

      currentLeaf = nextLeaf;
      const res = subInit({ nest, shared, subscribe }, ...args);
      const meta = res.model ? res : { model: res };
      currentLeaf = prevLeaf;

      nextLeaf.meta = meta;
      prevLeaf.children.push(nextLeaf);
      return meta.model;
    };

    return {
      model: nest(Process.executor(), initFn),
      meta: currentLeaf
    };
  }

  static runView(model, view) {
    return <div>Hello!</div>
  }

  static start({ shared: sharedInit, app: appInit, view, mount }) {
    const shared = Process.runInit(sharedInit);
    const app = Process.runInit(appInit, shared.model);
    const appElement = Process.runView(app.model, view);
    ReactDOM.render(appElement, mount);
  }
}
