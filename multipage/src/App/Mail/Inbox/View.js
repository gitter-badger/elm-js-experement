// @flow
import type { ViewProps } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import React from 'react';
import * as Commands from './Commands';
import * as Letter from '../Letter';
import { MailRoutes } from 'src/routes';


export const Messages = {
  boxes: 'MAIL.INBOX.BOXES_TITLE',
  letters: 'MAIL.INBOX.LETTERS_TITLE'
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
) => (
  <div>
    <div>
      <h1>{shared.intl.formatMessage(Messages.boxes)}</h1>
      <ul>
        {model.boxes.map(box => (
          <li key={box.id}>
            <a onClick={exec(MailRoutes.Inbox.bindArgs({ box: box.id }))}>
              {box.title}
              {shared.route.params.box === box.id && ' <---'}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <input
        placeholder="Search..."
        value={model.search}
        onChange={exec(Commands.SearchLetters)}
      />
    </div>

    <div>
      <h2>{shared.intl.formatMessage(Messages.letters)}</h2>
      {model.letters.map(letter =>
        nest(letter, Commands.LetterMiddleware, Letter.View)
      )}
    </div>
  </div>
);
