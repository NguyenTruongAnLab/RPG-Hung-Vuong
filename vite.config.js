import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({
  // Use repo name for GitHub Pages, './' for local development
  // command is 'build' or 'serve'
  base: command === 'build' ? '/RPG-Hung-Vuong/' : './',
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
  optimizeDeps: {
    exclude: ['dragonbones.js'] // Don't pre-bundle DragonBones
  },
  server: {
    port: 3000,
    open: true
  }
}));
