# Mini Hands On Cube

This README is written as the completed-project version of the cube app, aligned to the local design, implementation, and testing plans.

Mini Hands On Cube is a standalone Three.js Rubik's Cube experience built from the original workshop cube demo. The finished app keeps the playful continuous spin from the first exercise, adds a full 3x3x3 cubie model, and layers on manual face controls, solver-backed recovery, responsive UI, and a verification workflow that includes automated tests plus Three.js DevTools checks.

## Features

- Full 3x3x3 Rubik's Cube assembled from 27 cubies.
- Manual face-first move controls using a face selector and directional pad.
- Shared move queue for manual turns, scramble playback, and solver playback.
- `Reset`, `Randomize`, `Solve`, and `Stop` utility controls.
- Solver integration through a `SolverEngine` adapter around `cubejs`.
- Non-blocking solver warm-up after initial render.
- Live status messaging for `warming`, `idle`, `scrambling`, `solving`, `solved`, and `error` states.
- Continuous parent-group spin preserved alongside OrbitControls.
- Responsive cartoon-style control shell with keyboard focus states and accessible status updates.
- Test coverage for notation, move math, cube state, solver orchestration, UI wiring, and app integration.

## Tech Stack

- Three.js v0.129.0 via Skypack ESM
- OrbitControls
- `cubejs` for 3x3x3 solving
- Vanilla JavaScript modules
- CSS
- Jest with `jsdom`
- `http-server`
- `cross-env`
- `threejs-devtools-mcp` for scene and performance verification

## Project Structure

```text
Mini_Hands_On_Cube/
|-- app.js
|-- index.html
|-- style.css
|-- core/
|   |-- CubeNotation.js
|   |-- Cubie.js
|   |-- MoveSet.js
|   |-- RubiksCube.js
|   |-- SolverEngine.js
|   `-- createRubiksCubeApp.js
|-- ui/
|   |-- FaceSelector.js
|   |-- DirectionalPad.js
|   `-- UtilityControls.js
|-- CHANGELOG.md
`-- package.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run start
```

Open:

```text
http://localhost:8000/
```

Preferred dev command with the Three.js DevTools overlay disabled:

```bash
npm run start:no-overlay
```

Python fallbacks:

```bash
npm run start:python
npm run start:python2
```

## How To Use The App

### Manual moves

1. Select a face from the face grid.
2. Use the directional pad to turn the matching layer.
3. Watch the move animate through the shared quarter-turn queue.

### Utility actions

- `Reset`: return the cube to the solved state immediately.
- `Randomize`: generate an app-safe scramble sequence and play it through the queue.
- `Solve`: serialize the current cube state, ask `SolverEngine` for a solution, and animate the returned algorithm.
- `Stop`: cancel active scramble or solve playback without corrupting the current cube state.

### Status states

The status label reports the app lifecycle clearly:

- `warming`: solver initialization is still running.
- `idle`: controls are ready and the cube is not busy.
- `scrambling`: queued scramble playback is in progress.
- `solving`: solver playback is in progress.
- `solved`: the cube is back in its solved state.
- `error`: the app rejected an invalid or unsupported state.

## Solver Notes

- The solver path is intentionally adapter-based so browser-only imports stay at the edge of the app.
- `cubejs` warm-up happens after the first render so initial paint stays fast.
- V1 solving is scoped to states produced by the app's own move and scramble pipeline.
- Solver playback uses the same move queue as manual turns, which keeps animation behavior consistent.

## Responsive And Accessibility Behavior

- The layout keeps the canvas usable across mobile, tablet, and desktop breakpoints.
- Direction controls stay hidden or disabled until a face is selected.
- Busy states lock conflicting controls to avoid invalid interactions.
- Status updates use `aria-live` messaging.
- Focus states remain visible for keyboard users.

## Development Workflow

Run the full automated suite:

```bash
npm test
```

Targeted examples:

```bash
npm test -- CubeNotation.test.js
npm test -- SolverEngine.test.js
npm test -- createRubiksCubeApp.test.js
```

Recommended verification flow:

1. Run `npm test`.
2. Start the app with `npm run start:no-overlay`.
3. Check core flows: manual moves, randomize, solve, stop, reset.
4. Run the required Three.js DevTools checks for bridge health, scene sanity, screenshots, console cleanliness, performance, and memory stability.

## Three.js DevTools Expectations

The finished implementation exposes `window.THREE` in development and treats DevTools inspection as a release gate. Minimum checks:

- Scene tree and object count look sane.
- No uncaught runtime errors during load, scramble, solve, stop, or reset.
- Repeated scramble/solve cycles do not show obvious leaks.
- Visual screenshots confirm controls and cube layout remain usable.

## Documentation Map

- `CHANGELOG.md`: local project change history.
- `LESSONS.md`: cube-specific lessons that should travel with the extracted project.
