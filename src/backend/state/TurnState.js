export default class TurnState {
  #turn;
  #currPlayer;
  #enemyBoard;
  #phase;

  constructor(turn, currentPlayer, enemyBoard, phase) {
    this.#turn = turn;
    this.#currPlayer = currentPlayer;
    this.#enemyBoard = enemyBoard;
    this.#phase = phase;
  }

  getTurn() {
    return this.#turn;
  }

  getPlayer() {
    return this.#currPlayer;
  }

  getBoard() {
    return this.#enemyBoard;
  }

  getPhase() {
    return this.#phase;
  }
}
