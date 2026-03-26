// Main browser entrypoint that wires the Three.js scene, solver services, and DOM controls together.
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import {
  FACE_COLORS,
  FACE_LABELS,
  formatAlgorithm,
  simplifyAlgorithm,
} from './core/CubeNotation.js';
import { getActionErrorState } from './core/appErrorState.js';
import { RubiksCube } from './core/RubiksCube.js';
import { SolverEngine } from './core/SolverEngine.js';
import { chooseSolvePlan } from './core/SolvePlanner.js';
import { createRubiksCubeApp } from './core/createRubiksCubeApp.js';
import { renderDirectionalPad } from './ui/DirectionalPad.js';
import { renderFaceSelector } from './ui/FaceSelector.js';
import { renderUtilityControls } from './ui/UtilityControls.js';

globalThis.THREE = THREE;

const container = document.getElementById('container3D');
const faceSelector = document.getElementById('face-selector');
const directionalPad = document.getElementById('directional-pad');
const utilityControls = document.getElementById('utility-controls');
const CubeClass = globalThis.Cube;

// Scene and camera stay intentionally simple so the sticker colors are always read accurately.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(6.5, 5.6, 7.2);

// OrbitControls remain active for drag rotation, but zoom is button-driven only.
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.minDistance = 4.5;
controls.maxDistance = 14;
controls.maxPolarAngle = Math.PI * 0.48;
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

const solverEngine = new SolverEngine({ CubeClass });

// Shared app state keeps scene motion, solve history, and UI affordances in sync.
const state = {
  selectedFace: null,
  idleSpinEnabled: true,
  isBusy: false,
  isOrbiting: false,
  solverReady: false,
  status: CubeClass ? 'Warming solver' : 'cubejs did not load',
  historyMoves: [],
  lastSolvePlan: null,
  lastSolveSnapshot: null,
  moveListOpen: false,
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
    !state.isBusy && !state.isOrbiting && !state.selectedFace;
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

function getIdleStatusMessage(fallbackMessage) {
  if (fallbackMessage) {
    return fallbackMessage;
  }

  if (state.selectedFace) {
    return `Ready to turn ${FACE_LABELS[state.selectedFace]}.`;
  }

  return 'Choose a color to pause the demo spin.';
}

function resizeRenderer() {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

// The controls are rendered from state each time so button enablement always matches camera/cube state.
function renderControls() {
  renderFaceSelector(faceSelector, {
    selectedFace: state.selectedFace,
    isBusy: state.isBusy,
    onSelect: (face) => {
      state.selectedFace = state.selectedFace === face ? null : face;
      syncIdleSpinState();
      renderControls();
    },
  });

  renderDirectionalPad(directionalPad, {
    selectedFace: state.selectedFace,
    isBusy: state.isBusy,
    onTurn: (face, direction) => {
      const move = direction === 'clockwise' ? face : `${face}'`;
      runQueuedAction(() => rubiksCube.queueMove(move), {
        busyStatus: `Turning ${move}`,
        idleStatus: `Turned ${move}`,
        onSuccess: (completedMoves) => {
          appendHistoryMoves(completedMoves);
          clearSolveArtifacts();
        },
      });
    },
  });

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

async function runQueuedAction(action, labels) {
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
    state.isBusy = false;
    const nextState = getActionErrorState(error, {
      fallbackMessage: 'Action failed',
    });

    if (nextState.shouldLog) {
      console.error(error);
    }

    state.status = nextState.status;
    syncIdleSpinState();
    renderControls();
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
    setHistoryMoves(scramble);
    clearSolveArtifacts();
    finalizeIdleStatus('Random-state scramble complete. Choose a color to solve.');
  } catch (error) {
    state.isBusy = false;
    const nextState = getActionErrorState(error, {
      fallbackMessage: 'Random-state scramble failed',
    });

    if (nextState.shouldLog) {
      console.error(error);
    }

    state.status = nextState.status;
    syncIdleSpinState();
    renderControls();
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
      moveText: formatAlgorithm(plan.moves),
    };
    state.moveListOpen = false;
    state.status = `Solving with ${plan.label} (${plan.moves.length} moves)`;
    renderControls();

    await app.solve(plan.moves);
    setHistoryMoves([]);
    finalizeIdleStatus(`Solve playback complete via ${plan.label}.`);
  } catch (error) {
    state.isBusy = false;
    const nextState = getActionErrorState(error, {
      fallbackMessage: 'Solve failed',
    });

    if (nextState.shouldLog) {
      console.error(error);
    }

    state.status = nextState.status;
    syncIdleSpinState();
    renderControls();
  }
}

function warmSolver() {
  if (!CubeClass) {
    renderControls();
    return;
  }

  solverEngine
    .warmInIdle()
    .then(() => {
      state.solverReady = true;

      if (!state.isBusy) {
        state.status = 'Solver ready. Choose a color to pause the demo spin.';
        renderControls();
      }
    })
    .catch((error) => {
      console.error(error);
      state.status = 'Solver warm-up failed';
      renderControls();
    });
}

controls.addEventListener('start', () => {
  state.isOrbiting = true;
  syncIdleSpinState();
});

controls.addEventListener('end', () => {
  state.isOrbiting = false;
  syncIdleSpinState();
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  app.tick(Math.min(clock.getDelta(), 0.05));
}

window.addEventListener('resize', resizeRenderer);

resizeRenderer();
renderControls();
warmSolver();
animate();
