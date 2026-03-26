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
3. Use the direction pad to rotate that layer.
4. Use utility controls when needed.
5. `Randomize` creates a true random-state scramble and animates it.
6. `Solve` computes a recovery sequence, preferring the shorter of the solver output or the inverse of your recorded move history.
7. `Show moves` reveals the exact sequence used by the last solve.
8. `Revert solve` restores the cube to the state it had right before the last solve playback.
9. `Stop` cancels active playback safely without leaving the app in a stuck state.
10. `Reset` returns to solved state instantly.
11. `-` and `+` are the only zoom controls; wheel and touch stay dedicated to orbiting the cube.

Status text reports current app state: `warming`, `idle`, `scrambling`, `solving`, `solved`, or `error`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, verification, and pull request expectations. Please also review the [Code of Conduct](./CODE_OF_CONDUCT.md) and [Security Policy](./SECURITY.md) before contributing.

## License

Mini Hands On Cube is released under the [MIT License](./LICENSE).

Copyright (c) 2026 Sithu Win San.
