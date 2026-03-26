// Shared cube notation helpers for labels, move parsing, and facelet/cubie state conversion.
// These tables keep UI-friendly color labels and solver-friendly face notation in one place.
export const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'];

export const FACE_DETAILS = {
  U: { label: 'White', color: '#f5f5f5', buttonTint: 'rgba(245, 245, 245, 0.18)' },
  R: { label: 'Red', color: '#d84f3f', buttonTint: 'rgba(216, 79, 63, 0.2)' },
  F: { label: 'Green', color: '#35b66a', buttonTint: 'rgba(53, 182, 106, 0.2)' },
  D: { label: 'Yellow', color: '#ffd45c', buttonTint: 'rgba(255, 212, 92, 0.2)' },
  L: { label: 'Orange', color: '#ef8b34', buttonTint: 'rgba(239, 139, 52, 0.2)' },
  B: { label: 'Blue', color: '#335fd1', buttonTint: 'rgba(51, 95, 209, 0.2)' }
};

export const FACE_LABELS = Object.fromEntries(
  FACE_ORDER.map((face) => [face, FACE_DETAILS[face].label])
);

export const FACE_COLORS = Object.fromEntries(
  FACE_ORDER.map((face) => [face, FACE_DETAILS[face].color])
);

export const MOVE_FACES = ['U', 'D', 'R', 'L', 'F', 'B'];

export const SOLVED_FACELETS =
  'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

// Normal vectors let us rotate stickers in 3D while still projecting back to face notation.
const FACE_NORMALS = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1]
};

const FACE_BY_NORMAL = {
  '0,1,0': 'U',
  '1,0,0': 'R',
  '0,0,1': 'F',
  '0,-1,0': 'D',
  '-1,0,0': 'L',
  '0,0,-1': 'B'
};

const ROTATIONS = {
  xp: ([x, y, z]) => [x, -z, y],
  xn: ([x, y, z]) => [x, z, -y],
  yp: ([x, y, z]) => [z, y, -x],
  yn: ([x, y, z]) => [-z, y, x],
  zp: ([x, y, z]) => [-y, x, z],
  zn: ([x, y, z]) => [y, -x, z]
};

const MOVE_ROTATIONS = {
  U: 'yn',
  D: 'yp',
  R: 'xn',
  L: 'xp',
  F: 'zn',
  B: 'zp'
};

// We precompute facelet metadata once because every move reuses the same 54 sticker slots.
const INDEX_TO_META = buildIndexToMeta();

function buildIndexToMeta() {
  const metadata = [];

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      metadata.push({ face: 'U', x: col - 1, y: 1, z: row - 1 });
    }
  }

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      metadata.push({ face: 'R', x: 1, y: 1 - row, z: 1 - col });
    }
  }

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      metadata.push({ face: 'F', x: col - 1, y: 1 - row, z: 1 });
    }
  }

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      metadata.push({ face: 'D', x: col - 1, y: -1, z: 1 - row });
    }
  }

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      metadata.push({ face: 'L', x: -1, y: 1 - row, z: col - 1 });
    }
  }

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      metadata.push({ face: 'B', x: 1 - col, y: 1 - row, z: -1 });
    }
  }

  return metadata;
}

function getIndexFromMeta(meta) {
  const { face, x, y, z } = meta;

  switch (face) {
    case 'U':
      return (z + 1) * 3 + (x + 1);
    case 'R':
      return 9 + (1 - y) * 3 + (1 - z);
    case 'F':
      return 18 + (1 - y) * 3 + (x + 1);
    case 'D':
      return 27 + (1 - z) * 3 + (x + 1);
    case 'L':
      return 36 + (1 - y) * 3 + (z + 1);
    case 'B':
      return 45 + (1 - y) * 3 + (1 - x);
    default:
      throw new Error(`Unknown face "${face}"`);
  }
}

// Layer checks keep move application data-driven instead of branching in the main loop.
function isOnLayer(meta, move) {
  switch (move) {
    case 'U':
      return meta.y === 1;
    case 'D':
      return meta.y === -1;
    case 'R':
      return meta.x === 1;
    case 'L':
      return meta.x === -1;
    case 'F':
      return meta.z === 1;
    case 'B':
      return meta.z === -1;
    default:
      return false;
  }
}

function rotateMeta(meta, move) {
  const rotate = ROTATIONS[MOVE_ROTATIONS[move]];
  const [x, y, z] = rotate([meta.x, meta.y, meta.z]);
  const [nx, ny, nz] = rotate(FACE_NORMALS[meta.face]);

  return {
    face: FACE_BY_NORMAL[[nx, ny, nz].join(',')],
    x,
    y,
    z
  };
}

// A quarter turn is expressed as sticker remapping so cube state stays renderer-agnostic.
function applyQuarterTurn(facelets, move) {
  const next = Array(54).fill(null);

  INDEX_TO_META.forEach((meta, index) => {
    const target = isOnLayer(meta, move) ? rotateMeta(meta, move) : meta;
    next[getIndexFromMeta(target)] = facelets[index];
  });

  return next.join('');
}

