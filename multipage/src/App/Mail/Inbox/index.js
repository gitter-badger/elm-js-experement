// @flow
import type { InitProps, InitModel } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import type { Model } from './Model';
import { RouterSubscription } from './Commands';


export * as Commands from './Commands';
export { View } from './View';
export type { Model } from './Model';

export const init = (
  { shared, subscribe } : InitProps<SharedModel>
) : InitModel<Model> => ({
  subs: subscribe(shared.route, RouterSubscription),
  model: {
    boxes: [],
    letters: []
  }
})
