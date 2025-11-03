import DomUtility from "../../utilities/DomUtility";
import htmlString from "./board-component.html";
import "./board-component.css";
import EventBus from "../../../backend/utilities/EventBus";

export default class BoardComponent {
  #container;
  #element;
  #squares;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.#squares = this.#createGrid(10);
    this.#registerEvents();
    this.render();
  }

  #registerEvents() {
    EventBus.on("ship placed", (ship) => this.renderShip(ship));
  }

  renderShip(ship) {
    

  }

  #createGrid(size) {
    const grid = [];

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = i;
        square.dataset.col = j;
        square.textContent = `${i},${j}`;
        square.addEventListener("click", () =>
          EventBus.emit("square clicked", {
            x: square.dataset.row,
            y: square.dataset.col,
          }),
        );
        grid.push(square);
      }
    }
    return grid;
  }

  render() {
    this.#squares.forEach((square) => this.#element.appendChild(square));
    this.#container.appendChild(this.#element);
  }
}
