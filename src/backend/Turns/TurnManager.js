import TurnState from "./TurnState";

export default class TurnManager {
  #gameController;
  #turnStates = [];

  constructor(gameController) {
    this.#gameController = gameController;
  }

  initialize() {
    const { player1, player2 } = this.#gameController.getPlayers();
    this.#turnStates = [new TurnState(1, player1, player2)];
  }

  nextTurn() {
    const currTurn = this.getCurrentTurnState();
    if (!currTurn?.hasAttacked()) return false;

    this.#turnStates.push(this.#buildNextTurn(currTurn));
    return true;
  }

  previousTurn() {
    if (this.#turnStates.length <= 1) return false;
    this.#turnStates.pop();
    return true;
  }

  #buildNextTurn(currTurn) {
    const { player1, player2 } = this.#gameController.getPlayers();
    const nextPlayer = currTurn.getPlayer() === player1 ? player2 : player1;
    const nextEnemy = nextPlayer === player1 ? player2 : player1;

    return new TurnState(this.getTurnNumber() + 1, nextPlayer, nextEnemy);
  }

  getCurrentTurnState() {
    return this.#turnStates[this.#turnStates.length - 1];
  }

  getTurnNumber() {
    return this.#turnStates.length;
  }
}
