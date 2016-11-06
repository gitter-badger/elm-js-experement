import { Cmd, Collection, ViewProps } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import * as User from '../../shared/User';
import { MailRoutes } from '../../routes';


export class Model extends Collection {
  intl: Intl.Model;
  user: User.Model;
  letters: Array;
};

export const Commands = {
  InitSentLetters: Cmd.none(),
  RouterCmd: Cmd.middleware()
    .default((model, route, routeCmd) => [
      route.firstTime(MailRoutes.Sent) && Commands.InitSentLetters,
      routeCmd
    ])
};

export const Messages = {
  for: 'MAIL.SENT.FOR'
};

export const view = ({ model, nest } : ViewProps<Model>) => (
  <div>
    <h2>{model.intl.formatMessage(Messages.for, model.user.name)}</h2>
    {model.letters.map(letter => (
      <p>{letter.title}</p>
    ))}
  </div>
);

export const init = (
  route: Router.Model,
  user: User.Model,
  intl: Intl.Model
) : Model =>
  new Model({
    intl,
    user,
    letters: []
  })
  .depend(user).depend(intl)
  .nest(route, Commands.RouterCmd);