import Ship from "../entities/Ship";

export default class Gameboard {
  #size;
  #misses = [];
  #hits = [];
  #ships = [];

  constructor(size = 10) {
    this.#size = size;
  }

  placeShip(ship, point, direction = "horizontal") {
    let positions = [point];

    for (let i = 1; i < ship.getLength(); i++) {
      direction === "horizontal"
        ? positions.push({ x: point.x + i, y: point.y })
        : positions.push({ x: point.x, y: point.y + i });
    }

    if (!positions.every((position) => this.#isInBounds(position))) {
      throw new Error("Ship not wholly in bounds");
    }

    ship.setPositions(positions);
    this.#ships.push(ship);
  }

  receiveAttack(attack) {
    if (!this.#isInBounds(attack)) {
      throw new Error("Attack is out of bounds");
    }

    if (
      this.#hits.some((point) => this.#collides(attack, point)) ||
      this.#misses.some((point) => this.#collides(attack, point))
    ) {
      throw new Error("Point already attacked");
    }

    for (const ship of this.#ships) {
      if (
        ship.getPositions().some((position) => position.x === attack.x && position.y === attack.y)
      ) {
        ship.hit();
        this.#hits.push(attack);
        return "hit";
      }
    }
    this.#misses.push(attack);
    return "miss";
  }

  #isInBounds(point) {
    return (
      point.x >= 0 &&
      point.x < this.#size &&
      point.y >= 0 &&
      point.y < this.#size
    );
  }

  #collides(pointA, pointB) {
    return pointA.x === pointB.x && pointA.y === pointB.y;
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
