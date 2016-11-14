import { Router } from 'mangojuice';


export const MailRoutes = {
  Inbox: Router.route('/inbox(/:box)'),
  Sent: Router.route('/sent')
};

export const Routes = {
  News: Router.route('/news', { default: true }),
  Mail: Router.route('/mail', MailRoutes)
};
