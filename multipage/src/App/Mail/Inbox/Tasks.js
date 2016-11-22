// @flow
/**
 * Tasks file is the place for all server side interactions and some
 * other asynchronous actions, like debouncing. You should place here
 * everything related with data parsing and checking, HTTP requests etc.
 *
 * Do not worry about exceptions in the task. Each task will be executed
 * in scope of some success and fail commands. So, if the task finished
 * successfully and return some object – success task will be executed.
 * Otherwise – fail task with exception object passed into it.
 *
 * The task is just a generator function. It is executed using redux-saga.
 */
import type { CmdProps } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import type { Model } from './Model';
import { Task } from 'mangojuice';


export const GetBoxesList = function* () {
  yield Task.delay(2000);
  const data = yield Task.call(_getBoxesList);
  return data;
};


export const GetBoxLetters = function* (
  { shared }: CmdProps<Model, SharedModel>
) {
  yield Task.delay(2000);
  const data = yield Task.call(_getMailsList, shared.route.box);
  return data;
};

export const SearchLetters = function* ({ model }) {
  yield Task.delay(350);
  return model.rawLetters.filter(x => 
    x.text.indexOf(model.search) >= 0
  );
};

export const _getBoxesList = () => {
  return Promise.resolve([
    { id: '1', title: 'Box 1' },
    { id: '2', title: 'Box 2' },
    { id: '3', title: 'Box 3' },
    { id: '4', title: 'Box 4' },
  ]);
};

export const _getMailsList = (boxId : string) => {
  return Promise.resolve([
    { title: `${boxId} mail 1`, text: 'Letter 1' },
    { title: `${boxId} mail 2`, text: 'Letter 2' },
    { title: `${boxId} mail 3`, text: 'Letter 3' },
    { title: `${boxId} mail 4`, text: 'Letter 4' },
  ]);
};
