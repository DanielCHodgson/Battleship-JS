import GameController from "../GameController";

const gameController = new GameController();

describe("GameController", () => {
  test("startGame should return 'game started!'", () => {
    expect(gameController.startGame()).toBe("game started!");
  });
});
