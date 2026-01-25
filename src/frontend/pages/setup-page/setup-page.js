import DomUtility from "../../utilities/DomUtility";
import htmlString from "./setup-page.html";
import "./setup-page.css";
import EventBus from "../../../backend/utilities/EventBus";

export default class SetupPage {
  #container;
  #element;
  #fields = {};

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);

    this.#cacheFields();
    this.#bindEvents();

    this.render();
  }

  #cacheFields() {
    this.#fields.form = this.#element.querySelector("[data-role='form']");
    this.#fields.hint = this.#element.querySelector("[data-role='hint']");
    this.#fields.swap = this.#element.querySelector("[data-role='swap']");

    this.#fields.player1Name = this.#element.querySelector("input[name='player1Name']");
    this.#fields.player2Name = this.#element.querySelector("input[name='player2Name']");
    this.#fields.player1AI = this.#element.querySelector("input[name='player1AI']");
    this.#fields.player2AI = this.#element.querySelector("input[name='player2AI']");
  }

  #bindEvents() {
    this.#fields.form.addEventListener("submit", (element) => {
      element.preventDefault();
      this.#submit();
    });

    this.#fields.swap.addEventListener("click", () => this.#swapPlayers());

    this.#fields.player1AI.addEventListener("change", () => {
      if (this.#fields.player1AI.checked && !this.#fields.player1Name.value.trim()) {
        this.#fields.player1Name.value = this.#fields.player2Name.value === "CPU" ? "CPU2" : "CPU";
      }
    });
    
    this.#fields.player2AI.addEventListener("change", () => {
      if (this.#fields.player2AI.checked && !this.#fields.player2Name.value.trim()) {
         this.#fields.player2Name.value = this.#fields.player1Name.value === "CPU" ? "CPU2" : "CPU";
      }
    });
  }

  #submit() {
    const player1Name = this.#fields.player1Name.value.trim();
    const player2Name = this.#fields.player2Name.value.trim();

    if (!player1Name || !player2Name) {
      this.#setHint("Please enter names for both players.");
      return;
    }

    if (player1Name.toLowerCase() === player2Name.toLowerCase()) {
      this.#setHint("Player names must be different.");
      return;
    }

    const payload = {
      player1: {
        name: player1Name,
        isAI: this.#fields.player1AI.checked,
      },
      player2: {
        name: player2Name,
        isAI: this.#fields.player2AI.checked,
      },
    };

    this.#setHint("");
    EventBus.emit("setup submitted", payload);
  }

  #swapPlayers() {
    const n1 = this.#fields.player1Name.value;
    const n2 = this.#fields.player2Name.value;
    this.#fields.player1Name.value = n2;
    this.#fields.player2Name.value = n1;

    const a1 = this.#fields.player1AI.checked;
    const a2 = this.#fields.player2AI.checked;
    this.#fields.player1AI.checked = a2;
    this.#fields.player2AI.checked = a1;

    this.#setHint("Swapped.");
    window.setTimeout(() => this.#setHint(""), 800);
  }

  #setHint(text) {
    this.#fields.hint.textContent = text;
  }

  render() {
    this.#container.appendChild(this.#element);
    this.#fields.player1Name.focus();
  }
}
