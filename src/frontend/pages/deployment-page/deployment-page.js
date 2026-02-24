import DomUtility from "../../utilities/DomUtility";
import htmlString from "./deployment-page.html";
import "./deployment-page.css";

import EventBus from "../../../backend/utilities/EventBus";
import BoardComponent from "../../components/board/board-component";

export default class DeploymentPage {
  #container;
  #element;

  #boardContainer = null;
  #boardComponent = null;
  #onStateChanged = null;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
  }

  open() {
    this.renderElement();
    this.#cacheFields();
    this.#boardComponent = new BoardComponent(this.#boardContainer);
    this.#registerEvents();
  }

  #cacheFields() {
    this.#boardContainer = this.#element.querySelector(".board");
  }

  #registerEvents() {
    this.#onStateChanged = (state) => this.#boardComponent.renderState(state);
    EventBus.on("state changed", this.#onStateChanged);
  }

  renderElement() {
    this.#container.innerHTML = "";
    this.#container
    this.#container.appendChild(this.#element);
  }

  renderState(state) {
    console.log(this.#boardComponent);
    this.#boardComponent?.renderState(state);
  }

  destroy() {
    if (this.#onStateChanged)
      EventBus.off("state changed", this.#onStateChanged);

    this.#onStateChanged = null;

    this.#boardComponent?.destroy();

    if (this.#element?.parentNode)
      this.#element.parentNode.removeChild(this.#element);

    this.#boardComponent = null;
    this.#boardContainer = null;
    this.#element = null;
    this.#container = null;
  }
}
