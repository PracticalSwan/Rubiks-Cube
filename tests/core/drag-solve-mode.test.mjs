// Drag-solve tests protect the math that turns a sticker drag into one deterministic cube move.
import { expect, test } from 'vitest';

import {
  classifyDragGesture,
  getFaceCellFromCubiePosition,
  resolveDragSolveMove,
} from '../../core/DragSolveMode.js';

test('getFaceCellFromCubiePosition maps front-face cubies into row and column indices', () => {
  expect(getFaceCellFromCubiePosition('F', { x: 0, y: 2, z: 2 })).toEqual({
    columnIndex: -1,
    rowIndex: 1,
  });

  expect(getFaceCellFromCubiePosition('F', { x: 1, y: 1, z: 2 })).toEqual({
    columnIndex: 0,
    rowIndex: 0,
  });

  expect(getFaceCellFromCubiePosition('F', { x: 2, y: 0, z: 2 })).toEqual({
    columnIndex: 1,
    rowIndex: -1,
  });
});

test('getFaceCellFromCubiePosition respects mirrored back-face columns and top-face rows', () => {
  expect(getFaceCellFromCubiePosition('B', { x: 2, y: 2, z: 0 })).toEqual({
    columnIndex: -1,
    rowIndex: 1,
  });

  expect(getFaceCellFromCubiePosition('U', { x: 1, y: 2, z: 0 })).toEqual({
    columnIndex: 0,
    rowIndex: 1,
  });
});

test('classifyDragGesture picks the nearest projected face axis and drag direction', () => {
  expect(
    classifyDragGesture({
      dragDelta: { x: -32, y: -5 },
      projectedRight: { x: 80, y: 0 },
      projectedUp: { x: 0, y: -80 },
      threshold: 16,
    })
  ).toEqual({
    axis: 'row',
    direction: 'left',
  });

  expect(
    classifyDragGesture({
      dragDelta: { x: 6, y: -28 },
      projectedRight: { x: 80, y: 0 },
      projectedUp: { x: 0, y: -80 },
      threshold: 16,
    })
  ).toEqual({
    axis: 'column',
    direction: 'up',
  });
});

test('classifyDragGesture rejects tiny or perfectly ambiguous drags', () => {
  expect(
    classifyDragGesture({
      dragDelta: { x: 8, y: 5 },
      projectedRight: { x: 80, y: 0 },
      projectedUp: { x: 0, y: -80 },
      threshold: 16,
    })
  ).toBeNull();

  expect(
    classifyDragGesture({
      dragDelta: { x: 20, y: -20 },
      projectedRight: { x: 80, y: 0 },
      projectedUp: { x: 0, y: -80 },
      threshold: 16,
    })
  ).toBeNull();
});

test('resolveDragSolveMove maps front-face drags into the same notation used by the move queue', () => {
  expect(
    resolveDragSolveMove({
      face: 'F',
      cubiePosition: { x: 0, y: 2, z: 2 },
      dragDelta: { x: -36, y: -4 },
      projectedRight: { x: 80, y: 0 },
      projectedUp: { x: 0, y: -80 },
    })
  ).toBe('U');

  expect(
    resolveDragSolveMove({
      face: 'F',
      cubiePosition: { x: 1, y: 1, z: 2 },
      dragDelta: { x: 0, y: -34 },
      projectedRight: { x: 80, y: 0 },
      projectedUp: { x: 0, y: -80 },
    })
  ).toBe("M'");
});

test('resolveDragSolveMove respects non-front faces and returns null for unclear drags', () => {
  expect(
    resolveDragSolveMove({
      face: 'U',
      cubiePosition: { x: 1, y: 2, z: 0 },
      dragDelta: { x: -30, y: -2 },
      projectedRight: { x: 70, y: 0 },
      projectedUp: { x: 0, y: -70 },
    })
  ).toBe('B');

  expect(
    resolveDragSolveMove({
      face: 'R',
      cubiePosition: { x: 2, y: 1, z: 1 },
      dragDelta: { x: 6, y: 6 },
      projectedRight: { x: 70, y: 0 },
      projectedUp: { x: 0, y: -70 },
      threshold: 16,
    })
  ).toBeNull();
});
