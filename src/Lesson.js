import React from 'react';
import { Html, Collection, Commander, Viewier } from './mangojuice';
import * as Exercise from './Exercise';


export const Model = new Collection({
  name: String,
  details: String,
  answer: String,
  incremented: Boolean,
  exercises: Exercise.Model,
  isDetailsShowed: Boolean,
  isLoading: Boolean
});


export const Commands = new Commander({
  Initialize: Model.update((model) => ({
    isLoading: false,
    details: 'Some long text',
    exercises: [
      Exercise.createExercise(1),
      Exercise.createExercise(2),
      Exercise.createExercise(3)
    ]
  })),
  ToggleDetails: Model.update((model) => ({
    isDetailsShowed: !model.isDetailsShowed
  })),
  ChangeFieldValue: Model.update((model, field, e) => ({
    [field]: e.target.value
  })),
  Incremented: Model.update((model) => ({
    incremented: true
  })),
  DoneExercise: Model.update((model, id) => ({
    exercises: model.exercises.filter(x => x._id !== id)
  })),
  ExerciseCmd: Commander.middleware({
    [Exercise.Commands.Increment]: (subModel, subCmd) => ([
      Commands.Incremented, subCmd
    ]),
    [Exercise.Commands.Done]: (subModel, subCmd) => (
      Commands.DoneExercise.with(subModel._id)
    )
  })
});


export const View = new Viewier((model) => (
  <div>
    <h1>{model.name}</h1>
    {model.incremented && (
      <h2>INCREMENTED</h2>
    )}
    <div>{model.answer}</div>
    <input
      value={model.answer}
      onChange={Commands.ChangeFieldValue.with('answer')}
    />
    <div>
      {Html.map(model.exercises, Commands.ExerciseCmd, Exercise.View)}
    </div>
    <button onClick={Commands.ToggleDetails}>
      Show details
    </button>
    {model.isDetailsShowed && (
      <div>{model.details}</div>
    )}
  </div>
));


export const getInitialModel = () => (
  Model.create({
    isDetailsShowed: false,
    isLoading: true,
    exercises: [],
    answer: ''
  })
);
