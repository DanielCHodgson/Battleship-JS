export default class CommandHistory {
  #history = [];
  #redoStack = [];

  undoLastCommand() {
    const command = this.#history.pop();
    if (!command) return false;

    this.#redoStack.push(command);
    command.undo();
    return true;
  }

  redoCommand() {
    const command = this.#redoStack.pop();
    if (!command) return false;

    const result = this.executeCommand(command, { fromRedo: true });
    if (result === false) this.#redoStack.push(command);
    return result;
  }

  executeCommand(command, { fromRedo = false } = {}) {
    if (!fromRedo) this.#redoStack.length = 0;

    const result = command.execute();
    if (result !== false) this.#history.push(command);

    return result;
  }

  recordExecutedCommand(command) {
    this.#redoStack.length = 0;
    this.#history.push(command);
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
