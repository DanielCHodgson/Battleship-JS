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
    this.#casheFields();
    this.#registerEvents();
    this.render();
  }

  #casheFields() {
    this.#fields.actionDisplay = this.#element.querySelector(".action-display");
    this.#fields.turnDisplay = this.#element.querySelector(".turn-display");
  }

  #registerEvents() {
    EventBus.on("turn state updated", (state) => this.#printTurnInfo(state));
    EventBus.on("attack resolved", (data) => this.#printAttackInfo(data));
    EventBus.on("attack error", (data) => this.#printErrorInfo(data));
    EventBus.on("game over", (turnState) => this.#printGameEndMessage(turnState));
  }

  #printTurnInfo(state) {
    this.#fields.actionDisplay.textContent = "";
    this.#fields.turnDisplay.textContent = `
    Turn: ${state.getTurn()} |
    Active player: ${state.getPlayer().getName()}
    `;
  }

  #printAttackInfo(data) {
    const { point, result } = data;
    this.#fields.actionDisplay.textContent = `Attacked (${point.x},${point.y}) resulting in a ${result}`;
  }

  #printErrorInfo(data) {
    this.#fields.actionDisplay.textContent = data.error;
  }

  #printGameEndMessage(turnState) {
    this.#fields.actionDisplay.textContent = `Game Over! ${turnState.getPlayer().getName()} won in ${turnState.getTurn()} turns!`;
  }

  render() {
    this.#container.appendChild(this.#element);
  }
}
