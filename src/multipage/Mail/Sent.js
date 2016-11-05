import { Cmd, Router, Task, Collection, ViewProps } from '../mangojuice';
import User from '../User';
import { MailRoutes } from './Routes';


export class Model extends Collection {
  user: User.Model;
  letters: Array;
};

export const Commands = {
  InitSentLetters: Cmd.none(),
  SetNextUser: Cmd.update((model : Model, user : User.Model) => ({
    update: { user }
  }))
};

export const view = ({ model, nest } : ViewProps<Model>) => (
  <div>
    <h2>Sent from {model.user.name}</h2>
    {model.letters.map(letter => (
      <p>{letter.title}</p>
    ))}
  </div>
);

export const init = (user: User.Model) : Model =>
  new Model({
    user,
    letters: []
  }, {
    cmd: Commands.InitSentMails,
    sub: User.changed(Commands.SetNextUser)
  });
