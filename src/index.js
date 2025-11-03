import "./styles/reset-modern.css";
import "./styles/styles.css";

import GameController from "./backend/controllers/GameController";
import BoardComponent from "./frontend/components/board/board-component";

let gameController;
let boardComponent;

function init() {
  gameController = new GameController();
  boardComponent = new BoardComponent(document.querySelector("body"));
}

init();
