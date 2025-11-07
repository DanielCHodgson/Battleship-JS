import EventBus from "../utilities/EventBus";

export default class NextTurnCommand {
  #gameController;

  constructor(gameController) {
    this.#gameController = gameController;
    EventBus.on("next turn", () => this.execute());
    EventBus.on("previous turn", () => this.undo());
  }

  execute() {
    this.#gameController.nextTurn();
  }

  undo() {
    this.#gameController.previousTurn();
  }
}
