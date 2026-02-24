import EventBus from "../utilities/EventBus";
import TurnManager from "../turns/TurnManager";
import AttackCommand from "../commands/AttackCommand";
import CompositeCommand from "../commands/CompositeCommand";
import ResolveTurnCommand from "../commands/ResolveTurnCommand";
import CommandHistory from "../commands/CommandHistory";
import AiMoveCalculator from "../controllers/AiMoveCalculator";
import AiTurnController from "../controllers/AiTurnController";
import PlayerFactory from "../factories/PlayerFactory";
import DeploymentManager from "../deployment/DeploymentManager";
import GameStateAdapter from "./GameStateAdapter";

export default class GameEngine {
  #players = {};
  #turnManager;
  #aiTurnController;
  #commandHistory;
  #playerFactory;

  #setupDetails = null;
  #deploymentManager;
  #deployingFor = "player1";
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

  deploySelectShip(payload) {
    if (this.#phase !== "deploying") return;

    const name = typeof payload === "string" ? payload : payload?.name;
    if (!name) return;

    this.#deploymentManager.selectShip(this.#deployingFor, name);
    this.emitState();
  }

  deploySetDirection(payload) {
    if (this.#phase !== "deploying") return;

    const direction =
      typeof payload === "string" ? payload : payload?.direction;
    if (!direction) return;

    this.#deploymentManager.setDirection(this.#deployingFor, direction);
    this.emitState();
  }

  deployRandomize() {
    if (this.#phase !== "deploying") return;

    this.#deploymentManager.randomize("player1");
    this.emitState();
  }

  attemptDeployment(point) {
    if (this.#phase !== "deploying") return;
    if (!point) return;

    const result = this.#deploymentManager.place(this.#deployingFor, point);

    if (!result.ok) {
      console.log(result);
      this.emitState();
      return;
    }

    this.emitState();
  }

  deploySubmit() {
    if (this.#phase !== "deploying") return;

    const ok = this.#checkDeploymentComplete();
    if (!ok) {
      console.log("deployment not complete");
    }

    this.emitState();
  }

  #checkDeploymentComplete() {
    if (!this.#deploymentManager.isComplete()) return false;

    const build = this.#deploymentManager.buildDeployments();
    if (!build.ok) return false;

    EventBus.emit("deployment completed", build.deployments);
    return true;
  }

  attemptAttack(point) {
    this.#handleAttack(point);
  }

  undo() {
    if (this.#phase === "deploying") {
      this.#deploymentManager.undo(this.#deployingFor);
      this.emitState();
      return;
    }

    this.#commandHistory.undoLastCommand();
    this.emitState();
  }

  redo() {
    this.#commandHistory.redoCommand();
    this.emitState();
  }

  restart() {
    if (this.#phase === "deploying") {
      this.startDeployment(this.#setupDetails);
      return;
    }

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
    this.#setupDetails = playerDetails;

    this.#deploymentManager.reset();
    this.#deploymentManager.randomize("player2");
    this.#deployingFor = "player1";

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
    const state = GameStateAdapter.toState({
      phase: this.#phase,
      turnManager: this.#turnManager,
      commandHistory: this.#commandHistory,
      deploymentManager: this.#deploymentManager,
      deployingFor: this.#deployingFor,
    });

    EventBus.emit("state changed", state);
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
