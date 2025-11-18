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
    EventBus.on("turn state updated", (turnState) => this.#printTurnInfo(turnState));
    EventBus.on("turn advanced", (turnState) => this.#printTurnInfo(turnState));
    EventBus.on("attack resolved", (data) => this.#printAttackInfo(data));
    EventBus.on("turn restored", (turnState) => this.#printTurnInfo(turnState));
    EventBus.on("attack error", (data) => this.#printErrorInfo(data));
    EventBus.on("game over", (turnState) => this.#printGameEndMessage(turnState));
  }

  #printTurnInfo(turnState) {
    this.#fields.actionDisplay.textContent = "";
    this.#fields.turnDisplay.textContent = `
    Turn: ${turnState.getRound()} |
    Active player: ${turnState.getPlayer().getName()}
    `;
  }

  #printAttackInfo(data) {
    const { point, result } = data;
    this.#fields.actionDisplay.textContent = `Attacked (${point.x},${point.y}) resulting in a ${result}`;
  }

  #printErrorInfo(data) {
    this.#fields.actionDisplay.textContent = data.error;
  }

  #printGameEndMessage(turnturnState) {
    this.#fields.actionDisplay.textContent = `Game Over! ${turnturnState.getPlayer().getName()} won in ${turnturnState.getRound()} turns!`;
  }

  render() {
    this.#container.appendChild(this.#element);
  }
}
