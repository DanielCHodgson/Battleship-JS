export default class NextTurnCommand {
  #turnManager;

  constructor(turnManager) {
    this.#turnManager = turnManager;
  }

  execute() {
    return this.#turnManager.nextTurn();
  }

  undo() {
    this.#turnManager.previousTurn();
  }
}
