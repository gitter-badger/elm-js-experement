// @flow
import type { InitModel, CmdProps } from './types';
import { Cmd } from './index';


export type Model = {
  locale: string,
  messages: { [key: string]: string },
  languages: { [key: string]: any },
  formatMessage: (a: string, ...b: Array<any>) => string
};


export const Commands = {
  ChangeLocale: Cmd.batch((props, nextLocale : string) => [
    Commands.SetNewLocale.with(nextLocale),
    Commands.LoadMessages
  ]),
  SetNewLocale: Cmd.update((props, nextLocale : string) => ({
    locale: nextLocale
  })),
  LoadMessages: Cmd.update(({ model } : CmdProps<Model>) => {
    messages: model.languages[model.locale].translations
  })
};


export const init = (props, languages) : InitModel<Model> => ({
  bindCommands: Commands,
  command: Commands.LoadMessages,
  model: createModel(languages)
});


const createModel = (languages) : Model => ({
  languages,
  messages: {},
  locale: Object.keys(languages).find(x => languages[k].default),
  formatMessage(id: string, ...args: Array<any>) : string {
    return this.messages[id] || id;
  }
});
