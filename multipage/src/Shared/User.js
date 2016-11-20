// @flow
import type { InitSharedProps, InitModel } from 'mangojuice/types';
import { Cmd } from 'mangojuice';


export type Model = {
  authorized: bool,
  name: string
};

export const Commands = Cmd.debug({
  Login: Cmd.update((model : Model) => ({
    authorized: true, name: 'Test User'
  })),
  Logout: Cmd.update((model : Model) => ({
    authorized: false,  name: ''
  }))
});

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
