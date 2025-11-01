export default class TurnState {
  #turn;
  #phase;
  #hits;
  #misses;

  constructor(turn, phase, hits, misses) {
    this.#turn = turn;
    this.#phase = phase;
    this.#hits = hits;
    this.#misses = misses;
  }
}
