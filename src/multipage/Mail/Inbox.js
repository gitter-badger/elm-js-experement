import { Cmd, Sub, Router, Task, Collection, ViewProps } from '../mangojuice';
import * as Letter from './Letter';
import User from '../User';
import { MailRoutes } from './Routes';


export class Model extends Collection {
  route: Router.Model;
  user: User.Model;
  boxes: Array;
  letters: Array<Letter.Model>;
};

export const Commands = {
  InitBoxesList: Cmd.batch((model: Model) => [
    Commands.UpdateBoxesList,
    Commands.GetBoxLetters
  ]),
  UpdateRoute: Cmd.batch((model: Model) => [
    Commands.SetNextRoute,
    Commands.GetBoxLetters
  ]),
  SetNextUser: Cmd.update((model: Model, user: User.Model) => ({
    update: { user }
  })),
  SetNextRoute: Cmd.update((model: Model, route: Router.Model) => ({
    update: { route }
  })),
  UpdateBoxesList: Cmd.execLatest(() => [
    Commands.BoxesGetSuccess,
    Commands.BoxesGetFailed,
    function* (model: Model) {
      yield Task.delay(2000);
      const data = yield Task.call(getBoxesList);
      return data;
    }
  ]),
  BoxesGetSuccess: Cmd.update((model: Model, boxes: Array) => ({
    update: { boxes }
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
    const letters = nextLetters.map(l => Letter.init(model.user, l));
    return {
      update: { letters },
      cmd: Cmd.batch(letters.map(x => Cmd.map(Commands.LetterCmd, x.cmd))),
      sub: Sub.batch(letters.map(x => Sub.map(Commands.LetterCmd, x.sub)))
    };
  }),
  LettersGetFailed: Cmd.nope(),
  FilterLetterOut: Cmd.update((model, id) => ({
    update: { letters: model.letters.filter(x => x.id !== id) }
  }))
  LetterCmd: Cmd.middleware()
    .when(Letter.Commands.Delete, (model, letter, subCmd) => [
      Commands.FilterLetterOut.with(letter.id),
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
        <p>{nest(letter, Commands.LetterCmd, Letter.view)}</p>
      ))}
    </div>
  </div>
);

export const init = (
  route : Router.Model,
  user : User.Model
) : Model =>
  new Model({
    user,
    route,
    boxes: [],
    letters: []
  }, {
    cmd: Commands.InitBoxesList,
    sub: Sub.batch(
      Router.changed(MailRoutes.Inbox, Commands.UpdateRoute),
      User.changed(Commands.SetNextUser)
    )
  });


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
