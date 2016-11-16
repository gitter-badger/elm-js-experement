// @flow
import type { InitSharedProps, InitModel } from '../../../mangojuice/types';
import { Cmd } from '../../../mangojuice';


export type Model = {
  authorized: bool,
  name: string
};

export const Commands = {
  Login: Cmd.update((model : Model) => {
    update: { authorized: true }
  }),
  Logout: Cmd.update((model : Model) => {
    update: { authorized: false }
  })
};

export const init = (
  { nest }
  : InitSharedProps
) : InitModel<Model> => ({
  bindCommands: Commands,
  model: {
    authorized: false,
    name: ''
  }
});
