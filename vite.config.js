import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  // Detect if building for Electron
  const isElectron = process.env.BUILD_FOR_ELECTRON === 'true';
  
  return {
    // Use repo name for GitHub Pages, './' for local development or Electron
    base: !isElectron && command === 'build' ? '/RPG-Hung-Vuong/' : './',
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      
      // 🔒 SECURITY: Production optimizations
      minify: 'esbuild', // Built-in to Vite, faster than terser, no external dependency
      sourcemap: false,  // 🔒 IMPORTANT: No source maps in production
      
      // Code splitting for better caching
      rollupOptions: {
        input: isElectron 
          ? {
              main: './src/electron/main.ts',
              preload: './src/electron/preload.ts',
              renderer: './index.html'
            }
          : './index.html',
        output: {
          // 🔒 Security: Split into separate chunks for better caching
          manualChunks: {
            'pixi': ['pixi.js'],
            'animation': ['pixi-dragonbones-runtime'],
            'physics': ['matter-js']
          },
          // 🔒 Security: Hash filenames so old versions can't be guessed
          entryFileNames: isElectron 
            ? '[name].js'  // No hashing for Electron main/preload
            : 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      
      // Optimize for production
      cssCodeSplit: true,
      reportCompressedSize: true,
      
      // Electron-specific settings
      ...(isElectron && {
        target: 'esnext'
      })
    },
    
    optimizeDeps: {
      exclude: ['dragonbones.js', 'electron'] // Don't pre-bundle DragonBones or Electron
    },
    
    server: {
      port: 3000,
      open: true,
      // 🔒 Security: Limit dev server to localhost only
      middlewareMode: false,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173
      }
    }
  };
});
