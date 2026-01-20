import EventBus from "../utilities/EventBus";

export default class EndGameCommand {
  #gameController;
  #prevPhase;

  constructor(gameController) {
    this.#gameController = gameController;
  }

  execute() {
    this.#prevPhase = this.#gameController.getPhase();
    this.#gameController.setPhase("gameover");
    return true;
  }

  undo() {
    this.#gameController.setPhase(this.#prevPhase);
  }
}
