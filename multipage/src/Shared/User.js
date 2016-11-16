import { Cmd, BaseModel } from 'mangojuice';


export class Model extends BaseModel {
  authorized: Boolean;
  name: String;
}

export const Commands = {
  Login: Cmd.update((model : Model) => {
    update: { authorized: true }
  }),
  Logout: Cmd.update((model : Model) => {
    update: { authorized: false }
  })
};

export const init = () : Model => {
  if (!Model.instance) {
    Model.instance = new Model({
      authorized: false,
      name: ''
    });
    Cmd.bindModel(Commands, Model.instance);
  }
  return Model.instance;
}
