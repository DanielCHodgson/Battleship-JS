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
import DeploymentSession from "../controllers/DeploymentSession";
import Gameboard from "../board/Gameboard";

export default class GameEngine {
  #players = {};
  #turnManager;
  #aiTurnController;
  #commandHistory;
  #playerFactory;

  #phase = "setup";

  #pendingSetupDetails = null;
  #pendingDeployments = null;

  #deploymentSession1;
  #deploymentSession2;

  constructor() {
    this.#deploymentSession1 = new DeploymentSession();
    this.#deploymentSession2 = new DeploymentSession();

    this.#playerFactory = new PlayerFactory();
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

  destroy() {
    this.#aiTurnController.destroy();
    this.#turnManager = null;
    this.#players = {};
  }

  setPlayers(player1, player2) {
    this.#players = { player1, player2 };
  }

  submitSetup(playerDetails) {
    this.#startDeployment(playerDetails);
  }

  completeDeployment(deployment) {
    const deployments = deployment.deployments ?? this.#pendingDeployments;
    const setup = deployment.playerDetails ?? this.#pendingSetupDetails;

    if (!deployments || !setup) return;

    const board1 = Gameboard.fromDeployment(deployments.player1);
    const board2 = Gameboard.fromDeployment(deployments.player2);

    this.#pendingDeployments = null;
    this.#pendingSetupDetails = null;

    this.#startGame({
      player1: {
        name: setup.player1.name,
        isAI: setup.player1.isAI,
        board: board1,
      },
      player2: {
        name: setup.player2.name,
        isAI: setup.player2.isAI,
        board: board2,
      },
    });
  }

  #startDeployment(playerDetails) {
    this.setPhase("deploying");
    this.#pendingSetupDetails = playerDetails;

    this.#deploymentSession1.reset();
    this.#deploymentSession2.reset();

    //this.#deploymentSession1.randomize();
    //const result1 = this.#deploymentSession1.buildResult();

    //this.#deploymentSession2.randomize();
    //const result2 = this.#deploymentSession2.buildResult();

    //if (!result1.ok || !result2.ok) return;

    ////this.#pendingDeployments = {
    // player1: result1.deployment,
    // player2: result2.deployment,
    //};

    console.log(this.#phase);
    this.emitState();
  }

  #startGame(playerDetailsWithBoards) {
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

    this.#deploymentSession1.reset();
    this.#deploymentSession2.reset();

    this.#deploymentSession1.randomize();
    const dep1 = this.#deploymentSession1.buildResult();
    this.#deploymentSession2.randomize();
    const dep2 = this.#deploymentSession2.buildResult();

    const board1 = Gameboard.fromDeployment(dep1.deployment);
    const board2 = Gameboard.fromDeployment(dep2.deployment);

    this.#players = this.#playerFactory.recreatePlayersFromExisting(
      this.#players,
      {
        player1Board: board1,
        player2Board: board2,
      },
    );

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

  getPendingDeployments() {
    return this.#pendingDeployments;
  }
}
