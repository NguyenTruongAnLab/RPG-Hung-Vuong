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

// Load DragonBones dynamically
import('dragonbones.js').then(() => {
  console.log('DragonBones loaded successfully');
  startGame();
}).catch(err => {
  console.error('Failed to load DragonBones:', err);
  startGame(); // Start anyway, will use fallbacks
});

/**
 * Initialize and start the game
 */
async function startGame() {
  try {
    // Create PixiJS application
    const app = new Application();
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

    // Check if player already has a party selected
    const savedParty = localStorage.getItem('playerParty');
    
    if (savedParty) {
      // Go directly to overworld
      console.log('Existing party found, loading overworld...');
      const overworldScene = new OverworldScene(app, sceneManager);
      await sceneManager.switchTo(overworldScene);
    } else {
      // Show character selection
      console.log('No party found, showing character selection...');
      const selectionScene = new CharacterSelectionScene(app, sceneManager);
      await sceneManager.switchTo(selectionScene);

      // Listen for game start event
      selectionScene.on('start-game', async () => {
        const overworldScene = new OverworldScene(app, sceneManager);
        await sceneManager.switchTo(overworldScene);
      });
    }

    // Game loop
    app.ticker.add((ticker) => {
      const deltaTime = ticker.deltaTime;
      sceneManager.update(deltaTime);
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

// Start the game
startGame();
