import Gameboard from "./GameBoard";
import Ship from "../entities/Ship";

describe("Gameboard", () => {
  let gameboard;
  let ship;

  beforeEach(() => {
    gameboard = new Gameboard(10);
    ship = new Ship("destroyer", 4);
  });

  test("ship is placed on the gameboard", () => {
    gameboard.placeShip(ship, { x: 0, y: 0 }, "horizontal");

    const ships = gameboard.getShips();

    expect(ships.length).toBe(1);
    expect(ships[0]).toBeInstanceOf(Ship);
    expect(ships[0].getName()).toBe("destroyer");
    expect(ships[0].getPositions()).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  test("a ship is placed with positions that are out of bounds", () => {
    expect(() =>
      gameboard.placeShip(ship, { x: 10, y: 10 }, "horizontal"),
    ).toThrow("Ship not wholly in bounds");
  });

  test("an attack is placed on a point containing a ship", () => {
    gameboard.placeShip(ship, { x: 0, y: 0 }, "horizontal");
    expect(gameboard.receiveAttack({ x: 0, y: 0 })).toStrictEqual({
      point: { x: 0, y: 0 },
      result: "hit",
    });
  });

  test("an attack is placed on an empty point", () => {
    gameboard.placeShip(ship, { x: 0, y: 0 }, "horizontal");
    expect(gameboard.receiveAttack({ x: 0, y: 1 })).toStrictEqual({
      point: { x: 0, y: 1 },
      result: "miss",
    });
  });

  test("an attack is placed out of bounds", () => {
    expect(() => gameboard.receiveAttack({ x: 11, y: 11 })).toThrow(
      "Attack is out of bounds",
    );
  });
});
