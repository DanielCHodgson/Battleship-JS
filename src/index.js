import "./styles/reset-modern.css";
import "./styles/styles.css";

import GameController from "./backend/controllers/GameController";
import Hud from "./frontend/components/ui/hud/hud";
import BoardComponent from "./frontend/components/board/board-component";

const body = document.querySelector("body");
let gameController;
let hudComponent;
let boardComponent;

function init() {
  gameController = new GameController();
  hudComponent = new Hud(body);
  boardComponent = new BoardComponent(body);
}

init();
