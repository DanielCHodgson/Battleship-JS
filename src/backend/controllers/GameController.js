import Player from "../entities/Player";
import Ship from "../entities/Ship";
import EventBus from "../utilities/EventBus";
import TurnManager from "../Turns/TurnManager";
import TurnCommand from "../commands/TurnCommand";
import AttackCommand from "../commands/AttackCommand";

export default class GameController {
  #players = {};
  #turnManager;
  #commandHistory = [];

  constructor() {
    this.#turnManager = new TurnManager(this);
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("attack attempted", (point) => this.handleAttack(point));
    EventBus.on("next turn", () =>
      this.executeCommand(new TurnCommand(this.#turnManager)),
    );
    EventBus.on("undo", () => this.undoLastCommand());
  }

  startGame() {
    if (!this.#players.player1 || !this.#players.player2) {
      this.#initTestPlayers();
    }
    this.#turnManager.firstTurn();
  }

  executeCommand(command) {
    command.execute();
    this.#commandHistory.push(command);
  }

  undoLastCommand() {
    const command = this.#commandHistory.pop();
    if (command) command.undo();
  }

  handleAttack(point) {
    const currentTurn = this.#turnManager.getCurrentTurnState();
    if (!currentTurn || currentTurn.hasAttacked()) return;

    const enemyBoard = currentTurn.getBoard();
    const result = this.executeCommand(new AttackCommand(enemyBoard, point));
    currentTurn.markAttackDone();

    if (result === "hit" && this.gameIsWon(enemyBoard)) {
      this.endGame(currentTurn);
    }
  }

  undoAttack(point, wasHit, shipHit) {
    //to do - update ship class with a "removeHit(point)" method
  }

  gameIsWon(board) {
    return board.getShips().every((ship) => ship.isSunk());
  }

  endGame(endState) {
    console.log("Game Over!");
    EventBus.emit("game over", endState);
  }

  setPlayers(player1, player2) {
    this.#players = { player1, player2 };
  }

  getPlayers() {
    return this.#players;
  }

  #initTestPlayers() {
    const player1 = new Player("Player1", false);
    const gameboard1 = player1.getGameboard();
    gameboard1.placeShip(new Ship("tug", 1), { x: 9, y: 0 }, "vertical");

    const player2 = new Player("Player2", false);
    const gameboard2 = player2.getGameboard();
    gameboard2.placeShip(new Ship("tug", 1), { x: 0, y: 0 }, "vertical");

    this.setPlayers(player1, player2);
  }
}
