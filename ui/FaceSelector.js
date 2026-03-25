const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];

export function renderFaceSelector(container, props) {
  const { selectedFace, isBusy, onSelect } = props;

  container.innerHTML = `
    <h3>Choose a face</h3>
    <div class="face-grid">
      ${FACES.map(
        (face) => `
          <button
            type="button"
            class="face-button"
            data-face="${face}"
            data-selected="${selectedFace === face}"
            aria-pressed="${selectedFace === face}"
            ${isBusy ? 'disabled' : ''}
          >
            ${face}
          </button>
        `
      ).join('')}
    </div>
  `;

  container.querySelectorAll('[data-face]').forEach((button) => {
    button.addEventListener('click', () => onSelect(button.dataset.face));
  });
}
