import React from 'react';
import Manjuice from './mangojuice';
import * as Lesson from './Lesson';
import * as Exercise from './Exercise';


export const Model = {
  lesson: Lesson.Model
};


export const Commands = {
  LessonCmd: Manjuice.middleware({
    [Exercise.Commands.Increment]: (subModel, subCmd) => subCmd
    _: (subModel, subCmd) => subCmd
  })
};


export const View = ({ model, nest }) => (
  <div>
    {nest(model.lesson, Commands.LessonCmd, Lesson.View)}
  </div>
);


export const getInitModel = () => {
  const [ lessonCmd, lesson ] = Lesson.getInitialModel();
  return [ lessonCmd, Manjuice.createModel({ lesson }) ];
}


Process.start(document.getElementById('content'), {
  view: View,
  init: getInitModel(),
  command: Commands.Initialize
});
