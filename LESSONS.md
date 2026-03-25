# Lessons

## 2026-03-25 - Rubik's Cube solver implementation

- Keep the cube state renderer-agnostic in `core/` so notation, move math, queueing, and solver orchestration stay testable without a browser canvas.
- Let `app.js` own the browser edge: Three.js imports, local `cubejs` browser scripts, DOM wiring, and `window.THREE` exposure for tooling.
- A shared quarter-turn queue keeps manual turns, random scrambles, and solver playback visually consistent and makes `Stop` behavior easier to reason about.
- Local browser verification should come before deeper scene inspection so console noise, missing assets, and layout regressions are ruled out early.
- Three.js DevTools belongs at the app edge as a runtime inspection tool; when the MCP bridge is available it should confirm scene tree, renderer state, and screenshots rather than replacing source-level tests.
