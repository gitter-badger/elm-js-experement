import { Cmd, Router, Collection, ViewProps } from '../mangojuice';
import * as Inbox from './Inbox';
import * as Sent from './Sent';
import User from '../User';
import { MailRoutes } from './Routes';


export class Model extends Collection {
  route: Router.Model;
  user: User.Model;
  inbox: Inbox.Model;
  sent: Sent.Model;
};

export const Commands = {
  InboxCmd: Cmd.middleware(),
  SentCmd: Cmd.middleware()
};

export const view = ({ model, nest, exec } : ViewProps<Model>) => (
  <div>
    <ul>
      <li>
        <a
          onClick={exec(MailRoutes.Inbox.with({ box: 0 }))}
          active={model.route.is(MailRoutes.Inbox)}
        >
          Inbox
        </a>
      </li>
      <li>
        <a
          onClick={exec(MailRoutes.Sent)}
          active={model.route.is(MailRoutes.Sent)}
        >
          Sent
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
  user : User.Model
) : Model => {
  const inbox = Inbox.init(route, user);
  const sent = Sent.init(route, user);

  return new Model({ route, user, inbox, sent })
  .depend(route)
  .nest(inbox, Commands.InboxCmd)
  .nest(sent, Commands.SentCmd)
}
