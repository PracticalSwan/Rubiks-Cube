import { expect, test } from 'vitest';

import {
  applyAlgorithmToFacelets,
  applyMoveToFacelets,
  describeAlgorithmMoves,
  FACE_LABELS,
  getColorFaceOptions,
  getLiveColorFaceMap,
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

test('getLiveColorFaceMap follows center stickers after a middle-slice move', () => {
  const shiftedFacelets = applyMoveToFacelets(SOLVED_FACELETS, 'M');

  expect(getLiveColorFaceMap(shiftedFacelets)).toEqual({
    U: 'F',
    R: 'R',
    F: 'D',
    D: 'B',
    L: 'L',
    B: 'U',
  });

  const blueOption = getColorFaceOptions(shiftedFacelets).find(
    (option) => option.colorFace === 'B'
  );

  expect(blueOption).toMatchObject({
    colorFace: 'B',
    currentFace: 'U',
    currentPositionLabel: 'Top',
    label: 'Blue',
  });
});

test('describeAlgorithmMoves explains turns with live center colors and readable slice directions', () => {
  const shiftedFacelets = applyMoveToFacelets(SOLVED_FACELETS, 'M');

  expect(describeAlgorithmMoves(['R', "U'", "M'"], shiftedFacelets)).toEqual([
    {
      notation: 'R',
      description: 'Turn the red-center face clockwise',
    },
    {
      notation: "U'",
      description: 'Turn the blue-center face counterclockwise',
    },
    {
      notation: "M'",
      description: 'Move the middle vertical slice upward',
    },
  ]);
});
