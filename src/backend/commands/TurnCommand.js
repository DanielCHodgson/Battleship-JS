export default class TurnCommand {
  #turnManager;

  constructor(turnManager) {
    this.#turnManager = turnManager;
  }

  execute() {
    this.#turnManager.nextTurn();
  }

  undo() {
    this.#turnManager.previousTurn();
  }
}
