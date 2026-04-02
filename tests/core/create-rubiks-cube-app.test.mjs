import { Euler, Vector3 } from 'three';
import { expect, test, vi } from 'vitest';

import { createRubiksCubeApp } from '../../core/createRubiksCubeApp.js';

function createRuntime() {
  return {
    camera: {
      position: new Vector3(0, 0, 8),
      up: new Vector3(0, 1, 0),
    },
    controls: {
      maxDistance: 16,
      minDistance: 5.4,
      target: new Vector3(0, 0, 0),
      update: vi.fn(),
    },
    renderer: {
      render: vi.fn(),
    },
    rubiksCube: {
      group: {
        rotation: new Euler(0, 0, 0),
      },
      playSolution: vi.fn(),
      update: vi.fn(),
    },
    scene: {},
  };
}

test('createRubiksCubeApp tracks active view tweens until they finish', () => {
  const runtime = createRuntime();
  const app = createRubiksCubeApp({
    camera: runtime.camera,
    controls: runtime.controls,
    renderer: runtime.renderer,
    rubiksCube: runtime.rubiksCube,
    scene: runtime.scene,
    shouldAutoSpin: () => false,
  });

  expect(app.isViewTweening()).toBe(false);

  app.focusView(
    {
      eyeDirection: [0, 0, 1],
      upDirection: [0, 1, 0],
    },
    { duration: 0.2 }
  );

  expect(app.isViewTweening()).toBe(true);

  app.tick(0.1);
  expect(app.isViewTweening()).toBe(true);

  app.tick(0.2);
  expect(app.isViewTweening()).toBe(false);
});
