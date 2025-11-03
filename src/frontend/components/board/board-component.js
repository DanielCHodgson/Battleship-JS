import DomUtility from "../../utilities/DomUtility";
import htmlString from "./board-component.html";
import "./board-component.css";
import EventBus from "../../../backend/utilities/EventBus";

export default class BoardComponent {
  #container;
  #element;

  constructor(container) {
    this.#container = container;
    this.#element =   this.#element = DomUtility.stringToHTML(htmlString);;
    this.#container.appendChild(this.#element);
    EventBus.emit("board ready", this.#element);
  }

  createGrid(size = 10) {
    const squares = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = row;
        square.dataset.col = col;
        square.addEventListener("click", () =>
          EventBus.emit("square clicked", { x: col, y: row }),
        );
        squares.push(square);
      }
    }
    this.#element.append(...squares);
  }
}