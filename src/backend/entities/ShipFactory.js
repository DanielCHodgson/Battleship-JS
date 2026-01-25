import Ship from "./Ship";

export default class ShipFactory {
  #shipTypes = {
    carrier: { name: "carrier", length: 5 },
    battleship: { name: "battleship", length: 4 },
    cruiser: { name: "cruiser", length: 3 },
    submarine: { name: "submarine", length: 3 },
    destroyer: { name: "destroyer", length: 2 },
  };

  create(type) {
    const ship = this.#shipTypes[type];
    if (!ship) {
      throw new Error(`Unknown ship type: ${type}`);
    }
    return new Ship(ship.name, ship.length);
  }

  createFleet() {
    return [
      this.create("carrier"),
      this.create("battleship"),
      this.create("cruiser"),
      this.create("submarine"),
      this.create("destroyer"),
    ];
  }

  getDefinitions() {
    return { ...this.#shipTypes };
  }
}
