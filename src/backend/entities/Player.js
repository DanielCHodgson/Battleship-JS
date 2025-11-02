import GameBoard from "../board/Gameboard";

export default class Player {
  #name = null;
  #isAI = false;
  #board = null;

  constructor(name, isAI) {
    this.#name = name;
    this.#isAI = isAI;
    this.#board = new GameBoard();
  }

  placeHit(x, y) {
    this.#board.reciveAttack(x, y);
  }

  placeMiss() {}
}
