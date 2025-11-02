import Ship from "../Ship";

describe("Ship", () => {
  test("is not sunk when created", () => {
    const ship = new Ship("Destroyer", 3);
    expect(ship.isSunk()).toBe(false);
  });

  test("sinks after being hit >= times its length", () => {
    const ship = new Ship("Destroyer", 3);

    ship.hit();
    expect(ship.isSunk()).toBe(false);

    ship.hit();
    expect(ship.isSunk()).toBe(false);

    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});