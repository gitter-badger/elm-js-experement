import { Router, Cmd, Collection, ViewProps } from './mangojuice';
import { Routes } from './Routes';
import * as News from './News';
import * as Mail from './Mail';
import * as Letter from './Mail/Letter';
import * as User from './User';


export class Model extends Collection {
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
  MailCmd: Cmd.middleware()
    .when(Letter.Commands.Delete, (model : Model, letter : Letter.Model, subCmd) => [
      Commands.ShowNotification.with('Letter removed succeessfully!'),
      subCmd
    ]),
  NewsCmd: Cmd.middleware()
};

export view = ({ model, nest, exec } : ViewProps<Model>) => (
  <div>
    {!!model.notification && (
      <div>{model.notification}</div>
    )}
    <h1>Mango Mail App</h1>
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
  const route = Router.init(Routes);
  const user = User.init();
  const news = News.init(route, user);
  const mail = Mail.init(route, user);

  return new Model({
    user, route, news, mail,
    notification: ''
  })
  .depend(user).depend(route)
  .nest(news, Commands.NewsCmd)
  .nest(mail, Commands.MailCmd);
};
