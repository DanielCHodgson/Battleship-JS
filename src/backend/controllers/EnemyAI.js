export default class EnemyAI {
  calculateNextMove(turn) {
    const targetBoard = turn.getTargetBoard();

    const targetCandidates = this.#getTargetCandidates(targetBoard);
    if (targetCandidates.length) {
      return this.pickRandom(targetCandidates);
    }

    return this.pickRandomUntriedPoint(targetBoard);
  }

  #getTargetCandidates(targetBoard) {
    const unresolvedHits = this.#getUnresolvedPointsHit(targetBoard);
    if (!unresolvedHits.length) return [];

    return this.#expandHitsToCandidates(targetBoard, unresolvedHits);
  }

  #getUnresolvedPointsHit(targetBoard) {
    const hits = targetBoard.getHits();
    if (!hits.length) return [];

    return hits.filter((point) => this.#isUnresolvedHit(targetBoard, point));
  }

  #isUnresolvedHit(targetBoard, point) {
    const ship = targetBoard.getShipAt(point);
    return Boolean(ship) && !ship.isSunk();
  }

  #expandHitsToCandidates(targetBoard, pointsHit) {
    const candidates = [];
    const seen = new Set();

    for (const point of pointsHit) {
      const neighbours = this.#getNeighbours(point);
      for (const neighbour of neighbours) {
        if (!this.#isCandidate(targetBoard, neighbour)) continue;

        const key = `${neighbour.x},${neighbour.y}`;
        if (seen.has(key)) continue;
        seen.add(key);

        candidates.push(neighbour);
      }
    }

    return candidates;
  }

  #isCandidate(targetBoard, point) {
    return targetBoard.isInBounds(point) && !targetBoard.pointIsOccupied(point);
  }

  #getNeighbours(point) {
    return [
      { x: point.x, y: point.y - 1 },
      { x: point.x + 1, y: point.y },
      { x: point.x, y: point.y + 1 },
      { x: point.x - 1, y: point.y },
    ];
  }

  pickRandomUntriedPoint(targetBoard) {
    const size = targetBoard.getSize();
    const triedCount =
      targetBoard.getHits().length + targetBoard.getMisses().length;

    if (triedCount >= size * size) return null;

    let candidate;
    do {
      candidate = {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size),
      };
    } while (targetBoard.pointIsOccupied(candidate));

    return candidate;
  }

  pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }
}
