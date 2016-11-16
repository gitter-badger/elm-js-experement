import { Cmd } from 'mangojuice';
import { ViewProps, InitProps, InitModel } from 'mangojuice/types';
import { Model as SharedModel } from '../../Shared';
import { MailRoutes } from '../../routes';
import * as Router from 'mangojuice/Router';


export type Model {
  letters: Array<any>
};

export const Commands = {
  InitSentLetters: Cmd.none(),
  RouterCmd: Cmd.subscription((model : Model, route : Router.Model) => [
    route.firstTime(MailRoutes.Sent) && Commands.InitSentLetters
  ])
};

export const Messages = {
  for: 'MAIL.SENT.FOR'
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
) => (
  <div>
    <h2>{shared.intl.formatMessage(Messages.for, model.user.name)}</h2>
    {model.letters.map(letter => (
      <p>{letter.title}</p>
    ))}
  </div>
);

export const init = (
  { nest, shared }
  : InitProps<Model, SharedModel>
) : InitModel<Model> => ({
  subs: subscribe(shared.route, Commands.RouterCmd)
  model: {
    letters: []
  }
});
