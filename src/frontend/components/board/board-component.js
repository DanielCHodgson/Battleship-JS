import DomUtility from "../../utilities/DomUtility";
import htmlString from "./board-component.html";
import "./board-component.css";
import EventBus from "../../../backend/utilities/EventBus";

export default class BoardComponent {
  #container;
  #element;
  #cellHandlers = new Map();
  #hoverHandlers = new Map();
  #grid = [];
  #cellMap = null;
  #interactive;

  constructor(container, { interactive = true } = {}) {
    this.#container = container;
    this.#interactive = interactive;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.#element.classList.toggle("non-interactive", !interactive);
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
      if (!this.#interactive) return;
      EventBus.emit("point selected", {
        x: col,
        y: row,
      });
    };

    const onHover = () => {
      if (!this.#interactive) return;
      EventBus.emit("point hovered", {
        x: col,
        y: row,
      });
    };

    if (this.#interactive) {
      square.addEventListener("click", onClick);
      square.addEventListener("mouseenter", onHover);

      this.#cellHandlers.set(square, onClick);
      this.#hoverHandlers.set(square, onHover);
    }

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

  renderDeploymentState(ships) {
    this.clearBoard();
    if (!Array.isArray(ships)) return;

    this.renderShips(ships);
  }

  renderActivePlayerState(boardState, activePlayerIsAI, enemyPlayerIsAI) {
    this.clearBoard();
    if (!boardState) return;

    if (!activePlayerIsAI || (activePlayerIsAI && enemyPlayerIsAI)) {
      const ships = Array.isArray(boardState.ships) ? boardState.ships : [];
      const hits = Array.isArray(boardState.hits) ? boardState.hits : [];
      const misses = Array.isArray(boardState.misses) ? boardState.misses : [];

      this.renderShips(ships);
      this.renderHits(hits);
      this.renderMisses(misses);
    } else {
      this.renderFogOfWar();
    }
  }

  renderTargetPlayerState(targetState) {
    this.clearBoard();
    if (!targetState) return;

    const hits = Array.isArray(targetState.hits) ? targetState.hits : [];
    const misses = Array.isArray(targetState.misses) ? targetState.misses : [];
    this.renderHits(hits);
    this.renderMisses(misses);
  }

  setPreview(point, on) {
    if (!point) return;

    const cell = this.#cellMap.get(`${point.x},${point.y}`);
    if (!cell) return;

    cell.classList.toggle("ai-preview", on);
  }

  setInteractive(interactive) {
    this.#interactive = interactive;
    this.#element?.classList.toggle("non-interactive", !interactive);
  }

  setHoverEnabled(enabled) {
    this.#element?.classList.toggle("hover-disabled", !enabled);
  }

  paintCell(x, y, type) {
    const cell = this.#cellMap.get(`${x},${y}`);
    if (!cell) return;

    cell.classList.add(type);
  }

  renderShips(ships) {
    ships.forEach((ship) => {
      const positions = Array.isArray(ship?.positions) ? ship.positions : [];

      positions.forEach(({ x, y }) => {
        this.paintCell(x, y, "ship");
      });
    });
  }

  renderMisses(misses) {
    misses.forEach(({ x, y }) => this.paintCell(x, y, "miss"));
  }

  renderHits(hits) {
    hits.forEach(({ x, y }) => this.paintCell(x, y, "hit"));
  }

  clearBoard() {
    this.#element?.classList.remove("covered");
    this.#grid.forEach((cell) => {
      cell.classList.remove("ship", "hit", "miss", "disabled", "ai-preview");
    });
  }

  renderFogOfWar() {
    this.#element.classList.add("covered");
  }

  destroy() {
    this.#cellHandlers.forEach((handler, cell) => {
      cell.removeEventListener("click", handler);
    });

    this.#hoverHandlers.forEach((handler, cell) => {
      cell.removeEventListener("mouseenter", handler);
    });

    this.#cellHandlers.clear();
    this.#hoverHandlers.clear();

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
