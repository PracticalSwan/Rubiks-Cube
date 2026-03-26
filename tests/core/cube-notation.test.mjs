import { expect, test } from 'vitest';

import { FACE_LABELS, invertAlgorithm, simplifyAlgorithm } from '../../core/CubeNotation.js';

// These tests protect the player-facing notation helpers that now drive the UI labels and solve text.
test('FACE_LABELS maps internal face notation to human-readable color names', () => {
  expect(FACE_LABELS).toEqual({
    U: 'White',
    R: 'Red',
    F: 'Green',
    D: 'Yellow',
    L: 'Orange',
    B: 'Blue',
  });
});

test('simplifyAlgorithm collapses redundant turns on the same face', () => {
  expect(simplifyAlgorithm(['R', 'R'])).toEqual(['R2']);
  expect(simplifyAlgorithm(['R', 'R2'])).toEqual(["R'"]);
  expect(simplifyAlgorithm(['R', "R'"])).toEqual([]);
  expect(simplifyAlgorithm(['R', 'U', 'U', "U'", 'F2', 'F2'])).toEqual(['R', 'U']);
});

test('invertAlgorithm reverses order and inverts each move token', () => {
  expect(invertAlgorithm(['F', 'R2', "U'"])).toEqual(['U', 'R2', "F'"]);
});