export function normalizeMove(move) {
  const token = `${move ?? ''}`.trim();

  if (!/^[URFDLB](?:2|')?$/.test(token)) {
    throw new Error(`Unsupported move token "${move}"`);
  }

  return token;
}

// Algorithms can arrive as strings, nested arrays, or already-tokenized sequences from the UI/solver.
export function parseAlgorithm(algorithm) {
  if (Array.isArray(algorithm)) {
    return algorithm.flatMap((entry) => parseAlgorithm(entry));
  }

  if (typeof algorithm !== 'string') {
    return [];
  }

  const trimmed = algorithm.trim();

  if (!trimmed) {
    return [];
  }

  return trimmed.split(/\s+/).map(normalizeMove);
}

function moveToQuarterTurns(move) {
  const token = normalizeMove(move);

  if (token.endsWith('2')) {
    return 2;
  }

  if (token.endsWith("'")) {
    return 3;
  }

  return 1;
}

function quarterTurnsToMove(face, turns) {
  const normalizedTurns = ((turns % 4) + 4) % 4;

  switch (normalizedTurns) {
    case 0:
      return null;
    case 1:
      return face;
    case 2:
      return `${face}2`;
    case 3:
      return `${face}'`;
    default:
      return null;
  }
}

// Adjacent turns on the same face are collapsed so history and solve displays stay human-readable.
export function simplifyAlgorithm(algorithm) {
  const simplified = [];

  parseAlgorithm(algorithm).forEach((move) => {
    const previous = simplified[simplified.length - 1];

    if (!previous || previous[0] !== move[0]) {
      simplified.push(move);
      return;
    }

    simplified.pop();
    const mergedMove = quarterTurnsToMove(
      move[0],
      moveToQuarterTurns(previous) + moveToQuarterTurns(move)
    );

    if (mergedMove) {
      simplified.push(mergedMove);
    }
  });

  return simplified;
}

export function invertAlgorithm(algorithm) {
  return parseAlgorithm(algorithm)
    .slice()
    .reverse()
    .map((move) => {
      if (move.endsWith('2')) {
        return move;
      }

      return move.endsWith("'") ? move[0] : `${move[0]}'`;
    });
}

export function formatAlgorithm(algorithm, fallback = 'No moves recorded yet.') {
  const moves = parseAlgorithm(algorithm);
  return moves.length ? moves.join(' ') : fallback;
}

// Facelet application helpers are the shared bridge between solver output and rendered cube state.
export function applyMoveToFacelets(facelets, move) {
  const token = normalizeMove(move);
  let next = facelets;
  const turns = token.endsWith('2') ? 2 : token.endsWith("'") ? 3 : 1;

  for (let turn = 0; turn < turns; turn += 1) {
    next = applyQuarterTurn(next, token[0]);
  }

  return next;
}

export function applyAlgorithmToFacelets(facelets, algorithm) {
  return parseAlgorithm(algorithm).reduce(
    (next, move) => applyMoveToFacelets(next, move),
    facelets
  );
}

export function getFaceletIndex(position, face) {
  const { x, y, z } = position;

  switch (face) {
    case 'U':
      return z * 3 + x;
    case 'R':
      return 9 + (2 - y) * 3 + (2 - z);
    case 'F':
      return 18 + (2 - y) * 3 + x;
    case 'D':
      return 27 + (2 - z) * 3 + x;
    case 'L':
      return 36 + (2 - y) * 3 + z;
    case 'B':
      return 45 + (2 - y) * 3 + (2 - x);
    default:
      throw new Error(`Unsupported face "${face}"`);
  }
}

// Each cubie only stores the stickers that are visible from its current grid position.
export function createCubieStickerMap(facelets, position) {
  const stickers = {};

  if (position.y === 2) {
    stickers.U = facelets[getFaceletIndex(position, 'U')];
  }

  if (position.x === 2) {
    stickers.R = facelets[getFaceletIndex(position, 'R')];
  }

  if (position.z === 2) {
    stickers.F = facelets[getFaceletIndex(position, 'F')];
  }

  if (position.y === 0) {
    stickers.D = facelets[getFaceletIndex(position, 'D')];
  }

  if (position.x === 0) {
    stickers.L = facelets[getFaceletIndex(position, 'L')];
  }

  if (position.z === 0) {
    stickers.B = facelets[getFaceletIndex(position, 'B')];
  }

  return stickers;
}

export function toFaceletString(cubies) {
  if (!cubies.length) {
    return SOLVED_FACELETS;
  }

  const facelets = Array(54).fill(null);

  cubies.forEach((cubie) => {
    const position = cubie.currentPosition ?? cubie.logicalPosition;

    Object.entries(cubie.stickers ?? {}).forEach(([face, sticker]) => {
      facelets[getFaceletIndex(position, face)] = sticker;
    });
  });

  if (facelets.some((sticker) => !sticker)) {
    throw new Error('Cubies do not describe a complete cube state');
  }

  return facelets.join('');
}
