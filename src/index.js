import React from 'react';
import { createCommands, createModel, Commander, Process } from './mangojuice';
import * as Lesson from './Lesson';
import * as Exercise from './Exercise';


export const Model = createModel({
  lesson: Lesson.Model
});


export const Commands = createCommands({
  Initialize: Commander.batch((model) => [
    Exercise.Commands.Initialize.model(model.lesson)
  ]),
  LessonCmd: Commander.middleware({
    [Exercise.Commands.Increment]: (subModel, subCmd) => subCmd,
    _: (subModel, subCmd) => subCmd
  })
});


export const View = ({ model, nest }) => (
  <div>
    {nest(model.lesson, Commands.LessonCmd, Lesson.View)}
  </div>
);


export const getInitModel = () =>
  Model.create({ lesson: Lesson.getInitialModel() });


Process.start(document.getElementById('content'), {
  view: View,
  model: getInitModel(),
  command: Commands.Initialize
});
