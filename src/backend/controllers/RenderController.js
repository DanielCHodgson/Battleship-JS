import EventBus from "../utilities/EventBus";

export default class RenderController {
  #playerCells;
  #enemyCells;

  constructor() {
    this.#playerCells = this.#createCellMap(".board1 > .gameboard");
    this.#enemyCells = this.#createCellMap(".board2 > .gameboard");
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("state changed", (state) => this.render(state));
    EventBus.on("ai preview", (point) => this.setPreview(point, true));
    EventBus.on("ai preview cleared", (point) => this.setPreview(point, false));
  }

  #createCellMap(selector) {
    const cells = new Map();
    document.querySelectorAll(`${selector} > *`).forEach((cell) => {
      const key = `${cell.dataset.col},${cell.dataset.row}`;
      cells.set(key, cell);
    });
    return cells;
  }

  render(state) {
    const turn = state.getTurn();
    this.renderPlayerBoard(turn);
    this.renderEnemyBoard(
      turn.getTargetBoard(),
      state.getPhase(),
      turn.hasAttacked(),
    );
  }

  renderPlayerBoard(turn) {

    const targetBoard = document.querySelector(".target-board")

    if (turn.getPlayer().isAI()) {
     targetBoard.style.pointerEvents = "none";
    } else {
      targetBoard.style.pointerEvents = "";
    }

    const board = turn.getPlayerBoard();
    this.clearBoard(this.#playerCells);

    board.getShips().forEach((ship) =>
      ship.getPositions().forEach(({ x, y }) => {
        this.paintCell(this.#playerCells, x, y, "ship");
      }),
    );
    board
      .getHits()
      .forEach(({ x, y }) => this.paintCell(this.#playerCells, x, y, "hit"));
    board
      .getMisses()
      .forEach(({ x, y }) => this.paintCell(this.#playerCells, x, y, "miss"));
  }

  renderEnemyBoard(board) {
    this.clearBoard(this.#enemyCells);

    board
      .getHits()
      .forEach(({ x, y }) => this.paintCell(this.#enemyCells, x, y, "hit"));
    board
      .getMisses()
      .forEach(({ x, y }) => this.paintCell(this.#enemyCells, x, y, "miss"));
  }

  setPreview(point, on) {
    const cell = this.#enemyCells.get(`${point.x},${point.y}`);
    if (!cell) return;
    cell.classList.toggle("ai-preview", on);
  }

  paintCell(cellMap, x, y, type) {
    const cell = cellMap.get(`${x},${y}`);
    if (!cell) return;

    cell.classList.add(`${type}`);
  }

  clearBoard(cellMap) {
    cellMap.forEach((cell) =>
      cell.classList.remove("ship", "hit", "miss", "disabled"),
    );
  }
}
