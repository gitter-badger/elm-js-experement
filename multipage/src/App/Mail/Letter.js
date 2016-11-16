import { Cmd } from 'mangojuice';
import { ViewProps, InitProps, InitModel } from 'mangojuice/types';
import { Model as SharedModel } from '../../Shared';


export type Model {
  title: string,
  text: string
};

export const Commands = {
  Delete: Cmd.none()
};

export const Messages = {
  delete: 'MAIL.LETTER.DELETE'
}

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
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
  { shared, nest, subscribe }
  : InitProps<Model, SharedModel>,
  letter: Object
) : InitModel<Model> => ({
  title: letter.title,
  text: letter.text
});
