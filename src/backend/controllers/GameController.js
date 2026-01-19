import Player from "../entities/Player";
import Ship from "../entities/Ship";
import EventBus from "../utilities/EventBus";
import TurnManager from "../Turns/TurnManager";
import NextTurnCommand from "../commands/NextTurnCommand";
import AttackCommand from "../commands/AttackCommand";

export default class GameController {
  #players = {};
  #turnManager;
  #commandHistory = [];
  #phase = "playing";

  constructor() {
    this.#turnManager = new TurnManager(this);
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("attack attempted", (point) => this.handleAttack(point));
    EventBus.on("next turn", () => this.executeCommand(new NextTurnCommand(this.#turnManager)));
    EventBus.on("undo", () => this.undoLastCommand());
  }

  startGame() {
    if (!this.#players.player1 || !this.#players.player2) {
      this.#initTestPlayers();
    }
    this.#turnManager.initialize();
    this.emitState();
  }

  handleAttack(point) {
    const currentTurnState = this.#turnManager.getCurrentTurnState();
    if (!currentTurnState || currentTurnState.hasAttacked()) return;

    const enemyBoard = currentTurnState.getTargetBoard();
    const result = this.executeCommand(new AttackCommand(currentTurnState, point));

    if (result === "hit" && this.gameIsWon(enemyBoard)) {
      this.#phase = "gameover";
      this.emitState();
    }
  }

  undoLastCommand() {
    const command = this.#commandHistory.pop();
    if (!command) return;
    command.undo();
    this.emitState();
  }

  executeCommand(command) {
    const result = command.execute();
    if (result !== false) {
      this.#commandHistory.push(command);
      this.emitState();
    }
    return result;
  }

  emitState() {
    EventBus.emit("state changed", {
      turn: this.#turnManager.getCurrentTurnState(),
      turnNumber: this.#turnManager.getTurnNumber(),
      phase: this.#phase,
    });
  }

  gameIsWon(board) {
    return board.getShips().every((ship) => ship.isSunk());
  }

  setPlayers(player1, player2) {
    this.#players = { player1, player2 };
  }

  getPlayers() {
    return this.#players;
  }

  #initTestPlayers() {
    const player1 = new Player("Player1", false);
    player1.getGameboard().placeShip(
      new Ship("tug", 1),
      { x: 9, y: 0 },
      "vertical"
    );

    const player2 = new Player("Player2", false);
    player2.getGameboard().placeShip(
      new Ship("tug", 1),
      { x: 0, y: 0 },
      "vertical"
    );

    this.setPlayers(player1, player2);
  }
}
