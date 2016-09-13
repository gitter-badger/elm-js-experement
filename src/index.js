import React from 'react';
import { Html, Collection, Commander, Viewier, Process } from './mangojuice';
import * as Lesson from './Lesson';
import * as Exercise from './Exercise';


export const Model = new Collection({
  lesson: Lesson.Model
});

export const Commands = new Commander({
  Initialize: Commander.batch((model) => [
    Lesson.Commands.Initialize.model(model.lesson)
  ]),
  LessonCmd: Commander.middleware({
    [Exercise.Commands.Increment]: (subModel, subCmd) => subCmd,
    _: (subModel, subCmd) => subCmd
  })
});

export const View = new Viewier((model) => (
  <div>
    {Html.map(model.lesson, Commands.LessonCmd, Lesson.View)}
  </div>
));

export const createAppModel = () =>
  Model.create({ lesson: Lesson.getInitialModel() });


Process.start(document.getElementById('content'), {
  view: View,
  model: createAppModel(),
  cmdRunner: () => Commands.Initialize
});
