import EventBus from "../utilities/EventBus";

export default class RenderController {
  #playerCells;
  #enemyCells;
  #playerBoard;
  #targetBoard;

  constructor() {
    this.#playerCells = this.#createCellMap(".board1 > .gameboard");
    this.#enemyCells = this.#createCellMap(".board2 > .gameboard");

    this.#playerBoard = document.querySelector(".player-board");
    this.#targetBoard = document.querySelector(".target-board");

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

    if (turn.getPlayer().isAI()) {
      this.#targetBoard.style.pointerEvents = "none";
    } else {
      this.#targetBoard.style.pointerEvents = "";
    }

    this.renderPlayerBoard(turn);
    this.renderEnemyBoard(turn);
  }

  renderPlayerBoard(turn) {
    this.clearBoard(this.#playerCells);

    this.#playerBoard.querySelector("h2").textContent =
      `${turn.getPlayer().getName()}'s board`;

    const board = turn.getPlayerBoard();

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

  renderEnemyBoard(turn) {
    this.clearBoard(this.#enemyCells);

    this.#targetBoard.querySelector("h2").textContent =
      `${turn.getEnemyPlayer().getName()}'s board`;

    const playerBoard = this.#playerBoard.querySelector(".gameboard");

    const activePlayer = turn.getPlayer();
    const enemyPlayer = turn.getEnemyPlayer();

    const isAIVsHuman = activePlayer.isAI() !== enemyPlayer.isAI();
    const aiIsActing = activePlayer.isAI();

    playerBoard.classList.toggle("covered", isAIVsHuman && aiIsActing);

    const board = turn.getTargetBoard();

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
