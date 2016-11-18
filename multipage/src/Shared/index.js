// @flow
import type { InitSharedProps, InitModel } from 'mangojuice/types';
import { Cmd } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import * as Intl from 'mangojuice/Intl';
import * as User from './User';
import routes from 'src/routes';
import languages from 'src/languages';


export type Model = {
  intl: Intl.Model,
  route: Router.Model,
  user: User.Model
};

export const Commands = {
  IntlCmd: Cmd.middleware(),
  UserCmd: Cmd.middleware(),
  RotuerCmd: Cmd.middleware()
};

export const init = (
  { nest }
  : InitSharedProps
) : InitModel<Model> => ({
  bindCommands: Commands,
  model: {
    route: nest(Commands.RotuerCmd, Router.init, routes),
    intl: nest(Commands.IntlCmd, Intl.init, languages),
    user: nest(Commands.UserCmd, User.init)
  }
});
