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
    this.renderPlayerBoard(turn.getPlayerBoard());
    this.renderEnemyBoard(turn.getTargetBoard(), state.getPhase(), turn.hasAttacked());
  }

  renderPlayerBoard(board) {
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
