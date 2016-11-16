// @flow
import type { ViewProps, InitProps, InitModel } from '../../../../mangojuice/types';
import type { Model as SharedModel } from '../../Shared';
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
  <div>
    {shared.intl.formatMessage(Messages.title)}
  </div>
);

export const init = (
  { shared, nest, subscribe }
  : InitProps<SharedModel>
) : InitModel<Model> => ({
  news: []
})
