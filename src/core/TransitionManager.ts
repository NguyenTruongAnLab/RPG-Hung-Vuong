/**
 * TransitionManager - Handles scene transitions using GSAP
 * 
 * Provides smooth fade in/out and crossfade transitions between scenes.
 * Uses GSAP for high-performance animations.
 * 
 * @example
 * ```typescript
 * const manager = TransitionManager.getInstance();
 * 
 * // Fade out current scene
 * await manager.fadeOut(currentScene, 0.5);
 * 
 * // Switch scenes
 * sceneManager.switchTo(newScene);
 * 
 * // Fade in new scene
 * await manager.fadeIn(newScene, 0.5);
 * ```
 */
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { Scene } from './SceneManager';

export interface TransitionOptions {
  duration?: number;
  color?: number;
  alpha?: number;
}

/**
 * TransitionManager - Singleton manager for scene transitions
 */
export class TransitionManager {
  private static instance: TransitionManager;
  private overlay: PIXI.Graphics | null = null;
  private app: PIXI.Application | null = null;

  private constructor() {
    // Singleton pattern
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): TransitionManager {
    if (!TransitionManager.instance) {
      TransitionManager.instance = new TransitionManager();
    }
    return TransitionManager.instance;
  }

  /**
   * Initializes the transition manager with the app instance
   * 
   * @param app - The PixiJS application
   */
  init(app: PIXI.Application): void {
    this.app = app;
    this.createOverlay();
  }

  /**
   * Creates the transition overlay
   */
  private createOverlay(): void {
    if (!this.app) {
      throw new Error('TransitionManager not initialized. Call init() first.');
    }

    this.overlay = new PIXI.Graphics();
    this.overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.overlay.fill(0x000000);
    this.overlay.alpha = 0;
    this.overlay.zIndex = 10000; // Ensure it's on top
    
    // Add to stage
    this.app.stage.addChild(this.overlay);
  }

  /**
   * Fades out a scene to black
   * 
   * @param scene - The scene to fade out
   * @param duration - Fade duration in seconds (default: 0.5)
   * @param options - Additional transition options
   * @returns Promise that resolves when fade is complete
   * 
   * @example
   * ```typescript
   * await transitionManager.fadeOut(currentScene, 0.5);
   * ```
   */
  async fadeOut(
    scene: Scene,
    duration: number = 0.5,
    options: TransitionOptions = {}
  ): Promise<void> {
    if (!this.overlay) {
      this.createOverlay();
    }

    const { color = 0x000000, alpha = 1 } = options;

    // Update overlay color if needed
    if (this.overlay) {
      this.overlay.clear();
      this.overlay.rect(0, 0, this.app!.screen.width, this.app!.screen.height);
      this.overlay.fill(color);
    }

    return new Promise((resolve) => {
      gsap.to(this.overlay, {
        alpha: alpha,
        duration: duration,
        ease: 'power2.inOut',
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  /**
   * Fades in a scene from black
   * 
   * @param scene - The scene to fade in
   * @param duration - Fade duration in seconds (default: 0.5)
   * @param options - Additional transition options
   * @returns Promise that resolves when fade is complete
   * 
   * @example
   * ```typescript
   * await transitionManager.fadeIn(newScene, 0.5);
   * ```
   */
  async fadeIn(
    scene: Scene,
    duration: number = 0.5,
    options: TransitionOptions = {}
  ): Promise<void> {
    if (!this.overlay) {
      this.createOverlay();
    }

    return new Promise((resolve) => {
      gsap.to(this.overlay, {
        alpha: 0,
        duration: duration,
        ease: 'power2.inOut',
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  /**
   * Performs a crossfade transition between two scenes
   * 
   * @param fromScene - The scene to fade out
   * @param toScene - The scene to fade in
   * @param duration - Total transition duration in seconds (default: 1.0)
   * @returns Promise that resolves when crossfade is complete
   * 
   * @example
   * ```typescript
   * await transitionManager.crossFade(oldScene, newScene, 1.0);
   * ```
   */
  async crossFade(
    fromScene: Scene,
    toScene: Scene,
    duration: number = 1.0
  ): Promise<void> {
    const halfDuration = duration / 2;

    // Fade out current scene
    await this.fadeOut(fromScene, halfDuration);

    // Fade in new scene
    await this.fadeIn(toScene, halfDuration);
  }

  /**
   * Shows the overlay immediately
   * Useful for instant transitions
   */
  showOverlay(): void {
    if (this.overlay) {
      this.overlay.alpha = 1;
    }
  }

  /**
   * Hides the overlay immediately
   * Useful for instant transitions
   */
  hideOverlay(): void {
    if (this.overlay) {
      this.overlay.alpha = 0;
    }
  }

  /**
   * Gets the current overlay alpha
   * @returns Current alpha value (0-1)
   */
  getOverlayAlpha(): number {
    return this.overlay?.alpha ?? 0;
  }

  /**
   * Checks if a transition is currently active
   * @returns True if a transition is in progress
   */
  isTransitioning(): boolean {
    return this.overlay ? this.overlay.alpha > 0 && this.overlay.alpha < 1 : false;
  }

  /**
   * Cleans up the transition manager
   */
  dispose(): void {
    if (this.overlay && this.app) {
      gsap.killTweensOf(this.overlay);
      this.app.stage.removeChild(this.overlay);
      this.overlay.destroy();
      this.overlay = null;
    }
  }
}
