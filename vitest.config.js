// Keep the test runner in a lightweight local setup that mirrors the standalone cube project.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.mjs'],
  },
});
