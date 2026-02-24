import EventBus from "../utilities/EventBus";
import GameEngine from "./GameEngine";
import SceneManager from "../controllers/SceneManager";

export default class GameController {
  #gameEngine;
  #sceneManager;

  #onSetupSubmitted;
  #onDeploymentCompleted;
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
      this.#gameEngine.startDeployment(playerDetails);
    this.#onDeploymentCompleted = (deployment) =>
      this.#gameEngine.startGame(deployment);
    this.#onAttackAttempted = (point) => this.#gameEngine.attemptAttack(point);
    this.#onUndo = () => this.#gameEngine.undo();
    this.#onRedo = () => this.#gameEngine.redo();
    this.#onRestart = () => this.#gameEngine.restart();

    this.#registerEvents();
    this.#sceneManager.launch();
  }

  #registerEvents() {
    EventBus.on("setup submitted", this.#onSetupSubmitted);
    EventBus.on("deployment completed", this.#onDeploymentCompleted);
    EventBus.on("point selected", this.#onAttackAttempted);
    EventBus.on("undo", this.#onUndo);
    EventBus.on("redo", this.#onRedo);
    EventBus.on("restart", this.#onRestart);
  }

  destroy() {
    EventBus.off("setup submitted", this.#onSetupSubmitted);
    EventBus.off("deployment completed", this.#onDeploymentCompleted);
    EventBus.off("point selected", this.#onAttackAttempted);
    EventBus.off("undo", this.#onUndo);
    EventBus.off("redo", this.#onRedo);
    EventBus.off("restart", this.#onRestart);

    this.#sceneManager.destroy();
    this.#gameEngine.destroy();
  }
}
