export default class Ship {
  #name = null;
  #length = null;
  #positions = [];
  #hits = 0;

  constructor(name, length) {
    this.#name = name;
    this.#length = length;
  }

  hit() {
    this.#hits++;
  }

  isHit(point) {
    return this.#positions.some(
      (pos) => pos.x === point.x && pos.y === point.y,
    );
  }

  isSunk() {
    return this.#hits >= this.#length;
  }

  getLength() {
    return this.#length;
  }

  getPositions() {
    return this.#positions;
  }

  getName() {
    return this.#name;
  }

  setPositions(positions) {
    this.#positions = positions;
  }
}
