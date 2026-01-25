import DomUtility from "../../utilities/DomUtility";
import htmlString from "./game-page.html";
import "./gamepage.css";

export default class GamePage {
  #display = document.querySelector(".display");
  #board1 = document.querySelector(".board1");
  #board2 = document.querySelector(".board2");
  #renderController;
  #hudComponent;
  #boardComponent1;
  #boardComponent2;
  constructor() {}

  open() {
    hudComponent = new Hud(display);
    boardComponent1 = new BoardComponent(board1);
    boardComponent2 = new BoardComponent(board2);
    renderController = new RenderController();
    gameController = new GameController();
  }
}
