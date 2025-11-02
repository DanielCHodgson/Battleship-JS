import Player from "../Player";
import GameBoard from "../board/GameBoard";

jest.mock("../board/GameBoard");

describe("Player class", () => {
  beforeEach(() => {
    GameBoard.mockClear();
  });

  test("placeHit should call GameBoard method (when implemented)", () => {
    const mockHit = jest.fn();
    GameBoard.mockImplementation(() => ({
      receiveAttack: mockHit,
    }));

    const player = new Player("AI", true);
    if (player.placeHit) {
      player.placeHit(3, 4);
      expect(mockHit).toHaveBeenCalledWith(3, 4);
    }
  });
});
