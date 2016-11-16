// @flow
import type { CmdProps } from 'mangojuice/types';
import type { Model as RouterModel } from 'mangojuice/Router'
import type { Model as SharedModel } from 'src/Shared';
import type { Model as LetterModel } from '../Letter';
import type { Model } from './Model';
import { Cmd } from 'mangojuice';
import * as Tasks from './Tasks';


// Get boxes list
export const RetreiveBoxesSuccess = Cmd.update((
  { model }: CmdProps<Model, SharedModel>,
  nextBoxes : Array<any>
) => ({
  boxes: nextBoxes
}));

export const RetreiveBoxesFailed = Cmd.nope();

export const RetreiveBoxes = Cmd.execLatest(
  Tasks.GetBoxesList
  .success(RetreiveBoxesSuccess)
  .fail(RetreiveBoxesFailed)
);


// Get letters for active box
export const RetreiveBoxLettersSuccess = Cmd.update((
  { nest }: CmdProps<Model, SharedModel>,
  nextLetters: Array<any>
) => ({
  letters: nextLetters.map(l => nest(LetterMiddleware, Letter.init, l))
}));

export const RetreiveBoxLettersFailed = Cmd.nope();

export const RetreiveBoxLetters = Cmd.execLatest(
  Tasks.GetBoxLetters
  .success(RetreiveBoxLettersSuccess)
  .fail(RetreiveBoxLettersFailed)
);


// Remove letter from the list
export const FilterOutLetter = Cmd.update((
  { model }: CmdProps<Model, SharedModel>,
  letter: LetterModel
) => ({
  letters: model.letters.filter(x => x !== letter)
}));


// Catch letter commands to change inbox model
export const LetterMiddleware = Cmd.middleware()
  .on(Letter.Commands.Delete, (
    props: CmdProps<Model, SharedModel>,
    letter: Letter.Model,
    letterCmd
  ) => [
    FilterOutLetter.with(letter),
    letterCmd
  ]);


// Handle route changes and generate appropreate commands
export const RouterSubscription = Cmd.subscription((
  { shared }: CmdProps<Model, SharedModel>,
  route: RouterModel
) => [
  shared.route.firstTime(MailRoutes.Inbox) && RetreiveBoxes,
  shared.route.changed(MailRoutes.Inbox) && RetreiveBoxLetters,
]);
