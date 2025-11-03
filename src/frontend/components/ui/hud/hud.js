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
    this.#fields.display = this.#element.querySelector(".display");
  }

  #registerEvents() {
    EventBus.on(
      "square clicked",
      (square) =>
        (this.#fields.display.textContent = `Selected (${square.x}, ${square.y})`),
    );
  }

  render() {
    this.#container.appendChild(this.#element);
  }
}
