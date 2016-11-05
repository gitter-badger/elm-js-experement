import { Collection, ViewProps } from '../mangojuice';


export class Model extends Collection {
};

export const Commands = {
};

export const view = ({ model, exec, nest } : ViewProps<Model>) => (
  <div>
    News route
  </div>
);

export const init = (user: User.Model, letter: Object) : Model =>
  new Model();
