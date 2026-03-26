import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['cubejs-local'],
  },
  server: {
    host: '0.0.0.0',
    port: 8000,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 8000,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    sourcemap: true,
  },
});
