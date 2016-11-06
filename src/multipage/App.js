import { Cmd, Collection, ViewProps } from '../mangojuice';
import * as Router from '../mangojuice/Router';
import * as Intl from '../mangojuice/Intl';
import { Routes } from './Routes';
import * as User from './User';
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
    .command(Commands.DelayHideAnimation)
  ),
  DelayHideAnimation: Cmd.execLatest(() => [
    Commands.HideNotification, Cmd.nope(),
    function* () { yield Task.delay(5000) }
  ])
  HideNotification: Cmd.update((model : Model) => ({
    notification: ''
  }))
  NewsCmd: Cmd.middleware(),
  MailCmd: Cmd.middleware()
    .when(Letter.Commands.Delete, (model : Model, letter : Letter.Model, subCmd) => [
      Commands.ShowNotification.with('Letter removed succeessfully!'),
      subCmd
    ])
};

export const Messages = {
  title: 'APP.TITLE'
};

export view = ({ model, nest, exec } : ViewProps<Model>) => (
  <div>
    {!!model.notification && (
      <div>{model.notification}</div>
    )}
    <h1>{intl.model.formatMessage(Messages.title)}</h1>
    <div>{model.user.authorized
      ? <button onClick={exec(User.Commands.Login)}>Log in</button>
      : <button onClick={exec(User.Commands.Logout)}>Log out</button>}
    </div>
    {model.route.switch()
      .when(Routes.Mail, () => nest(model.mail, Mail.view))
      .when(Routes.News, () => nest(model.news, News.view))}
  </div>
);

export const init = () : Model => {
  const user = User.init();
  const route = Router.init(Routes);
  const intl = Intl.init(route);
  const news = News.init(route, user, intl);
  const mail = Mail.init(route, user, intl);

  return new Model({
    user, route, news, mail, intl,
    notification: ''
  })
  .depend(user).depend(route).depend(intl)
  .nest(news, Commands.NewsCmd)
  .nest(mail, Commands.MailCmd);
};
