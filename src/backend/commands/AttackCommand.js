export default class AttackCommand {
  #turnManager;
  #point;
  #executedTurn = null;
  #targetedBoard = null;
  #wasHit = false;
  #shipHit = null;

  constructor(turnManager, point) {
    this.#turnManager = turnManager;
    this.#point = point;
  }

  execute() {
    const turn = this.#turnManager.getCurrentTurn();
    if (!turn || turn.hasAttacked()) return false;

    const board = turn.getTargetBoard();
    const attack = board.receiveAttack(this.#point);

    if (!attack?.ok) return false;

    this.#executedTurn = turn;
    this.#targetedBoard = board;
    this.#wasHit = attack.result === "hit";
    this.#shipHit = attack.ship ?? null;

    turn.markAttackDone();

    return attack.result;
  }

  undo() {
    if (!this.#executedTurn || !this.#targetedBoard) return;

    this.#targetedBoard.revertAttack(this.#point, this.#wasHit, this.#shipHit);
    this.#executedTurn.markAttackUndone();
  }
}
