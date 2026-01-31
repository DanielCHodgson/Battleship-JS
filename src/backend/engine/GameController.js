import EventBus from "../utilities/EventBus";
import GameEngine from "./GameEngine";
import SceneManager from "../controllers/SceneManager";

export default class GameController {
  #gameEngine;
  #sceneManager;

  #onSetupSubmitted;
  #onAttackAttempted;
  #onUndo;
  #onRedo;
  #onRestart;

  constructor() {
    this.#gameEngine = new GameEngine();
    this.#sceneManager = new SceneManager(
      document.querySelector(".app-wrapper"),
      this.#gameEngine,
    );

    this.#onSetupSubmitted = (playerDetails) =>
      this.#gameEngine.submitSetup(playerDetails);
    this.#onAttackAttempted = (point) => this.#gameEngine.attemptAttack(point);
    this.#onUndo = () => this.#gameEngine.undo();
    this.#onRedo = () => this.#gameEngine.redo();
    this.#onRestart = () => this.#gameEngine.restart();

    this.#registerEvents();
  }

  #registerEvents() {
    EventBus.on("setup submitted", this.#onSetupSubmitted);
    // EventBus.on("deployment completed", this.#onDeploymentCompleted);
    EventBus.on("point selected", this.#onAttackAttempted);
    EventBus.on("undo", this.#onUndo);
    EventBus.on("redo", this.#onRedo);
    EventBus.on("restart", this.#onRestart);
  }

  launchGame() {
    this.#sceneManager.launch();
    this.#gameEngine.emitState();
  }

  destroy() {
    EventBus.off("setup submitted", this.#onSetupSubmitted);
    EventBus.off("point selected", this.#onAttackAttempted);
    EventBus.off("undo", this.#onUndo);
    EventBus.off("redo", this.#onRedo);
    EventBus.off("restart", this.#onRestart);

    this.#sceneManager.destroy();
    this.#gameEngine.destroy();

    this.#sceneManager = null;
    this.#gameEngine = null;
  }
}
