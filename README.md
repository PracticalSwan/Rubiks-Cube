# Mini Hands On Cube

Mini Hands On Cube is a standalone Three.js Rubik's Cube app with direct drag solving, color-based face controls, true random-state scrambles, and solver-assisted recovery.

## Features

- Interactive 3x3x3 Rubik's Cube scene.
- Free orbit drag around the cube, including full vertical pitch, while zoom stays on explicit `-` and `+` buttons.
- A mode toggle that switches between Classic Face Turn Mode, Drag Solve Mode, and Layer Arrow Mode without resetting the cube.
- Drag Solve Mode that lets you drag visible stickers to turn rows or columns while reserving the empty space around the cube for whole-view orbiting.
- Live center-color face selection, so `Blue` always means the face whose center sticker is blue right now.
- Classic mode with color-first clockwise/counterclockwise face turns that follow the live center-color mapping.
- Layer Arrow Mode with automatic flat face locking, persistent 12-arrow overlays that stay centered on the cube, row/column slice turns, and lock-follow behavior when the selected center moves to a new face.
- Utility controls for `Reset`, `Randomize`, `Solve`, `Show moves`, `Revert solve`, `Stop`, and button-only zoom.
- Solver integration powered by `cubejs`.
- State-aware solve planning that only reuses recorded history when it still matches the live cube state, and otherwise falls back to the `cubejs` solver so repeated random scrambles still solve cleanly.
- Solve move playback that presents plain-language steps with notation as a secondary hint instead of raw notation alone.
- Responsive layout that keeps the desktop shell inside the viewport, refreshes the canvas for high-DPI resize changes, and still stacks cleanly on tablet and mobile widths.
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
- `window.THREE` is exposed only in development through a dev-only helper so Playwright and Three.js DevTools can inspect the live scene without inflating the production bundle.

## How To Use

1. Let the cube idle-spin until you are ready to solve.
2. Pick `Drag Solve Mode` when you want the `onlinecube.com`-style interaction split.
3. In Drag Solve Mode, drag a visible sticker to turn its row or column, and drag the empty space around the cube when you want to orbit the whole view instead.
4. Choose a center color from the face selector when you want the targeted controls used by Classic Face Turn Mode or Layer Arrow Mode.
5. Pick `Classic Face Turn Mode` when you want the existing clockwise and counterclockwise direction pad.
6. The selector always follows live centers, so if a middle-slice move shifts the blue center to the top face, the `Blue` button updates to `currently on the top face`.
7. Pick `Layer Arrow Mode` when you want the selected center color rotated into a flat 2D front view with 12 persistent row and column arrows centered around the cube.
8. In Layer Arrow Mode, the lock follows the selected center color after slice moves so the chosen color stays in front; drag the scene once if you want to release that lock and orbit freely again.
9. Select a different color anytime you want the cube snapped to that live center again.
10. Use utility controls when needed.
11. `Randomize` creates a true random-state scramble and animates it.
12. `Solve` computes a recovery sequence, preferring the shorter of the solver output or the inverse of your recorded move history only when that history still matches the live cube state.
13. `Show moves` reveals a readable numbered move list for the last solve, with standard notation kept as a secondary hint.
14. `Revert solve` restores the cube to the state it had right before the last solve playback.
15. `Stop` cancels active playback safely without leaving the app in a stuck state.
16. `Reset` returns to solved state instantly.
17. Use `-` / `+` when you want to change camera distance.

Status text reports current app state: `warming`, `idle`, `scrambling`, `solving`, `solved`, or `error`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, verification, and pull request expectations. Please also review the [Code of Conduct](./CODE_OF_CONDUCT.md) and [Security Policy](./SECURITY.md) before contributing.

Public repo note: pull requests run the same `npm run verify` pipeline in GitHub Actions, and the repo now includes issue and PR templates to keep external contributions consistent.

## License

Mini Hands On Cube is released under the [MIT License](./LICENSE).

Copyright (c) 2026 Sithu Win San.
