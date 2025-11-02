export default class Ship {
  #name = null;
  #length = null;
  #positions = [];
  #hits = 0;

  constructor(name, length, positions) {
    this.#name = name;
    this.#length = length;
    this.#positions = positions;
  }

  //place(positions) {
  // if(this.#areValidPositions(positions));
  //this.#positions.push(positions);
  //}

  hit() {
    this.#hits++;
  }

  isSunk() {
    return this.#hits >= this.#length;
  }

  //getPositions() {
  // return this.#positions;
  //}

  getName() {
    return this.#name;
  }
}
