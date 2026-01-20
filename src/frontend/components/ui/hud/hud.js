import DomUtility from "../../../utilities/DomUtility";
import htmlString from "./hud.html";
import "./hud.css";

import EventBus from "../../../../backend/utilities/EventBus";

export default class Hud {
  #container;
  #element;
  #fields = {};

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);

    this.#cacheFields();
    this.#registerEvents();
    this.render();
  }

  #cacheFields() {
    this.#fields.actionDisplay = this.#element.querySelector(".action-display");
    this.#fields.turnDisplay = this.#element.querySelector(".turn-display");
  }

  #registerEvents() {
    EventBus.on("state changed", (state) => this.renderState(state));
  }

  renderState({ turn, phase }) {
    if (!turn) return;

    this.renderTurnInfo(turn);
    this.renderActionInfo(turn, phase);
  }

  renderTurnInfo(turn) {
    this.#fields.turnDisplay.textContent =
      `Turn: ${turn.getRound()} | ` +
      `Active player: ${turn.getPlayer().getName()}`;
  }

  renderActionInfo(turn, phase) {
    if (phase === "gameover") {
      this.#fields.actionDisplay.textContent =
        `Game Over! ${turn.getPlayer().getName()} ` +
        `won in ${turn.getRound()} turns!`;
      return;
    }

    if (turn.hasAttacked()) {
      this.#fields.actionDisplay.textContent = `${turn.getPlayer().getName()} has attacked`;
      return;
    }

    this.#fields.actionDisplay.textContent = "";
  }

  render() {
    this.#container.appendChild(this.#element);
  }
}
