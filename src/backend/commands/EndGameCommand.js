import EventBus from "../utilities/EventBus";

export default class EndGameCommand {
  #state;

  constructor(state) {
    this.#state = state;
  }

  execute() {
    EventBus.emit("game over", this.#state);
  }

  undo() {
    EventBus.emit("game resumed", this.#state);
  }
}
