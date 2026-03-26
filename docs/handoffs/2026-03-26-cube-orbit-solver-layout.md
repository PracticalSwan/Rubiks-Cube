# 2026-03-26 - Cube orbit, solver, and layout pass

## Scope

- Removed the long hero paragraph from the scene intro card.
- Unlocked full vertical orbiting by relaxing the OrbitControls polar cap.
- Reduced the desktop shell footprint so the scene and control rail fit inside the viewport.
- Fixed repeated-randomize solves by keeping cumulative history and rejecting stale reverse-history plans.
- Aligned the workflow guard with the documented `LESSONS.md` requirement.

## Files Changed

- `app.js`
- `core/SolvePlanner.js`
- `scripts/workflow-lib.mjs`
- `style.css`
- `index.html`
- `tests/core/solve-planner.test.mjs`
- `README.md`
- `CHANGELOG.md`
- `LESSONS.md`

## Verification

- `npm test -- tests/core/solve-planner.test.mjs`
- `npm run lint`
- `npm run build`
- Browser check at `http://localhost:61871/` via Playwright and Three.js DevTools:
  - desktop viewport has `scrollHeight === innerHeight`
  - mobile viewport still stacks vertically
  - camera dragged from above the cube to directly underneath and back
  - two consecutive `Randomize` clicks followed by `Solve` ended with `Cube is solved in 22 moves.`

## Follow-Up

- Run the full `npm run verify` pipeline before merge; this pass updated the workflow guard, so the workflow tests should now align with the repo policy.
