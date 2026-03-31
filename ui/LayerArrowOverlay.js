// Overlay helpers keep the 2D arrow ring aligned with the projected cube instead of the viewport frame.
import { escapeHtml } from './escapeHtml.js';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function computeLayerArrowLayout({
  buttonSize,
  captionHeight = 0,
  cubeBounds,
  overlayBounds,
}) {
  const safeButtonSize = Math.max(buttonSize, 1);
  const halfButton = safeButtonSize / 2;
  const outerGap = Math.max(12, Math.round(safeButtonSize * 0.42));
  const safeCubeWidth = Math.max(cubeBounds.width, safeButtonSize * 1.8);
  const safeCubeHeight = Math.max(cubeBounds.height, safeButtonSize * 1.8);
  const minX = halfButton + outerGap;
  const maxX = overlayBounds.width - halfButton - outerGap;
  const minY = halfButton + outerGap;
  const maxY = overlayBounds.height - halfButton - outerGap;
  const captionTop = overlayBounds.height - captionHeight - outerGap;
  const desiredHorizontalOffset = safeCubeWidth / 2 + safeButtonSize * 0.92 + outerGap;
  const desiredVerticalOffset = safeCubeHeight / 2 + safeButtonSize * 0.92 + outerGap;
  const horizontalOffset = Math.min(
    desiredHorizontalOffset,
    cubeBounds.centerX - minX,
    maxX - cubeBounds.centerX
  );
  const topOffset = Math.min(desiredVerticalOffset, cubeBounds.centerY - minY);
  const bottomOffset = Math.min(
    desiredVerticalOffset,
    captionTop - outerGap - halfButton - cubeBounds.centerY
  );
  const columnStep = Math.max(safeCubeWidth / 3.1, safeButtonSize * 1.05);
  const rowStep = Math.max(safeCubeHeight / 3.1, safeButtonSize * 1.05);
  const topY = clamp(cubeBounds.centerY - topOffset, minY, maxY);
  const bottomY = clamp(
    cubeBounds.centerY + bottomOffset,
    minY,
    captionTop - outerGap - halfButton
  );
  const leftX = clamp(cubeBounds.centerX - horizontalOffset, minX, maxX);
  const rightX = clamp(cubeBounds.centerX + horizontalOffset, minX, maxX);
  const positions = {
    top: [],
    bottom: [],
    left: [],
    right: [],
  };

  for (let slot = 0; slot < 3; slot += 1) {
    const slotOffset = slot - 1;
    const x = clamp(cubeBounds.centerX + slotOffset * columnStep, minX, maxX);
    const y = clamp(cubeBounds.centerY + slotOffset * rowStep, minY, maxY);

    positions.top.push({ x, y: topY });
    positions.bottom.push({ x, y: bottomY });
    positions.left.push({ x: leftX, y });
    positions.right.push({ x: rightX, y });
  }

  return {
    captionTop,
    positions,
  };
}

function getOverlayMetrics(container) {
  const overlayBounds = container.getBoundingClientRect();
  const sampleButton = container.querySelector('[data-arrow-id]');
  const caption = container.querySelector('.layer-arrow-caption');

  if (!sampleButton || !overlayBounds.width || !overlayBounds.height) {
    return null;
  }

  const buttonBounds = sampleButton.getBoundingClientRect();

  return {
    buttonSize: Math.max(buttonBounds.width, buttonBounds.height),
    caption,
    captionHeight: caption ? caption.getBoundingClientRect().height : 0,
    overlayBounds: {
      height: overlayBounds.height,
      width: overlayBounds.width,
    },
  };
}

export function updateLayerArrowOverlayLayout(container, cubeBounds) {
  if (container.hidden || !cubeBounds) {
    return;
  }

  const metrics = getOverlayMetrics(container);

  if (!metrics) {
    return;
  }

  const layout = computeLayerArrowLayout({
    buttonSize: metrics.buttonSize,
    captionHeight: metrics.captionHeight,
    cubeBounds,
    overlayBounds: metrics.overlayBounds,
  });

  ['top', 'bottom', 'left', 'right'].forEach((placement) => {
    container.querySelectorAll(`[data-placement="${placement}"]`).forEach((button, slot) => {
      const position = layout.positions[placement][slot];
      button.style.left = `${position.x}px`;
      button.style.top = `${position.y}px`;
    });
  });

  if (metrics.caption) {
    metrics.caption.style.top = `${layout.captionTop}px`;
  }
}

export function renderLayerArrowOverlay(container, props) {
  const { controls, currentMode, cubeBounds, isBusy, onArrow } = props;

  if (currentMode !== 'arrow') {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;

  if (!controls.length) {
    container.innerHTML = `
      <div class="layer-arrow-empty">
        <strong>Layer Arrow Mode</strong>
        <span>Choose a color to snap that face forward and reveal the row and column arrows.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="layer-arrow-grid" aria-label="Layer arrow controls around the cube">
      ${controls
        .map((control) => {
          return `
            <button
              type="button"
              class="layer-arrow-button layer-arrow-button--${control.placement}"
              data-arrow-id="${control.id}"
              data-placement="${control.placement}"
              data-slot="${control.slot}"
              title="${escapeHtml(control.tooltip)}"
              aria-label="${escapeHtml(control.tooltip)}"
              ${isBusy ? 'disabled' : ''}
            >
              <span aria-hidden="true">${control.icon}</span>
            </button>
          `;
        })
        .join('')}
    </div>
  `;

  container.querySelectorAll('[data-arrow-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = controls.find((control) => control.id === button.dataset.arrowId);

      if (selected) {
        onArrow(selected);
      }
    });
  });

  updateLayerArrowOverlayLayout(container, cubeBounds);
}
