import Player from "../entities/Player";

export default class GameSessionFactory {
  #shipFactory;

  constructor(shipFactory) {
    this.#shipFactory = shipFactory;
  }

  createPlayersFromDetails(playerDetails) {
    const player1 = new Player(
      playerDetails.player1.name,
      playerDetails.player1.isAI,
    );
    const player2 = new Player(
      playerDetails.player2.name,
      playerDetails.player2.isAI,
    );

    this.#populateFleetRandom(player1);
    this.#populateFleetRandom(player2);

    return { player1, player2 };
  }

  recreatePlayersFromExisting(existingPlayers) {
    const { player1: oldPlayer1, player2: oldPlayer2 } = existingPlayers;

    const player1 = new Player(oldPlayer1.getName(), oldPlayer1.isAI());
    const player2 = new Player(oldPlayer2.getName(), oldPlayer2.isAI());

    this.#populateFleetRandom(player1);
    this.#populateFleetRandom(player2);

    return { player1, player2 };
  }

  #populateFleetRandom(player) {
    const ships = this.#shipFactory.createFleet();
    ships.forEach((ship) => this.#placeShipAtRandom(ship, player.getBoard()));
  }

  #placeShipAtRandom(ship, board, maxAttempts = 100) {
    const size = board.getSize();

    for (let i = 0; i < maxAttempts; i++) {
      const point = {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size),
      };
      const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
      const result = board.placeShip(ship, point, direction);
      if (result.ok) return true;
    }

    throw new Error(`Failed to place ship ${ship.getName()}`);
  }
}
