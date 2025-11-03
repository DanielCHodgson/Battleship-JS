import EventBus from "../utilities/EventBus";

export default class RenderController {
  constructor() {
    EventBus.on("board ready", (boardEl) => this.renderBoard(boardEl));
    EventBus.on("render ship", (ship) => this.renderShip(ship));
    EventBus.on("attack result", (data) => this.renderAttack(data));
  }

  renderBoard(boardElement) {
    console.log("Board is ready!");
  }

  renderShip(ship) {
    const positions = ship.getPositions();
    const board = document.querySelector(".gameboard");
    positions.forEach((p) => {
      const square = board.querySelector(
        `.square[data-row="${p.y}"][data-col="${p.x}"]`,
      );
      if (square) square.classList.add("ship");
    });
  }

  renderAttack({ position, result }) {
    const board = document.querySelector(".gameboard");
    const square = board.querySelector(
      `.square[data-row="${position.y}"][data-col="${position.x}"]`,
    );
    if (!square) return;
    square.classList.add(result === "hit" ? "hit" : "miss");
  }
}
