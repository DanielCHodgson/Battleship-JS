import GameController from "./backend/controllers/GameController";
import "./styles/reset-modern.css";
import "./styles/styles.css";

const gameController = new GameController();

function init() { 
  gameController.launchGame();
}

init();