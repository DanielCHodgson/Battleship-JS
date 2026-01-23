export default class CompositeCommand {
  #commands = [];
  #executed = [];

  constructor(commands) {
    this.#commands = commands;
  }

  execute() {
    this.#executed = [];

    for (const cmd of this.#commands) {
      const result = cmd.execute();

      if (result === false) {
        for (let i = this.#executed.length - 1; i >= 0; i--) {
          this.#executed[i].undo();
        }
        return false;
      }

      this.#executed.push(cmd);
    }

    return true;
  }

  undo() {
    for (let i = this.#executed.length - 1; i >= 0; i--) {
      this.#executed[i].undo();
    }
  }
}
