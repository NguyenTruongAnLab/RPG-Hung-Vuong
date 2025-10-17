/**
 * Simple demo entry point for Phase 2 testing
 * Directly loads the OverworldScene
 */
import { Application } from 'pixi.js';
import { SceneManager } from './core/SceneManager';
import { OverworldScene } from './scenes/OverworldScene';

async function startDemo() {
    // Create PixiJS application
    const app = new Application();
    await app.init({
        width: 1280,
        height: 720,
        backgroundColor: 0x1a1a2e
    });

    // Add to DOM
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(app.canvas);
    } else {
        document.body.appendChild(app.canvas);
    }

    // Create scene manager
    const sceneManager = new SceneManager(app);

    // Load overworld scene
    const overworldScene = new OverworldScene(app);
    await sceneManager.switchTo(overworldScene);

    // Game loop
    app.ticker.add((ticker) => {
        sceneManager.update(ticker.deltaMS);
    });

    console.log('Phase 2 Demo Started!');
    console.log('Controls: WASD/Arrows = Move, Space = Attack');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startDemo);
} else {
    startDemo();
}
