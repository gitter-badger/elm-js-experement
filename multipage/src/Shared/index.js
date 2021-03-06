// @flow
import type { InitSharedProps, InitModel } from 'mangojuice/types';
import { Cmd } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import * as Intl from 'mangojuice/Intl';
import * as User from './User';
import * as routes from 'src/routes';
import languages from 'src/languages';


export type Model = {
  intl: Intl.Model,
  route: Router.Model,
  user: User.Model
};

export const Commands = Cmd.debug({
  IntlCmd: Cmd.middleware(),
  UserCmd: Cmd.middleware(),
  RotuerCmd: Cmd.middleware()
});

export const init = (
  { nest }
  : InitSharedProps
) : InitModel<Model> => ({
  bindCommands: Commands,
  model: {
    route: nest(Commands.RotuerCmd, Router, routes),
    intl: nest(Commands.IntlCmd, Intl, languages),
    user: nest(Commands.UserCmd, User)
  }
});
