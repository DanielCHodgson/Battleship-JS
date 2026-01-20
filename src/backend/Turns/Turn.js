export default class Turn {
  #index;
  #currPlayer;
  #enemyPlayer;
  #attackUsed = false;

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

  getEnemyPlayer() {
    return this.#enemyPlayer;
  }
  
  getPlayerBoard() {
    return this.#currPlayer.getGameboard();
  }

  getTargetBoard() {
    return this.#enemyPlayer.getGameboard();
  }

  hasAttacked() {
    return this.#attackUsed;
  }

  markAttackDone() {
    this.#attackUsed = true;
  }

  markAttackUndone() {
    this.#attackUsed = false;
  }
}
