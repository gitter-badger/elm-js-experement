import React from 'react';
import { Html, Collection, Commander, Viewier, Task } from './mangojuice';
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
  Initialize: Task.execLatest((model) => [
    Commands.InitializeSuccess,
    Commands.InitializeFailed,
    function* () {
      yield Task.delay(2000);
      const data = yield Task.call(getGithubStars, 'c58/marsdb');
      return data;
    }
  ]),
  InitializeSuccess: Model.update((model, result) => ({
    answer: result,
    details: '123'
  })),
  InitializeFailed: Model.update((model, error) => ({
    answer: error
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
    <button onClick={Commands.Initialize}>
      Show details
    </button>
    {model.isDetailsShowed && (
      <div>{model.details}</div>
    )}
  </div>
));

export const getGithubStars = async (repoName) => {
  return Promise.resolve(123);
};

export const getInitialModel = () => (
  Model.create({
    isDetailsShowed: false,
    isLoading: true,
    exercises: [],
    answer: ''
  })
);
