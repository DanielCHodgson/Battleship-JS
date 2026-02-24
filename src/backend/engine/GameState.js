export default class GameState {
  #turn;
  #turnNumber;
  #phase;
  #canUndo;
  #canRedo;
  #deployment;

  constructor({
    turn,
    turnNumber,
    phase,
    canUndo = false,
    canRedo = false,
    deployment = null,
  }) {
    this.#turn = turn;
    this.#turnNumber = turnNumber;
    this.#phase = phase;
    this.#canUndo = canUndo;
    this.#canRedo = canRedo;
    this.#deployment = deployment;
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

  getDeployment() {
    return this.#deployment;
  }
}
