import Turn from "./Turn";

export default class TurnManager {
  #gameController;
  #turns = [];

  constructor(gameController) {
    this.#gameController = gameController;
  }

  initialize() {
    const { player1, player2 } = this.#gameController.getPlayers();
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
    const { player1, player2 } = this.#gameController.getPlayers();
    const nextPlayer = currTurn.getPlayer() === player1 ? player2 : player1;
    const nextEnemy = nextPlayer === player1 ? player2 : player1;

    return new Turn(this.getTurnNumber() + 1, nextPlayer, nextEnemy);
  }

  getCurrentTurn() {
    return this.#turns[this.#turns.length - 1];
  }

  getTurnNumber() {
    return this.#turns.length;
  }
}
