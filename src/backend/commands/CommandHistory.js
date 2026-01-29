export default class CommandHistory {
  #gameController;
  #history = [];
  #redoStack = [];

  constructor(gameController) {
    this.#gameController = gameController;
  }

  undoLastCommand() {
    const command = this.#history.pop();
    if (!command) return;

    this.#redoStack.push(command);
    command.undo();
    this.#gameController.emitState();
  }

  redoCommand() {
    const command = this.#redoStack.pop();
    if (!command) return;

    this.executeCommand(command, { fromRedo: true });
    this.#gameController.emitState();
  }

  executeCommand(command, { fromRedo = false } = {}) {
    if (!fromRedo) this.#redoStack.length = 0;

    const result = command.execute();
    if (result !== false) this.#history.push(command);

    return result;
  }

  canUndo() {
    return this.#history.length > 0;
  }

  canRedo() {
    return this.#redoStack.length > 0;
  }

  reset() {
    this.#history.length = 0;
    this.#redoStack.length = 0;
  }
}
