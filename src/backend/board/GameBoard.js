export default class Gameboard {
  #size;
  #misses;
  #hits;
  #ships;

  constructor(size = 10) {
    this.#size = size;
    this.#misses = [];
    this.#hits = [];
    this.#ships = [];
  }

  placeShip(ship, point, direction = "horizontal") {
    const positions = [point];

    for (let i = 1; i < ship.getLength(); i++) {
      positions.push(
        direction === "horizontal"
          ? { x: point.x + i, y: point.y }
          : { x: point.x, y: point.y + i },
      );
    }

    if (!positions.every((pos) => this.isInBounds(pos))) {
      return { ok: false, reason: "ship-out-of-bounds" };
    }

    ship.setPositions(positions);
    this.#ships.push(ship);
    return { ok: true };
  }

  receiveAttack(point) {
    if (!this.isInBounds(point)) {
      return { ok: false, reason: "out-of-bounds" };
    }

    if (this.pointIsOccupied(point)) {
      return { ok: false, reason: "occupied" };
    }

    const hitShip = this.#ships.find((ship) => ship.collides(point));

    if (hitShip) {
      hitShip.hit();
      this.#hits.push({ ...point });
      return { ok: true, result: "hit", ship: hitShip };
    }

    this.#misses.push({ ...point });
    return { ok: true, result: "miss" };
  }

  revertAttack(point, didHit, shipHit) {
    const pointList = didHit ? this.#hits : this.#misses;

    if (didHit && shipHit) {
      shipHit.restoreHealth();
    }

    const filtered = pointList.filter(
      (p) => p.x !== point.x || p.y !== point.y,
    );

    if (didHit) this.#hits = filtered;
    else this.#misses = filtered;
  }

  pointIsOccupied(point) {
    return (
      this.#hits.some((p) => p.x === point.x && p.y === point.y) ||
      this.#misses.some((p) => p.x === point.x && p.y === point.y)
    );
  }

  isInBounds(point) {
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
    return this.#ships.find((ship) => ship.collides(point)) || null;
  }

  getHits() {
    return this.#hits;
  }

  getMisses() {
    return this.#misses;
  }
}
