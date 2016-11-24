import { nextId } from './utils';
import * as sagaProc from 'redux-saga/lib/internal/proc';


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

  bindArgs(...args) {
    const clone = new this.constructor();
    Object.assign(clone, this);
    clone._args = args;
    return clone;
  }

  exec(meta, ...args) {
    console.log(this.name);
    const { model, sharedModel: shared, nest } = meta;
    if (this._commandFn) {
      const exactArgs = [].concat(this._args || [], args || []);
      return this._commandFn({ model, shared, nest, meta }, ...exactArgs);
    }
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
    return filter(props, cmdModel, cmd).filter(x => x);
  };
};

export class BatchCmd extends Cmd {
  constructor(genFn) {
    super();
    this._genFn = genFn;
    this._commandFn = this.executor;
  }

  executor = (props, ...args) => {
    return this._genFn(props, ...args).filter(x => x);
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

export class TaskCmd extends Cmd {
  constructor(args, debounce = false) {
    super();
    this._executors = {};
    this._debounce = debounce;
    this._commandFn = this.executor;

    if (args.length === 1 && !this._argsGetter) {
      this._argsGetter = args[0];
    } else {
      this.ensureCommands(args);
    }
  }

  ensureCommands(args) {
    let usedArgs = args;
    if (this._argsGetter) {
      usedArgs = this._argsGetter();
    }
    if (usedArgs && usedArgs.length === 3) {
      this._successCmd = usedArgs[0];
      this._failCmd = usedArgs[1];
      this._taskCreator = usedArgs[2];
    } else if (usedArgs) {
      throw new Error('Wrong usage of task cmd');
    }
  }

  executor = (props, ...args) => {
    this.ensureCommands();

    const { model: { _id: modelId } } = props;
    if (this._debounce && this._executors[modelId]) {
      this._executors[modelId].cancel();
    }

    let proc;
    const cancel = () => proc && proc.cancel();
    const done = new Promise((resolve, reject) => {
      try {
        const iterator = this._taskCreator(props, ...args);
        const handleFail = (err) => reject(this._failCmd.bindArgs(err));
        const handleSuccess = (res) => {
          if (res !== sagaProc.TASK_CANCEL) {
            resolve(this._successCmd.bindArgs(res))
          }
        };

        proc = sagaProc.default(iterator);
        proc.done.then(handleSuccess, handleFail);
      } catch (e) {
        reject(this._failCmd.bindArgs(e));
      }
    });

    this._executors[modelId] = { done, cancel };
    return done;
  };
}

export const middleware = (defaultFn) => {
  return new MiddlewareCmd(defaultFn);
};

export const batch = (commandsFn) => {
  return new BatchCmd(commandsFn);
};

export const update = (updaterFn) => {
  return new UpdateCmd(updaterFn);
};

export const execLatest = (...args) => {
  return new TaskCmd(args, true);
};

export const execEvery = (...args) => {
  return new TaskCmd(args);
};

export const subscription = (commandsFn) => {
  return batch(commandsFn);
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
