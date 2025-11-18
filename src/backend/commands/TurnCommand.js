export default class TurnCommand {
  #turnManager;
  #prevAttackState = null;

  constructor(turnManager) {
    this.#turnManager = turnManager;
  }

  execute() {
    const currentTurn = this.#turnManager.getCurrentTurnState();
    if (!currentTurn || !currentTurn.hasAttacked()) return false;
    this.#prevAttackState = currentTurn.getAttackState();
    this.#turnManager.nextTurn();
    return true;
  }

  undo() {
    this.#turnManager.previousTurn();
    const prevTurn = this.#turnManager.getCurrentTurnState();
    if (prevTurn && this.#prevAttackState !== null) {
      prevTurn.setAttackState(this.#prevAttackState);
    }
  }
}
