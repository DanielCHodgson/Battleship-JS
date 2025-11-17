import EventBus from "../utilities/EventBus";
export default class AttackCommand {
  #board;
  #point;

  #wasHit = false;
  #shipHit = null;

  constructor(board, point) {
    this.#board = board;
    this.#point = point;
  }

  execute() {
    const result = this.#board.receiveAttack(this.#point);
    this.#wasHit = result === "hit";
    
    if (this.#wasHit) {
      this.#shipHit = this.#board.getShipAt(this.#point);
    }

    EventBus.emit("attack resolved", {
      board: this.#board,
      result,
      point: this.#point,
    });

    return result;
  }

  undo() {
    this.#board.undoAttack(this.#point, this.#wasHit, this.#shipHit);

    EventBus.emit("attack undone", {
      board: this.#board,
      point: this.#point,
    });
  }
}
