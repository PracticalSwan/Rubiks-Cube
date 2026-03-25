import { createRequire } from 'node:module';
import { describe, expect, test, jest } from '@jest/globals';
import { SOLVED_FACELETS } from '../../core/CubeNotation.js';
import { RubiksCube } from '../../core/RubiksCube.js';

const require = createRequire(import.meta.url);
const Cube = require('cubejs');

const createMesh = () => ({
  position: { set: jest.fn() },
  rotation: { x: 0, y: 0, z: 0 },
  userData: {}
});

const createGroup = () => ({
  children: [],
  rotation: { x: 0, y: 0, z: 0 },
  add(child) {
    this.children.push(child);
  },
  remove(child) {
    this.children = this.children.filter((entry) => entry !== child);
  }
});

const createReadonlyGroup = () => {
  const group = {
    children: [],
    add(child) {
      this.children.push(child);
    },
    remove(child) {
      this.children = this.children.filter((entry) => entry !== child);
    }
  };

  Object.defineProperty(group, 'rotation', {
    value: { x: 0, y: 0, z: 0 },
    writable: false,
    enumerable: true
  });

  return group;
};

describe('RubiksCube', () => {
  test('creates 27 cubies and starts solved', () => {
    const cube = new RubiksCube({ createMesh, createGroup });

    expect(cube.cubies).toHaveLength(27);
    expect(cube.isSolved()).toBe(true);
  });

  test('applies moves with cubejs-compatible facelets', () => {
    const cube = new RubiksCube({ createMesh, createGroup });
    const oracle = Cube.fromString(SOLVED_FACELETS);

    cube.applyMove('R');
    oracle.move('R');

    expect(cube.toFaceletString()).toBe(oracle.asString());
  });

  test('applies algorithms and their inverse without drifting', () => {
    const cube = new RubiksCube({ createMesh, createGroup });
    const oracle = Cube.fromString(SOLVED_FACELETS);
    const algorithm = "R U R' U'";
    const inverse = Cube.inverse(algorithm);

    cube.applyAlgorithm(algorithm);
    oracle.move(algorithm);

    expect(cube.toFaceletString()).toBe(oracle.asString());
    expect(cube.isSolved()).toBe(false);

    cube.applyAlgorithm(inverse);

    expect(cube.isSolved()).toBe(true);
    expect(cube.toFaceletString()).toBe(SOLVED_FACELETS);
  });

  test('resets back to the solved state', () => {
    const cube = new RubiksCube({ createMesh, createGroup });

    cube.applyAlgorithm('R U');
    cube.reset();

    expect(cube.isSolved()).toBe(true);
    expect(cube.toFaceletString()).toBe(SOLVED_FACELETS);
  });

  test('resolves queued batches after the update loop completes', async () => {
    const cube = new RubiksCube({
      createMesh,
      createGroup,
      animationDuration: 0.01
    });
    const oracle = Cube.fromString(SOLVED_FACELETS);
    const queued = cube.queueMoves(['R', 'U']);

    for (let frame = 0; frame < 4; frame += 1) {
      cube.update(0.01);
    }

    oracle.move('R U');

    await expect(queued).resolves.toEqual(['R', 'U']);
    expect(cube.toFaceletString()).toBe(oracle.asString());
  });

  test('cancels playback without committing the partial turn', async () => {
    const cube = new RubiksCube({
      createMesh,
      createGroup,
      animationDuration: 1
    });
    const queued = cube.queueMoves(['R']);

    cube.update(0.1);
    cube.cancelPlayback();

    await expect(queued).rejects.toMatchObject({
      code: 'PLAYBACK_CANCELLED'
    });
    expect(cube.toFaceletString()).toBe(SOLVED_FACELETS);
  });

  test('reuses an existing read-only group rotation object during animation', async () => {
    const cube = new RubiksCube({
      createMesh,
      createGroup: createReadonlyGroup,
      animationDuration: 0.01
    });
    const queued = cube.queueMoves(['R']);

    expect(() => cube.update(0.01)).not.toThrow();

    await expect(queued).resolves.toEqual(['R']);
  });
});
