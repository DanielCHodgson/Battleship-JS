import Player from "../entities/Player";
import Ship from "../entities/Ship";
import EventBus from "../utilities/EventBus";

export default class GameController {
  #players = {};
  #turnStates = [];

  constructor() {
    this.#initTestState();
  }

  #initTestState() {
    const player1 = new Player("Player1", false);
    const gameboard = player1.getGameboard();

    const ship1 = new Ship("destroyer", 4);
    const ship2 = new Ship("tug", 4);

    gameboard.placeShip(ship1, { x: 0, y: 0 }, "horizontal");
    gameboard.placeShip(ship2, { x: 5, y: 4 }, "vertical");

    console.log(gameboard.getShips())
    gameboard.getShips().forEach((ship) => EventBus.emit("render ship", ship));
  }

  startGame() {
    return "game started!";
  }

  nextTurn() {}

  endGame() {}
}
