import Player from "../entities/Player";
import Ship from "../entities/Ship";
import EventBus from "../utilities/EventBus";
import TurnManager from "../Turns/TurnManager";
import GameState from "../Turns/GameState";
import AttackCommand from "../commands/AttackCommand";
import CompositeCommand from "../commands/CompositeCommand";
import ResolveTurnCommand from "../commands/ResolveTurnCommand";
import EnemyAI from "./EnemyAI";
import AiTurnController from "./AiTurnController";

export default class GameController {
  #players = {};
  #turnManager;
  #commandHistory = [];
  #phase = "playing";

  constructor() {
    this.#turnManager = new TurnManager();
    new AiTurnController( this.#turnManager, new EnemyAI());
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("attack attempted", (point) => this.handleAttack(point));
    EventBus.on("undo", () => this.undoLastCommand());

    // Kept for debugging
    /* 
      EventBus.on("next turn", () => {
        if (this.#phase === "playing") {
        this.executeCommand(new NextTurnCommand(this.#turnManager));
      }}); 
    */
  }

  startGame() {
    if (!this.#players.player1 || !this.#players.player2) {
      this.#initTestPlayers();
    }

    const { player1, player2 } = this.#players;

    this.#turnManager.initialize(player1, player2);
    this.emitState();
  }

  handleAttack(point) {
    if (this.#phase !== "playing") return;
    if (!point) return;

    const turn = this.#turnManager.getCurrentTurn();
    if (!turn || turn.hasAttacked()) return;

    const move = new CompositeCommand([
      new AttackCommand(this.#turnManager, point),
      new ResolveTurnCommand(this.#turnManager, this),
    ]);

    this.executeCommand(move);
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

  // Dev / Testing utility

  #initTestPlayers() {
    const player1 = new Player("Player1", false);
    player1
      .getBoard()
      .placeShip(new Ship("tug", 1), { x: 9, y: 0 }, "vertical");

    const player2 = new Player("Player2", true);
    player2
      .getBoard()
      .placeShip(new Ship("tug", 1), { x: 0, y: 0 }, "vertical");

    this.setPlayers(player1, player2);
  }
}
