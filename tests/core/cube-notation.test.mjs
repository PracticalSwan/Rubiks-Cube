import { expect, test } from 'vitest';

import {
  applyAlgorithmToFacelets,
  applyMoveToFacelets,
  FACE_LABELS,
  invertAlgorithm,
  simplifyAlgorithm,
  SOLVED_FACELETS,
} from '../../core/CubeNotation.js';

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

test('notation helpers accept middle-slice moves for history-aware playback', () => {
  expect(simplifyAlgorithm(['M', 'M'])).toEqual(['M2']);
  expect(invertAlgorithm(['M', "E'", 'S2'])).toEqual(['S2', 'E', "M'"]);

  expect(applyMoveToFacelets(SOLVED_FACELETS, 'M')).not.toBe(SOLVED_FACELETS);
  expect(applyAlgorithmToFacelets(SOLVED_FACELETS, ['M', "M'"])).toBe(SOLVED_FACELETS);
});
