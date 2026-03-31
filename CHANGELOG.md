# Changelog

All notable changes to this standalone cube project should be documented in this file.

The format is based on Keep a Changelog and the project follows a simple date-based workshop history rather than strict releases.

## [2026-03-31]

### Changed

- Refined the render loop to use Three.js renderer-managed animation timing and to refresh the renderer pixel ratio during resize, which keeps the cube crisp after viewport or display-density changes without changing gameplay.
- Centralized async action-failure handling for manual turns, random scrambles, and solve playback so busy-state cleanup and status messaging stay consistent across the app shell.
- Hardened app startup with required DOM mount checks and kept the solver warmup status contextual when a player picks a face before the solver finishes loading.

## [2026-03-28]

### Added

- A top-level interaction-mode toggle that switches between the existing classic face-turn controls and the new Layer Arrow Mode without resetting cube state.
- A viewport-mounted 12-arrow overlay for Layer Arrow Mode so users can keep turning rows, columns, and middle slices without reselecting the face after every move.
- Middle-slice notation support (`M`, `E`, `S`) plus dedicated tests so arrow-mode turns flow through the same move queue, history, and solve-planning pipeline as classic turns.
- GitHub pull request and issue templates plus a CI workflow that runs `npm run verify` on pushes and pull requests.

### Changed

- Selecting a face in Layer Arrow Mode now rotates the cube into a true flat front view for the chosen color instead of inheriting the previous auto-spin angle, then keeps the view locked until the user drags the orbit controls or chooses a different face.
- Classic mode now hides the arrow overlay, while Layer Arrow Mode hides the clockwise/counterclockwise pad so the active interaction affordance is always clear.
- Camera handling now supports short face-focus transitions and manual drag-based unlocks without breaking zoom buttons, random scrambles, solve playback, or recorded move history.
- The Layer Arrow overlay now positions itself from the cube's projected screen bounds, which keeps the arrow ring centered and responsive on narrower viewports.
- The face selector now follows live center stickers instead of fixed notation faces, so choosing `Blue` always targets the face whose center is blue right now.
- Layer Arrow Mode now re-locks the selected center color after slice turns, which keeps the chosen color forward even when middle-layer moves shift centers to new faces.
- Solve playback details now render as readable numbered instructions with notation badges, so non-cubers can follow move sets without knowing `R`, `L`, or `M` ahead of time.

## [2026-03-26]

### Added

- MIT `LICENSE` for Sithu Win San.
- Baseline repo-health files: `.editorconfig`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- Local `docs/` workflow scaffold with protected `plans`, `specs`, `handoffs`, and reusable templates.
- `scripts/session-start.mjs` to scaffold dated plan, spec, and handoff artifacts for new sessions.
- `scripts/check-workflow-changes.mjs` and `scripts/verify-workflow.mjs` for commit-time and verification-time workflow checks.
- Project-local ESLint, Prettier, Vitest, and Vite tooling plus matching config files.
- Runtime dependency coverage for the Vite migration seam, including `loadCubeClass()` and the local solver package.
- Local vendored `cubejs` package under `vendor/cubejs` plus `core/loadCubeClass.js` for lazy solver bootstrapping.
- Detailed Vite production/testing plan and handoff notes in `docs/plans/` and `docs/handoffs/`.
- Husky `post-checkout`, `post-merge`, `pre-commit`, and `pre-push` hooks for session reminders and verification.
- Husky-based git hook workflow via `prepare` script and `.husky` hook files.
- `scripts/check-readme-against-gitignore.mjs` to block README content that references ignored paths.
- `scripts/check-session-workflow.mjs` to enforce staged updates for `CHANGELOG.md`, `LESSONS.md`, and `README.md` during major functional changes.
- `check:readme` and `verify` scripts for local and hook-driven validation.
- Local reminder hooks for session start and post-commit discipline.

### Changed

- Removed the hero paragraph from the scene copy so the intro card stays tighter and no longer repeats the longer workshop summary.
- Relaxed the orbit camera limits so the cube can be dragged fully above and below instead of stopping early on vertical movement.
- Tightened the desktop shell spacing, panel sizing, and initial camera framing so the scene and control deck fit the viewport without a page-height overflow while mobile still stacks normally.
- Preserved cumulative move history across repeated random-state scrambles and validated history against the live facelet state before preferring reverse-history solves, so `Solve` now finishes cleanly after multiple randomizes.
- Updated the workflow guard so missing `LESSONS.md` stays a blocking error for meaningful runtime changes, matching the documented repo policy and tests.
- Expanded `README.md` with contribution, conduct, security, and license references while keeping runtime setup and usage as the primary focus.
- Added `author`, `repository`, `bugs`, and `homepage` metadata to `package.json`.
- Cleaned contributor docs so the current Vite and Vitest workflow is the only documented path, including removal of stale Python fallback references from local instructions.
- Reintroduced lightweight contributor automation in `package.json` with `prepare`, `session:start`, and `verify` scripts while keeping the runtime start commands intact.
- Expanded local `CLAUDE.md` so new sessions have an explicit bootstrap path and protected-doc boundaries inside the standalone project.
- Ignored Husky's generated support folder so the repo only needs the authored hook files.
- Updated `pre-commit` to remind session startup reading of `LESSONS.md` and enforce README scope checks.
- Updated `pre-commit` to enforce Serena/LESSONS/CHANGELOG/README workflow policy checks.
- Updated `pre-push` to remind end-of-task documentation and run the full verify pipeline before allowing pushes.
- Updated the workflow guard to treat comment-only runtime edits as non-behavioral so contributor docs are not blocked unnecessarily.
- Removed deprecated Husky shim lines from local hook files to stay compatible with Husky v10.
- Expanded local `.gitignore` with agent/tooling artifacts and common local cache/environment files.
- Rewrote local `README.md` to remain strictly project-focused (no AI or workflow sections).
- Migrated the app shell to Vite for dev, build, and preview instead of the previous static-server workflow.
- Replaced Skypack Three.js imports and browser-global `cubejs` script tags with npm-managed `three` imports and a lazily loaded local `cubejs-local` package.
- Migrated the local automated test suite to Vitest and expanded the verify pipeline to include the production build.
- Swapped the face selector from cube notation to color names so guided turns match visible sticker colors.
- Disabled wheel and pinch zoom, then added explicit `-` and `+` controls for camera distance changes.
- Replaced lighting-driven sticker shading with flat materials so cube colors render without reflections or shadow tint shifts.
- Upgraded `Randomize` to use `cubejs` random-state scrambles instead of a naive repeated-face filter.
- Added history-aware solve selection, a move-set reveal panel, and a pre-solve restore button so solve playback is easier to inspect and undo.
- Fixed `Stop`/playback cancellation handling so expected cancel flows update status without logging console errors.
- Fixed stacked-layout scene sizing so tablet and mobile viewports keep the cube framed instead of letting the WebGL canvas balloon the panel height.
- Refined the local testing plan with the standalone app URL, practical Playwright selector guidance, and the current Three.js DevTools bridge workflow.
- Confirmed the migrated app through headed Playwright flows, responsive checks, and Three.js DevTools inspection with zero blocking browser-console errors.

### Removed

- Completed dated plans, specs, and handoff notes from `docs/` after folding their durable guidance into `README.md`, `LESSONS.md`, and Serena memory.
- Legacy Python static-server scripts that cannot serve the Vite module graph correctly.
- Browser-global dependency loading for Three.js and `cubejs`.
- The old Jest-based test harness.

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
