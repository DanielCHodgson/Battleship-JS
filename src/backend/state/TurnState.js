export default class TurnState {
  #turn;
  #player;
  #phase;
  #hits;
  #misses;

  constructor(turn, player, phase, hits, misses) {
    this.#turn = turn;
    this.#player = player;
    this.#phase = phase;
    this.#hits = hits;
    this.#misses = misses;
  }
}
