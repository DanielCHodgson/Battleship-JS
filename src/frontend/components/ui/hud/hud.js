import DomUtility from "../../../utilities/DomUtility";
import htmlString from "./hud.html";
import "./hud.css";

import EventBus from "../../../../backend/utilities/EventBus";

export default class Hud {
  #container;
  #element;
  #fields = {};
  #lastTurnIndex = null;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.#cacheFields();
    this.#registerEvents();
    this.render();
  }

  #cacheFields() {
    this.#fields.actionDisplay =
      this.#element.querySelector(".action-display");
    this.#fields.turnDisplay =
      this.#element.querySelector(".turn-display");
  }

  #registerEvents() {
    EventBus.on("state changed", (state) => this.renderState(state));
  }

  renderState({ turn, phase }) {
    if (!turn) return;

    this.#renderTurnInfo(turn);
    this.#renderActionInfo(turn);

    if (phase === "gameover") {
      this.#renderGameEnd(turn);
    }
  }

  #renderTurnInfo(turn) {
    this.#fields.turnDisplay.textContent =
      `Turn: ${turn.getRound()} | ` +
      `Active player: ${turn.getPlayer().getName()}`;
  }

  #renderActionInfo(turn) {
    if (turn.getIndex() !== this.#lastTurnIndex) {
      this.#fields.actionDisplay.textContent = "";
      this.#lastTurnIndex = turn.getIndex();
      return;
    }

    if (turn.hasAttacked()) {
      this.#fields.actionDisplay.textContent =
        `${turn.getPlayer().getName()} has attacked`;
    }
  }

  #renderGameEnd(turn) {
    this.#fields.actionDisplay.textContent =
      `Game Over! ${turn.getPlayer().getName()} ` +
      `won in ${turn.getRound()} turns!`;
  }

  render() {
    this.#container.appendChild(this.#element);
  }
}
