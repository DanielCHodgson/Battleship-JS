import EventBus from "../utilities/EventBus";

export default class AiTurnController {
  #enemyAI;
  #turnManager;
  #isThinking = false;
  #previewPoint = null;

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
    this.#clearMovePreview();

    if (!this.#canAiAct(state)) return;

    const turn = state.getTurn();
    const aiMove = this.#enemyAI.calculateNextMove(turn);

    console.log(aiMove);

    if (!aiMove) return;

    this.#simulateThinking(aiMove);
  }

  async #simulateThinking(aiMove) {
    this.#isThinking = true;
    this.#previewPoint = aiMove;

    EventBus.emit("ai preview", aiMove);

    console.log("AI is thinking...");

    await this.#pretendDelay(1000);

    console.log("AI has decided on a move.");

    this.#isThinking = false;
    this.#clearMovePreview();

    const turn = this.#turnManager.getCurrentTurn();
    if (!this.#shouldAiPlayTurn(turn)) return;

    EventBus.emit("attack attempted", aiMove);
  }

  #handleAiUndo() {
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
