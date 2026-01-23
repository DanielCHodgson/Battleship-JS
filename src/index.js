import "./styles/reset-modern.css";
import "./styles/styles.css";
import RenderController from "./backend/controllers/RenderController";
import GameController from "./backend/controllers/GameController";
import Hud from "./frontend/components/ui/hud/hud";
import BoardComponent from "./frontend/components/board/board-component";

const display = document.querySelector(".display");
const board1 = document.querySelector(".board1");
const board2 = document.querySelector(".board2");
let renderController;
let gameController;
let hudComponent;
let boardComponent1;
let boardComponent2;

function init() {
  hudComponent = new Hud(display);
  boardComponent1 = new BoardComponent(board1);
  boardComponent2 = new BoardComponent(board2);
  renderController = new RenderController();
  gameController = new GameController();
  gameController.startGame();
}

init();