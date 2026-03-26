// Queue primitive used to serialize every animated move regardless of where it originated.
// MoveSet is the single queue for manual turns, scrambles, and solver playback batches.
export class MoveSet {
  constructor({ duration = 0.18 } = {}) {
    this.duration = duration;
    this.pendingMoves = [];
    this.activeMove = null;
    this.isAnimating = false;
  }

  enqueue(move, batch = null) {
    const item =
      typeof move === 'string' ? { move, batch, duration: this.duration } : move;

    this.pendingMoves.push(item);
    return item;
  }

  enqueueMany(moves, batch = null) {
    return moves.map((move) => this.enqueue(move, batch));
  }

  dequeue() {
    return this.pendingMoves.shift() ?? null;
  }

  start(item, details = {}) {
    // Per-move animation state is expanded once so the frame loop can stay allocation-light.
    this.activeMove = { ...item, progress: 0, ...details };
    this.isAnimating = true;
    return this.activeMove;
  }

  complete() {
    const finished = this.activeMove;
    this.activeMove = null;
    this.isAnimating = false;
    return finished;
  }

  clear() {
    const pending = [...this.pendingMoves];
    this.pendingMoves = [];
    return pending;
  }

  cancel() {
    // Cancel returns both active and queued work so higher layers can reject promises cleanly.
    const active = this.activeMove;
    const pending = this.clear();

    this.activeMove = null;
    this.isAnimating = false;

    return { active, pending };
  }

  hasWork() {
    return this.isAnimating || this.pendingMoves.length > 0;
  }
}
