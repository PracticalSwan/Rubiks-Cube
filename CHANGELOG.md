# Changelog

All notable changes to this standalone cube project should be documented in this file.

The format is based on Keep a Changelog and the project follows a simple date-based workshop history rather than strict releases.

## [2026-03-26]

### Added

- Husky-based git hook workflow via `prepare` script and `.husky` hook files.
- `scripts/check-readme-against-gitignore.mjs` to block README content that references ignored paths.
- `scripts/check-session-workflow.mjs` to enforce staged updates for `CHANGELOG.md`, `LESSONS.md`, and `README.md` during major functional changes.
- `check:readme` and `verify` scripts for local and hook-driven validation.
- Local reminder hooks for session start and post-commit discipline.

### Changed

- Updated `pre-commit` to remind session startup reading of `LESSONS.md` and enforce README scope checks.
- Updated `pre-commit` to enforce Serena/LESSONS/CHANGELOG/README workflow policy checks.
- Updated `pre-push` to remind end-of-task documentation and run the full verify pipeline before allowing pushes.
- Expanded local `.gitignore` with agent/tooling artifacts and common local cache/environment files.
- Rewrote local `README.md` to remain strictly project-focused (no AI or workflow sections).
- Fixed `Stop`/playback cancellation handling so expected cancel flows update status without logging console errors.
- Fixed stacked-layout scene sizing so tablet and mobile viewports keep the cube framed instead of letting the WebGL canvas balloon the panel height.
- Refined the local testing plan with the standalone app URL, practical Playwright selector guidance, and the current Three.js DevTools bridge workflow.

### Removed

- Local Jest test harness, test files, and Jest config so the folder now ships as a lean runtime-only app.
- Agent/workflow hook files and helper scripts that were only needed for AI-assisted session discipline.
- Planning and spec documents that were useful during implementation but are not required to run or use the project.

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
