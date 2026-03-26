// Lightweight cubie model that keeps one visible sub-cube aligned with puzzle state and scene state.
const DEFAULT_SPACING = 1.05;

// A Cubie keeps puzzle state and mesh state traveling together as turns are applied.
export class Cubie {
  constructor(logicalPosition, stickers, createMesh, { spacing } = {}) {
    this.logicalPosition = { ...logicalPosition };
    this.currentPosition = { ...logicalPosition };
    this.solvedPosition = { ...logicalPosition };
    this.solvedStickers = { ...stickers };
    this.stickers = { ...stickers };
    this.spacing = spacing ?? DEFAULT_SPACING;
    this.mesh = createMesh(this.stickers, this.logicalPosition);
    this.mesh.userData = this.mesh.userData ?? {};
    this.mesh.userData.cubie = this;
    this.syncTransform();
  }

  syncTransform() {
    // Grid coordinates are projected into centered scene coordinates here instead of at call sites.
    const { x, y, z } = this.currentPosition;

    this.mesh.position?.set?.(
      (x - 1) * this.spacing,
      (y - 1) * this.spacing,
      (z - 1) * this.spacing
    );

    if (this.mesh.rotation) {
      this.mesh.rotation.x = 0;
      this.mesh.rotation.y = 0;
      this.mesh.rotation.z = 0;
    }
  }

  setPosition(position) {
    this.currentPosition = { ...position };
    this.syncTransform();
  }

  setStickers(stickers) {
    // The mesh never owns sticker truth; it only mirrors the latest cube state.
    this.stickers = { ...stickers };
    this.mesh.userData?.applyStickers?.(this.stickers);
  }

  matchesSolvedPosition() {
    const { currentPosition, solvedPosition } = this;

    return (
      currentPosition.x === solvedPosition.x &&
      currentPosition.y === solvedPosition.y &&
      currentPosition.z === solvedPosition.z
    );
  }

  belongsToLayer(axis, value) {
    return this.currentPosition[axis] === value;
  }
}
