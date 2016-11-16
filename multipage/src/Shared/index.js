import { Cmd, BaseModel, SharedProps } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import * as Intl from 'mangojuice/Intl';
import * as User from './User';


export class Model extends BaseModel {
  intl: Intl.Model;
  route: Router.Model;
  user: User.Model;
};

export const Commands = {
  IntlCmd: Cmd.middleware(),
  UserCmd: Cmd.middleware(),
  RotuerCmd: Cmd.middleware()
};

export const init = ({ nest } : SharedProps<Model>) =>
  new Model({
    route: nest(Commands.RotuerCmd, Router.init, Routes)
    intl: nest(Commands.IntlCmd, Intl.init),
    user: nest(Commands.UserCmd, User.init)
  });
