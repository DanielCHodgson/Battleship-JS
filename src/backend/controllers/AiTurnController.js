import EventBus from "../utilities/EventBus";

export default class AiTurnController {
  #enemyAI;
  #turnManager;
  #isThinking = false;
  #previewPoint = null;
  #thinkToken = 0;

  constructor(turnManager, enemyAI) {
    this.#turnManager = turnManager;
    this.#enemyAI = enemyAI;
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("state changed", (state) => this.#handleAiTurn(state));
    EventBus.on("undo", () => this.#handleAiUndo());
  }

  #handleAiTurn(state) {
    this.#thinkToken++;

    this.#clearMovePreview();
    this.#isThinking = false;

    if (!this.#canAiAct(state)) return;

    const turn = state.getTurn();
    const aiMove = this.#enemyAI.calculateNextMove(turn);
    if (!aiMove) return;

    this.#simulateThinking(aiMove, this.#thinkToken);
  }

  async #simulateThinking(aiMove, tokenAtStart) {
    this.#isThinking = true;
    this.#previewPoint = aiMove;

    await this.#pretendDelay(1000);
    if (tokenAtStart !== this.#thinkToken) return;

    EventBus.emit("ai preview", aiMove);

    await this.#pretendDelay(1000);
    if (tokenAtStart !== this.#thinkToken) return;

    this.#isThinking = false;
    this.#clearMovePreview();

    const turn = this.#turnManager.getCurrentTurn();
    if (!this.#shouldAiPlayTurn(turn)) return;

    if (tokenAtStart !== this.#thinkToken) return;

    EventBus.emit("attack attempted", aiMove);
  }

  #handleAiUndo() {
    this.#thinkToken++;
    this.#isThinking = false;
    this.#clearMovePreview();
  }

  #canAiAct(state) {
    if (this.#isThinking) return false;
    if (state.getPhase() !== "playing") return false;
    return this.#shouldAiPlayTurn(state.getTurn());
  }

  #shouldAiPlayTurn(turn) {
    return turn && turn.getPlayer().isAI() && !turn.hasAttacked();
  }

  #clearMovePreview() {
    if (!this.#previewPoint) return;
    EventBus.emit("ai preview cleared", this.#previewPoint);
    this.#previewPoint = null;
  }

  #pretendDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
