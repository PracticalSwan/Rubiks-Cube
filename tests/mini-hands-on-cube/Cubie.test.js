import { describe, expect, test, jest } from '@jest/globals';
import { Cubie } from '../../core/Cubie.js';

describe('Cubie', () => {
  test('attaches itself to the mesh and syncs transforms', () => {
    const mesh = {
      position: { set: jest.fn() },
      rotation: { x: 1, y: 1, z: 1 },
      userData: {}
    };

    const cubie = new Cubie({ x: 0, y: 0, z: 0 }, { F: 'F' }, () => mesh);

    expect(mesh.userData.cubie).toBe(cubie);
    expect(mesh.position.set).toHaveBeenLastCalledWith(-1.05, -1.05, -1.05);

    cubie.setPosition({ x: 2, y: 1, z: 0 });

    expect(mesh.position.set).toHaveBeenLastCalledWith(1.05, 0, -1.05);
    expect(mesh.rotation).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('updates stickers through the mesh hook', () => {
    const applyStickers = jest.fn();
    const mesh = {
      position: { set: jest.fn() },
      rotation: { x: 0, y: 0, z: 0 },
      userData: { applyStickers }
    };

    const cubie = new Cubie({ x: 1, y: 1, z: 1 }, { F: 'F' }, () => mesh);

    cubie.setStickers({ R: 'R' });

    expect(applyStickers).toHaveBeenCalledWith({ R: 'R' });
  });
});
