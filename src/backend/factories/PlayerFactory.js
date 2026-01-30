import Player from "../entities/Player";

export default class PlayerFactory {
  constructor() {}

  createPlayersFromDetails(playerDetails) {
    const player1 = new Player(
      playerDetails.player1.name,
      playerDetails.player1.isAI,
      playerDetails.player1.board,
    );
    const player2 = new Player(
      playerDetails.player2.name,
      playerDetails.player2.isAI,
      playerDetails.player1.board,
    );

    return { player1, player2 };
  }

  recreatePlayersFromExisting(existingPlayers) {
    const { player1: oldPlayer1, player2: oldPlayer2 } = existingPlayers;

    const player1 = new Player(oldPlayer1.getName(), oldPlayer1.isAI());
    const player2 = new Player(oldPlayer2.getName(), oldPlayer2.isAI());

    return { player1, player2 };
  }
}
