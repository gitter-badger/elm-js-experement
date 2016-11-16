import { Cmd } from 'mangojuice';
import { InitProps, InitModel } from 'mangojuice/types';


export type Model {
  authorized: Boolean,
  name: String
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
  : InitProps<Model>
) : InitModel<Model> => ({
  bindCommands: Commands,
  model: {
    authorized: false,
    name: ''
  }
});
