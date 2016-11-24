// @flow
import { EventEmitter } from 'events';
import { Cmd, MiddelwareCmd } from './Cmd';
import { nextId } from './utils';


export default class Meta extends EventEmitter {
  constructor(init: Function, shared: Meta, ...args: Array<any>) {
    super();
    this.id = nextId();
    this.children = {};
    this.shared = shared;

    const { model, bindCommands, subs, command, port } = init({
      nest: this.nest,
      shared: shared && shared.model,
      subscribe: this.subscribe
    }, ...args);

    this.port = port;
    this.command = command;
    this.bindCommands = bindCommands;
    this.subs = Array.isArray(subs) || !subs ? subs : [subs];
    this.model = model;

    Object.defineProperty(this.model, '_id', {
      value: nextId(),
      enumerable: false,
      configurable: false
    });
  }

  get sharedModel() {
    return this.shared && this.shared.model;
  }

  nest = (middleware: MiddelwareCmd, init: Function, ...args: Array<any>) => {
    const nestedMeta = new Meta(init, this.shared, ...args);
    nestedMeta.setMiddleware(middleware, this);
    nestedMeta.onGlobalUpdate(this.emitGlobalUpdate);
    this.children[nestedMeta.model._id] = nestedMeta;
    return nestedMeta.model;
  }

  subscribe = (model, cmd) => {
    return { model, cmd };
  }

  emitUpdate = () => {
    this.emit('localUpdate', this.model._id);
    this.emitGlobalUpdate();
  }

  emitGlobalUpdate = (id) => {
    this.emit('globalUpdate', id || this.model._id);
  }

  on(name: string, handler: Function) {
    super.on(name, handler);
    return { stop: () => this.removeListener(name, handler) };
  }

  onLocalUpdate(handler: Function) {
    return this.on('localUpdate', handler);
  }

  onGlobalUpdate(handler: Function) {
    return this.on('globalUpdate', handler);
  }

  setMiddleware(cmd: Cmd, meta: Meta) {
    this.middleware = { cmd, meta };
  }

  execMiddleware(subModel, subCmd: Cmd): Array<Cmd> {
    if (this.middleware) {
      const { cmd, meta } = this.middleware;
      return cmd.exec(meta, subModel, subCmd);
    }
    return [ subCmd ];
  }

  makeSubsciptions(exec) {
    this.subs && this.subs.forEach(sub => {
      exec(sub.cmd);
      this.shared.onGlobalUpdate(id => id === sub.model._id && exec(sub.cmd));
    });
  }
}
