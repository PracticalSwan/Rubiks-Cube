// Covers solve-path selection so the UI keeps preferring short, inspectable playback sequences.
import test from 'node:test';
import assert from 'node:assert/strict';

import { chooseSolvePlan } from '../../core/SolvePlanner.js';

// The planner should prefer the most inspectable short path, not just whatever the solver returns first.
test('chooseSolvePlan prefers reversing simplified move history when it is shorter', () => {
  const plan = chooseSolvePlan({
    historyMoves: ['R', 'U', "U'"],
    solverMoves: ['F', 'R', 'U', 'B'],
  });

  assert.equal(plan.strategy, 'history');
  assert.equal(plan.label, 'History-aware reverse');
  assert.deepEqual(plan.moves, ["R'"]);
});

test('chooseSolvePlan falls back to the solver result when history is not better', () => {
  const plan = chooseSolvePlan({
    historyMoves: ['R', 'U'],
    solverMoves: ['F'],
  });

  assert.equal(plan.strategy, 'solver');
  assert.equal(plan.label, 'cube.js two-phase');
  assert.deepEqual(plan.moves, ['F']);
});
