export default class GameState {
  #turn;
  #turnNumber;
  #phase;
  #canUndo;
  #canRedo;

  constructor({ turn, turnNumber, phase, canUndo = false, canRedo = false }) {
    this.#turn = turn;
    this.#turnNumber = turnNumber;
    this.#phase = phase;
    this.#canUndo = canUndo;
    this.#canRedo = canRedo;
  }

  getTurn() {
    return this.#turn;
  }
  getTurnNumber() {
    return this.#turnNumber;
  }
  getPhase() {
    return this.#phase;
  }
  canUndo() {
    return this.#canUndo;
  }
  canRedo() {
    return this.#canRedo;
  }
}
