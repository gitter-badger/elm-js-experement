import { Cmd, BaseModel, ViewProps, InitProps } from 'mangojuice';
import { Model as Shared } from '../../Shared';
import { MailRoutes } from '../../routes';
import * as Inbox from './Inbox';
import * as Sent from './Sent';


export class Model extends BaseModel {
  inbox: Inbox.Model;
  sent: Sent.Model;
};

export const Commands = {
  InboxCmd: Cmd.middleware(),
  SentCmd: Cmd.middleware()
};

export const Messages = {
  inbox: 'MAIL.INBOX_TITLE',
  sent: 'MAIL.SENT_TITLE'
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, Shared>
) => (
  <div>
    <ul>
      <li>
        <a
          onClick={exec(MailRoutes.Inbox.with({ box: 0 }))}
          active={shared.route.is(MailRoutes.Inbox)}
        >
          {shared.intl.formatMessage(Messages.inbox)}
        </a>
      </li>
      <li>
        <a
          onClick={exec(MailRoutes.Sent)}
          active={shared.route.is(MailRoutes.Sent)}
        >
          {shared.intl.formatMessage(Messages.sent)}
        </a>
      </li>
    </ul>
    {shared.route.when()
      .is(MailRoutes.Inbox, () => nest(model.inbox, Commands.InboxCmd, Inbox.View))
      .is(MailRoutes.Sent, () => nest(model.sent, Commands.SentCmd, Sent.View))}
  </div>
);

export const init = (
  { nest, shared }
  : InitProps<Model, Shared>
) =>
  new Model({
    inbox: nest(Commands.InboxCmd, Inbox.init),
    sent: nest(Commands.SentCmd, Sent.init)
  });
