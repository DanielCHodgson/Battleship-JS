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

  constructor(container, engine) {
    this.#container = container;
    this.#engine = engine;

    EventBus.on("state changed", (gameState) => {
      this.#renderForPhase(gameState.getPhase());
    });
  }

  launch() {
    this.#renderForPhase(this.#engine.getPhase());
  }

  #renderForPhase(phase) {
    if (phase === "setup") {
      this.destroy();

      if (!this.#setupPage) {
        this.#setupPage = new SetupPage(this.#container);
      }

      this.#setupPage.open();

      return;
    }

    if (phase === "deploying") {
      this.destroy();

      if (!this.#deploymentPage) {
        this.#deploymentPage = new DeploymentPage(
          this.#container,
          this.#engine,
        );
        this.#deploymentPage.open();
      }
      return;
    }

    if (phase === "playing" || phase === "gameover") {
      this.destroy();

      if (!this.#gamePage) {
        this.#gamePage = new GamePage();
        this.#gamePage.open();
      }
    }
  }

  destroy() {
    this.#setupPage?.destroy();
    this.#deploymentPage?.destroy();
    this.#gamePage?.destroy();
    this.#setupPage = null;
    this.#gamePage = null;
    this.#deploymentPage = null;
  }
}
