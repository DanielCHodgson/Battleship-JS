import "./styles/reset-modern.css";
import "./styles/styles.css";

import RenderController from "./backend/controllers/RenderController";
import GameController from "./backend/controllers/GameController";
import Hud from "./frontend/components/ui/hud/hud";
import BoardComponent from "./frontend/components/board/board-component";
import Button from "./frontend/components/ui/button/button";

const display = document.querySelector(".display");
const board = document.querySelector(".board");
const buttons = document.querySelector(".buttons");
let renderController;
let gameController;
let hudComponent;
let boardComponent;
let nextButton;
let prevButton;

function init() {
  hudComponent = new Hud(display);
  boardComponent = new BoardComponent(board);
  renderController = new RenderController(boardComponent);
  gameController = new GameController();
  nextButton = new Button(buttons, "next", "Next Turn", "next turn");
  prevButton = new Button(buttons, "prev", "Prev Turn", "prev turn");
  gameController.startGame();
}

init();
