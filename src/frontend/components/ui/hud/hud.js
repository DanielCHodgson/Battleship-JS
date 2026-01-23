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
    this.#fields.buttons = document.querySelector(".buttons");
    this.#fields.actionDisplay = this.#element.querySelector(".action-display");
    this.#fields.turnDisplay = this.#element.querySelector(".turn-display");
  }

  #initButtons() {
    //new Button(this.#fields.buttons, "next", "Next Turn", "next turn");
    new Button(this.#fields.buttons, "undo", "Undo", "undo");

    //this.#fields.nextBtn = this.#fields.buttons.querySelector("#next");
    this.#fields.undoBtn = this.#fields.buttons.querySelector("#undo");
  }

  #registerEvents() {
    EventBus.on("state changed", (state) => this.renderState(state));
  }

  renderState(state) {
    if (!state) return;

    const turn = state.getTurn();
    const phase = state.getPhase();

    if (!turn) {
      this.#fields.turnDisplay.textContent = "";
      this.#fields.actionDisplay.textContent = "";
      return;
    }

    this.renderTurnInfo(turn);
    this.renderActionInfo(turn, phase);
    this.updateButtons(state, turn);
  }

  renderTurnInfo(turn) {
    const round = turn.getRound?.() ?? "";
    const playerName = turn.getPlayer?.()?.getName?.() ?? "";

    this.#fields.turnDisplay.textContent = `Turn: ${round} | Active player: ${playerName}`;
  }

  renderActionInfo(turn, phase) {
    const playerName = turn.getPlayer?.()?.getName?.() ?? "";
    const round = turn.getRound?.() ?? "";

    if (phase === "gameover") {
      this.#fields.actionDisplay.textContent = `Game Over! ${playerName} won in ${round} turns!`;
      return;
    }

    if (typeof turn.hasAttacked === "function" && turn.hasAttacked()) {
      this.#fields.actionDisplay.textContent = `${playerName} has attacked`;
      return;
    }

    this.#fields.actionDisplay.textContent = "";
  }

  updateButtons(state, turn) {
    const undoBtn = this.#fields.undoBtn;
    //const nextBtn = this.#fields.nextBtn;
  }

  render() {
    if (!this.#element.isConnected) {
      this.#container.appendChild(this.#element);
    }
  }
}
