// Main browser entrypoint that wires the Three.js scene, solver services, and DOM controls together.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  FACE_COLORS,
  describeAlgorithmMoves,
  getColorFaceOptions,
  getLiveColorFaceMap,
  simplifyAlgorithm,
} from './core/CubeNotation.js';
import { resolveDragSolveMove } from './core/DragSolveMode.js';
import { getFaceLockRotation, getFaceView, getLayerArrowControls } from './core/LayerArrowMode.js';
import { getActionErrorState } from './core/appErrorState.js';
import { RubiksCube } from './core/RubiksCube.js';
import { loadCubeClass } from './core/loadCubeClass.js';
import { SolverEngine } from './core/SolverEngine.js';
import { chooseSolvePlan } from './core/SolvePlanner.js';
import { createRubiksCubeApp } from './core/createRubiksCubeApp.js';
import { renderDirectionalPad } from './ui/DirectionalPad.js';
import { renderFaceSelector } from './ui/FaceSelector.js';
import { renderInteractionModeToggle } from './ui/InteractionModeToggle.js';
import { renderLayerArrowOverlay, updateLayerArrowOverlayLayout } from './ui/LayerArrowOverlay.js';
import { renderUtilityControls } from './ui/UtilityControls.js';

// Expose the runtime for Three.js DevTools and browser-level inspection workflows.
globalThis.THREE = THREE;

const MAX_RENDER_DELTA_SECONDS = 0.05;
const MAX_RENDER_PIXEL_RATIO = 2;

function getRequiredElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required app element: #${id}`);
  }

  return element;
}

function getRendererPixelRatio() {
  return THREE.MathUtils.clamp(window.devicePixelRatio || 1, 1, MAX_RENDER_PIXEL_RATIO);
}

const container = getRequiredElement('container3D');
const faceSelector = getRequiredElement('face-selector');
const interactionMode = getRequiredElement('interaction-mode');
const layerArrowOverlay = getRequiredElement('layer-arrow-overlay');
const directionalPad = getRequiredElement('directional-pad');
const utilityControls = getRequiredElement('utility-controls');
// Scene and camera stay intentionally simple so the sticker colors are always read accurately.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(getRendererPixelRatio());
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(7.6, 6.3, 8.5);

// OrbitControls remain active for drag rotation, but zoom is button-driven only.
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.minDistance = 5.4;
controls.maxDistance = 16;
controls.maxPolarAngle = Math.PI;
controls.update();

// Flat materials remove lighting-based tint shifts and make sticker colors match the UI labels.
const cubieGeometry = new THREE.BoxGeometry(0.94, 0.94, 0.94);
const edgeGeometry = new THREE.EdgesGeometry(cubieGeometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x07111c });
const materialFaces = ['R', 'L', 'U', 'D', 'F', 'B'];

function getStickerColor(sticker) {
  return FACE_COLORS[sticker] ?? '#0f1726';
}

function createCubieMesh(stickers) {
  const materials = materialFaces.map(
    (face) =>
      new THREE.MeshBasicMaterial({
        color: getStickerColor(stickers[face]),
      })
  );
  const mesh = new THREE.Mesh(cubieGeometry, materials);
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

  mesh.add(edges);
  mesh.userData.applyStickers = (nextStickers) => {
    materialFaces.forEach((face, index) => {
      mesh.material[index].color.set(getStickerColor(nextStickers[face]));
    });
  };

  return mesh;
}

const rubiksCube = new RubiksCube({
  createMesh: createCubieMesh,
  createGroup: () => new THREE.Group(),
  animationDuration: 0.16,
});
scene.add(rubiksCube.group);

const solverEngine = new SolverEngine({});

// Shared app state keeps scene motion, solve history, and UI affordances in sync.
const state = {
  currentMode: 'classic',
  faceViewLocked: false,
  selectedColor: null,
  idleSpinEnabled: true,
  isBusy: false,
  isOrbiting: false,
  solverReady: false,
  status: 'Loading solver',
  historyMoves: [],
  lastSolvePlan: null,
  lastSolveSnapshot: null,
  moveListOpen: false,
};

