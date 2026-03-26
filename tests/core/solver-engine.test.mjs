// Covers solver warm-up reuse and random-state scramble parsing without pulling in browser runtime code.
import test from 'node:test';
import assert from 'node:assert/strict';

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

  assert.equal(warmCount, 1);
  assert.deepEqual(scramble, ['R', 'U2', "F'"]);
});
