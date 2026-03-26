// Chooses the most useful solve playback path between solver output and reversible move history.
import {
  applyAlgorithmToFacelets,
  formatAlgorithm,
  invertAlgorithm,
  parseAlgorithm,
  SOLVED_FACELETS,
  simplifyAlgorithm,
} from './CubeNotation.js';

function createCandidate(strategy, label, moves) {
  return {
    strategy,
    label,
    moves,
    moveText: formatAlgorithm(moves),
  };
}

export function chooseSolvePlan({ currentFacelets = null, historyMoves = [], solverMoves = [] }) {
  const candidates = [];
  const normalizedHistory = simplifyAlgorithm(historyMoves);
  const normalizedSolver = parseAlgorithm(solverMoves);

  // We normalize both paths before comparing so the UI never prefers a longer
  // sequence just because it contains redundant quarter turns.
  const reverseHistory = invertAlgorithm(normalizedHistory);
  const historyMatchesCurrentState =
    !currentFacelets ||
    applyAlgorithmToFacelets(SOLVED_FACELETS, normalizedHistory) === currentFacelets;

  if (reverseHistory.length && historyMatchesCurrentState) {
    candidates.push(createCandidate('history', 'History-aware reverse', reverseHistory));
  }

  if (normalizedSolver.length) {
    candidates.push(createCandidate('solver', 'cube.js two-phase', normalizedSolver));
  }

  if (!candidates.length) {
    return createCandidate('none', 'Already solved', []);
  }

  // A shorter path always wins, but on ties we prefer the reversible history
  // path because it matches what the user just did and is easier to inspect.
  candidates.sort((left, right) => {
    if (left.moves.length !== right.moves.length) {
      return left.moves.length - right.moves.length;
    }

    if (left.strategy === right.strategy) {
      return 0;
    }

    return left.strategy === 'history' ? -1 : 1;
  });

  return candidates[0];
}
