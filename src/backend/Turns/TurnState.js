export default class TurnState {
  #turn;
  #currPlayer;
  #enemyBoard;
  #phase;
  #attackUsed;

  constructor(turn, currentPlayer, enemyBoard, phase) {
    this.#turn = turn;
    this.#currPlayer = currentPlayer;
    this.#enemyBoard = enemyBoard;
    this.#phase = phase;
    this.#attackUsed = false;
  }

  getTurn() {
    return this.#turn;
  }

  hasAttacked() {
    return this.#attackUsed;
  }

  toggleAttackUsed() {
    this.#attackUsed = !this.#attackUsed;
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
