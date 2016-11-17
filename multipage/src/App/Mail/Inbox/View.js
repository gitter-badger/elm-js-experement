// @flow
import type { ViewProps } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import { LetterMiddleware } from './Commands';
import { View as LetterView } from '../Letter';
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
          <li>
            <a onClick={exec(MailRoutes.Inbox.with({ box: box.id }))}>
              {box.title}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h2>{shared.intl.formatMessage(Messages.letters)}</h2>
      {model.letters.map(letter =>
        nest(letter, LetterMiddleware, LetterView)
      )}
    </div>
  </div>
);
