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

  collides(point) {
    return this.#positions.some(
      (pos) => pos.x === point.x && pos.y === point.y,
    );
  }

  isSunk() {
    return this.#hits >= this.#length;
  }

  restoreHealth() {
    if (this.#hits > 0) {
      this.#hits--;
    }
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

  getHits() {
    return this.#hits;
  }

  setPositions(positions) {
    this.#positions = positions;
  }

  clone() {
    const clonedShip = new Ship(this.#name, this.#length);
    clonedShip.#positions = this.#positions.map((pos) => ({ ...pos }));
    clonedShip.#hits = this.#hits;
    return clonedShip;
  }
}
