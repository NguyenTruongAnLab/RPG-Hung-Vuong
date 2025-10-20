/**
 * Main entry point for Thần Thú Văn Lang - Phase 4
 * 
 * Modern entry using SceneManager and CharacterSelectionScene
 */
import { Application, Assets } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { SceneManager } from './core/SceneManager';
import { AssetManager } from './core/AssetManager';
import { CharacterSelectionScene } from './scenes/CharacterSelectionScene';
import { OverworldScene } from './scenes/OverworldScene';

// Make PIXI available globally for DragonBones
(window as any).PIXI = PIXI;

// CRITICAL: Disable Web Workers for image loading so fetch/XHR interception works
// PixiJS v8 uses WorkerManager.loadImageBitmap which bypasses main thread interception
// Setting preferWorkers: false forces images to load on main thread where asset-loader.js can intercept
try {
  Assets.setPreferences({ preferWorkers: false });
  console.log('🔧 [Main] Disabled PixiJS Web Workers for encrypted asset interception');
} catch (error) {
  console.warn('⚠️ [Main] Could not disable workers:', error);
}

/**
 * Initialize and start the game
 */
async function startGame() {
  try {
    // Initialize AssetManager first (handles Electron/web detection)
    const assetManager = AssetManager.getInstance();
    await assetManager.initialize();
    console.log('✅ AssetManager initialized');
    
    // Create PixiJS application with responsive sizing
    const app = new Application();
    // Note: previous defensive patch for PIXI.Container.addChild was removed.
    // WeatherManager now uses a local SafeContainer wrapper when constructing emitters.
    
    // Get container first to determine viewport size
    const container = document.getElementById('game-container');
    if (!container) {
      throw new Error('Game container not found');
    }
    
    // Use window dimensions for fullscreen/responsive canvas
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    await app.init({
      width: width,
      height: height,
      backgroundColor: 0x1a1a2e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      resizeTo: window // Auto-resize with window
    });

    // Add canvas to DOM first
    container.appendChild(app.canvas);
    
    // Style canvas for fullscreen (after appending to DOM)
    app.canvas.style.width = '100%';
    app.canvas.style.height = '100%';
    app.canvas.style.display = 'block';
    app.canvas.style.position = 'absolute';
    app.canvas.style.top = '0';
    app.canvas.style.left = '0';
    
    // CRITICAL: Set canvas tabindex to make it focusable, then focus it
    app.canvas.setAttribute('tabindex', '0');
    app.canvas.focus();
    console.log('✅ Canvas focused for keyboard input');
    
    // Add event listeners to track focus state
    app.canvas.addEventListener('focus', () => {
      console.log('✅ CANVAS FOCUSED - Keyboard input will work');
    });
    
    app.canvas.addEventListener('blur', () => {
      console.log('⚠️ CANVAS LOST FOCUS - Keyboard input disabled');
    });
    
    // Handle window resize for responsive canvas
    // Note: resizeTo: window in init() handles automatic resizing,
    // but we keep this for explicit control and canvas focus
    window.addEventListener('resize', () => {
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      // Re-focus canvas after resize
      app.canvas.focus();
    });

    // Create scene manager
    const sceneManager = new SceneManager(app);

    // Always show character selection first (opening experience)
    // This allows players to see the game UI even if they have a saved party
    console.log('Starting game - showing character selection scene...');
    const selectionScene = new CharacterSelectionScene(app, sceneManager);
    await sceneManager.switchTo(selectionScene);

    // Listen for game start event
    selectionScene.on('start-game', async () => {
      console.log('Starting overworld scene...');
      const overworldScene = new OverworldScene(app, sceneManager);
      await sceneManager.switchTo(overworldScene);
      
      // CRITICAL: Re-focus canvas after scene transition
      // Button clicks may have stolen focus, so we need to regain it
      setTimeout(() => {
        app.canvas.focus();
        console.log('✅ Canvas refocused after scene transition');
      }, 100);
    });

    // Game loop
    app.ticker.add((ticker) => {
      const deltaTime = ticker.deltaTime;
      sceneManager.update(deltaTime);
    });

    // Defensive check: remove any non-PIXI display objects from the stage to avoid
    // 'updateLocalTransform is not a function' crashes during rendering. This helps
    // catch accidental additions of plain objects to the stage at runtime.
    app.ticker.add(() => {
      try {
        const children = [...app.stage.children];
        for (const child of children) {
          // Some objects (like plain POJOs) won't have updateLocalTransform method
          // which Pixi expects on DisplayObject. Remove and log them.
          // @ts-ignore
          if (!child || typeof (child as any).updateLocalTransform !== 'function') {
            console.error('Removing non-display child from stage to avoid render crash:', child);
            try { app.stage.removeChild(child as any); } catch (e) { /* ignore */ }
          }
        }
      } catch (e) {
        // keep ticker stable
      }
    });

    console.log('Thần Thú Văn Lang - Game started!');
    console.log('207 Divine Beasts | Ngũ Hành System | Turn-based Combat');

    // Make app accessible globally for debugging
    (window as any).app = app;
    (window as any).sceneManager = sceneManager;
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

/**
 * Wait for encrypted assets if in production web build
 * Development uses unencrypted assets directly
 */
if (typeof (window as any).assetLoader !== 'undefined') {
  console.log('🔐 [Main] Detected encrypted asset system, waiting for assets to be ready...');
  
  // Check if already ready (loaded before script execution)
  if ((window as any).encryptedAssetsReady) {
    console.log('🔐 [Main] Assets already ready, starting game now');
    startGame();
  } else {
    // Wait for assetsReady event
    window.addEventListener('assetsReady', () => {
      console.log('🔐 [Main] Received assetsReady event, starting game now');
      startGame();
    });
    
    // Also handle failure case
    window.addEventListener('assetsFailed', () => {
      console.error('❌ [Main] Failed to load encrypted assets, cannot start game');
      const container = document.getElementById('game-container');
      if (container) {
        container.innerHTML = '<div style="color: red; text-align: center; padding: 50px;">' +
          '❌ Failed to load game assets<br>' +
          'Please check console for details and try refreshing the page.' +
          '</div>';
      }
    });
    
    console.log('🔐 [Main] Waiting for assetsReady event...');
  }
} else {
  // Development mode or Electron - start immediately
  console.log('🚀 [Main] No encrypted asset system detected, starting game immediately');
  startGame();
}
