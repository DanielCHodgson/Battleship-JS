import Player from "../entities/Player";

export default class PlayerFactory {
  createPlayer({ name, isAI, board }) {
    return new Player(name, isAI, board);
  }

  createPlayers({ player1, player2 }) {
    return {
      player1: this.createPlayer(player1),
      player2: this.createPlayer(player2),
    };
  }

  recreatePlayersFromExisting(existingPlayers, { player1Board, player2Board } = {}) {
    const { player1: existingPlayer1, player2: existingPlayer2 } = existingPlayers;

    return {
      player1: new Player(existingPlayer1.getName(), existingPlayer1.isAI(), player1Board),
      player2: new Player(existingPlayer2.getName(), existingPlayer2.isAI(), player2Board),
    };
  }
}
