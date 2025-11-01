import GameBoard from "../GameBoard";

export default class Player {
  #name = null;
  #isAI = false;
  #board = null;

  constructor(name, isAI) {
    this.#name = name;
    this.#isAI = isAI;
    this.#board = new GameBoard();
  }

  placeHit() {}

  placeMiss() {}
}
