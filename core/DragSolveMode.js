// Drag-solve helpers keep sticker-hit math and drag classification deterministic outside the DOM.
import { getFaceView, resolveLayerArrowMove } from './LayerArrowMode.js';

const DEFAULT_DRAG_THRESHOLD = 16;
const AXIS_AMBIGUITY_EPSILON = 0.08;

function dot2(left, right) {
  return left.x * right.x + left.y * right.y;
}

function dot3(left, right) {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function length2(vector) {
  return Math.hypot(vector.x, vector.y);
}

function normalize2(vector) {
  const length = length2(vector);

  if (!length) {
    return null;
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

function clampCellIndex(value) {
  return Math.max(-1, Math.min(1, Math.round(value)));
}

function toCenteredPosition(position) {
  return [position.x - 1, position.y - 1, position.z - 1];
}

export function getFaceCellFromCubiePosition(face, cubiePosition) {
  const view = getFaceView(face);
  const centeredPosition = toCenteredPosition(cubiePosition);

  return {
    columnIndex: clampCellIndex(dot3(centeredPosition, view.rightDirection)),
    rowIndex: clampCellIndex(dot3(centeredPosition, view.upDirection)),
  };
}

export function classifyDragGesture({
  dragDelta,
  projectedRight,
  projectedUp,
  threshold = DEFAULT_DRAG_THRESHOLD,
}) {
  if (length2(dragDelta) < threshold) {
    return null;
  }

  const normalizedRight = normalize2(projectedRight);
  const normalizedUp = normalize2(projectedUp);

  if (!normalizedRight || !normalizedUp) {
    return null;
  }

  const normalizedDrag = normalize2(dragDelta);
  const rightAlignment = Math.abs(dot2(normalizedDrag, normalizedRight));
  const upAlignment = Math.abs(dot2(normalizedDrag, normalizedUp));

  if (Math.abs(rightAlignment - upAlignment) <= AXIS_AMBIGUITY_EPSILON) {
    return null;
  }

  if (rightAlignment > upAlignment) {
    return {
      axis: 'row',
      direction: dot2(dragDelta, normalizedRight) >= 0 ? 'right' : 'left',
    };
  }

  return {
    axis: 'column',
    direction: dot2(dragDelta, normalizedUp) >= 0 ? 'up' : 'down',
  };
}

export function resolveDragSolveMove({
  face,
  cubiePosition,
  dragDelta,
  projectedRight,
  projectedUp,
  threshold = DEFAULT_DRAG_THRESHOLD,
}) {
  const gesture = classifyDragGesture({
    dragDelta,
    projectedRight,
    projectedUp,
    threshold,
  });

  if (!gesture) {
    return null;
  }

  const cell = getFaceCellFromCubiePosition(face, cubiePosition);
  const index = gesture.axis === 'row' ? cell.rowIndex : cell.columnIndex;

  return resolveLayerArrowMove(face, {
    axis: gesture.axis,
    direction: gesture.direction,
    index,
  });
}
