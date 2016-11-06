import { Cmd, Collection, Task, ViewProps } from '../../mangojuice';
import * as Router from '../../mangojuice/Router';
import * as User from '../User';
import { MailRoutes } from '../Routes';


export class Model extends Collection {
  intl: Intl.Model;
  user: User.Model;
  letters: Array;
};

export const Commands = {
  InitSentLetters: Cmd.none(),
  RouterCmd: Cmd.middleware()
    .other((model, route, subCmd) => [
      route.firstTime(MailRoutes.Sent) && Commands.InitSentLetters,
      subCmd
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
