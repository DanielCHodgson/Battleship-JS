/**
 * @jest-environment jsdom
 */
import EventBus from "../../utilities/EventBus";
import RenderController from "../RenderController";

jest.mock("../../utilities/EventBus", () => ({
  on: jest.fn(),
  emit: jest.fn(),
}));

describe("RenderController", () => {
  let renderController;
  let mockBoard;

  beforeEach(() => {
    jest.clearAllMocks();
    renderController = new RenderController();
    mockBoard = {
      getHits: jest.fn(() => [{ x: 1, y: 1 }]),
      getMisses: jest.fn(() => [{ x: 2, y: 2 }]),
      getShips: jest.fn(() => [
        { positions: [{ x: 3, y: 3 }, { x: 4, y: 4 }] },
      ]),
    };
  });

  test("should register 'attack resolved' and 'turn updated' event listeners on EventBus", () => {
    expect(EventBus.on).toHaveBeenCalledTimes(2);
    expect(EventBus.on).toHaveBeenCalledWith(
      "attack resolved",
      expect.any(Function),
    );
    expect(EventBus.on).toHaveBeenCalledWith(
      "turn updated",
      expect.any(Function),
    );
  });

  test("renderBoard should paint hits and misses", () => {
    const paintSpy = jest.spyOn(renderController, "paintCell").mockImplementation(() => {});
    renderController.renderBoard(mockBoard);

    expect(mockBoard.getHits).toHaveBeenCalled();
    expect(mockBoard.getMisses).toHaveBeenCalled();
    expect(paintSpy).toHaveBeenCalledWith(1, 1, "hit");
    expect(paintSpy).toHaveBeenCalledWith(2, 2, "miss");

    paintSpy.mockRestore();
  });

  test("renderShips should paint all ship positions", () => {
    const paintSpy = jest.spyOn(renderController, "paintCell").mockImplementation(() => {});
    renderController.renderShips(mockBoard);

    expect(mockBoard.getShips).toHaveBeenCalled();
    expect(paintSpy).toHaveBeenCalledWith(3, 3, "ship");
    expect(paintSpy).toHaveBeenCalledWith(4, 4, "ship");

    paintSpy.mockRestore();
  });

  test("paintCell should modify the correct DOM element", () => {
    document.body.innerHTML = `
      <div class="gameboard">
        <div data-col="5" data-row="5" class=""></div>
      </div>
    `;
    renderController.paintCell(5, 5, "hit");

    const cell = document.querySelector(`[data-col='5'][data-row='5']`);
    expect(cell.classList.contains("hit")).toBe(true);
  });

  test("clearBoard should remove all classes from gameboard cells", () => {
    document.body.innerHTML = `
      <div class="gameboard">
        <div class="ship" data-col="1" data-row="1"></div>
        <div class="hit" data-col="2" data-row="2"></div>
        <div class="miss" data-col="3" data-row="3"></div>
      </div>
    `;

    renderController.clearBoard();

    document.querySelectorAll(".gameboard > *").forEach((cell) => {
      expect(cell.classList.contains("ship")).toBe(false);
      expect(cell.classList.contains("hit")).toBe(false);
      expect(cell.classList.contains("miss")).toBe(false);
    });
  });

  test("should correctly handle EventBus callbacks for 'attack resolved' and 'turn updated'", () => {
    const attackResolvedCallback = EventBus.on.mock.calls.find(
      (call) => call[0] === "attack resolved",
    )[1];
    const turnUpdatedCallback = EventBus.on.mock.calls.find(
      (call) => call[0] === "turn updated",
    )[1];

    const renderBoardSpy = jest.spyOn(renderController, "renderBoard");
    const clearBoardSpy = jest.spyOn(renderController, "clearBoard");

    attackResolvedCallback({ board: mockBoard });
    expect(renderBoardSpy).toHaveBeenCalledWith(mockBoard);

    turnUpdatedCallback({ board: mockBoard });
    expect(clearBoardSpy).toHaveBeenCalled();
    expect(renderBoardSpy).toHaveBeenCalledWith(mockBoard);

    renderBoardSpy.mockRestore();
    clearBoardSpy.mockRestore();
  });
});
