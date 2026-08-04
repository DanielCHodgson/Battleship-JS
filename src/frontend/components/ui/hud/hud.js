import DomUtility from "../../../utilities/DomUtility";
import htmlString from "./hud.html";
import "./hud.css";
import EventBus from "../../../../backend/utilities/EventBus";

export default class Hud {
  #container;
  #buttonContainer;
  #element;

  #fields = {
    buttons: null,
    actionDisplay: null,
    turnDisplay: null,
  };

  #aiPaused = false;

  #handlers = {
    onAiStatus: null,
    onButtonsClick: null,
  };

  constructor(container, buttonContainer) {
    this.#container = container;
    this.#buttonContainer = buttonContainer;
    this.#element = DomUtility.stringToHTML(htmlString);

    this.#cacheFields();
    this.render();
    this.#bindEvents();
    this.#registerEvents();
  }

  render() {
    const { buttons } = this.#fields;
    if (buttons && this.#buttonContainer && !buttons.isConnected) {
      this.#buttonContainer.appendChild(buttons);
    }

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

    this.#handlers.onButtonsClick = (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button || button.classList.contains("disabled")) return;

      EventBus.emit(button.dataset.action);
    };

    buttons.addEventListener("click", this.#handlers.onButtonsClick);
  }

  #registerEvents() {
    this.#handlers.onAiStatus = (status) => this.renderAiStatus(status);
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
    this.#renderActionInfo(state, turn, phase);
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

    undoBtn?.classList.toggle("disabled", !state.canUndo());
    redoBtn?.classList.toggle("disabled", !state.canRedo());

    if (pauseBtn) {
      const bothHuman = !turn.getPlayer().isAI() && !turn.getEnemy().isAI();
      pauseBtn.classList.toggle("disabled", phase === "gameover");
      pauseBtn.classList.toggle("hidden", bothHuman);
    }
  }

  #renderPauseUi() {
    const pauseBtn = this.#fields.buttons?.querySelector(
      '[data-action="togglePause"]',
    );
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

  #renderActionInfo(state, turn, phase) {
    const { actionDisplay } = this.#fields;
    if (!actionDisplay) return;

    const playerName = turn.getPlayer().getName();
    const round = turn.getRound();

    actionDisplay.classList.remove("is-alert", "is-hit", "is-miss");

    const feedback = state.getAttackFeedback();
    if (feedback) {
      const coordinate = this.#formatCoordinate(feedback.point);
      const didHit = feedback.result === "hit";
      actionDisplay.textContent = didHit
        ? `Hit! — ${coordinate}`
        : `Miss — ${coordinate}`;
      actionDisplay.classList.add(didHit ? "is-hit" : "is-miss");
      return;
    }

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

  #formatCoordinate(point) {
    const column = String.fromCharCode(65 + point.x);
    return `${column}${point.y + 1}`;
  }

  destroy() {
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

    if (this.#fields.buttons?.parentNode) {
      this.#fields.buttons.parentNode.removeChild(this.#fields.buttons);
    }

    this.#handlers = {
      onAiStatus: null,
      onButtonsClick: null,
    };

    this.#fields = {
      buttons: null,
      actionDisplay: null,
      turnDisplay: null,
    };

    this.#container = null;
    this.#buttonContainer = null;
    this.#element = null;
    this.#aiPaused = false;
  }
}
