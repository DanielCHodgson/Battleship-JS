import EventBus from "../utilities/EventBus";
import Gameboard from "../board/Gameboard";
import Ship from "../entities/Ship";
import Player from "../entities/Player";
import GameEngine from "./GameEngine";

describe("GameEngine flow", () => {
  let engine;
  let states;
  let onStateChanged;

  beforeEach(() => {
    jest.useFakeTimers();
    states = [];
    onStateChanged = (state) => states.push(state);
    EventBus.on("state changed", onStateChanged);
    engine = new GameEngine();
  });

  afterEach(() => {
    engine.destroy();
    EventBus.off("state changed", onStateChanged);
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  function deployHumanGame() {
    engine.startDeployment({
      player1: { name: "Player 1", isAI: false },
      player2: { name: "Player 2", isAI: false },
    });
    engine.randomizeDeployment();
    engine.deploySubmit();
    engine.randomizeDeployment();
    engine.deploySubmit();
    return states.at(-1);
  }

  function findEmptyPoint(board) {
    for (let y = 0; y < board.getSize(); y += 1) {
      for (let x = 0; x < board.getSize(); x += 1) {
        if (!board.getShipAt({ x, y })) return { x, y };
      }
    }
    return null;
  }

  test("moves both human players through deployment into play", () => {
    const finalState = deployHumanGame();

    expect(states).toHaveLength(5);
    expect(finalState.getPhase()).toBe("playing");
    expect(finalState.getTurnNumber()).toBe(1);
    expect(finalState.getTurn().getPlayer().getName()).toBe("Player 1");
  });

  test("shows attack feedback before resolving the turn", () => {
    let state = deployHumanGame();
    states.length = 0;
    const targetBoard = state.getTurn().getTargetBoard();
    const point = findEmptyPoint(targetBoard);

    expect(engine.handleAttack(point)).toBe(true);
    expect(states).toHaveLength(1);
    expect(states.at(-1).getTurnNumber()).toBe(1);
    expect(states.at(-1).getAttackFeedback()).toEqual({
      result: "miss",
      point,
    });
    expect(targetBoard.getMisses()).toContainEqual(point);

    jest.advanceTimersByTime(449);
    expect(states).toHaveLength(1);

    jest.advanceTimersByTime(1);
    expect(states).toHaveLength(2);
    expect(states.at(-1).getTurnNumber()).toBe(2);
    expect(states.at(-1).getAttackFeedback()).toBeNull();

    states.length = 0;
    expect(engine.undo()).toEqual({ ok: true });
    expect(states).toHaveLength(1);
    expect(states.at(-1).getTurnNumber()).toBe(1);
    expect(targetBoard.getMisses()).not.toContainEqual(point);

    states.length = 0;
    expect(engine.redo()).toEqual({ ok: true });
    expect(states).toHaveLength(1);
    expect(states.at(-1).getTurnNumber()).toBe(2);
    expect(targetBoard.getMisses()).toContainEqual(point);
  });

  test("restart rebuilds clean boards from the saved deployment", () => {
    const initialState = deployHumanGame();
    const initialTarget = initialState.getTurn().getTargetBoard();
    const point = findEmptyPoint(initialTarget);
    engine.handleAttack(point);
    states.length = 0;

    expect(engine.restart()).toEqual({ ok: true });

    const restarted = states.at(-1);
    const boards = [
      restarted.getTurn().getPlayerBoard(),
      restarted.getTurn().getTargetBoard(),
    ];
    expect(states).toHaveLength(1);
    expect(restarted.getTurnNumber()).toBe(1);
    boards.forEach((board) => {
      expect(board.getHits()).toEqual([]);
      expect(board.getMisses()).toEqual([]);
      board.getShips().forEach((ship) => expect(ship.getHits()).toBe(0));
    });

    jest.runAllTimers();
    expect(states).toHaveLength(1);
  });

  test("a winning attack can be undone", () => {
    const board1 = new Gameboard(2);
    const board2 = new Gameboard(2);
    board1.placeShip(new Ship("one", 1), { x: 0, y: 0 });
    board2.placeShip(new Ship("one", 1), { x: 0, y: 0 });
    engine.startGame({
      player1: new Player("Player 1", false, board1),
      player2: new Player("Player 2", false, board2),
    });

    engine.handleAttack({ x: 0, y: 0 });
    expect(states.at(-1).getPhase()).toBe("playing");
    expect(states.at(-1).getAttackFeedback()).toEqual({
      result: "hit",
      point: { x: 0, y: 0 },
    });

    jest.advanceTimersByTime(1199);
    expect(states.at(-1).getPhase()).toBe("playing");

    jest.advanceTimersByTime(1);
    expect(states.at(-1).getPhase()).toBe("gameover");

    states.length = 0;
    expect(engine.undo()).toEqual({ ok: true });
    expect(states).toHaveLength(1);
    expect(states.at(-1).getPhase()).toBe("playing");
    expect(board2.getHits()).toEqual([]);
    expect(board2.getShips()[0].getHits()).toBe(0);
  });

  test("quit cancels a pending turn and returns to setup", () => {
    const state = deployHumanGame();
    const point = findEmptyPoint(state.getTurn().getTargetBoard());
    engine.handleAttack(point);
    states.length = 0;

    expect(engine.quitGame()).toEqual({ ok: true });
    expect(states).toHaveLength(1);
    expect(states.at(-1).getPhase()).toBe("setup");
    expect(engine.getPlayers()).toEqual({});

    jest.runAllTimers();
    expect(states).toHaveLength(1);
  });
});
