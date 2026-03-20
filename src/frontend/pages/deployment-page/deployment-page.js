import DomUtility from "../../utilities/DomUtility";
import htmlString from "./deployment-page.html";
import "./deployment-page.css";

import EventBus from "../../../backend/utilities/EventBus";
import BoardComponent from "../../components/board/board-component";

export default class DeploymentPage {
  #container;
  #element;

  #textDisplay;

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

    this.#textDisplay = this.#element.querySelector(".display .text-panel");

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

    this.#onUndoClicked = () => {
      EventBus.emit("deploy undo");
    };

    this.#undoButton.addEventListener("click", this.#onUndoClicked);

    this.#onStateChanged = (state) => {
      this.#renderFromState(state);
    };

    this.#onShowPreview = (point) =>
      this.#boardComponent?.setPreview(point, true);
    this.#onClearPreview = (point) =>
      this.#boardComponent?.setPreview(point, false);

    EventBus.on("state changed", this.#onStateChanged);
    EventBus.on("show ai preview", this.#onShowPreview);
    EventBus.on("clear ai preview", this.#onClearPreview);
  }

  renderElement() {
    this.#container.innerHTML = "";
    this.#container.appendChild(this.#element);
  }

  #renderFromState(state) {
    const deployment = state.getDeployment() ?? null;
    if (!deployment) return;

    const remaining = deployment.shipsToPlace.length ?? 0;

    this.#boardComponent.renderDeploymentState(deployment.board.ships);

    this.#updateButtons(deployment, remaining, state.canUndo());
    this.#updateShips(deployment);

    this.#textDisplay.textContent = `${deployment.deployingFor} - deploy your fleet! ${remaining} ship${remaining !== 1 ? "s" : ""} remaining.`;
  }

  #updateButtons(deployment, remaining, canUndo) {
    this.#submitButton.disabled = remaining !== 0;
    this.#undoButton.disabled = !canUndo;

    this.#directionButtons.forEach((btn) => {
      const direction = btn.dataset.direction;
      const isSelected = deployment.direction === direction;
      btn.classList.toggle("selected", isSelected);
    });
  }

  #updateShips(deployment) {
    this.#shipItems.forEach((li) => {
      const name = li.textContent.trim();
      if (!name) return;

      const isSelected = deployment.selectedShip === name;
      li.classList.toggle("selected", isSelected);

      const isPlaced = !deployment.shipsToPlace.includes(name);
      li.classList.toggle("placed", isPlaced);
    });
  }

  #handleShipClicked(li) {
    const name = li.textContent.trim();
    if (!name) return;

    this.#shipItems.forEach((element) => element.classList.remove("selected"));
    li.classList.add("selected");

    EventBus.emit("deploy ship selected", name);
  }

  #handleDirectionClicked(button) {
    const direction = button.dataset.direction;
    if (!direction) return;

    EventBus.emit("deploy direction selected", direction);

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
