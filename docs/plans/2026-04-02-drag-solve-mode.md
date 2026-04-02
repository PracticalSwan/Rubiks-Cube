# Drag Solve Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a third interaction mode that lets players solve by dragging visible stickers while reserving empty surrounding space for whole-cube orbiting.

**Architecture:** Keep the existing cube model, notation, animation queue, and solver flow unchanged. Add a drag-gesture resolver in `core/`, wire it into `app.js`, and let the new mode decide whether a pointer drag belongs to sticker-turning or `OrbitControls` based on the initial hit target.

**Tech Stack:** Vite, Three.js, OrbitControls, vanilla DOM helpers, Vitest, Playwright/browser MCP

---

## Context

- Read `AGENTS.md`
- Read `README.md`, `CHANGELOG.md`, and `LESSONS.md`
- Read relevant Serena notes in `.serena/memories/project/`
- Keep `README.md` user-facing and record durable takeaways in `LESSONS.md`

### Task 1: Add drag-solve resolver tests

**Files:**

- Create: `tests/core/drag-solve-mode.test.mjs`
- Modify: `core/LayerArrowMode.js` only if shared helpers are worth reusing

**Step 1: Write the failing test**

```text
Add tests that prove a face hit plus a drag direction resolves to the expected cube move, and that tiny or ambiguous drags return null.
```

**Step 2: Run the test or check**

Run: `npm run test -- tests/core/drag-solve-mode.test.mjs`
Expected: FAIL because the drag-solve helper does not exist yet.

**Step 3: Implement the minimal change**

```text
Create a new core helper module with pure functions for hit classification, drag thresholds, and move resolution.
```

**Step 4: Verify green**

Run: `npm run test -- tests/core/drag-solve-mode.test.mjs`
Expected: PASS

### Task 2: Add the new interaction mode to the UI

**Files:**

- Modify: `ui/InteractionModeToggle.js`
- Modify: `style.css`

**Step 1: Write the failing test or capture the missing state**

```text
Add the new mode option first so the UI can render a third state and expose the intended copy.
```

**Step 2: Run the relevant checks**

Run: `npm run test -- tests/core/drag-solve-mode.test.mjs`
Expected: Existing drag tests still pass; UI remains unverified until app wiring lands.

**Step 3: Implement the minimal change**

```text
Add `drag` as a top-level interaction mode with copy that explains cube-drag turns and empty-space orbiting.
```

**Step 4: Verify green**

Run: `npm run lint -- ui/InteractionModeToggle.js`
Expected: PASS

### Task 3: Wire pointer ownership and drag solving into `app.js`

**Files:**

- Modify: `app.js`
- Modify: `core/createRubiksCubeApp.js` only if a small orbit enable/disable helper is needed

**Step 1: Write the failing test or state expectation**

```text
Capture the intended app flow in code: drag mode should claim gestures that start on the cube and leave empty-space drags to OrbitControls.
```

**Step 2: Run the focused checks**

Run: `npm run test -- tests/core/drag-solve-mode.test.mjs tests/core/layer-arrow-mode.test.mjs`
Expected: PASS for pure helpers before app integration; browser behavior still missing.

**Step 3: Implement the minimal change**

```text
Add raycasting, pointer tracking, drag threshold handling, gesture cleanup, status copy, and queueing through the existing move pipeline.
Hide the classic pad and arrow overlay while drag mode is active.
```

**Step 4: Verify green**

Run: `npm run test -- tests/core/drag-solve-mode.test.mjs tests/core/layer-arrow-mode.test.mjs tests/core/cube-notation.test.mjs`
Expected: PASS

### Task 4: Browser verification and artifact review

**Files:**

- Verify only: running app, screenshots, console logs

**Step 1: Start the app**

Run: `npm run dev`
Expected: Local Vite server starts successfully.

**Step 2: Verify behavior in browser**

Run:

- open the app in Playwright/browser MCP
- test dragging on stickers
- test dragging outside the cube
- capture desktop and smaller viewport screenshots

Expected:

- sticker drags turn one layer
- empty-space drags orbit the cube
- no blocking console errors
- no layout artifacts in control panels

**Step 3: Fix anything discovered**

```text
Adjust gesture thresholds, status text, or layout only where browser verification proves it is needed.
```

### Task 5: Full verification and documentation

**Files:**

- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `LESSONS.md`
- Modify: `.serena/memories/project/patterns-and-best-practices.md` if a durable interaction rule is learned

**Step 1: Run the full verification gate**

Run: `npm run verify`
Expected: PASS

**Step 2: Update docs**

```text
Document Drag Solve Mode in README, record the shipped behavior in CHANGELOG, and capture any durable interaction lesson in LESSONS.
```

**Step 3: Record memory**

```text
Update the relevant Serena memory note with the new interaction rule and verification expectation.
```
