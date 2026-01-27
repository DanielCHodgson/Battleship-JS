import EventBus from "../utilities/EventBus";

export default class AiTurnController {
  #enemyAI;
  #turnManager;

  #isThinking = false;
  #isPaused = false;

  #previewPoint = null;
  #previewShown = false;

  #thinkToken = 0;

  #thinkDelay = 750;
  #nextTurnDelay = 750;

  constructor(turnManager, enemyAI) {
    this.#turnManager = turnManager;
    this.#enemyAI = enemyAI;
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("state changed", (state) => this.#handleAiTurn(state));
    EventBus.on("undo", () => this.#handleAiUndo());
    EventBus.on("togglePause", () => this.#togglePause());
  }

  #handleAiTurn(state) {
    if (!this.#canAiAct(state)) return;
    this.#tryStartFromCurrentTurn();
  }

  #tryStartFromCurrentTurn() {
    if (this.#isPaused || this.#isThinking) return;

    const turn = this.#turnManager.getCurrentTurn();
    if (!this.#shouldAiPlayTurn(turn)) return;

    const aiMove = this.#enemyAI.calculateNextMove(turn);
    if (!aiMove) return;

    const run = this.#startRun();
    this.#simulateThinking(aiMove, run);
  }

  #startRun() {
    this.#thinkToken += 1;
    const token = this.#thinkToken;

    const isValid = () => token === this.#thinkToken;

    const check = () => {
      if (!isValid()) throw new Error("AI_RUN_CANCELED");
    };

    const delay = async (ms) => {
      await this.#pretendDelay(ms);
      check();
    };

    const waitUntilResumed = async () => {
      while (this.#isPaused && isValid()) {
        await this.#pretendDelay(50);
      }
      check();
    };

    return { check, delay, waitUntilResumed };
  }

  async #simulateThinking(aiMove, run) {
    this.#clearMovePreview();
    this.#isThinking = true;

    this.#previewPoint = aiMove;
    this.#previewShown = false;

    try {
      await run.waitUntilResumed();
      await run.delay(this.#thinkDelay);

      EventBus.emit("show ai preview", aiMove);
      this.#previewShown = true;

      await run.waitUntilResumed();
      await run.delay(this.#nextTurnDelay);

      this.#isThinking = false;
      this.#clearMovePreview();

      const turn = this.#turnManager.getCurrentTurn();
      run.check();
      if (!this.#shouldAiPlayTurn(turn)) return;

      EventBus.emit("attack attempted", aiMove);
    } catch (e) {
      this.#isThinking = false;
      this.#clearMovePreview();
    }
  }

  #cancelRun() {
    this.#thinkToken++;
    this.#isThinking = false;
    this.#clearMovePreview();
  }

  #handleAiUndo() {
    this.#cancelRun();
  }

  #canAiAct(state) {
    if (this.#isPaused || state.getPhase() !== "playing") return false;
    return this.#shouldAiPlayTurn(state.getTurn());
  }

  #shouldAiPlayTurn(turn) {
    return turn && turn.getPlayer().isAI() && !turn.hasAttacked();
  }

  #clearMovePreview() {
    if (!this.#previewPoint) return;

    if (this.#previewShown) {
      EventBus.emit("clear ai preview", this.#previewPoint);
    }

    this.#previewPoint = null;
    this.#previewShown = false;
  }

  #pretendDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  #setPaused(isPaused) {
    this.#isPaused = isPaused;
    if (this.#isPaused) this.#clearMovePreview();
    if (!this.#isPaused && !this.#isThinking) {
      this.#tryStartFromCurrentTurn();
    }
  }

  #togglePause() {
    this.#setPaused(!this.#isPaused);
  }
}
