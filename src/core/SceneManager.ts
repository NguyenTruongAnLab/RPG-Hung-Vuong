import * as PIXI from 'pixi.js';

/**
 * Abstract base class for all game scenes
 * 
 * Scenes represent different states of the game (Menu, Battle, Explore, etc.)
 * Each scene manages its own lifecycle and rendering.
 */
export abstract class Scene extends PIXI.Container {
  protected app: PIXI.Application;

  constructor(app: PIXI.Application) {
    super();
    this.app = app;
  }

  /**
   * Initialize the scene
   * Called when the scene becomes active
   * Load assets and create UI here
   */
  abstract init(): Promise<void>;

  /**
   * Update the scene
   * Called every frame (60 times per second)
   * 
   * @param dt - Delta time in milliseconds since last frame
   */
  abstract update(dt: number): void;

  /**
   * Cleanup the scene
   * Called when switching to another scene
   * Dispose of assets and remove listeners here
   */
  abstract destroy(): void;
}

/**
 * SceneManager - Manages scene lifecycle and transitions
 * 
 * The SceneManager handles switching between different game scenes
 * (Menu, Battle, Explore, etc.) and ensures proper cleanup.
 * 
 * @example
 * ```typescript
 * const sceneManager = new SceneManager(app);
 * await sceneManager.switchTo(new MenuScene(app));
 * 
 * // In game loop
 * sceneManager.update(deltaTime);
 * ```
 */
export class SceneManager {
  private app: PIXI.Application;
  private currentScene: Scene | null = null;
  private isTransitioning: boolean = false;

  /**
   * Creates a new SceneManager
   * @param app - The PixiJS application instance
   */
  constructor(app: PIXI.Application) {
    this.app = app;
  }

  /**
   * Switches to a new scene
   * 
   * This will:
   * 1. Destroy the current scene (if any)
   * 2. Initialize the new scene
   * 3. Add the new scene to the stage
   * 
   * @param scene - The scene to switch to
   * @throws Error if scene initialization fails
   */
  async switchTo(scene: Scene): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    this.isTransitioning = true;

    try {
      // Cleanup current scene
      if (this.currentScene) {
        // CRITICAL: Remove from stage BEFORE destroying to prevent render errors
        this.app.stage.removeChild(this.currentScene);
        this.currentScene.destroy();
      }

      // Initialize new scene
      this.currentScene = scene;
      await scene.init();

      // Add to stage
      this.app.stage.addChild(scene);
    } catch (error) {
      console.error('Failed to switch scene:', error);
      throw error;
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Updates the current scene
   * Call this in your game loop
   * 
   * @param dt - Delta time in milliseconds since last frame
   */
  update(dt: number): void {
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.update(dt);
    }
  }

  /**
   * Gets the currently active scene
   * @returns The current scene or null if no scene is active
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Checks if a scene transition is in progress
   * @returns true if transitioning, false otherwise
   */
  isTransitionInProgress(): boolean {
    return this.isTransitioning;
  }

  /**
   * Disposes of the scene manager and current scene
   */
  dispose(): void {
    if (this.currentScene) {
      this.currentScene.destroy();
      this.app.stage.removeChild(this.currentScene);
      this.currentScene = null;
    }
  }
}
