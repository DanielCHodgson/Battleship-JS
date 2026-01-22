import Player from "../entities/Player";
import Ship from "../entities/Ship";
import EventBus from "../utilities/EventBus";
import TurnManager from "../Turns/TurnManager";
import GameState from "../Turns/GameState";
import NextTurnCommand from "../commands/NextTurnCommand";
import AttackCommand from "../commands/AttackCommand";
import EndGameCommand from "../commands/EndGameCommand";
import AiTurnController from "./AiTurnController";
import EnemyAI from "./EnemyAI";

export default class GameController {
  #players = {};
  #turnManager;
  #commandHistory = [];
  #phase = "playing";

  constructor() {
    this.#turnManager = new TurnManager();
    this.#registerEvents();
    new AiTurnController(this.#turnManager, new EnemyAI());
  }

  #registerEvents() {
    EventBus.on("attack attempted", (point) => {
      if (this.#phase !== "playing") return;
      this.attack(point);
    });

    EventBus.on("next turn", () => {
      if (this.#phase !== "playing") return;
      this.executeCommand(new NextTurnCommand(this.#turnManager));
    });

    EventBus.on("undo", () => this.undoLastCommand());
  }

  startGame() {
    if (!this.#players.player1 || !this.#players.player2) {
      this.#initTestPlayers();
    }

    const { player1, player2 } = this.#players;
    this.#turnManager.initialize(player1, player2);

    this.emitState();
  }

  attack(point) {
    const currentTurn = this.#turnManager.getCurrentTurn();
    if (!currentTurn || currentTurn.hasAttacked()) return;

    const enemyBoard = currentTurn.getTargetBoard();
    const result = this.executeCommand(new AttackCommand(this.#turnManager, point));
    if (result === "hit" && this.gameIsWon(enemyBoard)) {
      this.executeCommand(new EndGameCommand(this));
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
    EventBus.emit(
      "state changed",
      new GameState({
        turn: this.#turnManager.getCurrentTurn(),
        turnNumber: this.#turnManager.getTurnNumber(),
        phase: this.#phase,
      }),
    );
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

  getPhase() {
    return this.#phase;
  }

  setPhase(phase) {
    this.#phase = phase;
  }

  #initTestPlayers() {
    const player1 = new Player("Player1", false);
    player1.getBoard().placeShip(new Ship("tug", 1), { x: 9, y: 0 }, "vertical");

    const player2 = new Player("Player2", true);
    player2.getBoard().placeShip(new Ship("tug", 1), { x: 0, y: 0 }, "vertical");

    this.setPlayers(player1, player2);
  }
}
