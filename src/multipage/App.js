import { Router, Sub, Collection, ViewProps } from './mangojuice';
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
  SetNextRoute: Cmd.update((model : Model, route : Router.Model) => ({
    update: { route }
  })),
  ShowNotification: Cmd.update((model : Model, message : String ) => ({
    update: { notification: message },
    cmd: Commands.DelayHideAnimation
  })),
  DelayHideAnimation: Cmd.execLatest(() => [
    Commands.HideNotification, Cmd.nope(),
    function* () { yield Task.delay(5000) }
  ])
  HideNotification: Cmd.update((model : Model) => ({
    update: { notification: '' }
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
    <div>{model.user.isAuthorized()
      ? <button onClick={exec(User.Commands.Login)}>Log in</button>
      : <button onClick={exec(User.Commands.Logout)}>Log out</button>}
    </div>
    {model.route.switch()
      .when(Routes.Mail, () => nest(model.mail, Commands.MailCmd, Mail.view))
      .when(Routes.News, () => nest(model.news, Commands.NewsCmd, News.view))}
  </div>
);

export const init = (
  route : Router.Model,
  user : User.Model
) : Model => {
  const news = News.init(route, user);
  const mail = Mail.init(route, user);

  return new Model({
    route, model, news, mail,
    notification: ''
  }, {
    cmd: Cmd.batch(
      Cmd.map(Commands.NewsCmd, news.cmd),
      Cmd.map(Commands.MailCmd, mail.cmd)
    ),
    sub: Sub.batch(
      Router.changed(Routes, Commands.SetNextRoute),
      Sub.map(Commands.MailCmd, mail.sub)),
      Sub.map(Commands.NewsCmd, news.sub))
    )
  });
};
