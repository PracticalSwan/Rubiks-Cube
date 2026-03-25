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
});
