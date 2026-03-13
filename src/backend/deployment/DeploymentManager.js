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

  selectShip(playerKey, name) {
    const session = this.#sessions[playerKey];
    if (!session) return { ok: false, reason: "no-session" };
    return session.setSelectedShip(name);
  }

  setDirection(playerKey, direction) {
    const session = this.#sessions[playerKey];
    if (!session) return { ok: false, reason: "no-session" };
    return session.setDirection(direction);
  }

  place(playerKey, point) {
    const session = this.#sessions[playerKey];
    if (!session) return { ok: false, reason: "no-session" };
    return session.placeAtPoint(point);
  }

  undo(playerKey) {
    const session = this.#sessions[playerKey];
    if (!session) return { ok: false, reason: "no-session" };
    return session.undoLastPlacement();
  }

  randomize(playerKey) {
    const session = this.#sessions[playerKey];
    if (!session) return { ok: false, reason: "no-session" };

    session.reset();
    session.randomize();
    return { ok: true };
  }

  validatePlayer(playerKey) {
    const session = this.#sessions[playerKey];
    if (!session) return { ok: false, reason: "no-session" };
    return session.buildResult();
  }

  isComplete() {
    return (
      this.#sessions.player1.isComplete() && this.#sessions.player2.isComplete()
    );
  }

  buildDeployments() {
    const result1 = this.#sessions.player1.buildResult();
    const result2 = this.#sessions.player2.buildResult();

    if (!result1.ok) return { ok: false, who: "player1", ...result1 };
    if (!result2.ok) return { ok: false, who: "player2", ...result2 };

    return {
      ok: true,
      deployments: {
        player1: result1.deployment,
        player2: result2.deployment,
      },
    };
  }

  getState(playerKey) {
    const session = this.#sessions[playerKey];
    if (!session) return null;

    const board = session.getBoard();
    const selectedShip = session.getSelectedShip();

    return {
      deployingFor: playerKey,
      direction: session.getSelectedDirection(),
      selectedShip: selectedShip ? selectedShip.getName() : null,
      shipsToPlace: session.getShipsToPlace().map((ship) => ship.getName()),
      placedShips: session.getPlacedShips().map((ship) => ship.getName()),
      board: {
        size: board.getSize(),
        ships: board.getShips().map((ship) => ({
          name: ship.getName(),
          positions: ship.getPositions().map((point) => ({ ...point })),
        })),
        hits: board.getHits
          ? board.getHits().map((point) => ({ ...point }))
          : [],
        misses: board.getMisses
          ? board.getMisses().map((point) => ({ ...point }))
          : [],
      },
    };
  }
}
