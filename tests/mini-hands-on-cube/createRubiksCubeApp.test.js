import { describe, expect, test, jest } from '@jest/globals';
import { createRubiksCubeApp } from '../../core/createRubiksCubeApp.js';

describe('createRubiksCubeApp', () => {
  test('keeps parent spin while solving playback updates cube state', async () => {
    const cubeRoot = { rotation: { x: 0, y: 0 } };
    const rubiksCube = {
      group: cubeRoot,
      update: jest.fn(),
      playSolution: jest.fn().mockResolvedValue(undefined)
    };

    const app = createRubiksCubeApp({
      rubiksCube,
      controls: { update: jest.fn() },
      renderer: { render: jest.fn() },
      scene: {},
      camera: {}
    });

    app.tick();
    await app.solve(['R', 'U']);

    expect(cubeRoot.rotation.x).toBeCloseTo(0.01);
    expect(cubeRoot.rotation.y).toBeCloseTo(0.01);
    expect(rubiksCube.playSolution).toHaveBeenCalledWith(['R', 'U']);
  });
});
