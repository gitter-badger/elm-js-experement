export class Cmd {
  static middleware() {
    return {
      on: () => {
        return Cmd.middleware();
      }
    }
  }

  static subscription() {

  }

  static execLatest() {

  }

  static update() {

  }

  static batch() {

  }

  static nope() {

  }
}


export class Task {
  success() {

  }

  fail() {

  }
}


export class Process {
  static start() {

  }
}
