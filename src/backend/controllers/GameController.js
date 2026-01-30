import EventBus from "../utilities/EventBus";
import TurnManager from "../Turns/TurnManager";
import GameState from "../Turns/GameState";
import AttackCommand from "../commands/AttackCommand";
import CompositeCommand from "../commands/CompositeCommand";
import ResolveTurnCommand from "../commands/ResolveTurnCommand";
import AiMoveCalculator from "./AiMoveCalculator";
import AiTurnController from "./AiTurnController";
import SetupPage from "../../frontend/pages/setup-page/setup-page";
import GamePage from "../../frontend/pages/game-page/game-page";
import CommandHistory from "../commands/CommandHistory";
import PlayerFactory from "../factories/PlayerFactory";
import DeploymentSession from "./DeploymentSession";
import GameBoard from "../board/Gameboard";

export default class GameController {
  #setupPage;
  #gamePage;
  #deploymentPage;
  #deploymentSession1;
  #deploymentSession2;

  #players = {};
  #turnManager;
  #aiTurnController;
  #commandHistory;
  #playerFactory;

  #phase = "playing";

  #onSetupSubmitted;
  #onAttackAttempted;
  #onUndo;
  #onRedo;
  #onRestart;

  constructor() {
    this.#deploymentSession1 = new DeploymentSession();
    this.#deploymentSession2 = new DeploymentSession();
    this.#playerFactory = new PlayerFactory();
    this.#commandHistory = new CommandHistory(this);
    this.#turnManager = new TurnManager();
    this.#aiTurnController = new AiTurnController(
      this.#turnManager,
      new AiMoveCalculator(),
    );

    this.#onSetupSubmitted = (playerDetails) => {
      this.#setupPage.destroy();
      this.#setupPage = null;
      this.startDeployment(playerDetails);
    };

    this.#onAttackAttempted = (point) => this.handleAttack(point);
    this.#onUndo = () => this.#commandHistory.undoLastCommand();
    this.#onRedo = () => {
      this.#commandHistory.redoCommand();
    };
    this.#onRestart = () => this.restartGame();

    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("setup submitted", this.#onSetupSubmitted);
    EventBus.on("deployment completed", this.#onSetupSubmitted);
    EventBus.on("point selected", this.#onAttackAttempted);
    EventBus.on("undo", this.#onUndo);
    EventBus.on("redo", this.#onRedo);
    EventBus.on("restart", this.#onRestart);
  }

  launchGame() {
    this.#setupPage = new SetupPage(document.querySelector(".app-wrapper"));
  }

  startDeployment(playerDetails) {
    this.#phase = "deploying";

    this.#deploymentSession1.randomize();
    const result1 = this.#deploymentSession1.buildResult();

    this.#deploymentSession2.randomize();
    const result2 = this.#deploymentSession1.buildResult();

    const board1 = GameBoard.fromDeployment(result1.deployment);
    const board2 = GameBoard.fromDeployment(result2.deployment);

    playerDetails.player1.board = board1;
    playerDetails.player1.board = board2;

    this.startGame(playerDetails);
  }

  startGame(playerDetails) {
    this.#commandHistory.reset();
    this.#phase = "playing";

    if (!this.#players.player1 || !this.#players.player2) {
      this.#players =
        this.#playerFactory.createPlayersFromDetails(playerDetails);
    }

    this.#openGamePage();
    this.#turnManager.initialize(this.#players);
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

    this.#commandHistory.reset();
    this.#phase = "playing";

    this.#players = this.#playerFactory.recreatePlayersFromExisting(
      this.#players,
    );

    this.#turnManager.initialize(this.#players);
    this.#openGamePage();
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

  #openGamePage() {
    this.#gamePage = new GamePage();
    this.#gamePage.open();
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
    EventBus.off("point selected", this.#onAttackAttempted);
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
