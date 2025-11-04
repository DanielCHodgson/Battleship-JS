import DomUtility from "../../utilities/DomUtility";
import htmlString from "./board-component.html";
import "./board-component.css";
import EventBus from "../../../backend/utilities/EventBus";

export default class BoardComponent {
  #container;
  #element;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.createGrid();
    this.#container.appendChild(this.#element);
  }

  createGrid(size = 10) {
    const squares = [];

    for (let col = 0; col < size; col++) {
      for (let row = 0; row < size; row++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = row;
        square.dataset.col = col;

        square.addEventListener("click", () => {
          EventBus.emit("square clicked", {
            x: col,
            y: row,
          });
        });

        squares.push(square);
      }
    }

    this.#element.append(...squares);
  }

  markShip(x, y) {
    this.#findSquare(x, y)?.classList.add("ship");
  }

  markHit(x, y) {
    this.#findSquare(x, y)?.classList.add("hit");
  }

  markMiss(x, y) {
    this.#findSquare(x, y)?.classList.add("miss");
  }

  #findSquare(x, y) {
    return this.#element.querySelector(
      `.square[data-row="${y}"][data-col="${x}"]`,
    );
  }

  getElement() {
    return this.#element;
  }
}
