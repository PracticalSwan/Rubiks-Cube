// Renders the selected-face turn controls and keeps manual move choices readable to non-cubers.
import { escapeHtml } from './escapeHtml.js';

// The direction pad stays locked until a face is chosen so demo spin and manual intent never clash.
export function renderDirectionalPad(container, props) {
  const { selectedFace, selectedLabel, selectedPositionLabel, isBusy, onTurn } = props;

  if (!selectedFace) {
    container.innerHTML = `
      <h3>Turn controls</h3>
      <p class="empty-copy">
        Choose a color to pause the demo spin and unlock turn controls.
      </p>
    `;
    return;
  }

  const faceLabel = selectedLabel || selectedFace;
  const positionLabel = selectedPositionLabel
    ? ` on the current ${selectedPositionLabel.toLowerCase()} face`
    : '';

  // The copy repeats the selected color so turns read like instructions, not cube notation drills.
  container.innerHTML = `
    <h3>Turn ${escapeHtml(faceLabel)}</h3>
    <div class="direction-grid">
      <button
        type="button"
        class="direction-button"
        data-turn="clockwise"
        ${isBusy ? 'disabled' : ''}
      >
        <span class="direction-title">Clockwise</span>
        <span class="direction-copy">Play a standard ${escapeHtml(faceLabel)} turn${escapeHtml(positionLabel)}.</span>
      </button>
      <button
        type="button"
        class="direction-button"
        data-turn="counterclockwise"
        ${isBusy ? 'disabled' : ''}
      >
        <span class="direction-title">Counterclockwise</span>
        <span class="direction-copy">
          Play ${escapeHtml(faceLabel)} counterclockwise${escapeHtml(positionLabel)} through the queue.
        </span>
      </button>
    </div>
  `;

  // Listeners are rebound on each render because the entire panel is replaced with fresh markup.
  container.querySelectorAll('[data-turn]').forEach((button) => {
    button.addEventListener('click', () => onTurn(selectedFace, button.dataset.turn));
  });
}
