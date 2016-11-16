// @flow
import type { CmdProps } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import type { Model } from './Model';
import { Task } from 'mangojuice';


export const GetBoxesList = new Task(function* () {
  yield Task.call(Task.delay, 2000);
  const data = yield Task.call(_getBoxesList);
  return data;
});


export const GetBoxLetters = new Task(function* (
  { shared }: CmdProps<Model, SharedModel>
) {
  yield Task.call(Task.delay, 2000);
  const data = yield Task.call(_getMailsList, shared.route.box);
  return data;
});


export const _getBoxesList = () => {
  return Promise.resolve([
    { id: '1', title: 'Box 1' },
    { id: '2', title: 'Box 2' },
    { id: '3', title: 'Box 3' },
    { id: '4', title: 'Box 4' },
  ]);
};

export const _getMailsList = (boxId : number) => {
  return Promise.resolve([
    { title: `${boxId} mail 1`, text: 'Letter 1' },
    { title: `${boxId} mail 2`, text: 'Letter 2' },
    { title: `${boxId} mail 3`, text: 'Letter 3' },
    { title: `${boxId} mail 4`, text: 'Letter 4' },
  ]);
};