const LOCKED_FRONT_VIEW = {
  eyeDirection: [0, 0, 1],
  upDirection: [0, 1, 0],
};
const projectedCubeBounds = new THREE.Box3();
const projectedCorner = new THREE.Vector3();
const projectedCubeCorners = [
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
];
const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const projectedAxisOrigin = new THREE.Vector3();
const projectedAxisTip = new THREE.Vector3();
const worldAxisVector = new THREE.Vector3();
const dragSolveGesture = {
  active: false,
  cubiePosition: null,
  face: null,
  moveQueued: false,
  pointerId: null,
  projectedRight: null,
  projectedUp: null,
  startClientX: 0,
  startClientY: 0,
};

const app = createRubiksCubeApp({
  rubiksCube,
  controls,
  renderer,
  scene,
  camera,
  shouldAutoSpin: () => state.idleSpinEnabled,
});

function syncIdleSpinState() {
  state.idleSpinEnabled =
    !state.isBusy && !state.isOrbiting && !state.selectedColor && state.currentMode !== 'drag';
}

function setHistoryMoves(nextMoves) {
  state.historyMoves = simplifyAlgorithm(nextMoves);
}

function appendHistoryMoves(nextMoves) {
  setHistoryMoves([...state.historyMoves, ...nextMoves]);
}

function clearSolveArtifacts() {
  state.lastSolvePlan = null;
  state.lastSolveSnapshot = null;
  state.moveListOpen = false;
}

function getCurrentFacelets() {
  return rubiksCube.toFaceletString();
}

function getSelectedFaceContext(facelets = getCurrentFacelets()) {
  if (!state.selectedColor) {
    return null;
  }

  const liveColorFaceMap = getLiveColorFaceMap(facelets);
  const currentFace = liveColorFaceMap[state.selectedColor];

  if (!currentFace) {
    return null;
  }

  const selectorOption = getColorFaceOptions(facelets).find(
    (option) => option.colorFace === state.selectedColor
  );

  return {
    colorFace: state.selectedColor,
    colorLabel: selectorOption?.label ?? state.selectedColor,
    currentFace,
    currentPositionLabel: selectorOption?.currentPositionLabel ?? currentFace,
  };
}

function getIdleStatusMessage(fallbackMessage) {
  if (fallbackMessage) {
    return fallbackMessage;
  }

  if (state.currentMode === 'drag') {
    return 'Drag a sticker to turn a row or column. Drag the empty space around the cube to orbit.';
  }

  const selectedFaceContext = getSelectedFaceContext();

  if (selectedFaceContext) {
    if (state.currentMode === 'arrow') {
      return state.faceViewLocked
        ? `Layer arrows are locked to ${selectedFaceContext.colorLabel} on the ${selectedFaceContext.currentPositionLabel.toLowerCase()} face. Drag once to unlock the view.`
        : `Layer arrows are ready for ${selectedFaceContext.colorLabel}. Choose another color to re-lock the view.`;
    }

    return `Ready to turn ${selectedFaceContext.colorLabel} on the ${selectedFaceContext.currentPositionLabel.toLowerCase()} face.`;
  }

  return state.currentMode === 'arrow'
    ? 'Choose a color to bring a face forward and enable layer arrows.'
    : 'Choose a color to pause the demo spin.';
}

function getProjectedCubeBounds() {
  projectedCubeBounds.setFromObject(rubiksCube.group);

  if (projectedCubeBounds.isEmpty()) {
    return null;
  }

  const width = renderer.domElement.clientWidth || container.clientWidth;
  const height = renderer.domElement.clientHeight || container.clientHeight;

  if (!width || !height) {
    return null;
  }

  const { min, max } = projectedCubeBounds;
  const cornerValues = [
    [min.x, min.y, min.z],
    [min.x, min.y, max.z],
    [min.x, max.y, min.z],
    [min.x, max.y, max.z],
    [max.x, min.y, min.z],
    [max.x, min.y, max.z],
    [max.x, max.y, min.z],
    [max.x, max.y, max.z],
  ];
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  cornerValues.forEach(([x, y, z], index) => {
    projectedCubeCorners[index].set(x, y, z);
    projectedCorner.copy(projectedCubeCorners[index]).project(camera);

    const projectedX = (projectedCorner.x * 0.5 + 0.5) * width;
    const projectedY = (-projectedCorner.y * 0.5 + 0.5) * height;

    minX = Math.min(minX, projectedX);
    maxX = Math.max(maxX, projectedX);
    minY = Math.min(minY, projectedY);
    maxY = Math.max(maxY, projectedY);
  });

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    height: maxY - minY,
    left: minX,
    right: maxX,
    top: minY,
    bottom: maxY,
    width: maxX - minX,
  };
}

