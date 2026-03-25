# Changelog

All notable changes to this standalone cube project should be documented in this file.

The format is based on Keep a Changelog and the project follows a simple date-based workshop history rather than strict releases.

## [2026-03-25]

### Added

- Local `README.md` for standalone project setup and project context.
- Local `package.json` with `http-server` and no-overlay startup commands.
- Local `.gitignore` for Node and editor artifacts.
- Local `LESSONS.md` so the extracted project can keep its own implementation notes.
- Baseline `style.css` so the existing HTML file no longer references a missing stylesheet.
- Jest plus `jsdom` test harness for the standalone cube repo.
- Initial `CubeNotation` contract covering the canonical solved facelet string.
- A full 3x3x3 Rubik's Cube scene with manual turns, scramble playback, solver playback, and responsive controls.
- Renderer-agnostic core modules for notation, move math, queueing, cube state, solver orchestration, and app wiring.
- Focused Jest coverage for cubies, move queues, solver behavior, UI controls, and animation orchestration.
- A tracked `LESSONS.md` file for implementation takeaways that travel with the standalone project.

### Changed

- Documented that the rotating cube demo is the current runtime and the Rubik's Cube solver remains in planning.
- Clarified that the local plans and spec files are intended to travel with the extracted project folder.
- Rewrote `README.md` as the finished-product guide for the planned Rubik's Cube solver implementation.
- Trimmed local README and LESSONS wording so the standalone folder keeps only high-signal setup and lesson context.
- Added ESM-aware test execution so the Rubik's Cube implementation plan can run red-green Jest cycles locally.
- Replaced the placeholder rotating cube runtime with the actual solver-backed Rubik's Cube app shell.
- Added local `cubejs` browser scripts plus `window.THREE` exposure so browser tooling can inspect the running scene.
