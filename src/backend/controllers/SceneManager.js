import EventBus from "../utilities/EventBus";
import SetupPage from "../../frontend/pages/setup-page/setup-page";
import GamePage from "../../frontend/pages/game-page/game-page";

export default class SceneManager {
  #container;
  #engine;

  #setupPage = null;
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
      this.#gamePage?.destroy();
      this.#gamePage = null;

      if (!this.#setupPage) {
        this.#setupPage = new SetupPage(this.#container);
      }
      return;
    }

    if (phase === "deploying") {
    
      return;
    }

    if (phase === "playing" || phase === "gameover") {
      this.#setupPage?.destroy();
      this.#setupPage = null;

      if (!this.#gamePage) {
        this.#gamePage = new GamePage();
        this.#gamePage.open();
      }
    }
  }

  destroy() {
    this.#setupPage?.destroy();
    this.#gamePage?.destroy();
    this.#setupPage = null;
    this.#gamePage = null;
  }
}
