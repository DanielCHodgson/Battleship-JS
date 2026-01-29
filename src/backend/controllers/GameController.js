import Player from "../entities/Player";
import EventBus from "../utilities/EventBus";
import TurnManager from "../Turns/TurnManager";
import GameState from "../Turns/GameState";
import AttackCommand from "../commands/AttackCommand";
import CompositeCommand from "../commands/CompositeCommand";
import ResolveTurnCommand from "../commands/ResolveTurnCommand";
import AiMoveCalculator from "./AiMoveCalculator";
import AiTurnController from "./AiTurnController";
import ShipFactory from "../entities/ShipFactory";
import SetupPage from "../../frontend/pages/setup-page/setup-page";
import GamePage from "../../frontend/pages/game-page/game-page";

export default class GameController {
  #setupPage;
  #gamePage;

  #players = {};
  #turnManager;
  #aiTurnController;

  #commandHistory = [];
  #commandRedoStack = [];
  #phase = "playing";
  #shipFactory;

  #onSetupSubmitted;
  #onAttackAttempted;
  #onUndo;
  #onRedo;
  #onRestart;

  constructor() {
    this.#turnManager = new TurnManager();
    this.#shipFactory = new ShipFactory();

    this.#aiTurnController = new AiTurnController(
      this.#turnManager,
      new AiMoveCalculator(),
    );

    this.#onSetupSubmitted = (playerDetails) => {
      this.#setupPage.destroy();
      this.#setupPage = null;
      this.startGame(playerDetails);
    };

    this.#onAttackAttempted = (point) => this.handleAttack(point);
    this.#onUndo = () => this.undoLastCommand();
    this.#onRedo = () => this.redoCommand();
    this.#onRestart = () => this.restartGame();

    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("setup submitted", this.#onSetupSubmitted);
    EventBus.on("attack attempted", this.#onAttackAttempted);
    EventBus.on("undo", this.#onUndo);
    EventBus.on("redo", this.#onRedo);
    EventBus.on("restart", this.#onRestart);
  }

  launchGame() {
    this.#setupPage = new SetupPage(document.querySelector(".app-wrapper"));
  }

  startGame(playerDetails) {
    this.#resetCommandHistory();
    this.#phase = "playing";

    if (!this.#players.player1 || !this.#players.player2) {
      this.#initTestGame(playerDetails);
    }

    this.#openGamePage();

    const { player1, player2 } = this.#players;
    this.#turnManager.initialize(player1, player2);

    this.emitState();
  }

  restartGame() {
    this.#aiTurnController.destroy();
    this.#gamePage.destroy();

    this.#turnManager = new TurnManager();
    this.#aiTurnController = new AiTurnController(
      this.#turnManager,
      new AiMoveCalculator(),
    );

    this.#resetCommandHistory();
    this.#phase = "playing";

    const player1 = this.#createNewPlayerFrom(this.#players.player1);
    const player2 = this.#createNewPlayerFrom(this.#players.player2);
    this.#populateFleetRandom(player1);
    this.#populateFleetRandom(player2);

    this.setPlayers(player1, player2);
    this.#turnManager.initialize(player1, player2);
    this.#openGamePage();
    this.emitState();
  }

  #openGamePage() {
    this.#gamePage = new GamePage();
    this.#gamePage.open();
  }

  #resetCommandHistory() {
    this.#commandHistory = [];
    this.#commandRedoStack = [];
  }

  #createNewPlayerFrom(existingPlayer) {
    return new Player(existingPlayer.getName(), existingPlayer.isAI());
  }

  #populateFleetRandom(player) {
    const ships = this.#shipFactory.createFleet();
    ships.forEach((ship) => this.#placeShipAtRandom(ship, player.getBoard()));
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

    const result = this.executeCommand(move);
    if (result !== false) this.emitState();
  }

  undoLastCommand() {
    const command = this.#commandHistory.pop();
    if (!command) return;

    this.#commandRedoStack.push(command);
    command.undo();
    this.emitState();
  }

  redoCommand() {
    const command = this.#commandRedoStack.pop();
    if (!command) return;

    this.executeCommand(command, { fromRedo: true });
    this.emitState();
  }

  executeCommand(command, { fromRedo = false } = {}) {
    if (!fromRedo) this.#commandRedoStack.length = 0;

    const result = command.execute();
    if (result !== false) this.#commandHistory.push(command);

    return result;
  }

  emitState() {
    EventBus.emit(
      "state changed",
      new GameState({
        turn: this.#turnManager.getCurrentTurn(),
        turnNumber: this.#turnManager.getTurnNumber(),
        phase: this.#phase,
        canUndo: this.#commandHistory.length > 0,
        canRedo: this.#commandRedoStack.length > 0,
      }),
    );
  }

  #initTestGame(playerDetails) {
    const player1 = this.#initTestPlayer(
      playerDetails.player1.name,
      playerDetails.player1.isAI,
    );
    const player2 = this.#initTestPlayer(
      playerDetails.player2.name,
      playerDetails.player2.isAI,
    );

    this.setPlayers(player1, player2);
  }

  #initTestPlayer(name, isAi) {
    const player = new Player(name, isAi);
    this.#populateFleetRandom(player);
    return player;
  }

  #placeShipAtRandom(ship, board, maxAttempts = 100) {
    const size = board.getSize();

    for (let i = 0; i < maxAttempts; i++) {
      const point = {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size),
      };

      const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
      const result = board.placeShip(ship, point, direction);

      if (result.ok) return true;
    }

    throw new Error(`Failed to place ship ${ship.getName()}`);
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

  gameIsWon(board) {
    return board.getShips().every((ship) => ship.isSunk());
  }

  destroy() {
    EventBus.off("setup submitted", this.#onSetupSubmitted);
    EventBus.off("attack attempted", this.#onAttackAttempted);
    EventBus.off("undo", this.#onUndo);
    EventBus.off("redo", this.#onRedo);
    EventBus.off("restart", this.#onRestart);

    this.#aiTurnController.destroy();
    this.#gamePage.destroy();
    this.#setupPage.destroy();

    this.#aiTurnController = null;
    this.#gamePage = null;
    this.#setupPage = null;
    this.#turnManager = null;
    this.#players = {};
  }
}
