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
      // Parse the DragonBones skeleton data
      this.factory.parseDragonBonesData(asset.skeleton);

      // Parse the texture atlas data with the texture
      this.factory.parseTextureAtlasData(asset.textureAtlas, asset.texture);

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
   * Cleans up DragonBones resources
   * Call this when disposing of the manager
   */
  public dispose(): void {
    // Clear all cached DragonBones data
    this.factory.clear();
  }
}
