import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({
  // Use repo name for GitHub Pages, './' for local development
  // command is 'build' or 'serve'
  base: command === 'build' ? '/RPG-Hung-Vuong/' : './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // 🔒 SECURITY: Production optimizations
    minify: 'terser', // Minify code - harder to reverse engineer
    sourcemap: false,  // 🔒 IMPORTANT: No source maps in production
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      },
      mangle: true // Obfuscate variable names
    },
    
    // Code splitting for better caching
    rollupOptions: {
      output: {
        // 🔒 Security: Split into separate chunks for better caching
        manualChunks: {
          'pixi': ['pixi.js'],
          'animation': ['pixi-dragonbones-runtime'],
          'physics': ['matter-js']
        },
        // 🔒 Security: Hash filenames so old versions can't be guessed
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    
    // Optimize for production
    cssCodeSplit: true,
    reportCompressedSize: true
  },
  
  optimizeDeps: {
    exclude: ['dragonbones.js'] // Don't pre-bundle DragonBones
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
}));
