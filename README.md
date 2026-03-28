# Mini Hands On Cube

Mini Hands On Cube is a standalone Three.js Rubik's Cube app with color-based face controls, true random-state scrambles, and solver-assisted recovery.

## Features

- Interactive 3x3x3 Rubik's Cube scene.
- Free orbit drag around the cube, including full vertical pitch, while zoom stays on explicit `-` and `+` buttons.
- A mode toggle that switches between Classic Face Turn Mode and Layer Arrow Mode without resetting the cube.
- Color-based face selector plus classic clockwise/counterclockwise face turns.
- Layer Arrow Mode with automatic flat face locking, persistent 12-arrow overlays that stay centered on the cube, and row/column slice turns.
- Utility controls for `Reset`, `Randomize`, `Solve`, `Show moves`, `Revert solve`, `Stop`, and button-only zoom.
- Solver integration powered by `cubejs`.
- State-aware solve planning that only reuses recorded history when it still matches the live cube state, and otherwise falls back to the `cubejs` solver so repeated random scrambles still solve cleanly.
- Responsive layout that keeps the desktop shell inside the viewport while still stacking cleanly on tablet and mobile widths.
- Accessible status updates and visible keyboard focus styling for control flows.

## Quick Start

From this folder:

```bash
npm install
npm run dev
```

Open `http://localhost:8000/` in your browser.

## Production Workflow

```bash
npm run dev
npm run build
npm run preview
npm run verify
```

- `dev` and `start` run the Vite development server on port `8000`.
- `build` emits the production bundle into `dist/` with source maps enabled.
- `preview` serves the built output through Vite's production preview server.
- `verify` runs linting, formatting checks, Vitest, the Vite production build, and the local workflow verification script.

Optional local variant:

```bash
npm run start:no-overlay
```

Use `npm run start:no-overlay` when you want the cleanest view for screenshots or Three.js DevTools inspection.

## Developer Commands

```bash
npm run test
npm run test:watch
npm run lint
npm run lint:fix
npm run format:check
npm run format
```

- `test` and `test:watch` run the Vitest suite for core, runtime dependency, and workflow helpers.
- `lint` and `lint:fix` run ESLint with a local flat config.
- `format` and `format:check` run Prettier with project-local settings.

## Runtime Packaging

- `three` is bundled from the local npm dependency through Vite instead of a CDN import.
- The solver ships as the local file dependency `cubejs-local` under `vendor/cubejs` and loads lazily through [`core/loadCubeClass.js`](./core/loadCubeClass.js).
- `window.THREE` remains exposed so Playwright and Three.js DevTools can inspect the live scene during debugging.

## How To Use

1. Let the cube idle-spin until you are ready to solve.
2. Choose a color from the face selector to pause the demo spin.
3. Pick `Classic Face Turn Mode` when you want the existing clockwise and counterclockwise direction pad.
4. Pick `Layer Arrow Mode` when you want the selected face rotated into a flat 2D front view with 12 persistent row and column arrows centered around the cube.
5. In Layer Arrow Mode, drag the scene once if you want to release the view lock and orbit freely again; select a new color whenever you want the face snapped forward again.
6. Use utility controls when needed.
7. `Randomize` creates a true random-state scramble and animates it.
8. `Solve` computes a recovery sequence, preferring the shorter of the solver output or the inverse of your recorded move history only when that history still matches the live cube state.
9. `Show moves` reveals the exact sequence used by the last solve.
10. `Revert solve` restores the cube to the state it had right before the last solve playback.
11. `Stop` cancels active playback safely without leaving the app in a stuck state.
12. `Reset` returns to solved state instantly.
13. Drag the scene to orbit freely around the cube, and use `-` / `+` when you want to change camera distance.

Status text reports current app state: `warming`, `idle`, `scrambling`, `solving`, `solved`, or `error`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, verification, and pull request expectations. Please also review the [Code of Conduct](./CODE_OF_CONDUCT.md) and [Security Policy](./SECURITY.md) before contributing.

Public repo note: pull requests run the same `npm run verify` pipeline in GitHub Actions, and the repo now includes issue and PR templates to keep external contributions consistent.

## License

Mini Hands On Cube is released under the [MIT License](./LICENSE).

Copyright (c) 2026 Sithu Win San.
