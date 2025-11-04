import Gameboard from "../board/Gameboard";

export default class Player {
  #name = null;
  #isAI = false;
  #board = null;

  constructor(name, isAI) {
    this.#name = name;
    this.#isAI = isAI;
    this.#board = new Gameboard();
  }

  placeHit(point) {
    this.#board.receiveAttack(point);
  }

  getGameboard() {
    return this.#board;
  }

  getName() {
    return this.#name;
  }
}
