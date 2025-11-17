import EventBus from "../utilities/EventBus";

export default class RenderController {
  constructor() {
    EventBus.on("attack resolved", (attack) => this.renderBoard(attack.board));
    EventBus.on("turn state updated", (state) => {
      this.clearBoard();
      this.renderBoard(state.getBoard());
    });
    EventBus.on("turn restored", (state) => {
      this.clearBoard();
      this.renderBoard(state.getBoard());
    });
    EventBus.on("game over", () => this.hideElement("#next"));
  }

  renderBoard(board) {
    board.getHits().forEach(({ x, y }) => this.paintCell(x, y, "hit"));
    board.getMisses().forEach(({ x, y }) => this.paintCell(x, y, "miss"));
  }

  renderShips(board) {
    board
      .getShips()
      .forEach((ship) =>
        ship.positions.forEach(({ x, y }) => this.paintCell(x, y, "ship")),
      );
  }

  paintCell(x, y, type) {
    const cell = document.querySelector(`[data-col='${x}'][data-row='${y}']`);
    if (!cell) return;
    cell.classList.remove("ship", "hit", "miss");
    cell.classList.add(type);
  }

  clearBoard() {
    document
      .querySelectorAll(".gameboard > *")
      .forEach((cell) => cell.classList.remove("ship", "hit", "miss"));
  }

  hideElement(selector) {
    const element = document.querySelector(selector);
    if (!element) return;
    element.style.display = "none";
  }
}
