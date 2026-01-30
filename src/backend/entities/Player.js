export default class Player {
  #name = null;
  #isAI = false;
  #board = null;

  constructor(name, isAI, board) {
    this.#name = name;
    this.#isAI = isAI;
    this.#board = board;
  }

  getBoard() {
    return this.#board;
  }

  getName() {
    return this.#name;
  }

  isAI() {
    return this.#isAI;
  }
}
