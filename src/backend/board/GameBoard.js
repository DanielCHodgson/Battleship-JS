import Ship from "../entities/Ship";
import EventBus from "../utilities/EventBus";

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
    EventBus.emit("ship placed", ship);
  }

  receiveAttack(point) {
    const hitShip = this.#ships.find((ship) => ship.isHit(point));

    if (hitShip) {
      this.#hits.push(point);
      return { point, result: "hit" };
    } else {
      this.#misses.push(point);
      return { point, result: "miss" };
    }
  }

  #isInBounds(point) {
    return (
      point.x >= 0 &&
      point.x < this.#size &&
      point.y >= 0 &&
      point.y < this.#size
    );
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
