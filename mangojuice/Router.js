// @flow
import type { InitSharedProps, InitModel } from './types';
import { Cmd } from './index';


export type Model = {
  firstTime: Function,
  changed: Function
};

export const Commands = {
};

export const init = (
  { nest }
  : InitSharedProps,
  routes
) : InitModel<Model> => ({
  bindCommands: Commands,
  model: createModel(routes)
});

export const route = (pattern, opts) => {
  return Cmd.nope();
};

const createModel = (routes) => {
  return {
    firstTime() { return true; },
    changed() { return true; }
  };
};
