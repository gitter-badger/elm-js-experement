// @flow
import type { ViewProps, InitProps, InitModel } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import React from 'react';
import { Cmd, Task } from 'mangojuice';
import { Routes, MailRoutes } from 'src/routes';
import * as Intl from 'mangojuice/Intl';
import * as User from 'src/Shared/User';
import * as News from './News';
import * as Mail from './Mail';
import * as Letter from './Mail/Letter';


export type Model = {
  mail: Mail.Model,
  news: News.Model,
  notification: string
};

export const Commands = Cmd.debug({
  ShowNotification: Cmd.batch((props, message : String) => [
    Commands.SetNotificationMsg.bindArgs(message),
    Commands.DelayHideNotification
  ]),
  DelayHideNotification: Cmd.execLatest(() => [
    Commands.SetNotificationMsg.bindArgs(''),
    Cmd.nope(),
    function* () { yield Task.delay(3000) }
  ]),
  SetNotificationMsg: Cmd.update((props, message : String) => ({
    notification: message
  })),
  LogModel: Cmd.update(({ model, shared }) => {
    console.log(JSON.stringify(model, null, 2));
    console.log(JSON.stringify(shared, null, 2));
  }),
  NewsCmd: Cmd.middleware(),
  MailCmd: Cmd.middleware()
    .on(Letter.Commands.Delete, ({ shared }, letter, letterCmd) => [
      Commands.ShowNotification.bindArgs(Messages.letterRemoved),
      letterCmd
    ])
});

export const Messages = {
  letterRemoved: 'APP.LETTER_REMOVED',
  title: 'APP.TITLE',
  news: 'NEWS.TITLE',
  mail: 'MAIL.TITLE',
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
) => (
  <div>
    {!!model.notification && (
      <h1>{shared.intl.formatMessage(model.notification)}</h1>
    )}
    <h1>{shared.intl.formatMessage(Messages.title)}</h1>
    <div>{!shared.user.authorized
      ? <button onClick={exec(User.Commands.Login)}>Log in</button>
      : <button onClick={exec(User.Commands.Logout)}>Log out</button>}
    </div>
    <div>
      <button onClick={exec(Intl.Commands.ChangeLocale.bindArgs('ru'))}>Ru</button>
      <button onClick={exec(Intl.Commands.ChangeLocale.bindArgs('en'))}>En</button>
    </div>
    <ul>
      <li>
        <a onClick={exec(MailRoutes.Inbox.bindArgs({ box: 0 }))}>
          {shared.intl.formatMessage(Messages.mail)}
          {shared.route.is(Routes.Mail) && ' <---'}
        </a>
      </li>
      <li>
        <a onClick={exec(Routes.News)}>
          {shared.intl.formatMessage(Messages.news)}
          {shared.route.is(Routes.News) && ' <---'}
        </a>
      </li>
    </ul>
    {shared.route.when(Routes.Mail, () => nest(model.mail, Mail))}
    {shared.route.when(Routes.News, () => nest(model.news, News))}
    {shared.route.notFound(() => <span>Page not found :(</span>)}
    <button onClick={exec(Commands.LogModel)}>Log model</button>
  </div>
);

export const init = (
  { shared, nest, subscribe }
  : InitProps<SharedModel>
) : Model => ({
  model: {
    mail: nest(Commands.MailCmd, Mail),
    news: nest(Commands.NewsCmd, News),
    notification: ''
  }
});
