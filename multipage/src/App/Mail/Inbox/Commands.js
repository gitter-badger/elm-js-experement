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


// Get letters for active box
export const RetreiveBoxLettersSuccess = Cmd.update((
  { nest }: CmdProps<Model, SharedModel>,
  nextLetters: Array<Letter.Model>
) => ({
  letters: nextLetters.map(l => nest(LetterMiddleware, Letter.init, l))
}));

export const RetreiveBoxLettersFailed = Cmd.nope();

export const RetreiveBoxLetters = Cmd.execLatest(
  RetreiveBoxLettersSuccess,
  RetreiveBoxLettersFailed,
  Tasks.GetBoxLetters
);


// Remove letter from the list
export const FilterOutLetter = Cmd.update((
  { model }: CmdProps<Model, SharedModel>,
  letter: Letter.Model
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
    FilterOutLetter.bindArgs(letter),
    letterCmd
  ]);


// Handle route changes and generate appropreate commands
export const RouterSubscription = Cmd.subscription(
  ({ shared }) => [
    shared.route.firstTime(MailRoutes.Inbox) && RetreiveBoxes,
    shared.route.changed(MailRoutes.Inbox) && RetreiveBoxLetters,
  ]
);
