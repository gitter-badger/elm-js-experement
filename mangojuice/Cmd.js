import { nextId } from './utils';


class Cmd {
  constructor(model, commandFn, args, id) {
    this._id = id || nextId();
    this._model = model;
    this._commandFn = commandFn;
    this._args = args;
  }

  get id() {
    return this._id;
  }

  set model(val) {
    this._model = val;
  }

  bindModel(model) {
    return this.clone(model);
  }

  bindArgs(...args) {
    return this.clone(null, null, args);
  }

  clone(model, cmd, args) {
    return new Cmd(
      model || this._model,
      cmd || this._commandFn,
      args || this._args,
      this._id
    );
  }

  exec(model, shared, nest, ...args) {
    return this._commandFn && this._commandFn({
      model: this._model || model,
      shared, nest
    }, ...(this._args || args));
  }
}

class MiddlewareCmd extends Cmd {
  constructor(defaultFn) {
    super();
    this._cmdMap = {};
    this._commandFn = this.executor;
    this._defaultFilter = defaultFn || ((a, b, cmd) => [cmd]);
  }

  on(cmd, filter) {
    this._cmdMap[cmd.id] = filter;
    return this;
  }

  default(filter) {
    this._defaultFilter = filter;
    return this;
  }

  executor = (props, cmdModel, cmd) => {
    const filter = this._cmdMap[cmd.id] || this._defaultFilter;
    return filter(props, cmdModel, cmd);
  };
};


export const middleware = (defaultFn) => {
  return new MiddlewareCmd(defaultFn);
};

export const subscription = (defaultFn) => {
  return middleware(defaultFn);
};

export const  execLatest = () => {
  return {};
};

export const update = (updaterFn) => {
  return new Cmd(null, (props, ...args) => {
    const newFields = updaterFn(props, ...args);
    Object.assign(props.model, newFields);
    return props.model;
  });
};

export const batch = () => {
  return {};
};

export const nope = () => {
  return new Cmd();
};

export const debug = (commands) => {
  Object.keys(commands).forEach(k => {
    commands[k].name = k;
  });
  return commands;
}
