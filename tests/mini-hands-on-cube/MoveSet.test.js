import { describe, expect, test } from '@jest/globals';
import { MoveSet } from '../../core/MoveSet.js';

describe('MoveSet', () => {
  test('tracks queued and active moves', () => {
    const moveSet = new MoveSet({ duration: 0.25 });
    const batch = {};

    moveSet.enqueue('R', batch);
    moveSet.enqueue('U', batch);

    expect(moveSet.pendingMoves).toHaveLength(2);

    const next = moveSet.dequeue();
    moveSet.start(next, { axis: 'x' });

    expect(moveSet.isAnimating).toBe(true);
    expect(moveSet.activeMove.move).toBe('R');

    const done = moveSet.complete();

    expect(done.move).toBe('R');
    expect(moveSet.pendingMoves).toHaveLength(1);
  });

  test('cancels active and queued work', () => {
    const moveSet = new MoveSet();

    moveSet.enqueue('F');
    moveSet.start(moveSet.dequeue(), { axis: 'z' });
    moveSet.enqueue("F'");

    const canceled = moveSet.cancel();

    expect(canceled.active.move).toBe('F');
    expect(canceled.pending).toHaveLength(1);
    expect(moveSet.isAnimating).toBe(false);
    expect(moveSet.pendingMoves).toHaveLength(0);
  });
});
