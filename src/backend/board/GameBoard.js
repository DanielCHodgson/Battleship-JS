import Ship from "../entities/Ship";

export default class Gameboard {
  #size;
  #misses = [];
  #hits = [];
  #ships = [];

  constructor(size = 10) {
    this.#size = size;
  }

  addShip(name, length, point, direction = "horizontal") {
    let positions = [point];

    for (let i = 1; i < length; i++) {
      direction === "horizontal"
        ? positions.push({ x: point.x + i, y: point.y })
        : positions.push({ x: point.x, y: point.y + i });
    }

    if (!positions.every((p) => this.#isInBounds(p))) {
      throw new Error("Ship not wholly in bounds");
    }

    const ship = new Ship(name, length, positions);
    this.#ships.push(ship);
  }

  receiveAttack(x, y) {
  
  }

  #isInBounds({ x, y }) {
    return x >= 0 && x < this.#size && y >= 0 && y < this.#size;
  }

  getShips() {
    return this.#ships;
  }

  getHits() {
    return this.#hits;
  }

  getMisses() {
    return this.#misses;
  }
}
