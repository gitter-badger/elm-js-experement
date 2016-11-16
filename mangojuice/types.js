// @flow

export type InitSharedProps = {
  nest : <T>(a : any, b : (...c : Array<any>) => InitModel<T>) => T
};

export type InitModel<T> = {
  cmd? : any,
  model : T,
  subs? : Array<any>,
  bindCommands? : any
} | T;

export type InitProps<S> = {
  shared : S,
  nest : <T>(a : any, b : (...c : Array<any>) => InitModel<T>) => T,
  subscribe : Function
};

export type ViewProps<T, G> = {
  model : T,
  shared : G,
  nest : <H>(a : H, b : any, c : (props : ViewProps<H, G>) => any) => any,
  exec : Function
};
