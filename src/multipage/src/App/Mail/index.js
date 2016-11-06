import { Cmd, Collection, ViewProps } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import * as Intl from 'mangojuice/Intl';
import * as User from '../../Shared/User';
import { MailRoutes } from '../../routes';
import * as Inbox from './Inbox';
import * as Sent from './Sent';


export class Model extends Collection {
  intl: Intl.Model;
  route: Router.Model;
  user: User.Model;
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

export const view = ({ model, nest, exec } : ViewProps<Model>) => (
  <div>
    <ul>
      <li>
        <a
          onClick={exec(MailRoutes.Inbox.with({ box: 0 }))}
          active={model.route.is(MailRoutes.Inbox)}
        >
          {model.intl.formatMessage(Messages.inbox)}
        </a>
      </li>
      <li>
        <a
          onClick={exec(MailRoutes.Sent)}
          active={model.route.is(MailRoutes.Sent)}
        >
          {model.intl.formatMessage(Messages.sent)}
        </a>
      </li>
    </ul>
    {model.route.switch()
      .when(MailRoutes.Inbox, () => nest(model.inbox, Inbox.view))
      .when(MailRoutes.Sent, () => nest(model.sent, Sent.view))
    }
  </div>
);

export const init = (
  route : Router.Model,
  user : User.Model,
  intl : Intl.Model
) : Model => {
  const inbox = Inbox.init(route, user, intl);
  const sent = Sent.init(route, user, intl);

  return new Model({ route, user, inbox, sent, intl })
  .depend(route).depend(intl)
  .nest(inbox, Commands.InboxCmd)
  .nest(sent, Commands.SentCmd)
}