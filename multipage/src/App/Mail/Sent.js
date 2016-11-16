// @flow
import type { ViewProps, InitProps, InitModel, CmdProps } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import React from 'react';
import { Cmd } from 'mangojuice';
import { MailRoutes } from 'src/routes';
import * as Router from 'mangojuice/Router';


export type Model = {
  letters: Array<any>
};

export const Commands = {
  InitSentLetters: Cmd.none(),
  RouterCmd: Cmd.subscription((model : Model, route : Router.Model) => [
    route.firstTime(MailRoutes.Sent) && Commands.InitSentLetters
  ])
};

export const Messages = {
  for: 'MAIL.SENT.FOR'
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
) => (
  <div>
    <h2>{shared.intl.formatMessage(Messages.for, model.user.name)}</h2>
    {model.letters.map(letter => (
      <p>{letter.title}</p>
    ))}
  </div>
);

export const init = (
  { shared, nest, subscribe }
  : InitProps<SharedModel>
) : InitModel<Model> => ({
  subs: subscribe(shared.route, Commands.RouterCmd),
  model: {
    letters: []
  }
});
