import EventBus from "../../utilities/EventBus";
import RenderController from "../RenderController";

jest.mock("../../utilities/EventBus", () => ({
  on: jest.fn(),
  emit: jest.fn(),
}));

describe("RenderController", () => {
  let mockBoard;
  let renderController;

  beforeEach(() => {
    mockBoard = {
      markShip: jest.fn(),
      markHit: jest.fn(),
      markMiss: jest.fn(),
    };

    jest.clearAllMocks();

    renderController = new RenderController(mockBoard);
  });

  test("should register event listeners on EventBus", () => {
    expect(EventBus.on).toHaveBeenCalledTimes(2);
    expect(EventBus.on).toHaveBeenCalledWith(
      "render ship",
      expect.any(Function),
    );
    expect(EventBus.on).toHaveBeenCalledWith(
      "render attack",
      expect.any(Function),
    );
  });

  test("renderShip should mark all ship positions", () => {
    const mockShip = {
      getPositions: jest.fn(() => [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ]),
    };

    renderController.renderShip(mockShip);

    expect(mockShip.getPositions).toHaveBeenCalled();
    expect(mockBoard.markShip).toHaveBeenCalledTimes(2);
    expect(mockBoard.markShip).toHaveBeenNthCalledWith(1, 1, 1);
    expect(mockBoard.markShip).toHaveBeenNthCalledWith(2, 2, 2);
  });

  test("renderAttack should call markHit when result is 'hit'", () => {
    const data = { point: { x: 3, y: 4 }, result: "hit" };
    renderController.renderAttack(data);

    expect(mockBoard.markHit).toHaveBeenCalledWith(3, 4);
    expect(mockBoard.markMiss).not.toHaveBeenCalled();
  });

  test("renderAttack should call markMiss when result is not 'hit'", () => {
    const data = { point: { x: 5, y: 6 }, result: "miss" };
    renderController.renderAttack(data);

    expect(mockBoard.markMiss).toHaveBeenCalledWith(5, 6);
    expect(mockBoard.markHit).not.toHaveBeenCalled();
  });

  test("should correctly handle 'render ship' and 'attack result' events from EventBus", () => {
    const renderShipCallback = EventBus.on.mock.calls.find(
      (call) => call[0] === "render ship",
    )[1];
    const attackResultCallback = EventBus.on.mock.calls.find(
      (call) => call[0] === "render attack",
    )[1];

    const mockShip = {
      getPositions: jest.fn(() => [{ x: 7, y: 8 }]),
    };
    renderShipCallback(mockShip);
    expect(mockBoard.markShip).toHaveBeenCalledWith(7, 8);

    attackResultCallback({ point: { x: 9, y: 10 }, result: "hit" });
    expect(mockBoard.markHit).toHaveBeenCalledWith(9, 10);
  });
});
