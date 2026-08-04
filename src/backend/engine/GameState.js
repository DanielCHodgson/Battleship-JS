export default class GameState {
  #turn;
  #turnNumber;
  #phase;
  #canUndo;
  #canRedo;
  #deployment;
  #attackFeedback;

  constructor({
    turn,
    turnNumber,
    phase,
    canUndo = false,
    canRedo = false,
    deployment = null,
    attackFeedback = null,
  }) {
    this.#turn = turn;
    this.#turnNumber = turnNumber;
    this.#phase = phase;
    this.#canUndo = canUndo;
    this.#canRedo = canRedo;
    this.#deployment = deployment;
    this.#attackFeedback = attackFeedback;
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

  getAttackFeedback() {
    return this.#attackFeedback;
  }
}
