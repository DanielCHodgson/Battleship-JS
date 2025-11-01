export default class GameBoard {
  #size = 10;
  #ships = [];
  #misses = [];
  #hits = [];

  construtor(size) {
    this.#size = size;
  }
}
