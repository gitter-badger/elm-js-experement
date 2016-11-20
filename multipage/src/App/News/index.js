// @flow
import type { ViewProps, InitProps, InitModel } from 'mangojuice/types';
import type { Model as SharedModel } from 'src/Shared';
import React from 'react';


export type Model = {
  news: Array<any>
};

export const Commands = {
};

export const Messages = {
  title: 'NEWS.TITLE'
};

export const View = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
) => (
  <h1>
    {shared.intl.formatMessage(Messages.title)}
  </h1>
);

export const init = (
  { shared, nest, subscribe }
  : InitProps<SharedModel>
) : InitModel<Model> => ({
  model: {
    news: []
  }
})
