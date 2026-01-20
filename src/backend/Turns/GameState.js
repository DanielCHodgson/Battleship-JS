export default class GameState {
  #turn;
  #turnNumber;
  #phase;

  constructor({ turn, turnNumber, phase }) {
    this.#turn = turn;
    this.#turnNumber = turnNumber;
    this.#phase = phase;
  }

  isGameOver() {
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
