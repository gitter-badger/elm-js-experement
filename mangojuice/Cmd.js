import { nextId } from './utils';


export class Cmd {
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

export class MiddlewareCmd extends Cmd {
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

export class BatchCmd extends Cmd {
  constructor(genFn) {
    super();
    this._genFn = genFn;
    this._commandFn = this.executor;
  }

  executor = (props, ...args) => {
    return this._genFn(props, ...args);
  };
};

export class UpdateCmd extends Cmd {
  constructor(updateFn) {
    super();
    this._updateFn = updateFn;
    this._commandFn = this.executor;
  }

  executor = (props, ...args) => {
    const newFields = this._updateFn(props, ...args);
    Object.assign(props.model, newFields);
    return newFields;
  };
};


export const middleware = (defaultFn) => {
  return new MiddlewareCmd(defaultFn);
};

export const batch = (commandsFn) => {
  return new BatchCmd(commandsFn);
};

export const update = (updaterFn) => {
  return new UpdateCmd(updaterFn);
};

export const subscription = (defaultFn) => {
  return middleware(defaultFn);
};

export const  execLatest = () => {
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
