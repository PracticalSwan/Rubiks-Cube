import { BoxGeometry, EdgesGeometry, LineBasicMaterial } from 'three';
import { expect, test } from 'vitest';

import { createCubieMeshFactory } from '../../core/createCubieMeshFactory.js';

const materialFaces = ['R', 'L', 'U', 'D', 'F', 'B'];
const STICKER_COLORS = {
  B: '#335fd1',
  D: '#ffd45c',
  F: '#35b66a',
  L: '#ef8b34',
  R: '#d84f3f',
  U: '#f5f5f5',
};

function getStickerColor(sticker) {
  return STICKER_COLORS[sticker] ?? '#0f1726';
}

function createStickerMap(overrides = {}) {
  return {
    R: null,
    L: null,
    U: null,
    D: null,
    F: null,
    B: null,
    ...overrides,
  };
}

test('createCubieMeshFactory reuses shared sticker materials and keeps transforms manual', () => {
  const cubieGeometry = new BoxGeometry(0.94, 0.94, 0.94);
  const edgeGeometry = new EdgesGeometry(cubieGeometry);
  const edgeMaterial = new LineBasicMaterial({ color: 0x07111c });
  const createCubieMesh = createCubieMeshFactory({
    cubieGeometry,
    edgeGeometry,
    edgeMaterial,
    materialFaces,
    getStickerColor,
  });

  const firstMesh = createCubieMesh(createStickerMap({ F: 'F', U: 'U' }));
  const secondMesh = createCubieMesh(createStickerMap({ F: 'F', U: 'U' }));

  expect(firstMesh.matrixAutoUpdate).toBe(false);
  expect(firstMesh.children[0].matrixAutoUpdate).toBe(false);
  expect(firstMesh.material[4]).toBe(secondMesh.material[4]);
  expect(firstMesh.material[2]).toBe(secondMesh.material[2]);
  expect(firstMesh.material[0]).toBe(secondMesh.material[0]);

  firstMesh.userData.applyStickers(createStickerMap({ F: 'R', U: 'U' }));

  expect(firstMesh.material[4].color.getHexString()).toBe('d84f3f');
  expect(secondMesh.material[4].color.getHexString()).toBe('35b66a');
  expect(firstMesh.material[2]).toBe(secondMesh.material[2]);
});
