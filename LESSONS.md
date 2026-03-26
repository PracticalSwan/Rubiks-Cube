# Lessons

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
