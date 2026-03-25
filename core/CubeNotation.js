export const SOLVED_FACELETS =
  'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

export function toFaceletString(cubies) {
  if (!cubies.length) {
    return SOLVED_FACELETS;
  }

  throw new Error('Implement cubie-to-facelet serialization');
}
