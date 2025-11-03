import "./styles/reset-modern.css";
import "./styles/styles.css";

import RenderController from "./backend/controllers/RenderController";
import GameController from "./backend/controllers/GameController";
import Hud from "./frontend/components/ui/hud/hud";
import BoardComponent from "./frontend/components/board/board-component";

const body = document.querySelector("body");
let renderController;
let gameController;
let hudComponent;
let boardComponent;

function init() {
  hudComponent = new Hud(body);
  boardComponent = new BoardComponent(body);
  renderController = new RenderController();
  gameController = new GameController();
}

init();
