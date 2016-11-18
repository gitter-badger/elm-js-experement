// @flow
import { Process } from 'mangojuice';
import * as App from './App';
import * as Shared from './Shared';


Process.start({
  mount: document.getElementById('content'),
  shared: Shared.init,
  app: App.init,
  view: App.View
});
