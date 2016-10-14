import React from 'react';
import { createModel, createCommands, Commander } from './mangojuice';


export const Model = createModel({
  score: Number
});


export const Executors = createCommands({
  Increment: Model.update((model) => ({
    score: model.score + 1
  })),
  Done: Commander.noop()
});


export const View = ({ model, exec }) => (
  <div>
    <p>{model.score}</p>
    <button onClick={exec(Commands.Increment)}>Increment</button>
    <button onClick={exec(Commands.Done)}>Done</button>
  </div>
);


export const createExercise = (score) =>
  Model.create({ score });
