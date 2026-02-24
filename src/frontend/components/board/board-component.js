import DomUtility from "../../utilities/DomUtility";
import htmlString from "./board-component.html";
import "./board-component.css";
import EventBus from "../../../backend/utilities/EventBus";

export default class BoardComponent {
  #container;
  #element;
  #cellHandlers = new Map();
  #grid = [];
  #cellMap = null;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.#grid = this.createGrid();
    this.#cellMap = this.#createCellMap();
    this.renderElement();
  }

  createGrid(size = 10) {
    const grid = [];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        grid.push(this.#createCell(row, col));
      }
    }
    return grid;
  }

  #createCell(row, col) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.row = row;
    square.dataset.col = col;

    const onClick = () => {
      EventBus.emit("point selected", {
        x: col,
        y: row,
      });
    };

    square.addEventListener("click", onClick);
    this.#cellHandlers.set(square, onClick);

    return square;
  }

  #createCellMap() {
    const cells = new Map();
    this.#grid.forEach((cell) => {
      const key = `${cell.dataset.col},${cell.dataset.row}`;
      cells.set(key, cell);
    });
    return cells;
  }

  renderElement() {
    if (!this.#element) return;
    this.#container.innerHTML = "";
    this.#grid.forEach((cell) => this.#element.appendChild(cell));
    this.#container.appendChild(this.#element);
  }

  renderState(state) {
    this.clearBoard();

    if (state.getPhase() === "deploying") {
      const deployment = state.getDeployment();
      const ships = deployment?.board?.ships ?? [];

      ships.forEach((ship) =>
        (ship.positions ?? []).forEach(({ x, y }) => this.paintCell(x, y, "ship")),
      );
      return;
    }
    const turn = state.getTurn();
    if (!turn) return;

    const boardState = turn.getPlayerBoard();

    boardState.getShips().forEach((ship) =>
      ship.getPositions().forEach(({ x, y }) => {
        this.paintCell(x, y, "ship");
      }),
    );

    boardState.getHits().forEach(({ x, y }) => this.paintCell(x, y, "hit"));
    boardState.getMisses().forEach(({ x, y }) => this.paintCell(x, y, "miss"));
  }

  setPreview(point, on) {
    const cell = this.#cellMap.get(`${point.x},${point.y}`);
    if (!cell) return;
    cell.classList.toggle("ai-preview", on);
  }

  paintCell(x, y, type) {
    const cell = this.#cellMap.get(`${x},${y}`);
    if (!cell) return;

    cell.classList.add(`${type}`);
  }

  clearBoard() {
    this.#grid.forEach((cell) =>
      cell.classList.remove("ship", "hit", "miss", "disabled", "ai-preview"),
    );
  }

  destroy() {
    this.#cellHandlers.forEach((handler, cell) => {
      cell.removeEventListener("click", handler);
    });
    this.#cellHandlers.clear();

    if (this.#element?.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }

    this.#container = null;
    this.#element = null;
    this.#cellMap = null;
    this.#grid = null;
  }

  getElement() {
    return this.#element;
  }
}