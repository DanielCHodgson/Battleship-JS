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
    EventBus.on("state changed", (state) => {
      this.#handleAiTurn(state);
    });

    EventBus.on("undo", () => {
      this.#handleAiUndo();
    });
  }

  #handleAiTurn(state) {
    if (this.#previewPoint) {
      EventBus.emit("ai preview cleared", this.#previewPoint);
      this.#previewPoint = null;
    }

    if (this.#isThinking) return;
    if (state.getPhase() !== "playing") return;

    const turn = state.getTurn();
    if (!turn || !turn.getPlayer().isAI() || !turn.hasAttacked()) return;

    const aiMove = this.#enemyAI.calculateNextMove(turn);
    if (!aiMove) return;

    this.#isThinking = true;
    this.#previewPoint = aiMove;

    EventBus.emit("ai preview", aiMove);

    this.#pretendDelay(500).then(() => {
      this.#isThinking = false;

      if (this.#previewPoint) {
        EventBus.emit("ai preview cleared", this.#previewPoint);
        this.#previewPoint = null;
      }

      const turn = this.#turnManager.getCurrentTurn();
      if (!turn || !turn.getPlayer().isAI() || !turn.hasAttacked()) return;

      EventBus.emit("attack attempted", aiMove);
    });
  }

  #handleAiUndo() {
    this.#isThinking = false;
    if (this.#previewPoint) {
      EventBus.emit("ai preview cleared", this.#previewPoint);
      this.#previewPoint = null;
    }
  }

  #pretendDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
