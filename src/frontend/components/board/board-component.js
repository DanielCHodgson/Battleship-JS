import DomUtility from "../../utilities/DomUtility";
import htmlString from "./board-component.html";
import "./board-component.css";
import EventBus from "../../../backend/utilities/EventBus";

export default class BoardComponent {
  #container;
  #element;
  #squareHandlers = new Map();

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.createGrid();
    this.#container.appendChild(this.#element);
  }

  createGrid(size = 10) {
    const squares = [];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = row;
        square.dataset.col = col;

        const onClick = () => {
          EventBus.emit("point selected", {
            x: col,
            y: row,
          });
        };

        square.addEventListener("click", onClick);
        this.#squareHandlers.set(square, onClick);

        squares.push(square);
      }
    }
    this.#element.append(...squares);
  }

  getElement() {
    return this.#element;
  }

  destroy() {
    this.#squareHandlers.forEach((handler, square) => {
      square.removeEventListener("click", handler);
    });
    this.#squareHandlers.clear();

    if (this.#element?.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }

    this.#container = null;
    this.#element = null;
  }
}
