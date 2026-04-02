import { expect, test } from 'vitest';

import { Cubie } from '../../core/Cubie.js';

function createTrackedMesh() {
  const state = {
    latestPosition: null,
    updateCount: 0,
  };

  const mesh = {
    position: {
      set(x, y, z) {
        state.latestPosition = [x, y, z];
      },
    },
    rotation: {
      x: 1,
      y: 2,
      z: 3,
    },
    updateMatrix() {
      state.updateCount += 1;
    },
    userData: {},
  };

  return { mesh, state };
}

test('Cubie syncTransform updates the local matrix after position changes', () => {
  const { mesh, state } = createTrackedMesh();
  const cubie = new Cubie(
    { x: 1, y: 1, z: 1 },
    { R: null, L: null, U: null, D: null, F: null, B: null },
    () => mesh
  );

  expect(state.updateCount).toBe(1);
  expect(state.latestPosition).toEqual([0, 0, 0]);

  cubie.setPosition({ x: 2, y: 0, z: 1 });

  expect(state.updateCount).toBe(2);
  expect(state.latestPosition).toEqual([1.05, -1.05, 0]);
  expect(mesh.rotation).toEqual({ x: 0, y: 0, z: 0 });
});
