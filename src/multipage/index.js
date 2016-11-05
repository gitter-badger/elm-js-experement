import { Process, Router } from '../mangojuice';
import { Routes } from './Routes';
import * as App from './App';
import * as User from './User';


Process.start({
  mount: document.getElementById('content'),
  model: App.init(Router.for(Routes), User.init()),
  view: App.view
});
