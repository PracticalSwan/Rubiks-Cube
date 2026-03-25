import { describe, expect, test, jest } from '@jest/globals';
import { SolverEngine } from '../../core/SolverEngine.js';

describe('SolverEngine', () => {
  test('warms the solver once and returns parsed moves', async () => {
    const CubeClass = {
      initSolver: jest.fn(),
      fromString: jest.fn(() => ({
        solve: () => "R U R' U'"
      }))
    };

    const engine = new SolverEngine({ CubeClass });
    const moves = await engine.solve(
      'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'
    );

    expect(CubeClass.initSolver).toHaveBeenCalledTimes(1);
    expect(engine.isReady()).toBe(true);
    expect(moves).toEqual(['R', 'U', "R'", "U'"]);
  });

  test('maps invalid facelets into a stable error code', async () => {
    const CubeClass = {
      initSolver: jest.fn(),
      fromString: jest.fn(() => {
        throw new Error('Invalid facelets');
      })
    };

    const engine = new SolverEngine({ CubeClass });

    await expect(engine.solve('invalid')).rejects.toMatchObject({
      code: 'INVALID_FACELETS'
    });
  });

  test('warms during idle time when a scheduler is provided', async () => {
    const CubeClass = {
      initSolver: jest.fn(),
      fromString: jest.fn()
    };
    const scheduleIdle = jest.fn((callback) => callback());
    const engine = new SolverEngine({ CubeClass, scheduleIdle });

    await engine.warmInIdle();

    expect(scheduleIdle).toHaveBeenCalledTimes(1);
    expect(engine.isReady()).toBe(true);
  });
});
