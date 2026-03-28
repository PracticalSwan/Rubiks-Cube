// Renders the face picker using live center colors instead of fixed solver notation.
import { escapeHtml } from './escapeHtml.js';

// The selector translates internal face notation into the player-facing color language.
export function renderFaceSelector(container, props) {
  const { isBusy, onSelect, options = [], selectedColor } = props;

  // Swatches mirror sticker colors so the chosen label matches the rendered cube face immediately.
  container.innerHTML = `
    <h3>Choose a center color</h3>
    <div class="face-grid">
      ${options
        .map(
          (option) => `
          <button
            type="button"
            class="face-button"
            data-face="${option.colorFace}"
            data-selected="${selectedColor === option.colorFace}"
            aria-pressed="${selectedColor === option.colorFace}"
            style="--face-button-tint: ${option.buttonTint}; --face-button-color: ${option.color};"
            ${isBusy ? 'disabled' : ''}
          >
            <span class="face-swatch" aria-hidden="true"></span>
            <span class="face-text">
              <span class="face-label">${escapeHtml(option.label)}</span>
              <span class="face-copy">Currently on the ${escapeHtml(option.currentPositionLabel.toLowerCase())} face</span>
            </span>
          </button>
        `
        )
        .join('')}
    </div>
  `;

  // Full rerenders keep selection and disabled states simple without a component framework.
  container.querySelectorAll('[data-face]').forEach((button) => {
    button.addEventListener('click', () => onSelect(button.dataset.face));
  });
}
