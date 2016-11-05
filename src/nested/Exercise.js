import React from 'react';
import Manjuice from './mangojuice';


export const Model = {
  score: Number
};


export const Executors = {
  Done: Manjuice.noop(),
  Increment: Manjuice.update((model) => ({
    score: model.score + 1
  }))
};


export const View = ({ model, exec }) => (
  <div>
    <p>{model.score}</p>
    <button onClick={exec(Commands.Increment)}>Increment</button>
    <button onClick={exec(Commands.Done)}>Done</button>
  </div>
);


export const createExercise = (score) =>
  Model.create({ score });
