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
    // Create PixiJS application
    const app = new Application();
    // Note: previous defensive patch for PIXI.Container.addChild was removed.
    // WeatherManager now uses a local SafeContainer wrapper when constructing emitters.
    await app.init({
      width: 960,
      height: 640,
      backgroundColor: 0x1a1a2e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    // Add canvas to DOM
    const container = document.getElementById('game-container');
    if (!container) {
      throw new Error('Game container not found');
    }
    container.appendChild(app.canvas);

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