function projectWorldPointToScreen(worldPoint) {
  const width = renderer.domElement.clientWidth || container.clientWidth;
  const height = renderer.domElement.clientHeight || container.clientHeight;

  if (!width || !height) {
    return null;
  }

  projectedAxisOrigin.copy(worldPoint).project(camera);

  return {
    x: (projectedAxisOrigin.x * 0.5 + 0.5) * width,
    y: (-projectedAxisOrigin.y * 0.5 + 0.5) * height,
  };
}

function getProjectedFaceAxes(face, worldOrigin) {
  const view = getFaceView(face);
  const origin = projectWorldPointToScreen(worldOrigin);

  if (!origin) {
    return null;
  }

  worldAxisVector
    .set(...view.rightDirection)
    .applyQuaternion(rubiksCube.group.quaternion)
    .normalize();
  projectedAxisTip.copy(worldOrigin).add(worldAxisVector);
  const rightTip = projectWorldPointToScreen(projectedAxisTip);

  worldAxisVector
    .set(...view.upDirection)
    .applyQuaternion(rubiksCube.group.quaternion)
    .normalize();
  projectedAxisTip.copy(worldOrigin).add(worldAxisVector);
  const upTip = projectWorldPointToScreen(projectedAxisTip);

  if (!rightTip || !upTip) {
    return null;
  }

  return {
    projectedRight: {
      x: rightTip.x - origin.x,
      y: rightTip.y - origin.y,
    },
    projectedUp: {
      x: upTip.x - origin.x,
      y: upTip.y - origin.y,
    },
  };
}

function getDragSolveHit(event) {
  const bounds = renderer.domElement.getBoundingClientRect();

  if (!bounds.width || !bounds.height) {
    return null;
  }

  pointerNdc.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  );
  raycaster.setFromCamera(pointerNdc, camera);

  const hit = raycaster
    .intersectObjects(
      rubiksCube.cubies.map((cubie) => cubie.mesh),
      false
    )
    .find(
      (intersection) =>
        intersection.object?.userData?.cubie &&
        Number.isInteger(intersection.face?.materialIndex) &&
        materialFaces[intersection.face.materialIndex]
    );

  if (!hit) {
    return null;
  }

  const face = materialFaces[hit.face.materialIndex];
  const projectedAxes = getProjectedFaceAxes(face, hit.point);

  if (!projectedAxes) {
    return null;
  }

  return {
    cubiePosition: { ...hit.object.userData.cubie.currentPosition },
    face,
    projectedRight: projectedAxes.projectedRight,
    projectedUp: projectedAxes.projectedUp,
  };
}

function clearDragSolveGesture() {
  if (dragSolveGesture.pointerId !== null) {
    try {
      if (renderer.domElement.hasPointerCapture?.(dragSolveGesture.pointerId)) {
        renderer.domElement.releasePointerCapture(dragSolveGesture.pointerId);
      }
    } catch {
      // Pointer capture can already be gone by the time cleanup runs.
    }
  }

  dragSolveGesture.active = false;
  dragSolveGesture.cubiePosition = null;
  dragSolveGesture.face = null;
  dragSolveGesture.moveQueued = false;
  dragSolveGesture.pointerId = null;
  dragSolveGesture.projectedRight = null;
  dragSolveGesture.projectedUp = null;
  dragSolveGesture.startClientX = 0;
  dragSolveGesture.startClientY = 0;
  controls.enabled = true;
}

function handleDragSolvePointerDown(event) {
  if (state.currentMode !== 'drag' || state.isBusy || !event.isPrimary) {
    return;
  }

  const hit = getDragSolveHit(event);

  if (!hit) {
    return;
  }

  dragSolveGesture.active = true;
  dragSolveGesture.cubiePosition = hit.cubiePosition;
  dragSolveGesture.face = hit.face;
  dragSolveGesture.moveQueued = false;
  dragSolveGesture.pointerId = event.pointerId;
  dragSolveGesture.projectedRight = hit.projectedRight;
  dragSolveGesture.projectedUp = hit.projectedUp;
  dragSolveGesture.startClientX = event.clientX;
  dragSolveGesture.startClientY = event.clientY;
  controls.enabled = false;
  renderer.domElement.setPointerCapture?.(event.pointerId);
  event.preventDefault();
  event.stopPropagation();
}

