import Player from "../entities/Player";

export default class GameController {
  #eventBus = null;
  #players = [];
  #turnStates = [];

  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  startGame() {
    this.#players.push(
      new Player("Player 1", false),
      new Player("Player 2"),
      false,
    );
  }

  nextTurn() {}

  endGame() {}
}
