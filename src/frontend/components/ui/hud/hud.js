import DomUtility from "../../../utilities/DomUtility";
import htmlString from "./hud.html";
import "./hud.css";
import EventBus from "../../../../backend/utilities/EventBus";

export default class Hud {
  #container;
  #element;

  #fields = {
    buttons: null,
    actionDisplay: null,
    turnDisplay: null,
  };

  #aiPaused = false;

  #handlers = {
    onStateChanged: null,
    onAiStatus: null,
    onButtonsClick: null,
  };

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);

    this.render();
    this.#cacheFields();
    this.#bindEvents();
    this.#registerEvents();
  }

  render() {
    if (!this.#element.isConnected) {
      this.#container.appendChild(this.#element);
    }
  }

  #cacheFields() {
    this.#fields.buttons = this.#element.querySelector(".buttons");
    this.#fields.actionDisplay = this.#element.querySelector(".action-display");
    this.#fields.turnDisplay = this.#element.querySelector(".turn-display");
  }

  #bindEvents() {
    const { buttons } = this.#fields;
    if (!buttons) return;

    this.#handlers.onButtonsClick = (e) => {
      const button = e.target.closest("button[data-action]");
      if (!button) return;

      if (button.classList.contains("disabled")) return;

      const action = button.dataset.action;

      switch (action) {
        case "undo":
          EventBus.emit("undo");
          break;
        case "redo":
          EventBus.emit("redo");
          break;
        case "togglePause":
          EventBus.emit("togglePause");
          break;
        case "restart":
          EventBus.emit("restart");
          break;
      }
    };

    buttons.addEventListener("click", this.#handlers.onButtonsClick);
  }

  #registerEvents() {
    this.#handlers.onStateChanged = (state) => this.renderState(state);
    this.#handlers.onAiStatus = (status) => this.renderAiStatus(status);

    EventBus.on("state changed", this.#handlers.onStateChanged);
    EventBus.on("ai status", this.#handlers.onAiStatus);
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
    const { buttons } = this.#fields;
    if (!buttons) return;

    const undoBtn = buttons.querySelector('[data-action="undo"]');
    const redoBtn = buttons.querySelector('[data-action="redo"]');
    const pauseBtn = buttons.querySelector('[data-action="togglePause"]');

    if (undoBtn) {
      undoBtn.classList.toggle("disabled", !state.canUndo());
    }

    if (redoBtn) {
      redoBtn.classList.toggle("disabled", !state.canRedo());
    }

    if (pauseBtn) {
      const bothHuman = !turn.getPlayer().isAI() && !turn.getEnemy().isAI();
      pauseBtn.classList.toggle("disabled", phase === "gameover");
      pauseBtn.classList.toggle("hidden", bothHuman);
    }
  }

  #renderPauseUi() {
    const { buttons } = this.#fields;
    if (!buttons) return;

    const pauseBtn = buttons.querySelector('[data-action="togglePause"]');
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

  destroy() {
    if (this.#handlers.onStateChanged) {
      EventBus.off("state changed", this.#handlers.onStateChanged);
    }

    if (this.#handlers.onAiStatus) {
      EventBus.off("ai status", this.#handlers.onAiStatus);
    }

    if (this.#fields.buttons && this.#handlers.onButtonsClick) {
      this.#fields.buttons.removeEventListener(
        "click",
        this.#handlers.onButtonsClick,
      );
    }

    if (this.#element?.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }

    this.#handlers = {
      onStateChanged: null,
      onAiStatus: null,
      onButtonsClick: null,
    };

    this.#fields = {
      buttons: null,
      actionDisplay: null,
      turnDisplay: null,
    };

    this.#container = null;
    this.#element = null;
    this.#aiPaused = false;
  }
}
