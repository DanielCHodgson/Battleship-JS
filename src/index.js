import "./styles/reset-modern.css";
import "./styles/styles.css";

import GameController from "./backend/controllers/GameController";
import EventBus from "./backend/utilities/EventBus";

const gameEvents = new EventBus();
let gameController;

function init() {
  gameController = new GameController(gameEvents);
}

init();
