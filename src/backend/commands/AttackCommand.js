export default class AttackCommand {
  #turnState;
  #point;
  #wasHit = false;
  #shipHit = null;

  constructor(turnState, point) {
    this.#turnState = turnState;
    this.#point = point;
  }

  execute() {
    if (this.#turnState.hasAttacked()) return false;

    const board = this.#turnState.getTargetBoard();
    const result = board.receiveAttack(this.#point);

    this.#turnState.markAttackDone();
    this.#wasHit = result === "hit";

    if (this.#wasHit) {
      this.#shipHit = board.getShipAt(this.#point);
    }

    return result;
  }

  undo() {
    this.#turnState
      .getTargetBoard()
      .revertAttack(this.#point, this.#wasHit, this.#shipHit);

    this.#turnState.markAttackUndone();
  }
}
