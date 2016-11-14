import { Cmd, BaseModel, Task, ViewProps, InitProps } from 'mangojuice';
import { MailRoutes } from '../../routes';
import * as Letter from './Letter';


export class Model extends BaseModel {
  boxes: Array<any>;
  letters: Array<Letter.Model>;
};

export const Commands = {
  UpdateBoxesList: Cmd.execLatest(() =>
    new Task(function* () {
      yield Task.delay(2000);
      const data = yield Task.call(getBoxesList);
      return data;
    })
    .success(Commands.BoxesGetSuccess)
    .fail(Commands.BoxesGetFailed)
  ),
  BoxesGetSuccess: Cmd.update((model: Model, nextBoxes: Array) => ({
    boxes: nextBoxes
  })),
  BoxesGetFailed: Cmd.nope(),
  GetBoxLetters: Cmd.execLatest(() =>
    new Task(function* (model: Model) {
      yield Task.delay(2000);
      const data = yield Task.call(getMailsList, model.route.box);
      return data;
    })
    .success(Commands.LettersGetSuccess)
    .fail(Commands.LettersGetFailed)
  ),
  LettersGetSuccess: Cmd.update((model: Model, nextLetters: Array) => ({
    letters: nextLetters.map(l => model.nest(Commands.LetterCmd, Letter.init, l))
  })),
  LettersGetFailed: Cmd.nope(),
  FilterOutLetter: Cmd.update((model, id) => ({
    letters: model.letters.filter(x => x.id !== id)
  })),
  LetterCmd: Cmd.middleware()
    .on(Letter.Commands.Delete, (model, letter, letterCmd) => [
      Commands.FilterOutLetter.with(letter.id),
      letterCmd
    ]),
  RouterCmd: Cmd.middleware()
    .anyCommand((model, route, routeCmd) => [
      route.firstTime(MailRoutes.Inbox) && Commands.UpdateBoxesList,
      route.changed(MailRoutes.Inbox) && Commands.GetBoxLetters,
      routeCmd
    ])
};

export const Messages = {
  boxes: 'MAIL.INBOX.BOXES_TITLE',
  letters: 'MAIL.INBOX.LETTERS_TITLE'
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, Shared>
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
      {model.letters.map(letter => nest(letter, Letter.View))}
    </div>
  </div>
);

export const init = (
  { nest, shared, subscribe }
  : InitProps<Model, Shared>
) => ({
  model: new Model({
    boxes: [],
    letters: []
  }),
  subs: subscribe(shared.route, Commands.RouterCmd)
})


export const getBoxesList = () => {
  return Promise.resolve([
    { id: '1', title: 'Box 1' },
    { id: '2', title: 'Box 2' },
    { id: '3', title: 'Box 3' },
    { id: '4', title: 'Box 4' },
  ]);
};

export const getMailsList = (boxId) => {
  return Promise.resolve([
    { title: `${boxId} mail 1`, text: 'Letter 1' },
    { title: `${boxId} mail 2`, text: 'Letter 2' },
    { title: `${boxId} mail 3`, text: 'Letter 3' },
    { title: `${boxId} mail 4`, text: 'Letter 4' },
  ]);
};
