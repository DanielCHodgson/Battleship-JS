import DomUtility from "../../../utilities/DomUtility";
import htmlString from "./hud.html";
import Button from "../button/button-component";
import "./hud.css";
import EventBus from "../../../../backend/utilities/EventBus";

export default class Hud {
  #container;
  #element;
  #fields = {};

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);

    this.#cacheFields();
    this.render();
    this.#initButtons();
    this.#registerEvents();
  }

  #cacheFields() {
    const root = this.#container.closest(".ui") || document;

    this.#fields.buttons = root.querySelector(".buttons");
    this.#fields.actionDisplay = this.#element.querySelector(".action-display");
    this.#fields.turnDisplay = this.#element.querySelector(".turn-display");
  }

  #initButtons() {
    if (!this.#fields.buttons) return;

    if (!this.#fields.buttons.querySelector("#undo")) {
      new Button(this.#fields.buttons, "undo", "Undo", "undo");
    }

    if (!this.#fields.buttons.querySelector("#pause")) {
      new Button(this.#fields.buttons, "pause", "Pause AI", "togglePause");
    }

    this.#fields.undoBtn = this.#fields.buttons.querySelector("#undo");
    this.#fields.pauseBtn = this.#fields.buttons.querySelector("#pause");

    this.#fields.pauseBtn.addEventListener("click", () => {
      const isPaused = this.#fields.pauseBtn.classList.toggle("is-active");
      this.#fields.pauseBtn.textContent = isPaused ? "Resume AI" : "Pause AI";
    });
  }

  #registerEvents() {
    EventBus.on("state changed", (state) => this.renderState(state));
  }

  renderState(state) {
    if (!state) return;

    const turn = state.getTurn?.();
    const phase = state.getPhase?.();

    if (!turn) {
      this.#fields.turnDisplay.textContent = "";
      this.#fields.actionDisplay.textContent = "";
      this.#fields.actionDisplay.classList.remove("is-alert");
      return;
    }

    this.renderTurnInfo(turn);
    this.renderActionInfo(turn, phase);
  }

  renderTurnInfo(turn) {
    const round = turn.getRound?.() ?? "";
    const playerName = turn.getPlayer?.()?.getName?.() ?? "";
    this.#fields.turnDisplay.textContent = `Turn ${round} — ${playerName}`;
  }

  renderActionInfo(turn, phase) {
    const playerName = turn.getPlayer?.()?.getName?.() ?? "";
    const round = turn.getRound?.() ?? "";

    this.#fields.actionDisplay.classList.remove("is-alert");

    if (phase === "gameover") {
      this.#fields.actionDisplay.textContent = `Game Over — ${playerName} won in ${round} turns.`;
      this.#fields.actionDisplay.classList.add("is-alert");
      return;
    }

    if (turn.hasAttacked?.()) {
      this.#fields.actionDisplay.textContent = `${playerName} has attacked.`;
      return;
    }

    this.#fields.actionDisplay.textContent = "Pick a target square.";
  }

  render() {
    if (!this.#element.isConnected) {
      this.#container.appendChild(this.#element);
    }
  }
}
