// Lazy-loader tests make sure the app caches the solver import instead of reloading it on every action.
import { expect, test } from 'vitest';

import { loadCubeClass } from '../../core/loadCubeClass.js';

test('loadCubeClass caches the solver module and exposes the cube API', async () => {
  const [firstCubeClass, secondCubeClass] = await Promise.all([loadCubeClass(), loadCubeClass()]);

  expect(firstCubeClass).toBe(secondCubeClass);
  expect(firstCubeClass.initSolver).toBeTypeOf('function');
  expect(firstCubeClass.scramble).toBeTypeOf('function');
  expect(firstCubeClass.fromString).toBeTypeOf('function');
});
