import React from 'react';
import { Html, Collection, Commander, Viewier } from './mangojuice';


export const Model = new Collection({
  score: Number
});

export const Commands = new Commander({
  Increment: Model.update((model) => ({ score: model.score + 1 })),
  Done: Commander.noop()
});

export const View = new Viewier((model) => (
  <div>
    <p>{model.score}</p>
    <button onClick={Commands.Increment}>Increment</button>
    <button onClick={Commands.Done}>Done</button>
  </div>
));


export const createExercise = (score) =>
  Model.create({ score });
