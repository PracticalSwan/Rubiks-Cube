// Solve-planner coverage protects the history-versus-solver choice that drives playback UX.
import { expect, test } from 'vitest';

import { applyAlgorithmToFacelets, SOLVED_FACELETS } from '../../core/CubeNotation.js';
import { chooseSolvePlan } from '../../core/SolvePlanner.js';

// The planner should prefer the most inspectable short path, not just whatever the solver returns first.
test('chooseSolvePlan prefers reversing simplified move history when it is shorter', () => {
  const plan = chooseSolvePlan({
    historyMoves: ['R', 'U', "U'"],
    solverMoves: ['F', 'R', 'U', 'B'],
  });

  expect(plan.strategy).toBe('history');
  expect(plan.label).toBe('History-aware reverse');
  expect(plan.moves).toEqual(["R'"]);
});

test('chooseSolvePlan falls back to the solver result when history is not better', () => {
  const plan = chooseSolvePlan({
    historyMoves: ['R', 'U'],
    solverMoves: ['F'],
  });

  expect(plan.strategy).toBe('solver');
  expect(plan.label).toBe('cube.js two-phase');
  expect(plan.moves).toEqual(['F']);
});

test('chooseSolvePlan ignores stale history when the current cube state no longer matches it', () => {
  const plan = chooseSolvePlan({
    currentFacelets: applyAlgorithmToFacelets(SOLVED_FACELETS, ['U']),
    historyMoves: ['R'],
    solverMoves: ["U'"],
  });

  expect(plan.strategy).toBe('solver');
  expect(plan.label).toBe('cube.js two-phase');
  expect(plan.moves).toEqual(["U'"]);
});
