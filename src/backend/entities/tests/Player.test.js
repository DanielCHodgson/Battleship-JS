import Player from "../Player";

describe("Player class", () => {
  test("stores its name, controller type, and board", () => {
    const board = { receiveAttack: jest.fn() };
    const player = new Player("CPU", true, board);

    expect(player.getName()).toBe("CPU");
    expect(player.isAI()).toBe(true);
    expect(player.getBoard()).toBe(board);
  });
});
