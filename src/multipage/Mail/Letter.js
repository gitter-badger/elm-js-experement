import { Cmd, Task, Collection, ViewProps } from '../mangojuice';
import User from '../User';


export class Model extends Collection {
  user: User.Model,
  title: String;
  text: String;
};

export const Commands = {
  Delete: Cmd.none()
};

export const view = ({ model, exec } : ViewProps<Model>) => (
  <div>
    <h3>{model.title}</h3>
    <p>{model.text}</p>
    {model.user.authorized && (
      <div>
        <button onClick={exec(Commands.Delete)}>Delete</button>
      </div>
    )}
  </div>
);

export const init = (user: User.Model, letter: Object) : Model =>
  new Model({
    user,
    title: letter.title,
    text: letter.text
  })
  .depend(user);
