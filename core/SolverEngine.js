// Thin wrapper around cubejs that handles warm-up, error mapping, solving, and random-state scrambles.
import { parseAlgorithm } from './CubeNotation.js';

function mapSolverError(error) {
  const message = error?.message ?? String(error);
  const stableError = new Error(message);

  if (/invalid|facelet|fromstring/i.test(message)) {
    stableError.code = 'INVALID_FACELETS';
    return stableError;
  }

  if (/solvable|parity|twist|flip/i.test(message)) {
    stableError.code = 'IMPOSSIBLE_STATE';
    return stableError;
  }

  stableError.code = 'SOLVER_ERROR';
  return stableError;
}

export class SolverEngine {
  constructor({
    CubeClass,
    scheduleIdle = (callback) => {
      if (typeof globalThis.requestIdleCallback === 'function') {
        return globalThis.requestIdleCallback(callback);
      }

      return setTimeout(callback, 0);
    }
  }) {
    this.CubeClass = CubeClass;
    this.scheduleIdle = scheduleIdle;
    this.warmPromise = null;
    this.ready = false;
  }

  isReady() {
    return this.ready;
  }

  async warm() {
    if (!this.warmPromise) {
      // cubejs precomputes lookup tables; caching the promise avoids duplicate
      // warm-up work when scramble and solve are clicked close together.
      this.warmPromise = Promise.resolve(this.CubeClass.initSolver()).then(() => {
        this.ready = true;
      });
    }

    await this.warmPromise;
  }

  warmInIdle() {
    return new Promise((resolve, reject) => {
      this.scheduleIdle(async () => {
        try {
          await this.warm();
          resolve();
        } catch (error) {
          reject(mapSolverError(error));
        }
      });
    });
  }

  async solve(facelets) {
    try {
      await this.warm();
      const cube = this.CubeClass.fromString(facelets);
      return parseAlgorithm(cube.solve());
    } catch (error) {
      throw mapSolverError(error);
    }
  }

  async createRandomStateScramble() {
    try {
      await this.warm();
      // Use cubejs random-state scrambles instead of ad-hoc turn shuffles so
      // the generated positions reflect the real state space of the puzzle.
      return parseAlgorithm(this.CubeClass.scramble());
    } catch (error) {
      throw mapSolverError(error);
    }
  }
}
