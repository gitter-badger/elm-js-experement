import { Cmd, Collection, Task, ViewProps } from 'mangojuice';
import * as Router from 'mangojuice/Router';
import * as Intl from 'mangojuice/Intl';
import languages from '../languages';
import * as User from '../shared/User';
import { Routes } from '../routes';
import * as News from './News';
import * as Mail from './Mail';
import * as Letter from './Mail/Letter';


export class Model extends Collection {
  intl: Intl.Model;
  route: Router.Model;
  user: User.Model;
  mail: Mail.Model;
  news: News.Model;
  notification: String;
};

export const Commands = {
  ShowNotification: Cmd.update((model : Model, message : String ) =>
    new Model({ notification: message })
    .command(Commands.DelayHideNotification)
  ),
  DelayHideNotification: Cmd.execLatest((model : Model) =>
    new Task(function* () { yield Task.delay(5000) })
    .success(Commands.HideNotification)
    .fail(Cmd.nope())
  ),
  HideNotification: Cmd.update((model : Model) => ({
    notification: ''
  }))
  NewsCmd: Cmd.middleware(),
  MailCmd: Cmd.middleware()
    .on(Letter.Commands.Delete, (model, letter, letterCmd) => [
      Commands.ShowNotification.with('Letter removed succeessfully!'),
      letterCmd
    ])
};

export const Messages = {
  title: 'APP.TITLE'
};

export const view = ({ model, nest, exec } : ViewProps<Model>) => (
  <div>
    {!!model.notification && (
      <div>{model.notification}</div>
    )}
    <h1>{model.intl.formatMessage(Messages.title)}</h1>
    <div>{model.user.authorized
      ? <button onClick={exec(User.Commands.Login)}>Log in</button>
      : <button onClick={exec(User.Commands.Logout)}>Log out</button>}
    </div>
    {model.route.when()
      .is(Routes.Mail, () => nest(model.mail, Mail.view))
      .is(Routes.News, () => nest(model.news, News.view))}
  </div>
);

export const init = () : Model => {
  const user = User.init();
  const route = Router.init(Routes);
  const intl = Intl.init(route, languages);
  const news = News.init(route, user, intl);
  const mail = Mail.init(route, user, intl);

  return new Model({
    user, route, news, mail, intl,
    notification: ''
  })
  .dependsOf(user, route, intl)
  .applyMiddleware(news, Commands.NewsCmd)
  .applyMiddleware(mail, Commands.MailCmd);
};
