import EventBus from "../utilities/EventBus";
import SetupPage from "../../frontend/pages/setup-page/setup-page";
import DeploymentPage from "../../frontend/pages/deployment-page/deployment-page";
import GamePage from "../../frontend/pages/game-page/game-page";

export default class SceneManager {
  #container;
  #engine;

  #setupPage = null;
  #deploymentPage = null;
  #gamePage = null;
  #currentScene = null;
  #onStateChanged;

  constructor(container, engine) {
    this.#container = container;
    this.#engine = engine;

    this.#onStateChanged = (gameState) => this.#renderState(gameState);
    EventBus.on("state changed", this.#onStateChanged);
  }

  launch() {
    this.#openScene(this.#engine.getPhase());
  }

  #renderState(gameState) {
    const phase = gameState.getPhase();
    const scene = this.#getSceneName(phase);

    if (scene !== this.#currentScene) this.#openScene(phase);

    if (scene === "deployment") this.#deploymentPage?.renderState(gameState);
    if (scene === "game") this.#gamePage?.renderState(gameState);
  }

  #getSceneName(phase) {
    if (phase === "deploying") return "deployment";
    if (phase === "playing" || phase === "gameover") return "game";
    return "setup";
  }

  #openScene(phase) {
    const scene = this.#getSceneName(phase);
    this.#destroyCurrentPage();
    this.#currentScene = scene;

    if (scene === "setup") {

      if (!this.#setupPage) {
        this.#setupPage = new SetupPage(this.#container, this.#engine);
      }
      this.#setupPage.open();
      return;
    }

    if (scene === "deployment") {
      if (!this.#deploymentPage) {
        this.#deploymentPage = new DeploymentPage(
          this.#container,
          this.#engine,
        );
        this.#deploymentPage.open();
      }
      return;
    }

    if (scene === "game") {
      if (!this.#gamePage) {
        this.#gamePage = new GamePage(this.#container);
        this.#gamePage.open();
      }
    }
  }

  #destroyCurrentPage() {
    this.#setupPage?.destroy();
    this.#deploymentPage?.destroy();
    this.#gamePage?.destroy();
    this.#setupPage = null;
    this.#gamePage = null;
    this.#deploymentPage = null;
  }

  destroy() {
    EventBus.off("state changed", this.#onStateChanged);
    this.#destroyCurrentPage();
    this.#currentScene = null;
    this.#onStateChanged = null;
  }

  getSetupPage() {
    return this.#setupPage;
  }

  getDeploymentPage() {
    return this.#deploymentPage;
  }

  getGamePage() {
    return this.#gamePage;
  }
}
