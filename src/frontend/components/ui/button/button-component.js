import EventBus from "../../../../backend/utilities/EventBus";
import DomUtility from "../../../utilities/DomUtility";
import htmlString from "./button-component.html";
import "./button-component.css";

export default class Button {
  #container;
  #id;
  #name;
  #element;

  constructor(container, id, label, eventName) {
    this.#container = container;
    this.#id = id;
    this.#name = label;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.#element.id = this.#id;
    this.#element.textContent = this.#name;
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
    this.#container.appendChild(this.#element);
  }
}
