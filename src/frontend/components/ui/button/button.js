import EventBus from "../../../../backend/utilities/EventBus";
import DomUtility from "../../../utilities/DomUtility";
import htmlString from "./button.html";
import "./button.css";

export default class Button {
  #container;
  #name;
  #element;

  constructor(container, name, eventName) {
    this.#container = container;
    this.#name = name;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.#registerEvent(eventName);
    this.render();
  }

  #registerEvent(eventName) {
    this.#element.addEventListener("click", () => this.#handleClick(eventName));
  }

  #handleClick(eventName) {
    if (typeof eventName == "string") EventBus.emit(eventName);
  }

  render() {
    this.#element.textContent = this.#name;
    this.#container.appendChild(this.#element);
  }
}
