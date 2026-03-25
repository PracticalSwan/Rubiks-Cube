export function renderDirectionalPad(container, props) {
  const { selectedFace, isBusy, onTurn } = props;

  if (!selectedFace) {
    container.innerHTML = `
      <h3>Turn controls</h3>
      <p class="empty-copy">Pick a face to unlock the directional pad.</p>
    `;
    return;
  }

  container.innerHTML = `
    <h3>Turn ${selectedFace}</h3>
    <div class="direction-grid">
      <button
        type="button"
        class="direction-button"
        data-turn="clockwise"
        ${isBusy ? 'disabled' : ''}
      >
        <span class="direction-title">Clockwise</span>
        <span class="direction-copy">Play a standard ${selectedFace} turn.</span>
      </button>
      <button
        type="button"
        class="direction-button"
        data-turn="counterclockwise"
        ${isBusy ? 'disabled' : ''}
      >
        <span class="direction-title">Counterclockwise</span>
        <span class="direction-copy">Play ${selectedFace}' through the queue.</span>
      </button>
    </div>
  `;

  container.querySelectorAll('[data-turn]').forEach((button) => {
    button.addEventListener('click', () =>
      onTurn(selectedFace, button.dataset.turn)
    );
  });
}
