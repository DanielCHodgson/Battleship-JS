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
  #controlMount = null;
  #board1 = null;
  #board2 = null;

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
    this.#hudComponent = new Hud(this.#display, this.#controlMount);
    this.#activeBoard = new BoardComponent(this.#board1, { interactive: false });
    this.#targetBoard = new BoardComponent(this.#board2);
    this.#registerEvents();
  }

  #cacheFields() {
    this.#display = this.#element.querySelector(".display");
    this.#controlMount = this.#element.querySelector(".control-mount");
    this.#board1 = this.#element.querySelector(".board1");
    this.#board2 = this.#element.querySelector(".board2");
  }

  #registerEvents() {
    this.#handlers.onShowAiPreview = (point) => {
      this.#targetBoard?.setHoverEnabled(false);
      this.#targetBoard?.setPreview(point, true);
    };
    this.#handlers.onClearAiPreview = (point) => {
      this.#targetBoard?.setPreview(point, false);
      this.#targetBoard?.setHoverEnabled(true);
    };

    EventBus.on("show ai preview", this.#handlers.onShowAiPreview);
    EventBus.on("clear ai preview", this.#handlers.onClearAiPreview);
  }

  renderState(state) {
    if (!this.#activeBoard || !this.#targetBoard || !state) return;

    const turn = state.getTurn();
    if (!turn) return;

    this.#targetBoard.setInteractive(
      !turn.getPlayer().isAI() && !state.getAttackFeedback(),
    );
    this.#hudComponent?.renderState(state);
    this.#activeBoard.renderActivePlayerState(
      this.#serializeBoard(turn.getPlayer().getBoard()),
      turn.getPlayer().isAI(),
      turn.getEnemy().isAI(),
    );
    this.#targetBoard.renderTargetPlayerState(
      this.#serializeBoard(turn.getEnemy().getBoard()),
    );
  }

  destroy() {
    EventBus.off("show ai preview", this.#handlers.onShowAiPreview);
    EventBus.off("clear ai preview", this.#handlers.onClearAiPreview);

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
    this.#controlMount = null;
    this.#board1 = null;
    this.#board2 = null;
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
