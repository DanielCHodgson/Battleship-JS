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
  #deployments = null;
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

    this.#commandHistory = new CommandHistory();
    this.setPhase("setup");
  }

  undo() {
    if (this.#phase === "deploying" && this.#deployingFor) {
      const result = this.#deploymentManager.undo(this.#deployingFor);
      if (result.ok) this.emitState();
      return result;
    }

    if (this.#phase === "playing" || this.#phase === "gameover") {
      const didUndo = this.#commandHistory.undoLastCommand();
      if (didUndo) {
        this.emitState();
        return { ok: true };
      }
      return { ok: false, reason: "nothing-to-undo" };
    }

    return { ok: false, reason: "undo-not-available" };
  }

  redo() {
    if (this.#phase !== "playing") {
      return { ok: false, reason: "redo-not-available" };
    }

    const result = this.#commandHistory.redoCommand();
    if (result !== false) {
      this.emitState();
      return { ok: true };
    }
    return { ok: false, reason: "nothing-to-redo" };
  }

  restart() {
    if (this.#phase === "deploying") {
      this.startDeployment(this.#setupDetails);
      return { ok: true };
    }

    return this.#restartGame();
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
    if (!playerDetails?.player1 || !playerDetails?.player2) {
      return { ok: false, reason: "invalid-player-details" };
    }

    this.#setupDetails = playerDetails;
    this.#deployments = null;
    this.#deploymentManager.reset();

    this.#prepareDeploymentFlow(playerDetails);

    if (this.#deploymentOrder.length === 0) {
      return this.#completeDeployment();
    }

    this.#deploymentIndex = 0;
    this.#deployingFor = this.#deploymentOrder[this.#deploymentIndex];
    this.setPhase("deploying");
    this.emitState();
    return { ok: true };
  }

  selectDeploymentShip(name) {
    if (this.#phase !== "deploying" || !this.#deployingFor) {
      return { ok: false, reason: "not-deploying" };
    }
    const result = this.#deploymentManager.selectShip(this.#deployingFor, name);
    if (result.ok) this.emitState();
    return result;
  }

  setDeploymentDirection(direction) {
    if (this.#phase !== "deploying" || !this.#deployingFor) {
      return { ok: false, reason: "not-deploying" };
    }
    const result = this.#deploymentManager.setDirection(
      this.#deployingFor,
      direction,
    );
    if (result.ok) this.emitState();
    return result;
  }

  placeDeploymentShip(point) {
    if (this.#phase !== "deploying" || !this.#deployingFor) {
      return { ok: false, reason: "not-deploying" };
    }
    const result = this.#deploymentManager.place(this.#deployingFor, point);
    if (result.ok) this.emitState();
    return result;
  }

  randomizeDeployment() {
    if (this.#phase !== "deploying" || !this.#deployingFor) {
      return { ok: false, reason: "not-deploying" };
    }
    const result = this.#deploymentManager.randomize(this.#deployingFor);
    if (result.ok) this.emitState();
    return result;
  }

  undoDeployment() {
    if (this.#phase !== "deploying" || !this.#deployingFor) {
      return { ok: false, reason: "not-deploying" };
    }
    const result = this.#deploymentManager.undo(this.#deployingFor);
    if (result.ok) this.emitState();
    return result;
  }

  deploySubmit() {
    if (this.#phase !== "deploying" || !this.#deployingFor) {
      return { ok: false, reason: "not-deploying" };
    }

    const result = this.#deploymentManager.validatePlayer(this.#deployingFor);
    if (!result.ok) {
      return result;
    }

    if (this.#hasNextDeploymentPlayer()) {
      this.#advanceDeploymentPlayer();
      this.emitState();
      return { ok: true };
    }

    return this.#completeDeployment();
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

  #completeDeployment() {
    const build = this.#deploymentManager.buildDeployments();
    if (!build.ok) {
      return build;
    }

    this.#deployments = build.deployments;

    this.startGame(this.#createPlayersFromDeployments());
    return { ok: true };
  }

  #createPlayersFromDeployments() {
    const player1 = this.#playerFactory.createPlayerFromDeployment({
      name: this.#setupDetails.player1.name,
      isAI: this.#setupDetails.player1.isAI,
      deployment: this.#deployments.player1,
    });

    const player2 = this.#playerFactory.createPlayerFromDeployment({
      name: this.#setupDetails.player2.name,
      isAI: this.#setupDetails.player2.isAI,
      deployment: this.#deployments.player2,
    });

    return { player1, player2 };
  }

  startGame(players) {
    this.#commandHistory.reset();
    this.setPhase("playing");
    this.#players = players;
    this.#turnManager.initialize(this.#players);
    this.emitState();
  }

  #restartGame() {
    if (!this.#deployments) {
      return { ok: false, reason: "no-deployment-to-restart" };
    }

    this.#aiTurnController.destroy();

    this.#turnManager = new TurnManager();
    this.#aiTurnController = new AiTurnController(
      this.#turnManager,
      new AiMoveCalculator(),
    );

    this.#commandHistory.reset();
    this.setPhase("playing");
    this.#players = this.#createPlayersFromDeployments();
    this.#turnManager.initialize(this.#players);
    this.emitState();
    return { ok: true };
  }

  handleAttack(point) {
    if (this.#phase !== "playing" || !point) return false;

    const turn = this.#turnManager.getCurrentTurn();
    if (!turn || turn.hasAttacked()) return false;

    const move = new CompositeCommand([
      new AttackCommand(this.#turnManager, point),
      new ResolveTurnCommand(this.#turnManager, this),
    ]);

    const result = this.#commandHistory.executeCommand(move);
    if (result !== false) this.emitState();
    return result;
  }

  emitState() {
    EventBus.emit("state changed", this.getState());
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

  getDeployingFor() {
    return this.#deployingFor;
  }

  getState() {
    return GameStateAdapter.toState({
      phase: this.#phase,
      turnManager: this.#turnManager,
      commandHistory: this.#commandHistory,
      deploymentManager: this.#deploymentManager,
      deployingFor: this.#deployingFor,
    });
  }
}
