import DomUtility from "../../utilities/DomUtility";
import htmlString from "./game-page.html";
import "./game-page.css";

import Hud from "../../components/ui/hud/hud";
import BoardComponent from "../../components/board/board-component";
import EventBus from "../../../backend/utilities/EventBus";

export default class GamePage {
  #container;
  #element;

  #display = null;
  #board1 = null;
  #board2 = null;
  #buttons = null;

  #hudComponent = null;
  #targetBoard = null;
  #activeBoard = null;

  #handlers = {};

  constructor(container = document.querySelector(".app-wrapper")) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
  }

  open() {
    this.render();
    this.#cacheFields();

    this.#hudComponent = new Hud(this.#display);
    this.#activeBoard = new BoardComponent(this.#board1);
    this.#targetBoard = new BoardComponent(this.#board2);

    this.#registerEvents();
    this.#bindEvents();
  }

  #cacheFields() {
    this.#display = this.#element.querySelector(".display");
    this.#board1 = this.#element.querySelector(".board1");
    this.#board2 = this.#element.querySelector(".board2");
    this.#buttons = this.#element.querySelector(".buttons");
  }

  #registerEvents() {
    this.#handlers.onStateChanged = (state) => {
      if (!this.#activeBoard || !this.#targetBoard) return;

      const turn = state.getTurn();

      this.#activeBoard.renderActivePlayerState(
        this.#serializeBoard(turn.getPlayer().getBoard()),
        turn.getPlayer().isAI(),
        turn.getEnemy().isAI(),
      );

      this.#targetBoard.renderTargetPlayerState(
        this.#serializeBoard(turn.getEnemy().getBoard()),
      );
    };

    EventBus.on("state changed", this.#handlers.onStateChanged);
  }

  #bindEvents() {
    if (!this.#buttons) return;

    this.#handlers.onButtonsClick = (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.dataset.action;
      if (action === "undo") EventBus.emit("undo");
    };

    this.#buttons.addEventListener("click", this.#handlers.onButtonsClick);
  }

  destroy() {
    if (this.#handlers.onStateChanged) {
      EventBus.off("state changed", this.#handlers.onStateChanged);
    }

    if (this.#buttons && this.#handlers.onButtonsClick) {
      this.#buttons.removeEventListener("click", this.#handlers.onButtonsClick);
    }

    this.#hudComponent?.destroy();
    this.#targetBoard?.destroy();
    this.#activeBoard?.destroy();

    if (this.#element?.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }

    this.#handlers = {};
    this.#hudComponent = null;
    this.#targetBoard = null;
    this.#activeBoard = null;
    this.#display = null;
    this.#board1 = null;
    this.#board2 = null;
    this.#buttons = null;
    this.#element = null;
    this.#container = null;
  }

  render() {
    this.#container.innerHTML = "";
    this.#container.appendChild(this.#element);
  }

  #serializeBoard(board) {
    return {
      ships: board.getShips().map((ship) => ({
        positions: ship.getPositions().map((position) => ({ ...position })),
      })),
      hits: board.getHits().map((position) => ({ ...position })),
      misses: board.getMisses().map((position) => ({ ...position })),
    };
  }
}
