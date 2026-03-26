# Mini Hands On Cube

Mini Hands On Cube is a standalone Three.js Rubik's Cube app with color-based face controls, true random-state scrambles, and solver-assisted recovery.

## Features

- Interactive 3x3x3 Rubik's Cube scene.
- Color-based face selector and directional controls for manual turns.
- Utility controls for `Reset`, `Randomize`, `Solve`, `Show moves`, `Revert solve`, `Stop`, and button-only zoom.
- Solver integration powered by `cubejs`.
- History-aware solve planning that prefers reversing the recorded scramble or manual turns when that route is shorter than the default solver output.
- Responsive layout that keeps the scene and controls usable on desktop, tablet, and mobile widths.
- Accessible status updates and visible keyboard focus styling for control flows.

## Quick Start

From this folder:

```bash
npm install
npm run start
```

Open `http://localhost:8000/` in your browser.

Optional local start variants:

```bash
npm run start:no-overlay
npm run start:python
npm run start:python2
```

Use `npm run start:no-overlay` when you want the cleanest view for screenshots or Three.js DevTools inspection.

## Developer Commands

```bash
npm run test
npm run lint
npm run lint:fix
npm run format:check
npm run format
```

- `test` runs the Node.js test suite for core and workflow helpers.
- `lint` and `lint:fix` run ESLint with a local flat config.
- `format` and `format:check` run Prettier with project-local settings.

## How To Use

1. Let the cube idle-spin until you are ready to solve.
2. Choose a color from the face selector to pause the demo spin.
3. Use the direction pad to rotate that layer.
4. Use utility controls when needed:
5. `Randomize` creates a true random-state scramble and animates it.
6. `Solve` computes a recovery sequence, preferring the shorter of the solver output or the inverse of your recorded move history.
7. `Show moves` reveals the exact sequence used by the last solve.
8. `Revert solve` restores the cube to the state it had right before the last solve playback.
9. `Stop` cancels active playback safely without leaving the app in a stuck state.
10. `Reset` returns to solved state instantly.
11. `-` and `+` are the only zoom controls; wheel and touch stay dedicated to orbiting the cube.

Status text reports current app state: `warming`, `idle`, `scrambling`, `solving`, `solved`, or `error`.
