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

    if (!positions.every((pos) => this.#isInBounds(pos))) {
      throw new Error("Ship not wholly in bounds");
    }

    ship.setPositions(positions);
    this.#ships.push(ship);
    EventBus.emit("ship placed", ship);
  }

  receiveAttack(point) {
    if (!this.#isInBounds(point)) {
      throw new Error("Attack out of bounds");
    }

    if (this.containsPoint(point)) {
      EventBus.emit("attack error", {
        error: "Point already contains a marker",
        point,
      });
      return;
    }

    const hitShip = this.#ships.find((ship) => ship.isHit(point));

    if (hitShip) {
      hitShip.hit();
      this.#hits.push({ ...point });
      return "hit";
    } else {
      this.#misses.push({ ...point });
      return "miss";
    }
  }

  revertAttack(point, wasHit, shipHit) {
    if (wasHit) {
      shipHit.restoreHealth();
    }

    this.#hits = this.#hits.filter((p) => p.x !== point.x || p.y !== point.y);
    this.#misses = this.#misses.filter(
      (p) => p.x !== point.x || p.y !== point.y,
    );
  }

  containsPoint(point) {
    return (
      this.#hits.some((p) => p.x === point.x && p.y === point.y) ||
      this.#misses.some((p) => p.x === point.x && p.y === point.y)
    );
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

  getShipAt(point) {
    return this.#ships.find((ship) => ship.isHit(point)) || null;
  }
  setShips(list) {
    this.#ships = list;
  }

  getHits() {
    return this.#hits;
  }

  setHits(count) {
    this.#hits = count;
  }

  getMisses() {
    return this.#misses;
  }
  setMisses(list) {
    this.#misses = list;
  }

  clone() {
    const copy = new Gameboard(this.#size);
    copy.#hits = structuredClone(this.#hits);
    copy.#misses = structuredClone(this.#misses);
    copy.#ships = this.#ships.map((ship) => ship.clone());
    return copy;
  }
}
