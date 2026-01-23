import NextTurnCommand from "./NextTurnCommand";
import EndGameCommand from "./EndGameCommand";

export default class ResolveTurnCommand {
  #turnManager;
  #gameController;
  #chosenPath = null;

  constructor(turnManager, gameController) {
    this.#turnManager = turnManager;
    this.#gameController = gameController;
  }

  execute() {
    const turn = this.#turnManager.getCurrentTurn();
    if (!turn) return false;

    const targetBoard = turn.getTargetBoard();

    if (this.#gameController.gameIsWon(targetBoard)) {
      this.#chosenPath = new EndGameCommand(this.#gameController);
    } else {
      this.#chosenPath = new NextTurnCommand(this.#turnManager);
    }

    return this.#chosenPath.execute();
  }

  undo() {
    if (!this.#chosenPath) return;
    this.#chosenPath.undo();
  }
}
