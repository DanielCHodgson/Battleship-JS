import DomUtility from "../../utilities/DomUtility";
import htmlString from "./deployment-page.html";
import "./deployment-page.css";
import EventBus from "../../../backend/utilities/EventBus";
import BoardComponent from "../../components/board/board-component";

export default class DeploymentPage {
  #container;
  #engine;
  #element;
  #handlers = {};
  #boardComponent = null;
  #deploymentSession = null;

  #fields = {
    boardElement: null,
    continueBtn: null,
    randomizeBtn: null,
  };

  constructor(container, engine) {
    this.#container = container;
    this.#engine = engine;
    this.#element = DomUtility.stringToHTML(htmlString);

    this.#cacheFields();
    this.#initBoard();
    this.#bindEvents();
  }

  open() {
    this.render();
    this.#renderFromEngine();
  }

  #cacheFields() {
    this.#fields.boardElement = this.#element.querySelector(".board");

    this.#fields.continueBtn = this.#element.querySelector(".continue");
    this.#fields.randomizeBtn = this.#element.querySelector(".randomize");
  }

  #initBoard() {
    if (this.#fields.boardElement) {
      this.#boardComponent = new BoardComponent(this.#fields.boardElement);
    }
  }

  #bindEvents() {
    this.#handlers.onContinue = () => {
      const deployments = this.#engine.getPendingDeployments();

      EventBus.emit("deployment completed", {
        deployments,
      });
    };

    this.#handlers.onRandomize = () => {
      this.#handlers.onContinue();
    };

    this.#fields.continueBtn?.addEventListener(
      "click",
      this.#handlers.onContinue,
    );

    this.#fields.randomizeBtn?.addEventListener(
      "click",
      this.#handlers.onRandomize,
    );

    if (!this.#fields.continueBtn) {
      queueMicrotask(() => this.#handlers.onContinue());
    }
  }

  #renderFromEngine() {
    const pending = this.#engine.getPendingDeployments();
    console.log(pending);

    if (!pending) return;
  }

  render() {
    this.#container.appendChild(this.#element);
  }

  destroy() {
    this.#fields.continueBtn?.removeEventListener(
      "click",
      this.#handlers.onContinue,
    );
    this.#fields.randomizeBtn?.removeEventListener(
      "click",
      this.#handlers.onRandomize,
    );

    this.#boardComponent?.destroy?.();

    this.#element?.remove();

    this.#handlers = {};
    this.#boardComponent = null;
    this.#element = null;
    this.#container = null;
    this.#engine = null;
  }

  getDeploymentSession() {
    return this.#deploymentSession;
  }
  setDeploymentSession(deploymentSession) {
    this.#deploymentSession = deploymentSession;
  }
}
