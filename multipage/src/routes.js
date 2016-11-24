import { route } from 'mangojuice/Router';


export const MailRoutes = {
  Inbox: route('/inbox(/:box)'),
  Sent: route('/sent')
};

export const Routes = {
  News: route('/news', null, { default: true }),
  Mail: route('/mail', MailRoutes)
};
