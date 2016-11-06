import { Collection, ViewProps } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import * as Intl from 'mangojuice/Intl';
import * as User from '../../Shared/User';


export class Model extends Collection {
  intl: Intl.Model;
  route: Router.Model;
  user: User.Model;
};

export const Commands = {
};

export const Messages = {
  title: 'NEWS.TITLE'
};

export const view = ({ model, exec, nest } : ViewProps<Model>) => (
  <div>
    {model.intl.formatMessage(Messages.title)}
  </div>
);

export const init = (
  route: Router.Model,
  user: User.Model,
  intl: Intl.Model
) : Model =>
  new Model({ intl, user, route })
  .depend(intl);
