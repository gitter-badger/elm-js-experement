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

export const init = (
  route: Router.Model,
  user: User.Model,
  intl: Intl.Model
) : Model =>
  new Model();
