import Gameboard from "./Gameboard";
import Ship from "../entities/Ship";

describe("Gameboard", () => {
  let gameboard;
  let ship;

  beforeEach(() => {
    gameboard = new Gameboard(10);
    ship = new Ship("destroyer", 4);
  });

  test("places a ship and records all of its positions", () => {
    const result = gameboard.placeShip(
      ship,
      { x: 0, y: 0 },
      "horizontal",
    );

    expect(result).toEqual({ ok: true });
    expect(gameboard.getShips()).toHaveLength(1);
    expect(ship.getPositions()).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  test("rejects out-of-bounds and overlapping placements", () => {
    expect(
      gameboard.placeShip(ship, { x: 10, y: 10 }, "horizontal"),
    ).toEqual({ ok: false, reason: "ship-out-of-bounds" });

    gameboard.placeShip(ship, { x: 0, y: 0 }, "horizontal");
    expect(
      gameboard.placeShip(
        new Ship("cruiser", 3),
        { x: 2, y: 0 },
        "vertical",
      ),
    ).toEqual({ ok: false, reason: "ship-overlaps" });
  });

  test("records hits and prevents attacking the same point twice", () => {
    gameboard.placeShip(ship, { x: 0, y: 0 }, "horizontal");
    const attack = gameboard.receiveAttack({ x: 0, y: 0 });

    expect(attack.ok).toBe(true);
    expect(attack.result).toBe("hit");
    expect(attack.ship).toBe(ship);
    expect(ship.getHits()).toBe(1);
    expect(gameboard.getHits()).toEqual([{ x: 0, y: 0 }]);
    expect(gameboard.receiveAttack({ x: 0, y: 0 })).toEqual({
      ok: false,
      reason: "occupied",
    });
  });

  test("records misses", () => {
    expect(gameboard.receiveAttack({ x: 0, y: 1 })).toEqual({
      ok: true,
      result: "miss",
    });
    expect(gameboard.getMisses()).toEqual([{ x: 0, y: 1 }]);
  });

  test("rejects an out-of-bounds attack", () => {
    expect(gameboard.receiveAttack({ x: 11, y: 11 })).toEqual({
      ok: false,
      reason: "out-of-bounds",
    });
  });
});
