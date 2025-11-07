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
    EventBus.on("square clicked", (square) => {
      this.#fields.actionDisplay.textContent = `Selected (${square.x}, ${square.y})`;
    });

    EventBus.on("turn started", (data) => this.#printTurnInfo(data.state));
  }

  #printTurnInfo(state) {
    this.#fields.turnDisplay.textContent =
    `
    Turn: ${state.getTurn()} |
    Active player: ${state.getPlayer().getName()}
    `;
  }

  render() {
    this.#container.appendChild(this.#element);
  }
}
