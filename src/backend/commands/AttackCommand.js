export default class AttackCommand {
  #turnManager;
  #point;

  #turn = null;
  #board = null;
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

    this.#turn = turn;
    this.#board = board;
    this.#wasHit = attack.result === "hit";
    this.#shipHit = attack.ship ?? null;

    turn.markAttackDone();
    return attack.result;
  }

  undo() {
    if (!this.#turn || !this.#board) return;

    this.#board.revertAttack(this.#point, this.#wasHit, this.#shipHit);
    this.#turn.markAttackUndone();
  }
}
