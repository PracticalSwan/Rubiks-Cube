// Renders the face picker using color language instead of solver notation.
import { FACE_DETAILS, FACE_ORDER } from '../core/CubeNotation.js';
import { escapeHtml } from './escapeHtml.js';

const FACES = FACE_ORDER;

// The selector translates internal face notation into the player-facing color language.
export function renderFaceSelector(container, props) {
  const { selectedFace, isBusy, onSelect } = props;

  // Swatches mirror sticker colors so the chosen label matches the rendered cube face immediately.
  container.innerHTML = `
    <h3>Choose a color</h3>
    <div class="face-grid">
      ${FACES.map(
        (face) => `
          <button
            type="button"
            class="face-button"
            data-face="${face}"
            data-selected="${selectedFace === face}"
            aria-pressed="${selectedFace === face}"
            style="--face-button-tint: ${FACE_DETAILS[face].buttonTint}; --face-button-color: ${FACE_DETAILS[face].color};"
            ${isBusy ? 'disabled' : ''}
          >
            <span class="face-swatch" aria-hidden="true"></span>
            <span class="face-label">${escapeHtml(FACE_DETAILS[face].label)}</span>
          </button>
        `
      ).join('')}
    </div>
  `;

  // Full rerenders keep selection and disabled states simple without a component framework.
  container.querySelectorAll('[data-face]').forEach((button) => {
    button.addEventListener('click', () => onSelect(button.dataset.face));
  });
}