function handleDragSolvePointerMove(event) {
  if (!dragSolveGesture.active || dragSolveGesture.pointerId !== event.pointerId) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  if (dragSolveGesture.moveQueued || state.isBusy) {
    return;
  }

  const move = resolveDragSolveMove({
    cubiePosition: dragSolveGesture.cubiePosition,
    dragDelta: {
      x: event.clientX - dragSolveGesture.startClientX,
      y: event.clientY - dragSolveGesture.startClientY,
    },
    face: dragSolveGesture.face,
    projectedRight: dragSolveGesture.projectedRight,
    projectedUp: dragSolveGesture.projectedUp,
  });

  if (!move) {
    return;
  }

  dragSolveGesture.moveQueued = true;
  queuePlayerMoves([move], {
    busyStatus: `Turning dragged layer (${move})`,
  });
}

function handleDragSolvePointerEnd(event) {
  if (!dragSolveGesture.active || dragSolveGesture.pointerId !== event.pointerId) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  clearDragSolveGesture();
}

function syncLayerArrowOverlayLayout() {
  if (state.currentMode !== 'arrow' || !state.selectedColor || layerArrowOverlay.hidden) {
    return;
  }

  const cubeBounds = getProjectedCubeBounds();

  if (cubeBounds) {
    updateLayerArrowOverlayLayout(layerArrowOverlay, cubeBounds);
  }
}

function setFaceLock(face, options = {}) {
  if (!face) {
    state.faceViewLocked = false;
    app.cancelViewTween();
    return;
  }

  rubiksCube.group.rotation.set(...getFaceLockRotation(face));
  state.faceViewLocked = true;
  app.focusView(LOCKED_FRONT_VIEW, options);
}

function clearFaceLock() {
  state.faceViewLocked = false;
  app.cancelViewTween();
}

function handleFaceSelection(face) {
  const nextColor = state.selectedColor === face ? null : face;

  state.selectedColor = nextColor;

  const selectedFaceContext = getSelectedFaceContext();

  if (state.currentMode === 'arrow' && selectedFaceContext) {
    setFaceLock(selectedFaceContext.currentFace);
  } else {
    clearFaceLock();
  }

  state.status = getIdleStatusMessage();
  syncIdleSpinState();
  renderControls();
}

function handleModeChange(mode) {
  if (mode === state.currentMode) {
    return;
  }

  if (dragSolveGesture.active) {
    clearDragSolveGesture();
  }

  state.currentMode = mode;

  const selectedFaceContext = getSelectedFaceContext();

  if (mode === 'arrow' && selectedFaceContext) {
    setFaceLock(selectedFaceContext.currentFace);
  } else {
    clearFaceLock();
  }

  if (!state.isBusy) {
    state.status = getIdleStatusMessage();
  }

  syncIdleSpinState();
  renderControls();
}

function queuePlayerMoves(moves, labels) {
  runQueuedAction(() => rubiksCube.queueMoves(moves), {
    ...labels,
    onSuccess: (completedMoves) => {
      appendHistoryMoves(completedMoves);
      const currentFacelets = getCurrentFacelets();

      if (state.currentMode === 'arrow' && state.faceViewLocked) {
        const selectedFaceContext = getSelectedFaceContext(currentFacelets);

        if (selectedFaceContext) {
          setFaceLock(selectedFaceContext.currentFace, { immediate: true });
        }
      }

      clearSolveArtifacts();
      labels.onSuccess?.(completedMoves);
    },
  });
}

function resizeRenderer() {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(getRendererPixelRatio());
  renderer.setSize(width, height, false);
  syncLayerArrowOverlayLayout();
}

