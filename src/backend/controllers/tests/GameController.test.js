import GameController from "../GameController";
import Player from "../../entities/Player";
import Ship from "../../entities/Ship";
import TurnState from "../../state/TurnState";

describe("GameController", () => {
  let gameController;
  let player1, player2;
  let gameboard1, gameboard2;

  beforeEach(() => {
    gameController = new GameController();

    player1 = new Player("Player 1", false);
    gameboard1 = player1.getGameboard();
    gameboard1.placeShip(
      new Ship("destroyer", 4),
      { x: 0, y: 0 },
      "horizontal",
    );
    gameboard1.placeShip(new Ship("tug", 4), { x: 5, y: 4 }, "vertical");

    player2 = new Player("Player 2", false);
    gameboard2 = player2.getGameboard();
    gameboard2.placeShip(
      new Ship("destroyer", 4),
      { x: 0, y: 9 },
      "horizontal",
    );
    gameboard2.placeShip(new Ship("tug", 4), { x: 9, y: 0 }, "vertical");

    gameController.setPlayers(player1, player2);
    gameController.startGame();
  });

  test("startGame should add initial turn state", () => {
    const turns = gameController.getTurns();

    expect(turns.length).toBe(1);
    const firstTurn = turns[0];

    expect(firstTurn.getTurn()).toBe(1);
    expect(firstTurn.getPlayer()).toBe(player1);
    expect(firstTurn.getBoard()).toBe(gameboard2);
    expect(firstTurn.getPhase()).toBe("play");
  });

  test("handleAttack should add a miss to the enemy board", () => {
    gameController.handleAttack({ x: 0, y: 0 });
    const currentTurn = gameController.getCurrentTurn();

    expect(currentTurn.getBoard().getMisses()).toContainEqual({ x: 0, y: 0 });
  });

  test("nextTurn should invert the current player and enemy board", () => {
    gameController.nextTurn();
    const turns = gameController.getTurns();
    const currentTurn = gameController.getCurrentTurn();

    expect(turns.length).toBe(2);
    expect(currentTurn.getTurn()).toBe(2);
    expect(currentTurn.getPlayer()).toBe(player2);
    expect(currentTurn.getBoard()).toBe(gameboard1);
    expect(currentTurn.getPhase()).toBe("play");
  });

  test("handleAttack should add a hit to the enemy board", () => {
    gameController.handleAttack({ x: 0, y: 9 });
    const currentTurn = gameController.getCurrentTurn();
    expect(currentTurn.getBoard().getHits()).toContainEqual({ x: 0, y: 9 });
  });
});
