import EventBus from "../utilities/EventBus";

export default class AiTurnController {
  #enemyAI;
  #turnManager;

  constructor(turnManager, enemyAI) {
    this.#turnManager = turnManager;
    this.#enemyAI = enemyAI;
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("next turn", () => {
      const currentTurn = this.#turnManager.getCurrentTurn();
      if (currentTurn && currentTurn.getPlayer().isAI()) {
        this.#handleAITurn(currentTurn);
      }
    });
  }

  #handleAITurn(turn) {
    const aiMove = this.#enemyAI.calculateNextMove(turn);
    EventBus.emit("attack attempted", aiMove);
  }
}
