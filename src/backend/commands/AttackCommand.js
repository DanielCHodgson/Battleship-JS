import EventBus from "../utilities/EventBus";
export default class AttackCommand {
  #turnState;
  #point;
  #wasHit = false;
  #shipHit = null;

  constructor(turnstate, point) {
    this.#turnState = turnstate;
    this.#point = point;
  }

  execute() {
    const result = this.#turnState.getBoard().receiveAttack(this.#point);
    this.#turnState.markAttackDone();
    this.#wasHit = result === "hit";

    if (this.#wasHit) {
      this.#shipHit = this.#turnState.getBoard().getShipAt(this.#point);
    }

    EventBus.emit("attack resolved", {
      board: this.#turnState.getBoard(),
      result,
      point: this.#point,
    });

    return result;
  }

  undo() {
    this.#turnState
      .getBoard()
      .revertAttack(this.#point, this.#wasHit, this.#shipHit);
    this.#turnState.markAttackUndone();
    EventBus.emit("attack undone", this.#turnState);
  }
}
