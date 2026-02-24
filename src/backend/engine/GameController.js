import EventBus from "../utilities/EventBus";
import GameEngine from "./GameEngine";
import SceneManager from "../controllers/SceneManager";

export default class GameController {
  #gameEngine;
  #sceneManager;

  #onSetupSubmitted;
  #onDeploySubmit;
  #onDeploymentCompleted;
  #onPointSelected;
  #onUndo;
  #onRedo;
  #onRestart;

  #onDeployShipSelected;
  #onDeployDirectionSelected;
  #onDeployRandomize;

  constructor() {
    this.#gameEngine = new GameEngine();
    this.#sceneManager = new SceneManager(
      document.querySelector(".app-wrapper"),
      this.#gameEngine,
    );

    this.#onSetupSubmitted = (playerDetails) =>
      this.#gameEngine.startDeployment(playerDetails);

    this.#onDeploySubmit = () => this.#gameEngine.deploySubmit();

    this.#onDeploymentCompleted = (deployment) =>
      this.#gameEngine.startGame(deployment);

    this.#onPointSelected = (point) => {
      const phase = this.#gameEngine.getPhase();

      if (phase === "deploying") {
        this.#gameEngine.attemptDeployment(point);
      } else if (phase === "playing") {
        this.#gameEngine.attemptAttack(point);
      }
    };

    this.#onUndo = () => this.#gameEngine.undo();
    this.#onRedo = () => this.#gameEngine.redo();
    this.#onRestart = () => this.#gameEngine.restart();

    // allow both:
    // EventBus.emit("deploy ship selected", "carrier")
    // EventBus.emit("deploy ship selected", { name: "carrier" })
    this.#onDeployShipSelected = (payload) => {
      const name = typeof payload === "string" ? payload : payload?.name;
      if (!name) return;
      this.#gameEngine.deploySelectShip(name);
    };

    // allow both:
    // EventBus.emit("deploy direction selected", "vertical")
    // EventBus.emit("deploy direction selected", { direction: "vertical" })
    this.#onDeployDirectionSelected = (payload) => {
      const direction =
        typeof payload === "string" ? payload : payload?.direction;
      if (!direction) return;
      this.#gameEngine.deploySetDirection(direction);
    };

    this.#onDeployRandomize = () => this.#gameEngine.deployRandomize();

    this.#registerEvents();
    this.#sceneManager.launch();
  }

  #registerEvents() {
    EventBus.on("setup submitted", this.#onSetupSubmitted);

    EventBus.on("deploy submit", this.#onDeploySubmit);
    EventBus.on("deployment completed", this.#onDeploymentCompleted);

    EventBus.on("point selected", this.#onPointSelected);

    EventBus.on("deploy ship selected", this.#onDeployShipSelected);
    EventBus.on("deploy direction selected", this.#onDeployDirectionSelected);
    EventBus.on("deploy randomize", this.#onDeployRandomize);

    EventBus.on("undo", this.#onUndo);
    EventBus.on("redo", this.#onRedo);
    EventBus.on("restart", this.#onRestart);
  }

  destroy() {
    EventBus.off("setup submitted", this.#onSetupSubmitted);

    EventBus.off("deploy submit", this.#onDeploySubmit);
    EventBus.off("deployment completed", this.#onDeploymentCompleted);

    EventBus.off("point selected", this.#onPointSelected);

    EventBus.off("deploy ship selected", this.#onDeployShipSelected);
    EventBus.off("deploy direction selected", this.#onDeployDirectionSelected);
    EventBus.off("deploy randomize", this.#onDeployRandomize);

    EventBus.off("undo", this.#onUndo);
    EventBus.off("redo", this.#onRedo);
    EventBus.off("restart", this.#onRestart);

    this.#sceneManager.destroy();
    this.#gameEngine.destroy();
  }
}
