import Player from "../entities/Player";
import Ship from "../entities/Ship";
import EventBus from "../utilities/EventBus";

export default class GameController {
  #players = {};
  #turnStates = [];

  constructor() {
    this.#initTestBoard();
  }

  #initTestBoard() {
    const player1 = new Player("Player1", false);

    const ship1 = new Ship("destroyer", 4)
    const ship2 = new Ship("tug", 4)

    player1.getGameboard().placeShip(ship1, { x: 0, y: 0 }, "horizontal");
    player1.getGameboard().placeShip(ship2, { x: 5, y: 4 }, "vertical");
  }

  startGame() {
    return "game started!";
  }

  nextTurn() {}

  endGame() {}
}
