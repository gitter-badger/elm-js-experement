// @flow
import type { ViewProps, InitProps, InitModel } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import React from 'react';
import { Cmd, Task } from 'mangojuice';
import { Routes } from 'src/routes';
import * as User from 'src/Shared/User';
import * as News from './News';
import * as Mail from './Mail';
import * as Letter from './Mail/Letter';


export type Model = {
  mail: Mail.Model,
  news: News.Model,
  notification: string
};

export const Commands = {
  ShowNotification: Cmd.batch((model : Model, message : String) => [
    Commands.SetNotificationMsg.with(message),
    Commands.DelayHideNotification
  ]),
  DelayHideNotification: Cmd.execLatest(() =>
    new Task(function* () { yield Task.delay(5000) })
    .success(Commands.SetNotificationMsg.with(''))
    .fail(Cmd.nope())
  ),
  SetNotificationMsg: Cmd.update((model : Model, message : String) => ({
    notification: message
  })),
  NewsCmd: Cmd.middleware(),
  MailCmd: Cmd.middleware()
    .on(Letter.Commands.Delete, (model, letter, letterCmd) => [
      Commands.ShowNotification.with('Letter removed succeessfully!'),
      letterCmd
    ])
};

export const Messages = {
  title: 'APP.TITLE'
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
) => (
  <div>
    {!!model.notification && (
      <div>{model.notification}</div>
    )}
    <h1>{shared.intl.formatMessage(Messages.title)}</h1>
    <div>{shared.user.authorized
      ? <button onClick={exec(User.Commands.Login)}>Log in</button>
      : <button onClick={exec(User.Commands.Logout)}>Log out</button>}
    </div>
    {shared.route.when()
      .is(Routes.Mail, () => nest(model.mail, Commands.MailCmd, Mail.View))
      .is(Routes.News, () => nest(model.news, Commands.NewsCmd, News.View))}
  </div>
);

export const init = (
  { shared, nest, subscribe }
  : InitProps<SharedModel>
) : Model => ({
  mail: nest(Commands.MailCmd, Mail.init),
  news: nest(Commands.NewsCmd, News.init),
  notification: ''
});
