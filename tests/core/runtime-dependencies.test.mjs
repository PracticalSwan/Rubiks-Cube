import * as THREE from 'three';
import { expect, test } from 'vitest';
import Cube from 'cubejs-local';

test('runtime dependencies resolve through the module graph', () => {
  expect(THREE.WebGLRenderer).toBeTypeOf('function');
  expect(Cube).toBeTypeOf('function');
  expect(Cube.initSolver).toBeTypeOf('function');
  expect(Cube.scramble).toBeTypeOf('function');
  expect(Cube.fromString).toBeTypeOf('function');
});
