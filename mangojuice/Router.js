// @flow
import type { InitSharedProps, InitModel } from './types';
import { Cmd } from './index';


export type Model = {
  firstTime: Function,
  changed: Function,
  switch: Function
};

export const Commands = {
};

export const init = (
  { nest }
  : InitSharedProps,
  routes
) : InitModel<Model> => ({
  bindCommands: Commands,
  model: createModel(routes),
  port: createHistoryHandler(routes)
});

export const route = (pattern, opts) => {
  return Cmd.nope();
};


const createModel = (routes) => {
  return {
    firstTime() { return true; },
    changed() { return true; },
    is() { return true; },
    when(route, fn) { return fn() }
  };
};

const createHistoryHandler = (routes) => {
  return ({ model, exec }) => {
    // You can execute any command here
  };
};
