// @flow
import type { ViewProps, InitProps, InitModel } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import React from 'react';
import { Cmd } from 'mangojuice';
import { MailRoutes } from 'src/routes';
import * as Inbox from './Inbox';
import * as Sent from './Sent';


export type Model = {
  inbox: Inbox.Model,
  sent: Sent.Model
};

export const Commands = Cmd.debug({
  InboxCmd: Cmd.middleware(),
  SentCmd: Cmd.middleware()
});

export const Messages = {
  inbox: 'MAIL.INBOX_TITLE',
  sent: 'MAIL.SENT_TITLE'
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
) => (
  <div>
    <ul>
      <li>
        <a onClick={exec(MailRoutes.Inbox.bindArgs({ box: 0 }))}>
          {shared.intl.formatMessage(Messages.inbox)}
          {shared.route.is(MailRoutes.Inbox) && ' <---'}
        </a>
      </li>
      <li>
        <a onClick={exec(MailRoutes.Sent)}>
          {shared.intl.formatMessage(Messages.sent)}
          {shared.route.is(MailRoutes.Sent) && ' <---'}
        </a>
      </li>
    </ul>
    {shared.route.when(MailRoutes.Inbox, () => nest(model.inbox, Inbox))}
    {shared.route.when(MailRoutes.Sent, () => nest(model.sent, Sent))}
  </div>
);

export const init = (
  { nest } : InitProps<SharedModel>
) : InitModel<Model> => ({
  model: {
    inbox: nest(Commands.InboxCmd, Inbox),
    sent: nest(Commands.SentCmd, Sent)
  }
});
