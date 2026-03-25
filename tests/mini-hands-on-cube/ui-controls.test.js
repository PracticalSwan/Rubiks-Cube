import { describe, expect, test, jest } from '@jest/globals';
import { renderDirectionalPad } from '../../ui/DirectionalPad.js';
import { renderFaceSelector } from '../../ui/FaceSelector.js';
import { renderUtilityControls } from '../../ui/UtilityControls.js';

describe('ui controls', () => {
  test('renders Solve and Stop buttons with busy-state locking', () => {
    document.body.innerHTML = '<div id="utility-controls"></div>';

    renderUtilityControls(document.getElementById('utility-controls'), {
      isBusy: true,
      solverReady: false,
      onReset: jest.fn(),
      onRandomize: jest.fn(),
      onSolve: jest.fn(),
      onStop: jest.fn(),
      status: 'Warming solver'
    });

    expect(document.querySelector('[data-action="solve"]').disabled).toBe(true);
    expect(document.querySelector('[data-action="stop"]').disabled).toBe(false);
  });

  test('wires face selection and turn buttons to callbacks', () => {
    const onSelect = jest.fn();
    const onTurn = jest.fn();

    document.body.innerHTML =
      '<div id="face-selector"></div><div id="directional-pad"></div>';

    renderFaceSelector(document.getElementById('face-selector'), {
      selectedFace: 'F',
      isBusy: false,
      onSelect
    });
    renderDirectionalPad(document.getElementById('directional-pad'), {
      selectedFace: 'F',
      isBusy: false,
      onTurn
    });

    document.querySelector('[data-face="R"]').click();
    document.querySelector('[data-turn="clockwise"]').click();

    expect(onSelect).toHaveBeenCalledWith('R');
    expect(onTurn).toHaveBeenCalledWith('F', 'clockwise');
  });
});
