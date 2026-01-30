import DomUtility from "../../utilities/DomUtility";
import htmlString from "./deployment-page.html";
import "./deployment-page.css";

import BoardComponent from "../../components/board/board-component";

export default class DeploymentPage {
  #container;
  #element;
  #handlers = {};

  #boardComponent = null;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.#boardComponent = new BoardComponent(this.#element);
  }

  open() {
    this.render();
    this.#cacheFields();
    this.#bindEvents();
  }

  #cacheFields() {
    this.#boardComponent = this.#element.querySelector(".board");
  }

  #bindEvents() {}

  render() {
    this.#container.appendChild(this.#element);
  }

  destroy() {}
}
