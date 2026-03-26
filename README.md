# Mini Hands On Cube

Mini Hands On Cube is a standalone Three.js Rubik's Cube app with manual face controls, random scramble, and solver-assisted recovery.

## Features

- Interactive 3x3x3 Rubik's Cube scene.
- Face selector and directional controls for manual turns.
- Utility controls: `Reset`, `Randomize`, `Solve`, and `Stop`.
- Solver integration powered by `cubejs`.
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

## How To Use

1. Choose a face from the face selector.
2. Use the direction pad to rotate that layer.
3. Use utility controls when needed:
4. `Randomize` creates a scramble and animates it.
5. `Solve` computes and plays the solution sequence.
6. `Stop` cancels active playback safely without leaving the app in a stuck state.
7. `Reset` returns to solved state instantly.

Status text reports current app state: `warming`, `idle`, `scrambling`, `solving`, `solved`, or `error`.
