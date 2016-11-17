// @flow
import type { ViewProps, InitProps, InitModel } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import React from 'react';
import { Cmd } from 'mangojuice';


export type Model = {
  title: string,
  text: string
};

export const Commands = {
  Delete: Cmd.nope()
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
  { shared, nest, subscribe } : InitProps<SharedModel>,
  letter: Model
) : InitModel<Model> => ({
  ...letter
});
