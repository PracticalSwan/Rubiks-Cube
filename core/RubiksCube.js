import {
  MOVE_FACES,
  SOLVED_FACELETS,
  applyAlgorithmToFacelets,
  applyMoveToFacelets,
  createCubieStickerMap,
  parseAlgorithm,
  toFaceletString
} from './CubeNotation.js';
import { Cubie } from './Cubie.js';
import { MoveSet } from './MoveSet.js';

const MOVE_CONFIG = {
  U: { axis: 'y', layer: 2, angleSign: -1 },
  D: { axis: 'y', layer: 0, angleSign: 1 },
  R: { axis: 'x', layer: 2, angleSign: -1 },
  L: { axis: 'x', layer: 0, angleSign: 1 },
  F: { axis: 'z', layer: 2, angleSign: -1 },
  B: { axis: 'z', layer: 0, angleSign: 1 }
};

function createBatch(moves) {
  let resolve;
  let reject;
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return {
    moves: [...moves],
    remaining: moves.length,
    resolve,
    reject,
    promise
  };
}

function createCanceledError() {
  const error = new Error('Playback stopped');
  error.code = 'PLAYBACK_CANCELLED';
  return error;
}

function getMoveInfo(move) {
  const base = move[0];
  const turns = move.endsWith('2') ? 2 : 1;
  const direction = move.endsWith("'") ? -1 : 1;
  const config = MOVE_CONFIG[base];

  return {
    ...config,
    angle: config.angleSign * direction * turns * (Math.PI / 2)
  };
}

export class RubiksCube {
  constructor({
    createMesh,
    createGroup,
    spacing = 1.05,
    animationDuration = 0.18
  }) {
    this.createMesh = createMesh;
    this.createGroup = createGroup;
    this.spacing = spacing;
    this.group = createGroup();
    this.facelets = SOLVED_FACELETS;
    this.cubies = [];
    this.moveSet = new MoveSet({ duration: animationDuration });
    this.pendingBatches = new Set();
    this.build();
  }

  build() {
    for (let x = 0; x < 3; x += 1) {
      for (let y = 0; y < 3; y += 1) {
        for (let z = 0; z < 3; z += 1) {
          const position = { x, y, z };
          const cubie = new Cubie(
            position,
            createCubieStickerMap(this.facelets, position),
            this.createMesh,
            { spacing: this.spacing }
          );

          this.cubies.push(cubie);
          this.group.add?.(cubie.mesh);
        }
      }
    }
  }

  syncCubiesFromFacelets() {
    this.cubies.forEach((cubie) => {
      cubie.setStickers(createCubieStickerMap(this.facelets, cubie.currentPosition));
      cubie.syncTransform();
    });
  }

  isSolved() {
    return this.facelets === SOLVED_FACELETS;
  }

  hasPendingWork() {
    return this.moveSet.hasWork();
  }

  setFacelets(facelets) {
    this.facelets = facelets;
    this.syncCubiesFromFacelets();
  }

  reset() {
    this.setFacelets(SOLVED_FACELETS);
  }

  applyMove(move) {
    this.facelets = applyMoveToFacelets(this.facelets, move);
    this.syncCubiesFromFacelets();
    return this.facelets;
  }

  applyAlgorithm(algorithm) {
    this.facelets = applyAlgorithmToFacelets(this.facelets, algorithm);
    this.syncCubiesFromFacelets();
    return this.facelets;
  }

  toFaceletString() {
    return toFaceletString(this.cubies);
  }

  generateScramble(length = 20, random = Math.random) {
    const scramble = [];

    while (scramble.length < length) {
      const face = MOVE_FACES[Math.floor(random() * MOVE_FACES.length)];
      const suffix = random() > 0.5 ? "'" : '';
      const token = `${face}${suffix}`;

      if (!scramble.length || scramble[scramble.length - 1][0] !== face) {
        scramble.push(token);
      }
    }

    return scramble;
  }

  queueMove(move) {
    return this.queueMoves([move]);
  }

  queueMoves(moves) {
    const tokens = parseAlgorithm(moves);

    if (!tokens.length) {
      return Promise.resolve([]);
    }

    const batch = createBatch(tokens);
    this.pendingBatches.add(batch);
    this.moveSet.enqueueMany(tokens, batch);
    return batch.promise;
  }

  playSolution(moves) {
    return this.queueMoves(moves);
  }

  cancelPlayback() {
    const canceled = this.moveSet.cancel();
    const batches = new Set();

    if (canceled.active) {
      this.resetPivot(canceled.active.pivot, canceled.active.cubies);
      if (canceled.active.batch) {
        batches.add(canceled.active.batch);
      }
    }

    canceled.pending.forEach((item) => {
      if (item.batch) {
        batches.add(item.batch);
      }
    });

    batches.forEach((batch) => {
      if (this.pendingBatches.has(batch)) {
        this.pendingBatches.delete(batch);
        batch.reject(createCanceledError());
      }
    });
  }

  update(delta = 1 / 60) {
    if (!this.moveSet.isAnimating && this.moveSet.pendingMoves.length) {
      this.startNextAnimation();
    }

    if (!this.moveSet.activeMove) {
      return;
    }

    const activeMove = this.moveSet.activeMove;
    activeMove.progress = Math.min(
      1,
      activeMove.progress + delta / activeMove.duration
    );

    if (activeMove.pivot) {
      activeMove.pivot.rotation[activeMove.axis] =
        activeMove.angle * activeMove.progress;
    }

    if (activeMove.progress >= 1) {
      this.completeActiveMove();
    }
  }

  startNextAnimation() {
    const queued = this.moveSet.dequeue();

    if (!queued) {
      return;
    }

    const info = getMoveInfo(queued.move);
    const pivot = this.createGroup();

    if (!pivot.rotation) {
      pivot.rotation = { x: 0, y: 0, z: 0 };
    } else {
      pivot.rotation.x ??= 0;
      pivot.rotation.y ??= 0;
      pivot.rotation.z ??= 0;
    }

    const cubies = this.cubies.filter((cubie) =>
      cubie.belongsToLayer(info.axis, info.layer)
    );

    this.group.add?.(pivot);

    cubies.forEach((cubie) => {
      this.group.remove?.(cubie.mesh);
      pivot.add?.(cubie.mesh);
    });

    this.moveSet.start(queued, {
      ...info,
      cubies,
      pivot
    });
  }

  completeActiveMove() {
    const activeMove = this.moveSet.complete();

    if (!activeMove) {
      return;
    }

    this.resetPivot(activeMove.pivot, activeMove.cubies);
    this.facelets = applyMoveToFacelets(this.facelets, activeMove.move);
    this.syncCubiesFromFacelets();

    if (activeMove.batch) {
      activeMove.batch.remaining -= 1;

      if (activeMove.batch.remaining <= 0) {
        this.pendingBatches.delete(activeMove.batch);
        activeMove.batch.resolve(activeMove.batch.moves);
      }
    }
  }

  resetPivot(pivot, cubies = []) {
    if (!pivot) {
      return;
    }

    if (pivot.rotation) {
      pivot.rotation.x = 0;
      pivot.rotation.y = 0;
      pivot.rotation.z = 0;
    }

    cubies.forEach((cubie) => {
      pivot.remove?.(cubie.mesh);
      this.group.add?.(cubie.mesh);
      cubie.syncTransform();
    });

    this.group.remove?.(pivot);
  }
}
