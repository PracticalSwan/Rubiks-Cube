export function renderUtilityControls(container, props) {
  const {
    isBusy,
    solverReady,
    onReset,
    onRandomize,
    onSolve,
    onStop,
    status
  } = props;

  container.innerHTML = `
    <h3>Utility controls</h3>
    <div class="utility-grid">
      <button type="button" class="control-button" data-action="reset" ${
        isBusy ? 'disabled' : ''
      }>Reset</button>
      <button type="button" class="control-button" data-action="randomize" ${
        isBusy ? 'disabled' : ''
      }>Randomize</button>
      <button type="button" class="control-button" data-action="solve" ${
        !solverReady || isBusy ? 'disabled' : ''
      }>Solve</button>
      <button type="button" class="control-button" data-action="stop" ${
        isBusy ? '' : 'disabled'
      }>Stop</button>
    </div>
    <div class="status-block">
      <span class="status-label">Status</span>
      <p aria-live="polite" class="status-copy" data-role="status">${status}</p>
    </div>
  `;

  container.querySelector('[data-action="reset"]').addEventListener('click', onReset);
  container
    .querySelector('[data-action="randomize"]')
    .addEventListener('click', onRandomize);
  container.querySelector('[data-action="solve"]').addEventListener('click', onSolve);
  container.querySelector('[data-action="stop"]').addEventListener('click', onStop);
}
