import { Process } from '../mangojuice';
import * as App from './App';


Process.start({
  mount: document.getElementById('content'),
  model: App.init,
  view: App.view
});
