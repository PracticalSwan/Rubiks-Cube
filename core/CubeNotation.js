export const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'];

export const FACE_COLORS = {
  U: '#f5f5f5',
  R: '#d84f3f',
  F: '#35b66a',
  D: '#ffd45c',
  L: '#ef8b34',
  B: '#335fd1'
};

export const MOVE_FACES = ['U', 'D', 'R', 'L', 'F', 'B'];

export const SOLVED_FACELETS =
  'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

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
