import { Cmd, BaseModel, ViewProps, InitProps } from 'mangojuice';
import { Model as Shared } from '../../Shared';


export class Model extends BaseModel {
  title: string;
  text: string;
};

export const Commands = {
  Delete: Cmd.none()
};

export const Messages = {
  delete: 'MAIL.LETTER.DELETE'
}

export const View = (
  { model, shared, exec }
  : ViewProps<Model, Shared>
) => (
  <div>
    <h3>{model.title}</h3>
    <p>{model.text}</p>
    {shared.user.authorized && (
      <div>
        <button onClick={exec(Commands.Delete)}>
          {shared.intl.formatMessage(Messages.delete)}
        </button>
      </div>
    )}
  </div>
);

export const init = (
  { nest, shared } : InitProps<Model, Shared>,
  letter: Object
) =>
  new Model({
    title: letter.title,
    text: letter.text
  });
