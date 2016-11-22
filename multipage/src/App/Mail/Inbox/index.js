// @flow
import type { InitProps, InitModel } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import type { Model } from './Model';
import { Cmd } from 'mangojuice';
import * as Cmds from './Commands';


export const Commands = Cmd.debug(Cmds);
export { View } from './View';
export type { Model } from './Model';

export const init = (
  { shared, subscribe } : InitProps<SharedModel>
) : InitModel<Model> => ({
  subs: subscribe(shared.route, Commands.RouterSubscription),
  model: {
    search: '',
    boxes: [],
    letters: [],
    rawLetters: []
  }
})
