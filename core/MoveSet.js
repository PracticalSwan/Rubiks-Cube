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
