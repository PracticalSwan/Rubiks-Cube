// Regression coverage for notation helpers that feed both the solver bridge and the player-facing UI.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FACE_LABELS,
  invertAlgorithm,
  simplifyAlgorithm,
} from '../../core/CubeNotation.js';

// These tests protect the player-facing notation helpers that now drive the UI labels and solve text.
test('FACE_LABELS maps internal face notation to human-readable color names', () => {
  assert.deepEqual(FACE_LABELS, {
    U: 'White',
    R: 'Red',
    F: 'Green',
    D: 'Yellow',
    L: 'Orange',
    B: 'Blue',
  });
});

test('simplifyAlgorithm collapses redundant turns on the same face', () => {
  assert.deepEqual(simplifyAlgorithm(['R', 'R']), ['R2']);
  assert.deepEqual(simplifyAlgorithm(['R', 'R2']), ["R'"]);
  assert.deepEqual(simplifyAlgorithm(['R', "R'"]), []);
  assert.deepEqual(simplifyAlgorithm(['R', 'U', 'U', "U'", 'F2', 'F2']), ['R', 'U']);
});

test('invertAlgorithm reverses order and inverts each move token', () => {
  assert.deepEqual(invertAlgorithm(['F', 'R2', "U'"]), ['U', 'R2', "F'"]);
});
