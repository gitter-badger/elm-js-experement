import React from 'react';
import ReactDOM from 'react-dom';


// Internal state
let activeModel = null;
let nextModelId = 0;
let activeMiddleware = null;


const runContext = (model, middleware, fn) => {
  const oldModel = activeModel;
  const oldMiddelware = activeMiddleware;
  activeModel = model;
  activeMiddleware = middleware;
  const result = fn();
  activeModel = oldModel;
  activeMiddleware = oldMiddelware;
  return result;
}

export const Task = {
  create(name, model, command) {
    const middleware = activeMiddleware;
    const val = { name, model, command, args: [] };
    const executor = (...args) => {
      const finalArgs = val.args.concat(args);
      return middleware({ ...val, args: finalArgs });
    };
    executor.with = (...args) => {
      val.args = val.args.concat(args);
      return executor;
    };
    executor.model = (model) => {
      val.model = model;
      return executor;
    }
    return executor;
  }
}

export class Model {
  constructor(values) {
    Object.assign(this, values);
    Object.defineProperty(this, 'observers', {
      value: [],
      enumerable: false,
      configurable: false
    });

    this._id = nextModelId++;
  }

  observe(fn) {
    this.observers.push(fn);
    return { stop: () => {
      const fnIndex = this.observers.indexOf(fn);
      if (fnIndex) {
        this.observers.splice(fnIndex, 1);
      }
    } };
  }

  update(newValues) {
    Object.assign(this, newValues);
    this.observers.forEach(fn => fn());
  }
}

export class Collection {
  constructor(fields) {
    this.fields = fields;
  }

  update(updater) {
    return (model, ...args) => {
      const newValues = updater(model, ...args);
      model.update(newValues);
    };
  }

  create(values) {
    return new Model(values);
  }
}


export class Commander {
  constructor(commands) {
    const id = nextModelId++;

    Object.keys(commands).forEach((k) => {
      Object.defineProperty(this, k, {
        get: function() {
          const name = `${k}.${id}`;
          if (!activeModel) {
            return name;
          }
          const command = commands[k];
          return commands[k].phantom
            ? command(activeModel, activeMiddleware, name)
            : Task.create(name, activeModel, command);
        },
        enumerable: true,
        configurable: false
      });
    });
  }

  static noop() {
    return () => () => {};
  }

  static phantom(command) {
    command.phantom = true;
    return command;
  }

  static batch(commandsFn) {
    return Commander.phantom((model, middleware, name) => (...args) => {
      const commands = runContext(model, middleware, () => commandsFn(model));
      const command = () => commands.forEach(command => command(...args));
      return middleware({ name, command });
    });
  }

  static middleware(handlersObj) {
    return Commander.phantom((model, middleware, name) => (task) => {
      if (!task) {
        return null;
      }

      const handler = handlersObj[task.name] || handlersObj['_'];
      if (!handler) {
        return task;
      }

      const taskWrapper = () => middleware(task);
      const command = () => runContext(model, middleware, () => {
        const res = handler(task.model, taskWrapper);
        if (Array.isArray(res)) {
          res.forEach(x => x());
        } else {
          res();
        }
      });

      return { name, command };
    });
  }
}


export class Viewier {
  constructor(viewFn) {
    class ViewComponent extends React.Component {
      componentWillMount() {
        const { model } = this.props;
        this.observer = model.observe(this.forceUpdate.bind(this));
      }

      componentWillUnmount() {
        this.observer.stop();
      }

      shuoldComponentUpdate() {
        return false;
      }

      render() {
        const showFn = () => viewFn(this.props.model);
        return runContext(this.props.model, this.props.middleware, showFn);
      }
    }
    this.Component = ViewComponent;
  }

  render(model, middleware) {
    const { Component } = this;
    return (
      <Component
        key={model._id}
        model={model}
        middleware={middleware}
      />
    );
  }
}


export const Html = {
  map(modelsVal, middleware, viewObj) {
    const modelsArr = Array.isArray(modelsVal) ? modelsVal : [modelsVal];
    const nextMiddelware = middleware
      ? activeMiddleware.chain(middleware)
      : activeMiddleware;

    return modelsArr.map((model, i) => viewObj.render(model, nextMiddelware));
  }
};

export const Process = {
  createChainedExecutor(parent) {
    const executor = (...args) => {
      return parent(...args);
    };
    executor.chain = (cmd) => {
      const putBack = (...args) => executor(cmd(...args));
      return Process.createChainedExecutor(putBack);
    };
    return executor;
  },

  rootExecutor(task) {
    console.log(task);
    if (task) {
      const args = task.args || [];
      task.command(task.model, ...args);
    }
  },

  start(node, { view, model, cmdRunner }) {
    activeMiddleware = Process.createChainedExecutor(Process.rootExecutor);
    runContext(model, activeMiddleware, cmdRunner)();
    const comp = Html.map(model, null, view);
    ReactDOM.render(comp[0], node);
  }
};
