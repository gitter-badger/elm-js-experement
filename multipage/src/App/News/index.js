import { ViewProps, InitProps, InitModel } from 'mangojuice/types';
import { Model as SharedModel } from '../../Shared';


export type Model {
};

export const Commands = {
};

export const Messages = {
  title: 'NEWS.TITLE'
};

export const view = (
  { model, shared, nest, exec }
  : ViewProps<Model, SharedModel>
) => (
  <div>
    {shared.intl.formatMessage(Messages.title)}
  </div>
);

export const init = (
  { shared, nest, subscribe }
  : InitProps<Model, SharedModel>
) : InitModel<Model> =>
  new Model()