// The controls are rendered from state each time so button enablement always matches camera/cube state.
function renderControls() {
  const currentFacelets = getCurrentFacelets();
  const selectedFaceContext = getSelectedFaceContext(currentFacelets);

  renderInteractionModeToggle(interactionMode, {
    currentMode: state.currentMode,
    onChange: handleModeChange,
  });

  renderFaceSelector(faceSelector, {
    options: getColorFaceOptions(currentFacelets),
    selectedColor: state.selectedColor,
    isBusy: state.isBusy,
    onSelect: handleFaceSelection,
  });
  faceSelector.hidden = state.currentMode === 'drag';

  directionalPad.hidden = state.currentMode !== 'classic';

  if (state.currentMode === 'classic') {
    renderDirectionalPad(directionalPad, {
      selectedFace: selectedFaceContext?.currentFace ?? null,
      selectedLabel: selectedFaceContext?.colorLabel ?? '',
      selectedPositionLabel: selectedFaceContext?.currentPositionLabel ?? '',
      isBusy: state.isBusy,
      onTurn: (face, direction) => {
        const move = direction === 'clockwise' ? face : `${face}'`;
        queuePlayerMoves([move], {
          busyStatus: `Turning ${selectedFaceContext?.colorLabel ?? 'selected'} ${
            direction === 'clockwise' ? 'clockwise' : 'counterclockwise'
          }`,
          idleStatus: `${selectedFaceContext?.colorLabel ?? 'Selected'} turn complete.`,
        });
      },
    });
  } else {
    directionalPad.innerHTML = '';
  }

  renderLayerArrowOverlay(layerArrowOverlay, {
    controls:
      state.currentMode === 'arrow' && selectedFaceContext
        ? getLayerArrowControls(selectedFaceContext.currentFace)
        : [],
    currentMode: state.currentMode,
    cubeBounds:
      state.currentMode === 'arrow' && selectedFaceContext ? getProjectedCubeBounds() : null,
    faceLabel: selectedFaceContext?.colorLabel ?? '',
    isBusy: state.isBusy,
    isLocked: state.faceViewLocked,
    onArrow: (control) => {
      queuePlayerMoves([control.move], {
        busyStatus: `${control.tooltip} (${control.move})`,
        idleStatus: `${control.tooltip} (${control.move}) complete.`,
      });
    },
  });
  syncLayerArrowOverlayLayout();

  renderUtilityControls(utilityControls, {
    canRevert: Boolean(state.lastSolveSnapshot) && !state.isBusy,
    canShowMoves: Boolean(state.lastSolvePlan),
    canZoomIn: app.canZoomIn(),
    canZoomOut: app.canZoomOut(),
    isBusy: state.isBusy,
    lastSolvePlan: state.lastSolvePlan,
    moveCount: state.historyMoves.length,
    moveListOpen: state.moveListOpen,
    onReset: () => {
      if (state.isBusy) {
        return;
      }

      rubiksCube.reset();
      setHistoryMoves([]);
      clearSolveArtifacts();
      state.status = 'Cube reset to solved';
      syncIdleSpinState();
      renderControls();
    },
    onRandomize: () => {
      void handleRandomize();
    },
    onRevert: () => {
      if (state.isBusy || !state.lastSolveSnapshot) {
        return;
      }

      rubiksCube.setFacelets(state.lastSolveSnapshot.facelets);
      setHistoryMoves(state.lastSolveSnapshot.historyMoves);
      state.status = 'Restored the pre-solve cube state';
      syncIdleSpinState();
      renderControls();
    },
    onSolve: () => {
      void handleSolve();
    },
    onStop: () => {
      if (!state.isBusy) {
        return;
      }

      rubiksCube.cancelPlayback();
    },
    onToggleMoves: () => {
      if (!state.lastSolvePlan) {
        return;
      }

      state.moveListOpen = !state.moveListOpen;
      renderControls();
    },
    onZoomIn: () => {
      app.zoomIn();
      renderControls();
    },
    onZoomOut: () => {
      app.zoomOut();
      renderControls();
    },
    solverReady: state.solverReady,
    status: state.status,
  });
}

function finalizeIdleStatus(defaultStatus) {
  state.isBusy = false;
  state.solverReady = solverEngine.isReady();

  if (rubiksCube.isSolved()) {
    setHistoryMoves([]);
    state.status = state.lastSolvePlan
      ? `Cube is solved in ${state.lastSolvePlan.moves.length} moves.`
      : 'Cube is solved';
  } else {
    state.status = getIdleStatusMessage(defaultStatus);
  }

  syncIdleSpinState();
  renderControls();
}

function handleActionFailure(error, options) {
  state.isBusy = false;

  const nextState = getActionErrorState(error, options);

  if (nextState.shouldLog) {
    console.error(error);
  }

  state.status = nextState.status;
  syncIdleSpinState();
  renderControls();
}

function getSolverReadyStatus() {
  if (state.currentMode === 'drag') {
    return getIdleStatusMessage();
  }

  return state.selectedColor
    ? getIdleStatusMessage()
    : 'Solver ready. Choose a color to pause the demo spin.';
}

