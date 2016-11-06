import { Cmd, Collection, Task, ViewProps } from '../../mangojuice';
import * as Router from '../../mangojuice/Router';
import * as Intl from '../../mangojuice/Intl';
import { MailRoutes } from '../Routes';
import * as User from '../User';
import * as Letter from './Letter';


export class Model extends Collection {
  intl: Intl.Model;
  route: Router.Model;
  user: User.Model;
  boxes: Array;
  letters: Array<Letter.Model>;
};

export const Commands = {
  UpdateBoxesList: Cmd.execLatest(() => [
    Commands.BoxesGetSuccess,
    Commands.BoxesGetFailed,
    function* (model: Model) {
      yield Task.delay(2000);
      const data = yield Task.call(getBoxesList);
      return data;
    }
  ]),
  BoxesGetSuccess: Cmd.update((model: Model, nextBoxes: Array) => ({
    boxes: nextBoxes
  })),
  BoxesGetFailed: Cmd.nope(),
  GetBoxLetters: Cmd.execLatest(() => [
    Commands.LettersGetSuccess,
    Commands.LettersGetFailed,
    function* (model: Model) {
      yield Cmd.delay(2000);
      const data = yield Cmd.call(getMailsList, model.route.box);
      return data;
    }
  ]),
  LettersGetSuccess: Cmd.update((model: Model, nextLetters: Array) => {
    const letters = nextLetters.map(l => Letter.init(model.user, model.intl, l));
    const updateModel = new Model({ letters });
    letters.forEach(l => updateModel.nest(l, Commands.LetterCmd));
    return updateModel;
  }),
  LettersGetFailed: Cmd.nope(),
  FilterOutLetter: Cmd.update((model, id) => ({
    letters: model.letters.filter(x => x.id !== id)
  }))
  LetterCmd: Cmd.middleware()
    .when(Letter.Commands.Delete, (model, letter, subCmd) => [
      Commands.FilterOutLetter.with(letter.id),
      subCmd
    ]),
  RouterCmd: Cmd.middleware()
    .other((model, route, subCmd) => [
      route.firstTime(MailRoutes.Inbox) && Commands.UpdateBoxesList,
      route.changed(MailRoutes.Inbox) && Commands.GetBoxLetters,
      subCmd
    ])
};

export const view = ({ model, exec, nest } : ViewProps<Model>}) => (
  <div>
    <div>
      <h1>Boxes list</h1>
      <ul>
        {model.boxes.map(box => (
          <li>
            <a onClick={exec(MailRoutes.Inbox.with({ box: box.display_name }))}>
              {box.title}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h2>Mails</h2>
      {model.letters.map(letter => (
        <p>{nest(letter, Letter.view)}</p>
      ))}
    </div>
  </div>
);

export const init = (
  route : Router.Model,
  user : User.Model,
  intl : Intl.Model,
) : Model =>
  new Model({
    intl,
    user,
    route,
    boxes: [],
    letters: []
  })
  .depend(intl)
  .nest(route, Commands.RouterCmd)


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
