import Ship from "../entities/Ship";

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

  static fromDeployment({ size = 10, ships }) {
    if (!Array.isArray(ships)) {
      throw new Error("Deployment must include a ships array");
    }

    const board = new Gameboard(size);

    for (const { name, length, positions } of ships) {
  
      const ship = new Ship(name, length);
      ship.setPositions(positions.map((point) => ({ x: point.x, y: point.y })));

      board.getShips().push(ship);
    }

    return board;
  }

  placeShip(ship, point, direction = "horizontal") {
    if (this.#alreadyPlaced(ship)) {
      return { ok: false, reason: "ship-type-already-placed" };
    }

    const positions = this.#buildPositions(ship, point, direction);

    if (!positions.every((pos) => this.isInBounds(pos))) {
      return { ok: false, reason: "ship-out-of-bounds" };
    }

    if (this.#overlaps(positions)) {
      return { ok: false, reason: "ship-overlaps" };
    }

    ship.setPositions(positions);
    this.#ships.push(ship);
    return { ok: true };
  }

  placeShipAtRandom(ship, maxAttempts = 100) {
    const size = this.#size;

    for (let i = 0; i < maxAttempts; i++) {
      const point = {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size),
      };
      const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
      const result = this.placeShip(ship, point, direction);
      if (result.ok) return true;
    }

    throw new Error(`Failed to place ship ${ship.getName()}`);
  }

  removeShip(ship) {
    if (!ship) return { ok: false, reason: "no-ship-in-argument" };

    const before = this.#ships.length;
    this.#ships = this.#ships.filter((s) => s.getName() !== ship.getName());

    if (this.#ships.length === before) {
      return { ok: false, reason: "ship-not-found" };
    }

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

  getSize() {
    return this.#size;
  }

  #alreadyPlaced(ship) {
    return this.#ships.some((s) => s.getName() === ship.getName());
  }

  #overlaps(positions) {
    return positions.some((pos) => this.#ships.some((s) => s.collides(pos)));
  }

  #buildPositions(ship, point, direction) {
    const positions = [{ ...point }];

    for (let i = 1; i < ship.getLength(); i++) {
      positions.push(
        direction === "horizontal"
          ? { x: point.x + i, y: point.y }
          : { x: point.x, y: point.y + i },
      );
    }

    return positions;
  }
}
