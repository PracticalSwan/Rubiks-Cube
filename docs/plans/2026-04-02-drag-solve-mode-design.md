# Drag Solve Mode Design

**Date:** 2026-04-02

## Goal

Add a third interaction mode that matches the drag behavior of `onlinecube.com`: dragging on the cube itself performs a puzzle move, while dragging in the empty space around the cube rotates the whole scene.

## Current Problem

- The app currently exposes only two move-entry models:
  - `Classic Face Turn Mode`, which depends on selecting a color and pressing clockwise or counterclockwise buttons.
  - `Layer Arrow Mode`, which locks a face forward and uses a 12-arrow overlay.
- Orbit rotation is always bound to the canvas, so a player cannot solve the cube by dragging a sticker or row directly.
- The current controls work, but they do not offer the more tactile "grab the cube to turn a layer" interaction found on `onlinecube.com`.

## Recommended Approach

### 1. Add `Drag Solve Mode` as a third top-level interaction mode

- Keep the existing classic and arrow modes unchanged.
- Add a new mode that advertises:
  - drag on the cube to turn a layer
  - drag outside the cube to orbit
- Preserve the existing move queue, solve planning, history tracking, and busy-state rules so the new mode is only an input-layer addition.

### 2. Separate pointer ownership at gesture start

- On pointer down, raycast into visible cubies.
- If the pointer starts on a visible sticker/cubie face:
  - claim the gesture for drag solving
  - temporarily suppress orbit for that gesture
- If the pointer starts in empty space:
  - do not claim the gesture
  - let `OrbitControls` handle the drag normally
- This mirrors the reference interaction model and avoids mid-gesture ambiguity.

### 3. Resolve one drag into one notation move

- Record the hit face, hit cubie, and hit point on pointer down.
- During pointer move, once the drag exceeds a small threshold:
  - determine the dominant screen direction
  - determine whether the touched sticker belongs to the top/middle/bottom row or left/middle/right column of the hit face
  - map that combination to a standard cube move such as `U`, `R'`, `M`, or `S`
- Queue the resolved move through the same `rubiksCube.queueMoves(...)` path used by the other modes.

### 4. Keep camera behavior predictable

- `OrbitControls` should still exist globally.
- Drag Solve Mode changes only who owns the current drag gesture.
- When the gesture starts on the cube, orbit is blocked for that gesture.
- When the gesture starts off the cube, orbit behaves exactly as it does today.
- Zoom remains button-driven.

### 5. Fail safe on ambiguity

- Ignore tiny drags that do not clearly indicate intent.
- Ignore drag-solve gestures while the cube is busy animating, solving, or scrambling.
- Cancel drag ownership cleanly on `pointerup`, `pointercancel`, or `lostpointercapture`.
- Prefer "no move" over a wrong move if face, row/column, or drag direction is unclear.

## Data And Code Shape

1. Add a new core helper dedicated to drag-mode math and move resolution.
2. Keep `app.js` responsible for:
   - mode switching
   - pointer event wiring
   - busy-state guards
   - status text
   - queueing the resulting move
3. Keep `RubiksCube` and solver code unchanged except for consuming standard notation moves from the new resolver.

## UI Notes

- The mode toggle copy should explain the input split clearly so users know where to drag for orbiting versus solving.
- Drag Solve Mode should not show the classic turn pad or the arrow overlay.
- Status text should tell the user:
  - drag the cube to turn a layer
  - drag the space around it to rotate the view

## Testing Strategy

- Add unit tests for:
  - resolving hit rows and columns from face-local coordinates
  - mapping drag gestures to notation moves for several faces
  - returning `null` for ambiguous or tiny drags
- Add focused state tests where practical for mode behavior and gesture ownership.
- Run targeted Vitest checks first, then `npm run verify`.
- Finish with browser testing, console inspection, and desktop/mobile screenshots to catch interaction or layout artifacts.
