// @flow
/**
 * This is the place for all commands. Commands usually very simple and
 * doing only a few kind of things:
 *    1. Updating a model with some object passed to update command
 *    2. Define execution of some task (and success/fail commands)
 *    3. Define middleware for commands from children block
 *    4. Define subscription for handling changes of shared models
 *
 * So, as you can see, commands do not going to the server, do not parse
 * anything. But it contains business logic of the block – what should
 * be executed when and how the model should be affected.
 */
import type { CmdProps } from 'mangojuice/types';
import type { Model as RouterModel } from 'mangojuice/Router'
import type { Model as SharedModel } from 'src/Shared';
import type { Model, Box } from './Model';
import { Cmd } from 'mangojuice';
import { MailRoutes } from 'src/routes';
import * as Letter from '../Letter';
import * as Tasks from './Tasks';


// Get boxes list
export const RetreiveBoxesSuccess = Cmd.update((
  { model }: CmdProps<Model, SharedModel>,
  nextBoxes : Array<Box>
) => ({
  boxes: nextBoxes
}));
export const RetreiveBoxesFailed = Cmd.nope();
export const RetreiveBoxes = Cmd.execLatest(
  RetreiveBoxesSuccess,
  RetreiveBoxesFailed,
  Tasks.GetBoxesList
);

// Letters searching
export const SetLettersList = Cmd.update((props, nextLetters) => ({
  letters: nextLetters
}));
export const SetSearchQuery = Cmd.update((props, text) => ({
  search: text
}));
export const DebouncedSearchLetters = Cmd.execLatest(
  SetLettersList,
  Cmd.nope(),
  Tasks.SearchLetters
);
export const SearchLetters = Cmd.batch((props, event) => [
  SetSearchQuery.bindArgs(event.target.value),
  DebouncedSearchLetters
]);


// Get letters for active box
export const SetRawLetters = Cmd.update((
  { nest }: CmdProps<Model, SharedModel>,
  nextLetters: Array<Letter.Model>
) => ({
  rawLetters: nextLetters.map(l => nest(LetterMiddleware, Letter, l))
}));
export const CleanupLetters = Cmd.update(() => ({
  rawLetters: [],
  letters: []
}))
export const RetreiveBoxLettersSuccess = Cmd.batch((props, letters) => [
  SetRawLetters.bindArgs(letters),
  DebouncedSearchLetters
]);
export const RetreiveBoxLettersFailed = Cmd.nope();
export const DoRetreiveBoxLetters = Cmd.execLatest(
  RetreiveBoxLettersSuccess,
  RetreiveBoxLettersFailed,
  Tasks.GetBoxLetters
);
export const RetreiveBoxLetters = Cmd.batch(() => [
  CleanupLetters,
  DoRetreiveBoxLetters
]);



// Remove letter from the list
export const FilterOutLetter = Cmd.update((
  { model }: CmdProps<Model, SharedModel>,
  letter: Letter.Model
) => ({
  letters: model.letters.filter(x => x !== letter),
  rawLetters: model.rawLetters.filter(x => x !== letter),
}));


// Catch letter commands to change inbox model
export const LetterMiddleware = Cmd.middleware()
  .on(Letter.Commands.Delete, (props, letter: Letter.Model, letterCmd) => [
    FilterOutLetter.bindArgs(letter),
    letterCmd
  ]);


// Handle route changes and generate appropreate commands
export const RouterSubscription = Cmd.subscription(({ shared }) => [
  shared.route.firstTime(MailRoutes.Inbox) && RetreiveBoxes,
  shared.route.changed(MailRoutes.Inbox) && RetreiveBoxLetters,
]);
