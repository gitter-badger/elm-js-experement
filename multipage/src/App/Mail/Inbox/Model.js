// @flow
/**
 * Model file should contain type declaration of the block
 * and some related to the model additional types.
 */
import type { Model as LetterModel } from '../Letter';


export type Box = {
  id: string,
  title: string
};

export type Model = {
  boxes: Array<Box>,
  letters: Array<LetterModel>,
  rawLetters: Array<LetterModel>,
  search: String
};
