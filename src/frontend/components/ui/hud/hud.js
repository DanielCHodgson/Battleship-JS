import DomUtility from "../../../utilities/DomUtility";
import htmlString from "./hud.html";
import Button from "../button/button-component";
import "./hud.css";
import EventBus from "../../../../backend/utilities/EventBus";

export default class Hud {
  #container;
  #element;
  #fields = {
    buttons: null,
    actionDisplay: null,
    turnDisplay: null,
    undoBtn: null,
    redoBtn: null,
    pauseBtn: null,
    restartBtn: null,
  };

  #aiPaused = false;

  #onStateChanged;
  #onAiStatus;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);

    this.#cacheFields();
    this.render();
    this.#initButtons();

    this.#onStateChanged = (state) => this.renderState(state);
    this.#onAiStatus = (status) => this.renderAiStatus(status);

    this.#registerEvents();
  }

  #cacheFields() {
    const root = this.#container.closest(".ui") || document;

    this.#fields.buttons = root.querySelector(".buttons");
    this.#fields.actionDisplay = this.#element.querySelector(".action-display");
    this.#fields.turnDisplay = this.#element.querySelector(".turn-display");
  }

  #initButtons() {
    const { buttons } = this.#fields;
    if (!buttons) return;

    this.#initButton("undo", "Undo", "undo");
    this.#initButton("redo", "Redo", "redo");
    this.#initButton("pause", "Pause AI", "togglePause");
    this.#initButton("restart", "Restart", "restart");

    this.#fields.undoBtn = buttons.querySelector("#undo");
    this.#fields.redoBtn = buttons.querySelector("#redo");
    this.#fields.pauseBtn = buttons.querySelector("#pause");
    this.#fields.restartBtn = buttons.querySelector("#restart");
  }

  #initButton(id, label, eventName) {
    const { buttons } = this.#fields;
    if (!buttons || buttons.querySelector(`#${id}`)) return;
    new Button(buttons, id, label, eventName);
  }

  #registerEvents() {
    EventBus.on("state changed", this.#onStateChanged);
    EventBus.on("ai status", this.#onAiStatus);
  }

  renderAiStatus(status) {
    if (!status) return;
    this.#aiPaused = status.isPaused;
    this.#renderPauseUi();
  }

  renderState(state) {
    if (!state) return;

    const turn = state.getTurn();
    const phase = state.getPhase();

    if (!turn) {
      this.#resetTurnUi();
      return;
    }

    this.#renderButtons(state, turn, phase);
    this.#renderPauseUi();
    this.#renderTurnInfo(turn);
    this.#renderActionInfo(turn, phase);
  }

  #resetTurnUi() {
    const { turnDisplay, actionDisplay } = this.#fields;
    if (turnDisplay) turnDisplay.textContent = "";
    if (actionDisplay) {
      actionDisplay.textContent = "";
      actionDisplay.classList.remove("is-alert");
    }
  }

  #renderButtons(state, turn, phase) {
    const { undoBtn, redoBtn, pauseBtn } = this.#fields;
    if (!undoBtn || !redoBtn || !pauseBtn) return;

    undoBtn.classList.toggle("disabled", !state.canUndo());
    redoBtn.classList.toggle("disabled", !state.canRedo());

    const bothHuman = !turn.getPlayer().isAI() && !turn.getEnemy().isAI();
    pauseBtn.classList.toggle("disabled", phase === "gameover");
    pauseBtn.classList.toggle("hidden", bothHuman);
  }

  #renderPauseUi() {
    const { pauseBtn } = this.#fields;
    if (!pauseBtn) return;
    pauseBtn.classList.toggle("is-active", this.#aiPaused);
    pauseBtn.textContent = this.#aiPaused ? "Resume AI" : "Pause AI";
  }

  #renderTurnInfo(turn) {
    const { turnDisplay } = this.#fields;
    if (!turnDisplay) return;

    const round = turn.getRound();
    const playerName = turn.getPlayer().getName();
    turnDisplay.textContent = `Turn ${round} — ${playerName}`;
  }

  #renderActionInfo(turn, phase) {
    const { actionDisplay } = this.#fields;
    if (!actionDisplay) return;

    const playerName = turn.getPlayer().getName();
    const round = turn.getRound();

    actionDisplay.classList.remove("is-alert");

    if (phase === "gameover") {
      actionDisplay.textContent = `Game Over — ${playerName} won in ${round} turns.`;
      actionDisplay.classList.add("is-alert");
      return;
    }

    if (turn.hasAttacked()) {
      actionDisplay.textContent = `${playerName} has attacked.`;
      return;
    }

    actionDisplay.textContent = "Pick a target square.";
  }

  render() {
    if (!this.#element.isConnected) {
      this.#container.appendChild(this.#element);
    }
  }

  destroy() {
    if (this.#onStateChanged)
      EventBus.off("state changed", this.#onStateChanged);
    if (this.#onAiStatus) EventBus.off("ai status", this.#onAiStatus);

    if (this.#element?.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }

    this.#onStateChanged = null;
    this.#onAiStatus = null;

    this.#fields = {
      buttons: null,
      actionDisplay: null,
      turnDisplay: null,
      undoBtn: null,
      redoBtn: null,
      pauseBtn: null,
      restartBtn: null,
    };

    this.#container = null;
    this.#element = null;
    this.#aiPaused = false;
  }
}
