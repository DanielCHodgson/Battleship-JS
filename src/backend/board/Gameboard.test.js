import Gameboard from "./Gameboard";
import Ship from "../entities/Ship";

describe("Gameboard", () => {
  test("ship is added to the gameboard", () => {
    const gameboard = new Gameboard(10);

    gameboard.addShip("destroyer", 4, { x: 0, y: 0 }, "horizontal");

    const ships = gameboard.getShips();

    expect(ships.length).toBe(1);
    expect(ships[0]).toBeInstanceOf(Ship);
    expect(ships[0].getName()).toBe("destroyer");
  });

  test("throws error when ship positions are out of bounds", () => {
    const gameboard = new Gameboard(10);

    expect(() =>
      gameboard.addShip("destroyer", 4, { x: 10, y: 10 }, "horizontal")
    ).toThrow("Ship not wholly in bounds");
  });
});
