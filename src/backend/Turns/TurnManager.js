import Turn from "./Turn";

export default class TurnManager {
  #turns = [];
  #player1 = null;
  #player2 = null;

  constructor() {}

  initialize(player1, player2) {
    this.#player1 = player1;
    this.#player2 = player2;
    this.#turns = [new Turn(1, player1, player2)];
  }

  nextTurn() {
    const currTurn = this.getCurrentTurn();
    if (!currTurn?.hasAttacked()) return false;

    this.#turns.push(this.#buildNextTurn(currTurn));
    return true;
  }

  previousTurn() {
    if (this.#turns.length <= 1) return false;
    this.#turns.pop();
    return true;
  }

  #buildNextTurn(currTurn) {
    const nextPlayer =
      currTurn.getPlayer() === this.#player1 ? this.#player2 : this.#player1;
    const nextEnemy =
      nextPlayer === this.#player1 ? this.#player2 : this.#player1;

    return new Turn(this.getTurnNumber() + 1, nextPlayer, nextEnemy);
  }

  getCurrentTurn() {
    return this.#turns[this.#turns.length - 1];
  }

  getTurnNumber() {
    return this.#turns.length;
  }

  getTurns() {
    return this.#turns;
  }
}
