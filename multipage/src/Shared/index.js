// @flow
import type { InitSharedProps, InitModel } from 'mangojuice/types';
import { Cmd } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import * as Intl from 'mangojuice/Intl';
import * as User from './User';
import { Routes } from 'src/routes';


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
  route: nest(Commands.RotuerCmd, Router.init, Routes),
  intl: nest(Commands.IntlCmd, Intl.init),
  user: nest(Commands.UserCmd, User.init)
});
