import DomUtility from "../../utilities/DomUtility";
import htmlString from "./game-page.html";
import "./game-page.css";

import Hud from "../../components/ui/hud/hud";
import BoardComponent from "../../components/board/board-component";
import RenderController from "../../../backend/controllers/RenderController";
import EventBus from "../../../backend/utilities/EventBus";
import Button from "../../components/ui/button/button-component";

export default class GamePage {
  #container;
  #element;

  #display = null;
  #board1 = null;
  #board2 = null;
  #buttons = null;

  #renderController = null;
  #hudComponent = null;
  #boardComponent1 = null;
  #boardComponent2 = null;

  #handlers = {};

  constructor(container = document.querySelector(".app-wrapper")) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
  }

  open() {
    this.render();

    this.#cacheFields();

    this.#hudComponent = new Hud(this.#display);
    this.#boardComponent1 = new BoardComponent(this.#board1);
    this.#boardComponent2 = new BoardComponent(this.#board2);
    this.#renderController = new RenderController();

    this.#bindEvents();
  }

  #cacheFields() {
    this.#display = this.#element.querySelector(".display");
    this.#board1 = this.#element.querySelector(".board1");
    this.#board2 = this.#element.querySelector(".board2");
    this.#buttons = this.#element.querySelector(".buttons");
  }

  #bindEvents() {
    if (!this.#buttons) return;

    this.#handlers.onButtonsClick = (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.dataset.action;
      if (action === "undo") EventBus.emit("undo");
    };

    this.#buttons.addEventListener("click", this.#handlers.onButtonsClick);
  }

  destroy() {
    if (this.#buttons && this.#handlers.onButtonsClick) {
      this.#buttons.removeEventListener("click", this.#handlers.onButtonsClick);
    }

    if (this.#element?.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }

    this.#handlers = {};
    this.#renderController = null;
    this.#hudComponent = null;
    this.#boardComponent1 = null;
    this.#boardComponent2 = null;

    this.#display = null;
    this.#board1 = null;
    this.#board2 = null;
    this.#buttons = null;

    this.#element = null;
    this.#container = null;
  }

  render() {
    this.#container.innerHTML = "";
    this.#container.appendChild(this.#element);
  }
}
