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
    if (!this.#isInBounds(point)) {
      throw new Error("Attack is out of bounds");
    }

    if (
      this.#hits.some((hit) => this.#collides(hit, point)) ||
      this.#misses.some((miss) => this.#collides(miss, point))
    ) {
      throw new Error("Point already attacked");
    }
    let result = null;

    for (const ship of this.#ships) {
      if (
        ship
          .getPositions()
          .some((position) => position.x === point.x && position.y === point.y)
      ) {
        ship.hit();
        this.#hits.push(point);
        result = "hit";
        EventBus.emit("render attack", { point, result });
        return "hit";
      }
    }
    this.#misses.push(point);
    result = "miss";
    EventBus.emit("render attack", { point, result });
    return result;
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
