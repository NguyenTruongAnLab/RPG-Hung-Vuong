import { PixiFactory, PixiArmatureDisplay } from 'pixi-dragonbones-runtime';
import * as PIXI from 'pixi.js';

/**
 * Interface for DragonBones asset data
 */
export interface DragonBonesAsset {
  id: string;
  skeleton: any;
  textureAtlas: any;
  texture: PIXI.Texture;
}

/**
 * DragonBonesManager - Manages DragonBones runtime integration
 * 
 * This manager handles the initialization and creation of DragonBones
 * armature displays for the 200 monsters in the game.
 * 
 * @example
 * ```typescript
 * const manager = new DragonBonesManager(app);
 * const asset = await assetManager.loadMonster('char001');
 * const display = manager.createDisplay(asset);
 * app.stage.addChild(display);
 * ```
 */
export class DragonBonesManager {
  private factory: PixiFactory;
  // Track loaded data across all manager instances to avoid re-parsing the
  // same DragonBones data into the shared PixiFactory (which logs errors
  // if the same name is added multiple times). Use a static Set so it's
  // shared globally.
  private static loadedDataNames: Set<string> = new Set<string>();

  /**
   * Creates a new DragonBonesManager
   * @param app - The PixiJS application instance
   */
  constructor(app: PIXI.Application) {
    // Use the static factory instance from pixi-dragonbones-runtime
    this.factory = PixiFactory.factory;
  }

  /**
   * Creates a DragonBones armature display from asset data
   * 
   * @param asset - The DragonBones asset containing skeleton, texture atlas, and texture
   * @param armatureName - Optional armature name (defaults to 'armature')
   * @returns The created armature display ready to be added to the stage
   * 
   * @throws Error if skeleton data parsing fails
   */
  public createDisplay(
    asset: DragonBonesAsset,
    armatureName: string = 'armature'
  ): PixiArmatureDisplay {
    try {
      // Check if this data has already been added to prevent duplicates
      const dataKey = `${asset.id}_${armatureName}`;

      if (!DragonBonesManager.loadedDataNames.has(dataKey)) {
        // Parse the DragonBones skeleton data
        this.factory.parseDragonBonesData(asset.skeleton);

        // Parse the texture atlas data with the texture
        this.factory.parseTextureAtlasData(asset.textureAtlas, asset.texture);

        // Mark as loaded globally
        DragonBonesManager.loadedDataNames.add(dataKey);
      }

      // Build and return the armature display
      const display = this.factory.buildArmatureDisplay(armatureName);

      if (!display) {
        throw new Error(`Failed to build armature display for ${armatureName}`);
      }

      return display;
    } catch (error) {
      console.error(`Failed to create DragonBones display for ${asset.id}:`, error);
      throw error;
    }
  }

  /**
   * Plays an animation on a DragonBones armature display
   * 
   * @param display - The armature display
   * @param animationName - Name of the animation to play
   * @param playTimes - Number of times to play (0 = infinite loop, default 0)
   * 
   * @example
   * ```typescript
   * // Loop idle infinitely
   * manager.playAnimation(display, 'Idle', 0);
   * 
   * // Play attack once
   * manager.playAnimation(display, 'Attack A', 1);
   * ```
   */
  public playAnimation(
    display: PixiArmatureDisplay,
    animationName: string,
    playTimes: number = 0
  ): void {
    if (!display || !display.animation) {
      console.warn('Invalid armature display or missing animation');
      return;
    }

    display.animation.play(animationName, playTimes);
  }

  /**
   * Fades in an animation with smooth blending
   * 
   * @param display - The armature display
   * @param animationName - Name of the animation to fade in
   * @param fadeInTime - Fade in duration in seconds (default 0.3)
   * @param playTimes - Number of times to play (0 = infinite loop, default 0)
   * 
   * @example
   * ```typescript
   * // Smoothly transition from walk to run
   * manager.fadeInAnimation(display, 'run', 0.3, 0);
   * ```
   */
  public fadeInAnimation(
    display: PixiArmatureDisplay,
    animationName: string,
    fadeInTime: number = 0.3,
    playTimes: number = 0
  ): void {
    if (!display || !display.animation) {
      console.warn('Invalid armature display or missing animation');
      return;
    }

    display.animation.fadeIn(animationName, fadeInTime, playTimes);
  }

  /**
   * Stops all animations on a DragonBones armature display
   * @param display - The armature display
   */
  public stopAnimation(display: PixiArmatureDisplay): void {
    if (display && display.animation) {
      display.animation.stop();
    }
  }

  /**
   * Gets available animation names for an armature display
   * @param display - The armature display
   * @returns Array of animation names
   */
  public getAnimationNames(display: PixiArmatureDisplay): string[] {
    if (!display || !display.animation) {
      return [];
    }

    return display.animation.animationNames;
  }

  /**
   * Gets a bone from the armature for manipulation
   * 
   * @param display - The armature display
   * @param boneName - Name of the bone
   * @returns The bone object or null if not found
   * 
   * @example
   * ```typescript
   * const armBone = manager.getBone(display, 'arm');
   * if (armBone) {
   *   armBone.offset.rotation = Math.PI / 4;
   *   armBone.invalidUpdate();
   * }
   * ```
   */
  public getBone(display: PixiArmatureDisplay, boneName: string): any {
    if (!display || !display.armature) {
      return null;
    }

    return display.armature.getBone(boneName);
  }

  /**
   * Enables frame caching for performance optimization
   * 
   * @param display - The armature display
   * @param frameRate - Frame rate for caching (default 24)
   * 
   * @example
   * ```typescript
   * // Enable caching for smoother animation
   * manager.enableCaching(display, 24);
   * ```
   */
  public enableCaching(display: PixiArmatureDisplay, frameRate: number = 24): void {
    if (display && display.armature) {
      display.armature.cacheFrameRate = frameRate;
    }
  }

  /**
   * Adds the armature to the global WorldClock for automatic time advancement
   * 
   * @param display - The armature display
   * 
   * @example
   * ```typescript
   * // Add to clock for automatic updates
   * manager.addToClock(display);
   * ```
   */
  public addToClock(display: PixiArmatureDisplay): void {
    if (display && display.armature) {
      display.armature.clock = this.factory.clock;
    }
  }

  /**
   * Removes the armature from the global WorldClock
   * 
   * @param display - The armature display
   */
  public removeFromClock(display: PixiArmatureDisplay): void {
    if (display && display.armature) {
      display.armature.clock = null;
    }
  }

  /**
   * Cleans up DragonBones resources
   * Call this when disposing of the manager
   */
  public dispose(): void {
    // Instance dispose should not clear the shared factory (global state).
    // Clearing the global PixiFactory can break other parts of the app that
    // rely on previously-parsed DragonBones data. Provide a static helper
    // to clear global data when the application is shutting down.
    // No-op for instances.
  }

  /**
   * Clear all globally parsed DragonBones data and reset the tracker.
   * Call this only when you intentionally want to clear the global runtime
   * (for example during a full app teardown in tests).
   */
  public static clearAll(): void {
    try {
      // clear factory data
      PixiFactory.factory.clear();
    } catch (e) {
      // ignore factory clear errors
    }
    DragonBonesManager.loadedDataNames.clear();
  }
}
