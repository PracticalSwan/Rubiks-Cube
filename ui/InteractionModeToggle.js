// The interaction toggle renders the current control scheme without coupling the UI to app-state internals.
import { escapeHtml } from './escapeHtml.js';

const MODES = [
  {
    value: 'classic',
    label: 'Classic Face Turn Mode',
    copy: 'Keep the existing face selector plus clockwise and counterclockwise turns.',
  },
  {
    value: 'arrow',
    label: 'Layer Arrow Mode',
    copy: 'Lock a selected face forward and drive rows or columns with 12 persistent arrows.',
  },
];

export function renderInteractionModeToggle(container, props) {
  const { currentMode, onChange } = props;

  container.innerHTML = `
    <h3>Interaction mode</h3>
    <div class="mode-toggle" role="radiogroup" aria-label="Cube interaction mode">
      ${MODES.map(
        (mode) => `
          <label class="mode-option" data-selected="${mode.value === currentMode}">
            <input
              type="radio"
              name="interaction-mode"
              value="${mode.value}"
              ${mode.value === currentMode ? 'checked' : ''}
            />
            <span class="mode-option__title">${escapeHtml(mode.label)}</span>
            <span class="mode-option__copy">${escapeHtml(mode.copy)}</span>
          </label>
        `
      ).join('')}
    </div>
  `;

  container.querySelectorAll('input[name="interaction-mode"]').forEach((input) => {
    input.addEventListener('change', () => onChange(input.value));
  });
}
