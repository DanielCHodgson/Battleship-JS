import EventBus from "../utilities/EventBus";
import TurnManager from "../turns/TurnManager";
import GameState from "../engine/GameState";
import AttackCommand from "../commands/AttackCommand";
import CompositeCommand from "../commands/CompositeCommand";
import ResolveTurnCommand from "../commands/ResolveTurnCommand";
import CommandHistory from "../commands/CommandHistory";
import AiMoveCalculator from "../controllers/AiMoveCalculator";
import AiTurnController from "../controllers/AiTurnController";
import PlayerFactory from "../factories/PlayerFactory";
import DeploymentManager from "../deployment/DeploymentManager";

export default class GameEngine {
  #players = {};
  #turnManager;
  #aiTurnController;
  #commandHistory;
  #playerFactory;

  #setupDetails = null;
  #deploymentManager;
  #phase = "setup";

  constructor() {
    this.#playerFactory = new PlayerFactory();
    this.#deploymentManager = new DeploymentManager();
    this.#turnManager = new TurnManager();
    this.#aiTurnController = new AiTurnController(
      this.#turnManager,
      new AiMoveCalculator(),
    );

    this.#commandHistory = new CommandHistory(this);
    this.setPhase("setup");
  }

  attemptAttack(point) {
    this.#handleAttack(point);
  }

  undo() {
    this.#commandHistory.undoLastCommand();
    this.emitState();
  }

  redo() {
    this.#commandHistory.redoCommand();
    this.emitState();
  }

  restart() {
    this.#restartGame();
  }


  destroy() {
    this.#aiTurnController.destroy();
    this.#turnManager = null;
    this.#players = {};
  }

  setPlayers(player1, player2) {
    this.#players = { player1, player2 };
  }

  startDeployment(playerDetails) {
    this.setPhase("deploying");
    this.emitState();
  }

  startGame(playerDetailsWithBoards) {
    this.#commandHistory.reset();
    this.setPhase("playing");

    if (!this.#players.player1 || !this.#players.player2) {
      this.#players = this.#playerFactory.createPlayers(
        playerDetailsWithBoards,
      );
    }

    this.#turnManager.initialize(this.#players);
    this.emitState();
  }

  #restartGame() {
    this.#aiTurnController.destroy();

    this.#turnManager = new TurnManager();
    this.#aiTurnController = new AiTurnController(
      this.#turnManager,
      new AiMoveCalculator(),
    );

    this.#commandHistory.reset();
    this.setPhase("playing");

    this.#turnManager.initialize(this.#players);
    this.emitState();
  }

  #handleAttack(point) {
    if (this.#phase !== "playing") return;
    if (!point) return;

    const turn = this.#turnManager.getCurrentTurn();
    if (!turn || turn.hasAttacked()) return;

    const move = new CompositeCommand([
      new AttackCommand(this.#turnManager, point),
      new ResolveTurnCommand(this.#turnManager, this),
    ]);

    const result = this.#commandHistory.executeCommand(move);
    if (result !== false) this.emitState();
  }

  emitState() {
    EventBus.emit(
      "state changed",
      new GameState({
        turn: this.#turnManager.getCurrentTurn(),
        turnNumber: this.#turnManager.getTurnNumber(),
        phase: this.#phase,
        canUndo: this.#commandHistory.canUndo(),
        canRedo: this.#commandHistory.canRedo(),
      }),
    );
  }

  gameIsWon(board) {
    return board.getShips().every((ship) => ship.isSunk());
  }

  getPhase() {
    return this.#phase;
  }

  setPhase(phase) {
    this.#phase = phase;
  }

  getPlayers() {
    return this.#players;
  }
}
