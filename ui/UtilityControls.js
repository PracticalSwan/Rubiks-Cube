// Renders app-wide actions plus the solve metadata that hangs off the last playback.
import { escapeHtml } from './escapeHtml.js';

// Utility controls collect app-wide actions so solve metadata and playback controls stay together.
export function renderUtilityControls(container, props) {
  const {
    canRevert,
    canShowMoves,
    canZoomIn,
    canZoomOut,
    isBusy,
    lastSolvePlan,
    moveCount,
    moveListOpen,
    onReset,
    onRandomize,
    onRevert,
    onSolve,
    onStop,
    onToggleMoves,
    onZoomIn,
    onZoomOut,
    solverReady,
    status,
  } = props;

  // The whole panel is regenerated from state so button availability and move details never drift apart.
  container.innerHTML = `
    <h3>Utility controls</h3>
    <div class="utility-grid utility-grid--utilities">
      <button type="button" class="control-button" data-action="reset" ${
        isBusy ? 'disabled' : ''
      }>Reset</button>
      <button type="button" class="control-button" data-action="randomize" ${
        !solverReady || isBusy ? 'disabled' : ''
      }>Randomize</button>
      <button type="button" class="control-button" data-action="solve" ${
        !solverReady || isBusy ? 'disabled' : ''
      }>Solve</button>
      <button type="button" class="control-button" data-action="moves" ${
        !canShowMoves ? 'disabled' : ''
      }>${moveListOpen ? 'Hide moves' : 'Show moves'}</button>
      <button type="button" class="control-button" data-action="revert" ${
        !canRevert ? 'disabled' : ''
      }>Revert solve</button>
      <button type="button" class="control-button" data-action="stop" ${
        isBusy ? '' : 'disabled'
      }>Stop</button>
    </div>
    <div class="zoom-strip">
      <span class="zoom-label">Zoom</span>
      <div class="zoom-buttons">
        <button type="button" class="control-button control-button--compact" data-action="zoom-out" ${
          !canZoomOut ? 'disabled' : ''
        } aria-label="Zoom out">-</button>
        <button type="button" class="control-button control-button--compact" data-action="zoom-in" ${
          !canZoomIn ? 'disabled' : ''
        } aria-label="Zoom in">+</button>
      </div>
      <p class="zoom-copy">
        Zoom is button-only so wheel and touch stay focused on orbiting the cube.
      </p>
    </div>
    ${
      lastSolvePlan
        ? `
          <div class="move-plan" data-open="${moveListOpen}">
            <div class="move-plan-header">
              <span class="status-label">Last solve</span>
              <strong class="move-plan-title">${escapeHtml(lastSolvePlan.label)}</strong>
            </div>
            ${
              moveListOpen
                ? `<p class="move-plan-copy" data-role="move-copy">${escapeHtml(lastSolvePlan.moveText)}</p>`
                : ''
            }
          </div>
        `
        : ''
    }
    <div class="status-block">
      <div class="status-row">
        <span class="status-label">Status</span>
        <span class="status-meta">Recorded moves: ${moveCount}</span>
      </div>
      <p aria-live="polite" class="status-copy" data-role="status">${escapeHtml(status)}</p>
    </div>
  `;

  // Event listeners are rebound after each render because the prior DOM subtree was replaced wholesale.
  container.querySelector('[data-action="reset"]').addEventListener('click', onReset);
  container
    .querySelector('[data-action="randomize"]')
    .addEventListener('click', onRandomize);
  container.querySelector('[data-action="solve"]').addEventListener('click', onSolve);
  container.querySelector('[data-action="moves"]').addEventListener('click', onToggleMoves);
  container.querySelector('[data-action="revert"]').addEventListener('click', onRevert);
  container.querySelector('[data-action="stop"]').addEventListener('click', onStop);
  container.querySelector('[data-action="zoom-out"]').addEventListener('click', onZoomOut);
  container.querySelector('[data-action="zoom-in"]').addEventListener('click', onZoomIn);
}
