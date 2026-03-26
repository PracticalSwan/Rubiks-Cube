import { expect, test } from 'vitest';

import { SolverEngine } from '../../core/SolverEngine.js';

// Random-state scrambles rely on the same warm-up path as solving, so both behaviors are checked together.
test('createRandomStateScramble warms the solver and parses the returned scramble', async () => {
  let warmCount = 0;

  const engine = new SolverEngine({
    CubeClass: {
      initSolver() {
        warmCount += 1;
      },
      scramble() {
        return "R U2 F'";
      },
    },
    scheduleIdle(callback) {
      callback();
      return 0;
    },
  });

  const scramble = await engine.createRandomStateScramble();

  expect(warmCount).toBe(1);
  expect(scramble).toEqual(['R', 'U2', "F'"]);
});
