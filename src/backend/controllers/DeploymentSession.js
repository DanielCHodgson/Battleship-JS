import Gameboard from "../board/Gameboard";
import ShipFactory from "../factories/ShipFactory";

export default class DeploymentSession {
  #shipFactory;
  #selectedShip = null;
  #selectedDirection = "horizontal";
  #deploymentBoard;
  #shipsToPlace = [];
  #placedShips = [];

  constructor() {
    this.#shipFactory = new ShipFactory();
    this.#deploymentBoard = new Gameboard();
    this.#shipsToPlace = this.#shipFactory.createFleet();
  }

  selectShip(ship) {
    this.#selectedShip = ship;
  }

  setDirection(direction) {
    if (direction !== "horizontal" && direction !== "vertical") {
      return { ok: false, reason: "invalid-direction" };
    }
    this.#selectedDirection = direction;
    return { ok: true };
  }

  placeAtPoint(point) {
    if (!this.#selectedShip) return { ok: false, reason: "no-ship-selected" };

    const result = this.#deploymentBoard.placeShip(
      this.#selectedShip,
      point,
      this.#selectedDirection,
    );

    if (!result.ok) return result;

    this.#shipsToPlace = this.#shipsToPlace.filter(
      (ship) => ship !== this.#selectedShip,
    );
    this.#placedShips.push(this.#selectedShip);
    this.#selectedShip = null;

    return { ok: true };
  }

  undoLastPlacement() {
    const ship = this.#placedShips.pop();
    if (!ship) return { ok: false, reason: "no-ship-found" };

    this.#deploymentBoard.removeShip(ship);
    ship.clearPositions();
    this.#shipsToPlace.push(ship);

    return { ok: true };
  }

  reset() {
    this.#selectedShip = null;
    this.#selectedDirection = "horizontal";
    this.#shipsToPlace = this.#shipFactory.createFleet();
    this.#placedShips.length = 0;
    this.#deploymentBoard = new Gameboard();
  }

  randomize() {
    for (const ship of this.#shipsToPlace) {
      this.#deploymentBoard.placeShipAtRandom(ship);
      this.#placedShips.push(ship);
    }
    this.#shipsToPlace.length = 0;
  }

  isComplete() {
    return this.#shipsToPlace.length === 0;
  }

  buildResult() {
    if (!this.isComplete()) {
      return {
        ok: false,
        reason: "deployment-not-complete",
        remaining: this.#shipsToPlace.map((ship) => ship.getName()),
      };
    }

    return {
      ok: true,
      deployment: {
        size: this.#deploymentBoard.getSize(),
        ships: this.#deploymentBoard.getShips().map((ship) => ({
          name: ship.getName(),
          length: ship.getLength(),
          positions: ship.getPositions().map((p) => ({ ...p })),
        })),
      },
    };
  }

  getBoard() {
    return this.#deploymentBoard;
  }

  getShipsToPlace() {
    return [...this.#shipsToPlace];
  }

  getPlacedShips() {
    return [...this.#placedShips];
  }
}
