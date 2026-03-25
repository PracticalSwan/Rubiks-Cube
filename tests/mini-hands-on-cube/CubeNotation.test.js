import { describe, expect, test } from '@jest/globals';
import {
  SOLVED_FACELETS,
  toFaceletString
} from '../../core/CubeNotation.js';

describe('CubeNotation', () => {
  test('exports the canonical solved facelet string', () => {
    expect(SOLVED_FACELETS).toBe(
      'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'
    );
  });

  test('serializes a solved cube model into facelets', () => {
    const cubies = [];

    expect(toFaceletString(cubies)).toHaveLength(54);
  });
});
