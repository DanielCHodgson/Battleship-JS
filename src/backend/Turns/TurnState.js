export default class TurnState {
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

  getBoard() {
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

  getAttackState() {
    return this.#attackUsed;
  }
  setAttackState(value) {
    this.#attackUsed = value;
  }
}
