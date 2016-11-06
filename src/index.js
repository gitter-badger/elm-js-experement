class BaseModel {
  constructor() {

  }
}
const Mj = {
  Model: BaseModel
};

export class Model extends Mj.Model {
  route = Number
}

new Model();
