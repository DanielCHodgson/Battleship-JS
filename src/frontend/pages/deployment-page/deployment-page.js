import DomUtility from "../../utilities/DomUtility";
import htmlString from "./deployment-page.html";
import "./deployment-page.css";

import EventBus from "../../../backend/utilities/EventBus";
import BoardComponent from "../../components/board/board-component";

export default class DeploymentPage {
  #container;
  #element;

  #boardContainer = null;
  #boardComponent = null;

  #shipItems = [];
  #directionButtons = [];

  #undoButton = null;
  #randomizeButton = null;
  #submitButton = null;

  #onShipClicked = null;
  #onDirectionClicked = null;
  #onRandomizeClicked = null;
  #onUndoClicked = null;
  #onSubmitClicked = null;

  #onStateChanged = null;
  #onShowPreview = null;
  #onClearPreview = null;

  constructor(container) {
    this.#container = container;
    this.#element = DomUtility.stringToHTML(htmlString);
  }

  open() {
    this.renderElement();
    this.#cacheFields();
    this.#boardComponent = new BoardComponent(this.#boardContainer);
    this.#registerEvents();
  }

  #cacheFields() {
    this.#boardContainer = this.#element.querySelector(".board");

    this.#shipItems = [...this.#element.querySelectorAll(".ship-select li")];

    this.#directionButtons = [
      ...this.#element.querySelectorAll("[data-direction]"),
    ];
    this.#randomizeButton = this.#element.querySelector("[data-randomize]");
    this.#submitButton = this.#element.querySelector("[data-submit]");
    this.#undoButton = this.#element.querySelector("[data-undo]");
  }

  #registerEvents() {
    this.#onShipClicked = (event) => {
      this.#handleShipClicked(event.currentTarget);
    };

    this.#shipItems.forEach((li) =>
      li.addEventListener("click", this.#onShipClicked),
    );

    this.#onDirectionClicked = (event) => {
      this.#handleDirectionClicked(event.currentTarget);
    };

    this.#directionButtons.forEach((btn) =>
      btn.addEventListener("click", this.#onDirectionClicked),
    );

    this.#onRandomizeClicked = () => {
      EventBus.emit("deploy randomize");
    };

    this.#randomizeButton.addEventListener("click", this.#onRandomizeClicked);

    this.#onSubmitClicked = () => {
      EventBus.emit("deploy submit");
    };
    this.#submitButton.addEventListener("click", this.#onSubmitClicked);

    this.#onStateChanged = (state) => {
      this.#handleStateChanged(state);
    };

    EventBus.on("state changed", this.#onStateChanged);

    this.#onShowPreview = (point) =>
      this.#boardComponent?.setPreview(point, true);
    this.#onClearPreview = (point) =>
      this.#boardComponent?.setPreview(point, false);

    EventBus.on("show ai preview", this.#onShowPreview);
    EventBus.on("clear ai preview", this.#onClearPreview);
  }

  renderElement() {
    this.#container.innerHTML = "";
    this.#container.appendChild(this.#element);
  }

  #handleStateChanged(state) {
    this.#boardComponent.renderState(state);

    const deployment = state.getDeployment?.() ?? null;
    const remaining = deployment?.shipsToPlace?.length ?? 0;

    if (this.#submitButton) {
      this.#submitButton.disabled = remaining !== 0;
    }

    const canUndo = state.canUndo() ?? false;
    if (this.#undoButton) {
      this.#undoButton.disabled = !canUndo;
    }
  }

  #handleShipClicked(li) {
    const name = li.textContent.trim();
    if (!name) return;

    EventBus.emit("deploy ship selected", { name });

    this.#shipItems.forEach((element) => element.classList.remove("selected"));
    li.classList.add("selected");
  }

  #handleDirectionClicked(button) {
    const direction = button.dataset.direction;
    if (!direction) return;

    EventBus.emit("deploy direction selected", { direction });

    this.#directionButtons.forEach((element) =>
      element.classList.remove("selected"),
    );
    button.classList.add("selected");
  }

  destroy() {
    if (this.#onStateChanged)
      EventBus.off("state changed", this.#onStateChanged);

    if (this.#onShowPreview)
      EventBus.off("show ai preview", this.#onShowPreview);
    if (this.#onClearPreview)
      EventBus.off("clear ai preview", this.#onClearPreview);

    if (this.#onShipClicked) {
      this.#shipItems.forEach((li) =>
        li.removeEventListener("click", this.#onShipClicked),
      );
    }

    if (this.#onDirectionClicked) {
      this.#directionButtons.forEach((btn) =>
        btn.removeEventListener("click", this.#onDirectionClicked),
      );
    }

    if (this.#onRandomizeClicked) {
      this.#randomizeButton?.removeEventListener(
        "click",
        this.#onRandomizeClicked,
      );
    }

    if (this.#onUndoClicked) {
      this.#undoButton?.removeEventListener("click", this.#onUndoClicked);
    }

    if (this.#onSubmitClicked) {
      this.#submitButton?.removeEventListener("click", this.#onSubmitClicked);
    }

    this.#boardComponent?.destroy();

    if (this.#element?.parentNode)
      this.#element.parentNode.removeChild(this.#element);

    this.#shipItems = [];
    this.#directionButtons = [];
    this.#randomizeButton = null;

    this.#submitButton = null;

    this.#onShipClicked = null;
    this.#onDirectionClicked = null;
    this.#onRandomizeClicked = null;

    this.#onSubmitClicked = null;
    this.#undoButton = null;
    this.#onUndoClicked = null;

    this.#onStateChanged = null;
    this.#onShowPreview = null;
    this.#onClearPreview = null;

    this.#boardComponent = null;
    this.#boardContainer = null;
    this.#element = null;
    this.#container = null;
  }
}
