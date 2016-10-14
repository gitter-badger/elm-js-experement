import React from 'react';
import { createModel, createCommands, Commander, Task } from './mangojuice';
import * as Exercise from './Exercise';


export const Model = createModel({
  name: String,
  details: String,
  answer: String,
  incremented: Boolean,
  exercises: Exercise.Model,
  isDetailsShowed: Boolean,
  isLoading: Boolean
});


export const Commands = createCommands({
  Initialize: Task.execLatest(() => [
    Commands.InitializeSuccess,
    Commands.InitializeFailed,
    function* (model) {
      yield Task.delay(2000);
      const data = yield Task.call(getGithubStars, 'c58/marsdb');
      return data;
    }
  ]),
  InitializeSuccess: Model.update((model, result) => ({
    answer: result,
    details: '123',
    loading: false
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
  SetLoading: Model.update((model, val) => ({
    loading: val
  })),
  HandleFieldChange: Commander.batch((model, field, e) => [
    Commands.ChangeFieldValue.with(field, e),
    Commands.SetLoading.with(true)
  ]),
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
      [Commands.DoneExercise, subModel._id]
    )
  })
};


export const View = ({ model, nest, exec }) => (
  <div>
    <h1>{model.name}</h1>
    {model.incremented && (
      <h2>INCREMENTED</h2>
    )}
    <div>{model.answer}</div>
    <input
      value={model.answer}
      onChange={exec(Commands.HandleFieldChange.with('answer'))}
    />
    {model.loading ? <div>Loading...</div> : null}
    <div>
      {nest(model.exercise, Commands.ExerciseCmd, Exercise.View)}
    </div>
    <button onClick={exec(Commands.ToggleDetails)}>
      Show details
    </button>
    {model.isDetailsShowed && (
      <div>{model.details}</div>
    )}
  </div>
);


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
