import EventBus from "../utilities/EventBus";
import TurnState from "./TurnState";

export default class TurnManager {
  #gameController;
  #turnStates = [];

  constructor(gameController) {
    this.#gameController = gameController;
  }

  firstTurn() {
    const { player1, player2 } = this.#gameController.getPlayers();
    const firstTurn = new TurnState(1, player1, player2.getGameboard());
    this.#turnStates.push(firstTurn);
    EventBus.emit("turn state updated", firstTurn);
  }

  nextTurn() {
    const currTurn = this.getCurrentTurnState();
    if (!currTurn || !currTurn.hasAttacked()) return;
    const newTurn = this.#buildNextTurn(currTurn);
    this.#turnStates.push(newTurn);
    EventBus.emit("turn state updated", newTurn);
  }

  previousTurn() {
    if (this.#turnStates.length <= 1) return;
    this.#turnStates.pop();
    const prevTurn = this.getCurrentTurnState();
    EventBus.emit("turn restored", prevTurn);
  }

  #buildNextTurn(currTurn) {
    const { player1, player2 } = this.#gameController.getPlayers();
    const nextPlayer = currTurn.getPlayer() === player1 ? player2 : player1;
    return new TurnState(this.getTurnNumber() + 1, nextPlayer, currTurn.getPlayer().getGameboard());
  }

  getCurrentTurnState() {
    return this.#turnStates[this.#turnStates.length - 1];
  }

  getTurnNumber() {
    return this.#turnStates.length;
  }

  getTurnStates() {
    return this.#turnStates;
  }
}
