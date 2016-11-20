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
        <a
          onClick={exec(MailRoutes.Inbox.bindArgs({ box: 0 }))}
          className={shared.route.is(MailRoutes.Inbox)}
        >
          {shared.intl.formatMessage(Messages.inbox)}
        </a>
      </li>
      <li>
        <a
          onClick={exec(MailRoutes.Sent)}
          className={shared.route.is(MailRoutes.Sent)}
        >
          {shared.intl.formatMessage(Messages.sent)}
        </a>
      </li>
    </ul>
    {shared.route.when(MailRoutes.Inbox, () => nest(model.inbox, Commands.InboxCmd, Inbox.View))}
    {shared.route.when(MailRoutes.Sent, () => nest(model.sent, Commands.SentCmd, Sent.View))}
  </div>
);

export const init = (
  { nest } : InitProps<SharedModel>
) : InitModel<Model> => ({
  inbox: nest(Commands.InboxCmd, Inbox.init),
  sent: nest(Commands.SentCmd, Sent.init)
});
