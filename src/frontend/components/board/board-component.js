import DomUtility from "../../utilities/DomUtility";
import htmlString from "./board-component.html";
import "./board-component.css";

export default class BoardComponent {
  #container;
  #element;
  #fields;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
    this.#fields = this.cacheFields();
    this.registerEvents();
    this.render();
  }

  cacheFields() {}

  registerEvents() {}

  createGrid(size) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = i;
        square.dataset.col = j;
        square.textContent = `${i},${j}`;
        this.#element.appendChild(square);
      }
    }
  }

  render() {
    this.createGrid(10);
    this.#container.appendChild(this.#element);
  }
}
