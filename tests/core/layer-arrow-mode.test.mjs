// Layer-arrow tests verify the face-lock math that keeps row and column gestures deterministic.
import { expect, test } from 'vitest';
import { Euler, Vector3 } from 'three';

import {
  getFaceView,
  getFaceLockRotation,
  getLayerArrowControls,
  resolveLayerArrowMove,
} from '../../core/LayerArrowMode.js';

test('getFaceView keeps the top face upright when it is snapped to the front', () => {
  expect(getFaceView('U')).toEqual({
    eyeDirection: [0, 1, 0],
    upDirection: [0, 0, -1],
    rightDirection: [1, 0, 0],
  });
});

test('resolveLayerArrowMove maps front-face arrows to the expected slice tokens', () => {
  expect(resolveLayerArrowMove('F', { axis: 'column', index: 0, direction: 'up' })).toBe("M'");
  expect(resolveLayerArrowMove('F', { axis: 'row', index: 1, direction: 'left' })).toBe('U');
});

test('resolveLayerArrowMove remaps arrows when a different face is locked to the camera', () => {
  expect(resolveLayerArrowMove('B', { axis: 'column', index: 0, direction: 'up' })).toBe('M');
  expect(resolveLayerArrowMove('U', { axis: 'row', index: 1, direction: 'left' })).toBe('B');
});

test('getFaceLockRotation always makes the selected face a flat front view', () => {
  ['F', 'B', 'R', 'L', 'U', 'D'].forEach((face) => {
    const rotation = new Euler(...getFaceLockRotation(face));
    const view = getFaceView(face);
    const normal = new Vector3(...view.eyeDirection).applyEuler(rotation);
    const up = new Vector3(...view.upDirection).applyEuler(rotation);
    const normalizeAxis = (vector) =>
      vector.toArray().map((value) => {
        const rounded = Math.round(value);
        return Object.is(rounded, -0) ? 0 : rounded;
      });

    expect(normalizeAxis(normal)).toEqual([0, 0, 1]);
    expect(normalizeAxis(up)).toEqual([0, 1, 0]);
  });
});

test('getLayerArrowControls returns 12 persistent controls with human-friendly labels', () => {
  const controls = getLayerArrowControls('R');

  expect(controls).toHaveLength(12);
  expect(controls.map((control) => control.id)).toContain('column-left-up');
  expect(controls.map((control) => control.id)).toContain('row-bottom-right');
  expect(controls.find((control) => control.id === 'column-middle-up')).toMatchObject({
    move: "S'",
    tooltip: 'Turn middle column up',
  });
});
