import "./styles/reset-modern.css";
import "./styles/styles.css";

import RenderController from "./backend/controllers/RenderController";
import GameController from "./backend/controllers/GameController";
import Hud from "./frontend/components/ui/hud/hud";
import BoardComponent from "./frontend/components/board/board-component";
import Button from "./frontend/components/ui/button/button-component";

const display = document.querySelector(".display");
const board1 = document.querySelector(".board1");
const board2 = document.querySelector(".board2");
const buttons = document.querySelector(".buttons");
let renderController;
let gameController;
let hudComponent;
let boardComponent1;
let boardComponent2;
let nextButton;
let prevButton;

function init() {
  hudComponent = new Hud(display);
  boardComponent1 = new BoardComponent(board1);
  boardComponent2 = new BoardComponent(board2);
  renderController = new RenderController();
  gameController = new GameController();
  nextButton = new Button(buttons, "next", "Next Turn", "next turn");
  prevButton = new Button(buttons, "undo", "Undo", "undo");
  gameController.startGame();
}

init();
