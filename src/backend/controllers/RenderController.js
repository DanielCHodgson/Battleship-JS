import EventBus from "../utilities/EventBus";

export default class RenderController {
  #board;

  constructor(board) {
    this.#board = board;
    EventBus.on("render ship", (ship) => this.renderShip(ship));
    EventBus.on("render attack", ({ point, result }) => this.renderAttack({ point, result }));
  }

  renderShip(ship) {
    const positions = ship.getPositions();
    positions.forEach(({ x, y }) => this.#board.markShip(x, y));
  }

  renderAttack({ point, result }) {
    if (result === "hit") this.#board.markHit(point.x, point.y);
    else this.#board.markMiss(point.x, point.y);
  }
}
