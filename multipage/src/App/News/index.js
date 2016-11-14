import { BaseModel, ViewProps, InitProps } from 'mangojuice';
import { Model as Shared } from '../../Shared';


export class Model extends BaseModel {
};

export const Commands = {
};

export const Messages = {
  title: 'NEWS.TITLE'
};

export const view = (
  { model, shared, nest, exec }
  : ViewProps<Model, Shared>
) => (
  <div>
    {shared.intl.formatMessage(Messages.title)}
  </div>
);

export const init = (
  { nest, shared }
  : InitProps<Model, Shared>
) =>
  new Model()
