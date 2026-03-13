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

  #phase = "setup";
  #deployingFor = null;

  #deploymentOrder = [];
  #deploymentIndex = 0;

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

  undo() {
    if (this.#phase === "deploying" && this.#deployingFor) {
      this.#deploymentManager.undo(this.#deployingFor);
      this.emitState();
      return;
    }

    if (this.#phase === "playing") {
      this.#commandHistory.undoLastCommand();
      this.emitState();
    }
  }

  redo() {
    if (this.#phase !== "playing") return;
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

    this.#prepareDeploymentFlow(playerDetails);

    if (this.#deploymentOrder.length === 0) {
      this.#finishDeployment();
      return;
    }

    this.#deploymentIndex = 0;
    this.#deployingFor = this.#deploymentOrder[this.#deploymentIndex];
    this.setPhase("deploying");
    this.emitState();
  }

  deploySubmit() {
    if (this.#phase !== "deploying") return;
    if (!this.#deployingFor) return;

    const result = this.#deploymentManager.validatePlayer(this.#deployingFor);
    if (!result.ok) {
      console.log("deployment not complete", result.reason);
      this.emitState();
      return;
    }

    if (this.#hasNextDeploymentPlayer()) {
      this.#advanceDeploymentPlayer();
      this.emitState();
      return;
    }

    this.#finishDeployment();
  }

  #prepareDeploymentFlow(playerDetails) {
    this.#deploymentOrder = [];
    this.#deploymentIndex = 0;
    this.#deployingFor = null;

    Object.entries(playerDetails).forEach(([key, player]) => {
      if (player.isAI) {
        this.#deploymentManager.randomize(key);
      } else {
        this.#deploymentOrder.push(key);
      }
    });
  }

  #hasNextDeploymentPlayer() {
    return this.#deploymentIndex < this.#deploymentOrder.length - 1;
  }

  #advanceDeploymentPlayer() {
    this.#deploymentIndex += 1;
    this.#deployingFor = this.#deploymentOrder[this.#deploymentIndex];
  }

  #finishDeployment() {
    const build = this.#deploymentManager.buildDeployments();
    if (!build.ok) {
      console.log("failed to build deployments", build);
      return;
    }

    const player1 = this.#playerFactory.createPlayerFromDeployment({
      name: this.#setupDetails.player1.name,
      isAI: this.#setupDetails.player1.isAI,
      deployment: build.deployments.player1,
    });

    const player2 = this.#playerFactory.createPlayerFromDeployment({
      name: this.#setupDetails.player2.name,
      isAI: this.#setupDetails.player2.isAI,
      deployment: build.deployments.player2,
    });

    EventBus.emit("deployment completed", { player1, player2 });
  }

  startGame(players) {
    this.#commandHistory.reset();
    this.setPhase("playing");
    this.#players = players;
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

  handleAttack(point) {
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

  getDeploymentManager() {
    return this.#deploymentManager;
  }

  getDeployingFor() {
    return this.#deployingFor;
  }
}
