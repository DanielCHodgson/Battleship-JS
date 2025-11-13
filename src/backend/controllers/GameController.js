import NextTurnCommand from "../commands/NextTurnCommand";
import Player from "../entities/Player";
import Ship from "../entities/Ship";
import TurnState from "../state/TurnState";
import EventBus from "../utilities/EventBus";

export default class GameController {
  #players = {};
  #turnStates = [];
  #nextTurnCommand;

  constructor() {
    this.#nextTurnCommand = new NextTurnCommand(this);
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("attack attempted", (point) => this.handleAttack(point));
  }

  handleAttack(point) {
    const currentTurn = this.getCurrentTurn();
    if (!currentTurn) return;

    const board = currentTurn.getBoard();
    const result = board.receiveAttack(point);

    EventBus.emit("attack resolved", {
      board,
      point,
      result: result.result,
    });
  }

  startGame() {
    if (!this.#players.player1 || !this.#players.player2) {
      this.#initTestPlayers();
    }

    const { player1, player2 } = this.#players;
    const firstTurn = new TurnState(1, player1, player2.getGameboard(), "play");
    this.#turnStates.push(firstTurn);

    EventBus.emit("turn updated", {
      state: firstTurn,
      board: firstTurn.getBoard(),
    });
    return "game started!";
  }

  nextTurn() {
    const currTurn = this.getCurrentTurn();
    if (!currTurn) return;

    const { player1, player2 } = this.#players;
    const nextPlayer = currTurn.getPlayer() === player1 ? player2 : player1;

    const newTurn = new TurnState(
      currTurn.getTurn() + 1,
      nextPlayer,
      currTurn.getPlayer().getGameboard(),
      "play",
    );

    this.#turnStates.push(newTurn);
    EventBus.emit("turn updated", {
      state: newTurn,
      board: newTurn.getBoard(),
    });
  }

  previousTurn() {
    if (this.#turnStates.length <= 1) return;
    this.#turnStates.pop();
    const lastTurn = this.getCurrentTurn();
    EventBus.emit("turn restored", lastTurn);
  }

  endGame() {
    this.#turnStates = [];
    this.#players = {};
    EventBus.emit("game ended");
  }

  getTurns() {
    return this.#turnStates;
  }

  getCurrentTurn() {
    return this.#turnStates[this.#turnStates.length - 1] || null;
  }

  setPlayers(player1, player2) {
    this.#players = { player1, player2 };
  }

  // Testing Helpers ------------------
  #initTestPlayers() {
    const player1 = new Player("Player1", false);
    const gameboard1 = player1.getGameboard();
    gameboard1.placeShip(
      new Ship("destroyer", 4),
      { x: 0, y: 0 },
      "horizontal",
    );
    gameboard1.placeShip(new Ship("tug", 4), { x: 5, y: 4 }, "vertical");

    const player2 = new Player("Player2", false);
    const gameboard2 = player2.getGameboard();
    gameboard2.placeShip(
      new Ship("destroyer", 4),
      { x: 0, y: 9 },
      "horizontal",
    );
    gameboard2.placeShip(new Ship("tug", 4), { x: 9, y: 0 }, "vertical");

    this.setPlayers(player1, player2);
  }
}
