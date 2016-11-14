import { Cmd, BaseModel, ViewProps, InitProps } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import { Model as Shared } from '../../Shared';
import { MailRoutes } from '../../routes';


export class Model extends BaseModel {
  letters: Array<any>;
};

export const Commands = {
  InitSentLetters: Cmd.none(),
  RouterCmd: Cmd.middleware()
    .anyCommand((model : Model, route : Router.Model) => [
      route.firstTime(MailRoutes.Sent) && Commands.InitSentLetters
    ])
};

export const Messages = {
  for: 'MAIL.SENT.FOR'
};

export const View = (
  { model, shared }
  : ViewProps<Model, Shared>
) => (
  <div>
    <h2>{shared.intl.formatMessage(Messages.for, model.user.name)}</h2>
    {model.letters.map(letter => (
      <p>{letter.title}</p>
    ))}
  </div>
);

export const init = (
  { nest, shared, subscribe }
  : InitProps<Model, Shared>
) => ({
  model: new Model({ letters: [] }),
  subs: subscribe(shared.route, Commands.RouterCmd)
});
