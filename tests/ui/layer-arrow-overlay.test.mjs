import { expect, test } from 'vitest';

import { computeLayerArrowLayout } from '../../ui/LayerArrowOverlay.js';

test('computeLayerArrowLayout keeps the arrow ring centered on the cube bounds', () => {
  const layout = computeLayerArrowLayout({
    buttonSize: 52,
    captionHeight: 56,
    cubeBounds: {
      centerX: 210,
      centerY: 180,
      height: 144,
      width: 144,
    },
    overlayBounds: {
      height: 420,
      width: 420,
    },
  });

  expect(layout.captionTop).toBeGreaterThan(layout.positions.bottom[1].y);
  expect(layout.positions.top[1].x).toBe(210);
  expect(layout.positions.bottom[1].x).toBe(210);
  expect(layout.positions.left[1].y).toBe(180);
  expect(layout.positions.right[1].y).toBe(180);
  expect(layout.positions.top[0].x).toBeLessThan(210);
  expect(layout.positions.top[2].x).toBeGreaterThan(210);
  expect(layout.positions.left[1].x).toBeLessThan(210 - 72);
  expect(layout.positions.right[1].x).toBeGreaterThan(210 + 72);
});

test('computeLayerArrowLayout keeps every control inside a tight mobile overlay', () => {
  const layout = computeLayerArrowLayout({
    buttonSize: 46,
    captionHeight: 52,
    cubeBounds: {
      centerX: 194,
      centerY: 206,
      height: 150,
      width: 150,
    },
    overlayBounds: {
      height: 470,
      width: 388,
    },
  });

  Object.values(layout.positions)
    .flat()
    .forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(23);
      expect(x).toBeLessThanOrEqual(388 - 23);
      expect(y).toBeGreaterThanOrEqual(23);
      expect(y).toBeLessThanOrEqual(470 - 23);
    });
});
