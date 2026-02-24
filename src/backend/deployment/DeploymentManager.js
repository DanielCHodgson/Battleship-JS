import DeploymentSession from "./DeploymentSession";

export default class DeploymentManager {
  #sessions;

  constructor() {
    this.#sessions = {
      player1: new DeploymentSession(),
      player2: new DeploymentSession(),
    };
  }
  reset() {
    this.#sessions.player1.reset();
    this.#sessions.player2.reset();
  }

  getSession(playerKey) {
    return this.#sessions[playerKey];
  }

  randomize(playerKey) {
    this.#sessions[playerKey].reset();
    this.#sessions[playerKey].randomize();
  }

  isComplete() {
    return this.#sessions.player1.isComplete() && this.#sessions.player2.isComplete();
  }

  buildDeployments() {
    const result1 = this.#sessions.player1.buildResult();
    const result2 = this.#sessions.player2.buildResult();
    if (!result1.ok) return { ok: false, who: "player1", ...result1 };
    if (!result2.ok) return { ok: false, who: "player2", ...result2 };

    return {
      ok: true,
      deployments: { player1: result1.deployment, player2: result2.deployment },
    };
  }
}
