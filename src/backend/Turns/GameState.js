export default class GameState {
  #turn;
  #turnNumber;
  #phase;

  constructor({ turn, turnNumber, phase }) {
    this.#turn = turn;
    this.#turnNumber = turnNumber;
    this.#phase = phase;
  }

  getIsGameOver() {
    return this.#phase === "gameover";
  }

  getTurn() {
    return this.#turn;
  }
  getTurnNumber() {
    return this.#turnNumber;
  }

  getPhase() {
    return this.#phase;
  }
}
