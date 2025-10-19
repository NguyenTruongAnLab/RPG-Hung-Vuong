/**
 * Main entry point for Thần Thú Văn Lang - Phase 4
 * 
 * Modern entry using SceneManager and CharacterSelectionScene
 */
import { Application } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { SceneManager } from './core/SceneManager';
import { CharacterSelectionScene } from './scenes/CharacterSelectionScene';
import { OverworldScene } from './scenes/OverworldScene';

// Make PIXI available globally for DragonBones
(window as any).PIXI = PIXI;

/**
 * Initialize and start the game
 */
async function startGame() {
  try {
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

// Start the game immediately - pixi-dragonbones-runtime is now a proper ES module
startGame();
