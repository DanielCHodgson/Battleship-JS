export default class Turn {
  #index;
  #currPlayer;
  #enemyPlayer;
  #hasAttacked = false;

  constructor(index, currPlayer, enemyPlayer) {
    this.#index = index;
    this.#currPlayer = currPlayer;
    this.#enemyPlayer = enemyPlayer;
  }

  getIndex() {
    return this.#index;
  }

  getRound() {
    return Math.ceil(this.#index / 2);
  }

  getPlayer() {
    return this.#currPlayer;
  }

  getEnemy() {
    return this.#enemyPlayer;
  }
  
  getPlayerBoard() {
    return this.#currPlayer.getBoard();
  }

  getTargetBoard() {
    return this.#enemyPlayer.getBoard();
  }

  hasAttacked() {
    return this.#hasAttacked;
  }

  markAttackDone() {
    this.#hasAttacked = true;
  }

  markAttackUndone() {
    this.#hasAttacked = false;
  }
}
