import { Commander, Viewier, Router } from '../mangojuice';
import * as Lesson from './Lesson';


export const Commands = createCommands({
  /**
   * Home route and related commands
   */
  HomeRoute: Router.route('/(:id/)', (model) => [
    Commands.HomeRouteInit,
    Commands.HomeRouteCmd,
    Lesson.View
  ]),
  HomeRouteInit: Router.init(function* (routeModel) {
    return Lesson.getInitialModel(routeModel);
  }),
  HomeRouteCmd: Commander.middleware({
    [Lesson.Commands.ToggleDetails]: (subCmd, subModel) => (
      Commands.HomeRoute.with({ id: 10 })
    )
  })
});
