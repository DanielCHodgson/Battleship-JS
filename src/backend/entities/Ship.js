export default class Ship {
  #name = null;
  #length = null;
  #positions = [];
  #hits = [];

  constructor(name, length) {
    this.#name = name;
    this.#length = length;
  }

  place(positions) {
    this.#positions.push(positions);
  }

  hit() {}
}