async function runQueuedAction(action, labels = {}) {
  if (state.isBusy) {
    return;
  }

  state.isBusy = true;
  state.status = labels.busyStatus;
  syncIdleSpinState();
  renderControls();

  try {
    const completedMoves = await action();
    labels.onSuccess?.(completedMoves);
    finalizeIdleStatus(labels.idleStatus);
  } catch (error) {
    handleActionFailure(error, {
      fallbackMessage: 'Action failed',
    });
  }
}

async function handleRandomize() {
  if (state.isBusy || !state.solverReady) {
    return;
  }

  state.isBusy = true;
  state.status = 'Generating a true random-state scramble';
  syncIdleSpinState();
  renderControls();

  try {
    const scramble = await solverEngine.createRandomStateScramble();

    state.status = `Scrambling with ${scramble.length} moves`;
    renderControls();

    await rubiksCube.queueMoves(scramble);
    appendHistoryMoves(scramble);
    clearSolveArtifacts();
    finalizeIdleStatus('Random-state scramble complete. Choose a color to solve.');
  } catch (error) {
    handleActionFailure(error, {
      fallbackMessage: 'Random-state scramble failed',
    });
  }
}

async function handleSolve() {
  if (state.isBusy || !state.solverReady) {
    return;
  }

  if (rubiksCube.isSolved()) {
    state.status = 'Cube is already solved';
    renderControls();
    return;
  }

  const preSolveFacelets = rubiksCube.toFaceletString();
  const preSolveHistory = [...state.historyMoves];

  state.isBusy = true;
  state.status = 'Finding a solution';
  syncIdleSpinState();
  renderControls();

  try {
    const solverMoves = await solverEngine.solve(preSolveFacelets);
    const plan = chooseSolvePlan({
      currentFacelets: preSolveFacelets,
      historyMoves: preSolveHistory,
      solverMoves,
    });

    if (!plan.moves.length) {
      finalizeIdleStatus('Cube is already solved');
      return;
    }

    state.lastSolveSnapshot = {
      facelets: preSolveFacelets,
      historyMoves: preSolveHistory,
    };
    state.lastSolvePlan = {
      ...plan,
      moveDetails: describeAlgorithmMoves(plan.moves, preSolveFacelets),
    };
    state.moveListOpen = false;
    state.status = `Solving with ${plan.label} (${plan.moves.length} moves)`;
    renderControls();

    await app.solve(plan.moves);
    setHistoryMoves([]);
    finalizeIdleStatus(`Solve playback complete via ${plan.label}.`);
  } catch (error) {
    handleActionFailure(error, {
      fallbackMessage: 'Solve failed',
    });
  }
}

async function warmSolver() {
  try {
    const CubeClass = await loadCubeClass();

    solverEngine.setCubeClass(CubeClass);
    await solverEngine.warmInIdle();
    state.solverReady = true;

    if (!state.isBusy) {
      // If the user already selected a face before warmup finished, keep the
      // contextual idle copy instead of resetting back to the generic prompt.
      state.status = getSolverReadyStatus();
      renderControls();
    }
  } catch (error) {
    console.error(error);
    state.solverReady = false;
    state.status = 'Solver failed to load';
    renderControls();
  }
}

controls.addEventListener('start', () => {
  if (state.currentMode === 'arrow' && state.faceViewLocked) {
    clearFaceLock();
    if (!state.isBusy) {
      state.status = getIdleStatusMessage();
    }

    renderControls();
  }

  state.isOrbiting = true;
  syncIdleSpinState();
});

controls.addEventListener('end', () => {
  state.isOrbiting = false;
  syncIdleSpinState();
});

renderer.domElement.addEventListener('pointerdown', handleDragSolvePointerDown, true);
renderer.domElement.addEventListener('pointermove', handleDragSolvePointerMove, true);
renderer.domElement.addEventListener('pointerup', handleDragSolvePointerEnd, true);
renderer.domElement.addEventListener('pointercancel', handleDragSolvePointerEnd, true);
renderer.domElement.addEventListener(
  'lostpointercapture',
  (event) => {
    if (dragSolveGesture.active && dragSolveGesture.pointerId === event.pointerId) {
      clearDragSolveGesture();
    }
  },
  true
);

const clock = new THREE.Clock();

function animate() {
  app.tick(Math.min(clock.getDelta(), MAX_RENDER_DELTA_SECONDS));
  syncLayerArrowOverlayLayout();
}

window.addEventListener('resize', resizeRenderer);

resizeRenderer();
renderControls();
void warmSolver();
renderer.setAnimationLoop(animate);
