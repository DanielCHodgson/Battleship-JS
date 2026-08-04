import Gameboard from "../board/Gameboard";
import Player from "../entities/Player";

export default class PlayerFactory {
  createPlayer({ name, isAi, isAI, board }) {
    return new Player(name, isAi ?? isAI ?? false, board);
  }

  createPlayers({ player1, player2 }) {
    return {
      player1: this.createPlayer(player1),
      player2: this.createPlayer(player2),
    };
  }

  createPlayerFromDeployment({ name, isAI, deployment }) {
    return new Player(
      name,
      isAI,
      Gameboard.fromDeployment(deployment),
    );
  }

  createPlayersFromDeployment(setupDetails, deployments) {
    return {
      player1: this.createPlayerFromDeployment({
        name: setupDetails.player1.name,
        isAI: setupDetails.player1.isAi ?? setupDetails.player1.isAI,
        deployment: deployments.player1,
      }),
      player2: this.createPlayerFromDeployment({
        name: setupDetails.player2.name,
        isAI: setupDetails.player2.isAi ?? setupDetails.player2.isAI,
        deployment: deployments.player2,
      }),
    };
  }

  recreatePlayersFromExisting(
    existingPlayers,
    { player1Board, player2Board } = {},
  ) {
    const { player1: existingPlayer1, player2: existingPlayer2 } =
      existingPlayers;

    return {
      player1: new Player(
        existingPlayer1.getName(),
        existingPlayer1.isAI(),
        player1Board,
      ),
      player2: new Player(
        existingPlayer2.getName(),
        existingPlayer2.isAI(),
        player2Board,
      ),
    };
  }
}
