import GameState from "./GameState";

export default class GameStateAdapter {
  static toState({
    phase,
    turnManager,
    commandHistory,
    deploymentManager,
    deployingFor,
  }) {
    const turn = turnManager ? turnManager.getCurrentTurn() : null;
    const turnNumber = turnManager ? turnManager.getTurnNumber() : 0;

    const deployment =
      phase === "deploying" && deploymentManager
        ? deploymentManager.getState(deployingFor)
        : null;

    const canUndo =
      phase === "deploying"
        ? (deployment?.placedShips?.length ?? 0) > 0
        : (commandHistory?.canUndo?.() ?? false);

    const canRedo =
      phase === "deploying" ? false : (commandHistory?.canRedo?.() ?? false);

    return new GameState({
      turn,
      turnNumber,
      phase,
      canUndo,
      canRedo,
      deployment,
    });
  }
}
