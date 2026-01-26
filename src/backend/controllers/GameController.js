import Player from "../entities/Player";
import Ship from "../entities/Ship";
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
  #commandHistory = [];
  #phase = "playing";
  #shipFactory;

  constructor() {
    this.#turnManager = new TurnManager();
    this.#shipFactory = new ShipFactory();
    new AiTurnController(this.#turnManager, new AiMoveCalculator());
    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("setup submitted", (playerDetails) => {
      this.#setupPage.destroy();
      this.startGame(playerDetails);
    });
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

  launchGame() {
    this.#setupPage = new SetupPage(document.querySelector(".app-wrapper"));
  }

  startGame(playerDetails) {
    if (!this.#players.player1 || !this.#players.player2) {
      this.#initTestGame(playerDetails);
    }

    this.#gamePage = new GamePage();
    this.#gamePage.open();

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
    this.emitState();
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
    const ships = this.#shipFactory.createFleet();

    const player = new Player(name, isAi);

    ships.forEach((ship) => {
      this.#placeShipAtRandom(ship, player.getBoard());
    });

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
}
