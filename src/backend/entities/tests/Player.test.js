import Gameboard from "../../board/Gameboard";
jest.mock("../../board/Gameboard");

import Player from "../Player";

describe("Player class", () => {
  test("placeHit should call Gameboard's receiveAttack method", () => {
    const mockReceiveAttack = jest.fn();
    Gameboard.mockImplementation(() => ({
      receiveAttack: mockReceiveAttack,
    }));

    const player = new Player("AI", true);
    player.placeHit({ x: 3, y: 4 });
    expect(mockReceiveAttack).toHaveBeenCalledWith({ x: 3, y: 4 });
  });
});
