# Live Color Face Selector Design

**Date:** 2026-03-28

## Goal

Make face selection follow the cube's live center stickers so a color button such as `Blue` always targets the face whose center is blue right now, even after middle-slice moves. At the same time, make solve instructions understandable for non-cubers by promoting plain-language move descriptions over raw notation.

## Current Problem

- The UI presents face selection as colors, but the implementation stores a fixed notation face such as `U` or `R`.
- Arrow mode can turn middle slices, which moves centers to different cube positions.
- After those turns, the `Blue` button still points at the old notation face instead of the face that currently has the blue center.
- Solve playback text is notation-first (`R`, `R'`, `M`) and assumes cube-notation knowledge that many users do not have.

## Recommended Approach

### 1. Treat colors as the player-facing source of truth

- Keep the solver, animation queue, and cube state in notation space.
- Introduce a live color-to-face map derived from the current facelet string.
- Store the selected face in UI state as a color-facing identity, then resolve the current notation face through the live map whenever the user turns a face, locks arrow mode, or refreshes the selector.

### 2. Show the selector as color-first with live position context

- Each button keeps its stable color label (`Blue`, `Green`, etc.).
- Add a small helper label such as `currently: Front` or `currently: Top` so the user can see where that center sits right now.
- Keep selection and busy handling in the existing selector render path so the UI stays centralized.

### 3. Keep arrow mode behavior stable

- Arrow mode still locks to the currently selected live face.
- After a middle-slice move, the selected color stays selected, but its resolved face can change because the center moved.
- Re-render the selector and arrow controls after every move so the chosen color always targets the correct live face.

### 4. Replace notation-first solve text with readable instructions

- Keep notation internally for solver playback and history comparison.
- Convert each move token into plain-language guidance such as `Turn the blue-center face clockwise` or `Move the middle vertical slice upward`.
- Show notation as a secondary hint so advanced users can still map moves to standard cube language.

## Data Flow

1. Read `rubiksCube.toFaceletString()`.
2. Derive the center sticker on each notation face.
3. Build:
   - a face-to-color map for labels and tooltips
   - a color-to-face map for resolving the selected color into a live face
4. Feed that map into:
   - `renderFaceSelector()`
   - classic direction-pad execution
   - arrow-mode lock and overlay labels
   - solve-plan move descriptions

## UI Notes

- The face selector should remain compact, so the location helper text needs to be small and responsive.
- The move list should switch from a single sentence to a readable list layout because descriptions are longer than notation strings.
- Desktop and mobile screenshots are required after implementation to validate spacing, wrapping, and overlay alignment.

## Testing Strategy

- Add unit tests for deriving center-color mappings from facelets.
- Add tests for converting raw notation into plain-language move descriptions.
- Keep existing slice-notation and overlay-centering tests.
- Finish with `npm run verify` and browser validation on desktop and mobile.
