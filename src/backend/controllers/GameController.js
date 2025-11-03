import Player from "../entities/Player";

export default class GameController {
  #eventBus = null;
  #players = [];
  #turnStates = [];

  constructor() {}

  startGame() {
    return "game started!";
  }

  nextTurn() {}

  endGame() {}
}
