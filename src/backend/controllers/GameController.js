import Player from "../entities/Player";
import Ship from "../entities/Ship";
import TurnState from "../state/TurnState";
import EventBus from "../utilities/EventBus";

export default class GameController {
  #players = {};
  #turnStates = [];

  constructor() {
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("square clicked", (square) => this.selectSquare(square));
  }

  selectSquare(square) {
    const currentTurn = this.#turnStates[0];
    if (!currentTurn) return;
    const board = currentTurn.getPlayer().getGameboard();
  }

  #initTestPlayers() {
    const player1 = new Player("Player 1", false);
    const gameboard1 = player1.getGameboard();
    gameboard1.placeShip(
      new Ship("destroyer", 4),
      { x: 0, y: 0 },
      "horizontal",
    );
    gameboard1.placeShip(new Ship("tug", 4), { x: 5, y: 4 }, "vertical");

    const player2 = new Player("Player 2", false);
    const gameboard2 = player2.getGameboard();
    gameboard2.placeShip(
      new Ship("destroyer", 4),
      { x: 0, y: 9 },
      "horizontal",
    );
    gameboard2.placeShip(new Ship("tug", 4), { x: 9, y: 0 }, "vertical");

    this.setPlayers(player1, player2);
  }

  startGame() {
    if (!this.#players.player1 || !this.#players.player2) {
      this.#initTestPlayers();
    }

    const { player1, player2 } = this.#players;
    const turnState = new TurnState(1, player1, player2.getGameboard(), "play");

    this.#turnStates.push(turnState);

    EventBus.emit("turn started", turnState);
    return "game started!";
  }

  nextTurn() {}

  endGame() {}

  getTurns() {
    return this.#turnStates;
  }

  setPlayers(player1, player2) {
    this.#players = { player1, player2 };
  }
}
