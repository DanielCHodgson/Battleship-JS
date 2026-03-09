import EventBus from "../utilities/EventBus";
import GameEngine from "./GameEngine";
import SceneManager from "../controllers/SceneManager";

export default class GameController {
  #gameEngine;
  #sceneManager;

  #onSetupSubmitted;

  #onDeploymentShipSelected;
  #onDeploymentDirectionSelected;
  #onDeploymentRandomize;
  #onDeploymentUndo;

  #onDeploySubmit;
  #onDeploymentCompleted;

  #onPointSelected;

  #onMoveUndo;
  #onMoveRedo;
  #onGameRestart;

  constructor() {
    this.#gameEngine = new GameEngine();
    this.#sceneManager = new SceneManager(
      document.querySelector(".app-wrapper"),
      this.#gameEngine,
    );

    this.#bindEvents();
    this.#registerEvents();
    this.#sceneManager.launch();
  }

  #bindEvents() {
    this.#onSetupSubmitted = (playerDetails) =>
      this.#gameEngine.startDeployment(playerDetails);

    this.#onPointSelected = (point) => {
      const phase = this.#gameEngine.getPhase();

      if (phase === "deploying") {
        this.#gameEngine.attemptDeployment(point);
      } else if (phase === "playing") {
        this.#gameEngine.attemptAttack(point);
      }
    };

    this.#onDeploySubmit = () => this.#gameEngine.deploySubmit();

    this.#onDeploymentCompleted = (deployment) =>
      this.#gameEngine.startGame(deployment);

    this.#onDeploymentShipSelected = (name) =>
      this.#gameEngine.deploySelectShip(name);

    this.#onDeploymentDirectionSelected = (direction) =>
      this.#gameEngine.deploySetDirection(direction);

    this.#onDeploymentRandomize = () => this.#gameEngine.deployRandomize();
    this.#onDeploymentUndo = () => this.#gameEngine.deployUndo();

    this.#onMoveUndo = () => this.#gameEngine.undo();
    this.#onMoveRedo = () => this.#gameEngine.redo();
    this.#onGameRestart = () => this.#gameEngine.restart();
  }

  #registerEvents() {
    EventBus.on("setup submitted", this.#onSetupSubmitted);

    EventBus.on("deploy submit", this.#onDeploySubmit);
    EventBus.on("deployment completed", this.#onDeploymentCompleted);

    EventBus.on("point selected", this.#onPointSelected);

    EventBus.on("deploy ship selected", this.#onDeploymentShipSelected);
    EventBus.on(
      "deploy direction selected",
      this.#onDeploymentDirectionSelected,
    );
    EventBus.on("deploy randomize", this.#onDeploymentRandomize);
    EventBus.on("deploy undo", this.#onDeploymentUndo);

    EventBus.on("undo", this.#onMoveUndo);
    EventBus.on("redo", this.#onMoveRedo);
    EventBus.on("restart", this.#onGameRestart);
  }

  destroy() {
    EventBus.off("setup submitted", this.#onSetupSubmitted);

    EventBus.off("deploy submit", this.#onDeploySubmit);
    EventBus.off("deployment completed", this.#onDeploymentCompleted);

    EventBus.off("point selected", this.#onPointSelected);

    EventBus.off("deploy ship selected", this.#onDeploymentShipSelected);
    EventBus.off(
      "deploy direction selected",
      this.#onDeploymentDirectionSelected,
    );
    EventBus.off("deploy randomize", this.#onDeploymentRandomize);
    EventBus.off("deploy undo", this.#onDeploymentUndo);

    EventBus.off("undo", this.#onMoveUndo);
    EventBus.off("redo", this.#onMoveRedo);
    EventBus.off("restart", this.#onGameRestart);

    this.#sceneManager.destroy();
    this.#gameEngine.destroy();
  }
}
