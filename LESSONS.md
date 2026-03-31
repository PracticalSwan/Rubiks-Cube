# Lessons

## 2026-03-31 - Renderer lifecycle hardening and shared async recovery

- If a Three.js canvas can be resized after startup or moved between displays, refresh both `renderer.setPixelRatio(...)` and `renderer.setSize(...)` from the same resize path; updating only size leaves the scene crisp at boot but blurry after DPI changes.
- `renderer.setAnimationLoop(...)` can replace a manual `requestAnimationFrame(...)` wrapper without changing app-level tick logic, which keeps the render lifecycle aligned with current Three.js guidance and future renderer features.
- When multiple async UI actions share the same busy-state contract, centralize the error-to-status cleanup in one helper; duplicate catch blocks drift quickly and make stop/scramble/solve failures feel inconsistent.

## 2026-03-28 - Live center-color selection and readable move copy

- If the UI teaches face identity through colors, store the player's selection as the color identity and resolve notation faces from live center stickers on demand; middle-slice moves otherwise make the selector lie.
- A locked face-selection model should follow the selected center after slice moves, not just rename the selector button; otherwise the highlighted color and the visible front face drift apart.
- Solve move lists become much easier to trust when descriptions are generated step-by-step from the live facelet state before each move, because slice turns can change which color owns `U`, `R`, or `F` later in the same sequence.

## 2026-03-28 - Canonical face locking and cube-centered overlays

- If a face-lock feature starts from an auto-spinning presentation state, snapping only the camera is not enough; reset the cube's presentation rotation to a canonical pose first or the chosen color will drift away from the intended front view.
- Overlay controls that are meant to hug a 3D object should follow projected object bounds, not a static container grid; the cube itself stays centered while the viewport shape changes.
- Helper captions inside a constrained scene overlay can distort layout math more than they help; keep durable status messaging in the control rail when the overlay needs maximum space for controls.

## 2026-03-28 - Face-locked slice controls

- If a new control scheme still represents real cube moves, extend the shared notation and history layer first; letting `M`, `E`, and `S` ride the same queue as face turns kept solve planning and move playback consistent.
- Face-locking a Rubik's Cube view is easier to maintain as a camera-pose concern than as ad-hoc DOM state, especially when OrbitControls, button-based zoom, and animation playback all need to coexist.
- When a locked interaction mode can be manually escaped, model that unlock explicitly in app state so the UI can explain whether the face is still snapped forward or has been released by a drag gesture.

## 2026-03-26 - Orbit freedom, viewport fit, and repeated scrambles

- If `OrbitControls` feels like vertical drag is "blocked," check `maxPolarAngle` before touching gesture handlers; a low polar cap can mimic a broken drag system even when pointer events are fine.
- Reversible move history is only safe as a solve shortcut when it still reconstructs the current cube state from solved; once history can drift, validate it against live facelets before preferring it over the real solver.
- Random-state scrambles should extend the recorded move history instead of replacing it, otherwise a second scramble turns reverse-history playback into a rewind to an earlier scrambled state rather than a full solve.
- On a two-column WebGL layout, fixing desktop overflow is usually a combination of constraining the shell height, letting the control rail scroll internally, and slightly backing the camera off so the scene breathes without breaking the stacked mobile layout.

## 2026-03-26 - Vite migration and vendored solver packaging

- A raw vendored CommonJS folder can pass tests and builds yet still fail in Vite dev with `module is not defined`; wrapping it as a local file dependency gives Vite a package boundary it can prebundle reliably.
- If a linked local CommonJS dependency must work in browser dev mode, add it to `optimizeDeps.include` so the browser never receives the raw CommonJS entrypoint.
- Once the app depends on bare module imports, plain static servers are no longer valid development fallbacks; use Vite `dev` or `preview` for real verification.
- Keep the heavy solver behind a cached dynamic import so the first render stays lighter while warmup still remains deterministic.

## 2026-03-26 - Lightweight agentic workflow bootstrap

- Keep session automation inside the standalone cube folder so the workflow survives repo extraction without depending on root-only tooling.
- Use hook automation for reminders and durable doc guards, not for user-facing runtime behavior.
- Prefer lightweight Node scripts plus the existing Vitest setup for workflow checks instead of introducing a second, parallel test harness.

## 2026-03-26 - README scope and workflow discipline

- Keep `README.md` strictly for shipped project behavior and runtime usage when AI-related folders or workflow artifacts are intentionally excluded from pushes.
- Enforce documentation habits with commit-time checks so `CHANGELOG.md` and `LESSONS.md` stay updated for code changes.
- Treat large functional edits (multiple `core/`, `ui/`, or app shell files) as a trigger to refresh `README.md` for users.
- Mistake to avoid: mixing contributor workflow guidance into user-facing README content.

## 2026-03-26 - Testing pass follow-ups

- Expected cancel paths should share one error-to-status mapper so `Stop` can remain a normal recovery flow instead of drifting into `console.error` noise in one catch block but not another.
- In a stacked flex layout, a WebGL host with `min-height: 100%` can feed the canvas intrinsic size back into layout and create runaway portrait heights; use `min-height: 0` on the flex child and size the canvas explicitly with CSS.
- When a viewport screenshot looks wrong, inspect the DOM box metrics before assuming camera math is broken; the tablet framing regression here was caused by layout sizing, not by OrbitControls or camera projection.
- Three.js DevTools can attach cleanly once the proxy targets the real app port; if the bridge comes up on the wrong target, use `set_dev_port` and reload instead of assuming the MCP is dead.

## 2026-03-26 - Workflow guards should distinguish comments from behavior

- File-name-only workflow guards overreport runtime changes when a commit only adds comments; inspect staged diff lines before requiring `LESSONS.md` or `CHANGELOG.md`.
- For staged diffs, treat blank lines and comment-only additions in `.js`, `.mjs`, `.css`, and `.html` as documentation changes rather than behavioral changes.
- Husky v9's loader shim lines are already deprecated and should be removed from local hook files before Husky v10 makes them fail outright.

## 2026-03-26 - Documentation and memory cleanup

- Completed dated plans and handoffs become noise quickly; once their durable conclusions land in `README.md`, `CHANGELOG.md`, `LESSONS.md`, or Serena memory, remove the one-off files.
- Serena memory stays more useful when it keeps stable project context only and drops task-specific pass logs, stale checkout notes, and unrelated preferences.

## 2026-03-25 - Rubik's Cube solver implementation

- Keep the cube state renderer-agnostic in `core/` so notation, move math, queueing, and solver orchestration stay testable without a browser canvas.
- Let `app.js` own the browser edge: Three.js imports, local `cubejs` browser scripts, DOM wiring, and `window.THREE` exposure for tooling.
- A shared quarter-turn queue keeps manual turns, random scrambles, and solver playback visually consistent and makes `Stop` behavior easier to reason about.
- Local browser verification should come before deeper scene inspection so console noise, missing assets, and layout regressions are ruled out early.
- Three.js DevTools belongs at the app edge as a runtime inspection tool; when the MCP bridge is available it should confirm scene tree, renderer state, and screenshots rather than replacing source-level tests.
