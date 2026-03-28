# Live Color Face Selector Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make color selection follow live center stickers, refresh arrow-mode targeting automatically after slice moves, and replace notation-first solve text with readable step-by-step instructions.

**Architecture:** Keep solver/runtime notation unchanged, then add a live view-model layer that derives center-color mappings from the current facelet string. Use that mapping to drive selector labels, face resolution, arrow-mode locking, and solve-plan copy so the UI stays truthful even when centers move.

**Tech Stack:** Vite, Three.js, vanilla DOM rendering helpers, Vitest

---

### Task 1: Add live center-color helpers

**Files:**

- Modify: `core/CubeNotation.js`
- Test: `tests/core/cube-notation.test.mjs`

**Step 1: Write the failing tests**

- Add assertions for:
  - reading center colors from solved facelets
  - resolving a color back to the current live face after a slice move
  - generating readable move descriptions from notation

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/core/cube-notation.test.mjs`
Expected: FAIL because the new helpers do not exist yet.

**Step 3: Write minimal implementation**

- Add helpers that:
  - read current center stickers from a facelet string
  - expose color-first selector metadata
  - convert move tokens into readable move descriptions with optional notation badges

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/core/cube-notation.test.mjs`
Expected: PASS

### Task 2: Route selector state through live colors

**Files:**

- Modify: `app.js`
- Modify: `ui/FaceSelector.js`

**Step 1: Write the failing test or state expectation**

- Add or expand tests around selector-facing metadata if needed.
- Capture the intended state shape in code by replacing fixed-face assumptions with color-driven resolution.

**Step 2: Implement minimal state changes**

- Store the selected face as a selected color label or color token.
- Derive live selector options from the current facelets every render.
- Resolve the current notation face right before classic turns, arrow locks, and status messages.

**Step 3: Verify selector behavior manually in code review**

- Check that deselection, busy-state disabling, and arrow-mode lock behavior still use one state path.

### Task 3: Refresh solve playback copy

**Files:**

- Modify: `core/SolvePlanner.js`
- Modify: `ui/UtilityControls.js`
- Test: `tests/core/solve-planner.test.mjs`

**Step 1: Write the failing tests**

- Assert that solve plans expose readable step data instead of only one flat notation string.

**Step 2: Implement minimal plan changes**

- Extend solve-plan output with a move-details array for numbered display.
- Keep raw move tokens for playback and tie descriptions to the current live center-color map.

**Step 3: Update the controls renderer**

- Render a readable numbered move list with notation as secondary text.
- Keep the collapsed/expanded control behavior intact.

**Step 4: Run focused tests**

Run: `npm run test -- tests/core/solve-planner.test.mjs`
Expected: PASS

### Task 4: Polish and verify the UI

**Files:**

- Modify: `style.css`
- Verify: browser screenshots on desktop and mobile

**Step 1: Adjust layout only where needed**

- Make sure selector helper text and the move list stay readable without pushing the controls into awkward wrapping.

**Step 2: Verify in browser**

- Check full UI in desktop and mobile.
- Confirm:
  - the selected color follows the live center
  - arrow mode still locks the selected live face correctly
  - solve instructions are understandable
  - no overlay or spacing regressions appear

### Task 5: Final verification and documentation

**Files:**

- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `LESSONS.md`

**Step 1: Run the full verification gate**

Run: `npm run verify`
Expected: PASS

**Step 2: Update docs**

- Document that color selection now follows live center stickers.
- Document that solve playback now uses readable instructions with notation hints.

**Step 3: Record memory**

- Save the durable behavior change and verification expectations back into Serena memory.
