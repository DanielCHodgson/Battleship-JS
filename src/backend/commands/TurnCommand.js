import AttackCommand from "./AttackCommand";
import ResolveTurnCommand from "./ResolveTurnCommand";

export default class TurnCommand {
  #attackCommand;
  #resolveCommand;
  #attackExecuted = false;
  #turnResolved = false;
  #attackResult = null;

  constructor(turnManager, gameEngine, point) {
    this.#attackCommand = new AttackCommand(turnManager, point);
    this.#resolveCommand = new ResolveTurnCommand(turnManager, gameEngine);
  }

  executeAttack() {
    if (this.#attackExecuted) return false;

    const result = this.#attackCommand.execute();
    if (result === false) return false;

    this.#attackExecuted = true;
    this.#attackResult = result;
    return result;
  }

  resolve() {
    if (!this.#attackExecuted || this.#turnResolved) return false;

    const result = this.#resolveCommand.execute();
    if (result === false) return false;

    this.#turnResolved = true;
    return true;
  }

  execute() {
    const attack = this.executeAttack();
    if (attack === false) return false;

    if (!this.resolve()) {
      this.undo();
      return false;
    }

    return true;
  }

  undo() {
    if (this.#turnResolved) this.#resolveCommand.undo();
    if (this.#attackExecuted) this.#attackCommand.undo();

    this.#turnResolved = false;
    this.#attackExecuted = false;
    this.#attackResult = null;
  }

  getAttackResult() {
    return this.#attackResult;
  }
}
