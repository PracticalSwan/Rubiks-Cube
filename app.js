import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { FACE_COLORS } from './core/CubeNotation.js';
import { RubiksCube } from './core/RubiksCube.js';
import { SolverEngine } from './core/SolverEngine.js';
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

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(6.5, 5.6, 7.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4.5;
controls.maxDistance = 14;
controls.maxPolarAngle = Math.PI * 0.48;
controls.update();

const hemiLight = new THREE.HemisphereLight(0xbcd8ff, 0x08111c, 1.2);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(6, 8, 5);
scene.add(keyLight);

const accentLight = new THREE.PointLight(0x6ca9ff, 0.55, 18);
accentLight.position.set(-5, -1, 6);
scene.add(accentLight);

const cubieGeometry = new THREE.BoxGeometry(0.94, 0.94, 0.94);
const edgeGeometry = new THREE.EdgesGeometry(cubieGeometry);
const materialFaces = ['R', 'L', 'U', 'D', 'F', 'B'];

function getStickerColor(sticker) {
  return FACE_COLORS[sticker] ?? '#0f1726';
}

function createCubieMesh(stickers) {
  const materials = materialFaces.map(
    (face) =>
      new THREE.MeshStandardMaterial({
        color: getStickerColor(stickers[face]),
        roughness: 0.42,
        metalness: 0.05
      })
  );
  const mesh = new THREE.Mesh(cubieGeometry, materials);
  const edges = new THREE.LineSegments(
    edgeGeometry,
    new THREE.LineBasicMaterial({ color: 0x07111c })
  );

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
  animationDuration: 0.16
});
scene.add(rubiksCube.group);

const solverEngine = new SolverEngine({ CubeClass });
const app = createRubiksCubeApp({
  rubiksCube,
  controls,
  renderer,
  scene,
  camera
});

const state = {
  selectedFace: 'F',
  isBusy: false,
  solverReady: false,
  status: CubeClass ? 'Warming solver' : 'cubejs did not load'
};

function resizeRenderer() {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function renderControls() {
  renderFaceSelector(faceSelector, {
    selectedFace: state.selectedFace,
    isBusy: state.isBusy,
    onSelect: (face) => {
      state.selectedFace = face;
      renderControls();
    }
  });

  renderDirectionalPad(directionalPad, {
    selectedFace: state.selectedFace,
    isBusy: state.isBusy,
    onTurn: (face, direction) => {
      const move = direction === 'clockwise' ? face : `${face}'`;
      runQueuedAction(() => rubiksCube.queueMove(move), {
        busyStatus: `Turning ${move}`,
        idleStatus: `Turned ${move}`
      });
    }
  });

  renderUtilityControls(utilityControls, {
    isBusy: state.isBusy,
    solverReady: state.solverReady,
    onReset: () => {
      if (state.isBusy) {
        return;
      }

      rubiksCube.reset();
      state.status = 'Cube reset to solved';
      renderControls();
    },
    onRandomize: () => {
      const scramble = rubiksCube.generateScramble(20);
      runQueuedAction(() => rubiksCube.queueMoves(scramble), {
        busyStatus: `Scrambling with ${scramble.length} moves`,
        idleStatus: 'Scramble complete'
      });
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
    status: state.status
  });
}

function finalizeIdleStatus(defaultStatus = 'Ready for manual turns') {
  state.isBusy = false;
  state.solverReady = solverEngine.isReady();
  state.status = rubiksCube.isSolved() ? 'Cube is solved' : defaultStatus;
  renderControls();
}

async function runQueuedAction(action, labels) {
  if (state.isBusy) {
    return;
  }

  state.isBusy = true;
  state.status = labels.busyStatus;
  renderControls();

  try {
    await action();
    finalizeIdleStatus(labels.idleStatus);
  } catch (error) {
    state.isBusy = false;

    if (error?.code === 'PLAYBACK_CANCELLED') {
      state.status = 'Playback stopped';
    } else {
      console.error(error);
      state.status = error?.message ?? 'Action failed';
    }

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

  state.isBusy = true;
  state.status = 'Finding a solution';
  renderControls();

  try {
    const moves = await solverEngine.solve(rubiksCube.toFaceletString());

    if (!moves.length) {
      finalizeIdleStatus('Cube is already solved');
      return;
    }

    state.status = `Solving in ${moves.length} moves`;
    renderControls();
    await app.solve(moves);
    finalizeIdleStatus('Solve playback complete');
  } catch (error) {
    state.isBusy = false;
    console.error(error);

    if (error?.code === 'INVALID_FACELETS') {
      state.status = 'The current cube state could not be serialized.';
    } else if (error?.code === 'IMPOSSIBLE_STATE') {
      state.status = 'The current cube state is impossible to solve.';
    } else if (error?.code === 'PLAYBACK_CANCELLED') {
      state.status = 'Playback stopped';
    } else {
      state.status = error?.message ?? 'Solve failed';
    }

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
        state.status = 'Solver ready';
        renderControls();
      }
    })
    .catch((error) => {
      console.error(error);
      state.status = 'Solver warm-up failed';
      renderControls();
    });
}

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
