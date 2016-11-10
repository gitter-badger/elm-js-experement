import { Cmd, Collection, ViewProps } from 'mangojuice';
import * as Intl from 'mangojuice/Intl';
import * as User from '../../shared/User';


export class Model extends Collection {
  intl: Intl.Model;
  user: User.Model;
  title: String;
  text: String;
};

export const Commands = {
  Delete: Cmd.none()
};

export const Messages = {
  delete: 'MAIL.LETTER.DELETE'
}

export const View = ({ model, exec } : ViewProps<Model>) => (
  <div>
    <h3>{model.title}</h3>
    <p>{model.text}</p>
    {model.user.authorized && (
      <div>
        <button onClick={exec(Commands.Delete)}>
          {model.intl.formatMessage(Messages.delete)}
        </button>
      </div>
    )}
  </div>
);

export const init = (
  user: User.Model,
  intl: Intl.Model,
  letter: Object
) : Model =>
  new Model({
    intl,
    user,
    title: letter.title,
    text: letter.text
  });
