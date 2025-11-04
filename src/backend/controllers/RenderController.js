import EventBus from "../utilities/EventBus";

export default class RenderController {
  #board;

  constructor(board) {
    this.#board = board;
    EventBus.on("render ship", (ship) => this.renderShip(ship));
    EventBus.on("attack result", (data) => this.renderAttack(data));
  }

  renderShip(ship) {
    const positions = ship.getPositions();
    positions.forEach(({ x, y }) => this.#board.markShip(x, y));
  }

  renderAttack({ position, result }) {
    if (result === "hit") this.#board.markHit(position.x, position.y);
    else this.#board.markMiss(position.x, position.y);
  }
}
