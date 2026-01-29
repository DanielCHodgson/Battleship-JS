import EventBus from "../utilities/EventBus";
import TurnManager from "../Turns/TurnManager";
import GameState from "../Turns/GameState";
import AttackCommand from "../commands/AttackCommand";
import CompositeCommand from "../commands/CompositeCommand";
import ResolveTurnCommand from "../commands/ResolveTurnCommand";
import AiMoveCalculator from "./AiMoveCalculator";
import AiTurnController from "./AiTurnController";
import ShipFactory from "../factories/ShipFactory";
import SetupPage from "../../frontend/pages/setup-page/setup-page";
import GamePage from "../../frontend/pages/game-page/game-page";
import CommandHistory from "../commands/CommandHistory";
import GameSessionFactory from "../factories/GameSessionFactory";

export default class GameController {
  #setupPage;
  #gamePage;

  #players = {};
  #turnManager;
  #aiTurnController;
  #commandHistory;
  #gameSessionFactory;

  #phase = "playing";
  #shipFactory;

  #onSetupSubmitted;
  #onAttackAttempted;
  #onUndo;
  #onRedo;
  #onRestart;

  constructor() {
    this.#commandHistory = new CommandHistory(this);
    this.#turnManager = new TurnManager();
    this.#shipFactory = new ShipFactory();
    this.#gameSessionFactory = new GameSessionFactory(this.#shipFactory);

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
    this.#onUndo = () => this.#commandHistory.undoLastCommand();
    this.#onRedo = () => {
      this.#commandHistory.redoCommand();
    };
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
    this.#commandHistory.reset();
    this.#phase = "playing";

    if (!this.#players.player1 || !this.#players.player2) {
      this.#players =
        this.#gameSessionFactory.createPlayersFromDetails(playerDetails);
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

    this.#players = this.#gameSessionFactory.recreatePlayersFromExisting(
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
