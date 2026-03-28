// Arrow-mode helpers keep face locking and slice mapping deterministic without touching DOM code.
const FACE_VIEWS = {
  F: {
    eyeDirection: [0, 0, 1],
    upDirection: [0, 1, 0],
    rightDirection: [1, 0, 0],
  },
  B: {
    eyeDirection: [0, 0, -1],
    upDirection: [0, 1, 0],
    rightDirection: [-1, 0, 0],
  },
  R: {
    eyeDirection: [1, 0, 0],
    upDirection: [0, 1, 0],
    rightDirection: [0, 0, -1],
  },
  L: {
    eyeDirection: [-1, 0, 0],
    upDirection: [0, 1, 0],
    rightDirection: [0, 0, 1],
  },
  U: {
    eyeDirection: [0, 1, 0],
    upDirection: [0, 0, -1],
    rightDirection: [1, 0, 0],
  },
  D: {
    eyeDirection: [0, -1, 0],
    upDirection: [0, 0, 1],
    rightDirection: [1, 0, 0],
  },
};

const FACE_LOCK_ROTATIONS = {
  F: [0, 0, 0],
  B: [0, Math.PI, 0],
  R: [0, -Math.PI / 2, 0],
  L: [0, Math.PI / 2, 0],
  U: [Math.PI / 2, 0, 0],
  D: [-Math.PI / 2, 0, 0],
};

const AXIS_TO_MOVES = {
  x: {
    '-1': 'L',
    0: 'M',
    1: 'R',
  },
  y: {
    '-1': 'D',
    0: 'E',
    1: 'U',
  },
  z: {
    '-1': 'B',
    0: 'S',
    1: 'F',
  },
};

const ROTATIONS = {
  xp: ([x, y, z]) => [x, -z, y],
  xn: ([x, y, z]) => [x, z, -y],
  yp: ([x, y, z]) => [z, y, -x],
  yn: ([x, y, z]) => [-z, y, x],
  zp: ([x, y, z]) => [-y, x, z],
  zn: ([x, y, z]) => [y, -x, z],
};

// Slice conventions follow standard notation: M turns like L, E like D, and S like F.
const BASE_ROTATIONS = {
  U: 'yn',
  E: 'yp',
  D: 'yp',
  R: 'xn',
  M: 'xp',
  L: 'xp',
  F: 'zn',
  S: 'zn',
  B: 'zp',
};

const COLUMN_LABELS = {
  '-1': 'left',
  0: 'middle',
  1: 'right',
};

const ROW_LABELS = {
  '-1': 'bottom',
  0: 'middle',
  1: 'top',
};

function getAxisDetails(direction) {
  const [x, y, z] = direction;

  if (x) {
    return { axis: 'x', sign: x };
  }

  if (y) {
    return { axis: 'y', sign: y };
  }

  return { axis: 'z', sign: z };
}

function addVectors(left, right) {
  return left.map((value, index) => value + right[index]);
}

function scaleVector(vector, scalar) {
  return vector.map((value) => value * scalar);
}

function subtractVectors(left, right) {
  return left.map((value, index) => value - right[index]);
}

function dotProduct(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function invertMove(move) {
  return move.endsWith("'") ? move[0] : `${move}'`;
}

function rotatePoint(point, move) {
  return ROTATIONS[BASE_ROTATIONS[move]](point);
}

function getBaseMove(direction, index) {
  const { axis, sign } = getAxisDetails(direction);
  return AXIS_TO_MOVES[axis][`${index * sign}`];
}

function chooseMoveDirection(baseMove, samplePoint, preferredDirection) {
  const rotated = rotatePoint(samplePoint, baseMove);
  const movement = dotProduct(subtractVectors(rotated, samplePoint), preferredDirection);
  return movement > 0 ? baseMove : invertMove(baseMove);
}

export function getFaceView(face) {
  const view = FACE_VIEWS[face];

  if (!view) {
    throw new Error(`Unsupported face "${face}"`);
  }

  return view;
}

export function getFaceLockRotation(face) {
  const rotation = FACE_LOCK_ROTATIONS[face];

  if (!rotation) {
    throw new Error(`Unsupported face "${face}"`);
  }

  return rotation;
}

export function resolveLayerArrowMove(face, { axis, index, direction }) {
  const view = getFaceView(face);
  const isColumn = axis === 'column';
  const sliceDirection = isColumn ? view.rightDirection : view.upDirection;
  const baseMove = getBaseMove(sliceDirection, index);
  const samplePoint = addVectors(view.eyeDirection, scaleVector(sliceDirection, index));
  const preferredDirection = isColumn ? view.upDirection : view.rightDirection;
  const preferredSign = direction === 'up' || direction === 'right' ? 1 : -1;

  return chooseMoveDirection(baseMove, samplePoint, scaleVector(preferredDirection, preferredSign));
}

export function getLayerArrowControls(face) {
  const topAndBottom = [-1, 0, 1].flatMap((index, slot) => [
    {
      id: `column-${COLUMN_LABELS[`${index}`]}-up`,
      axis: 'column',
      direction: 'up',
      icon: '↑',
      index,
      placement: 'top',
      move: resolveLayerArrowMove(face, { axis: 'column', index, direction: 'up' }),
      slot,
      tooltip: `Turn ${COLUMN_LABELS[`${index}`]} column up`,
    },
    {
      id: `column-${COLUMN_LABELS[`${index}`]}-down`,
      axis: 'column',
      direction: 'down',
      icon: '↓',
      index,
      placement: 'bottom',
      move: resolveLayerArrowMove(face, { axis: 'column', index, direction: 'down' }),
      slot,
      tooltip: `Turn ${COLUMN_LABELS[`${index}`]} column down`,
    },
  ]);

  const leftAndRight = [1, 0, -1].flatMap((index, slot) => [
    {
      id: `row-${ROW_LABELS[`${index}`]}-left`,
      axis: 'row',
      direction: 'left',
      icon: '←',
      index,
      placement: 'left',
      move: resolveLayerArrowMove(face, { axis: 'row', index, direction: 'left' }),
      slot,
      tooltip: `Turn ${ROW_LABELS[`${index}`]} row left`,
    },
    {
      id: `row-${ROW_LABELS[`${index}`]}-right`,
      axis: 'row',
      direction: 'right',
      icon: '→',
      index,
      placement: 'right',
      move: resolveLayerArrowMove(face, { axis: 'row', index, direction: 'right' }),
      slot,
      tooltip: `Turn ${ROW_LABELS[`${index}`]} row right`,
    },
  ]);

  return [...topAndBottom, ...leftAndRight];
}
