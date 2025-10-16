import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'pixi': ['pixi.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
