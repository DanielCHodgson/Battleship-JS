export default class TurnState {
  #round;
  #currPlayer;
  #enemyBoard;
  #attackUsed = false;

  constructor(round, currPlayer, enemyBoard) {
    this.#round = round;
    this.#currPlayer = currPlayer;
    this.#enemyBoard = enemyBoard;
  }

  getRound() {
    return this.#round;
  }

  getPlayer() {
    return this.#currPlayer;
  }

  getBoard() {
    return this.#enemyBoard;
  }

  hasAttacked() {
    return this.#attackUsed;
  }

  markAttackDone() {
    this.#attackUsed = true;
  }
}
