import { PixiArmatureDisplay } from 'pixi-dragonbones-runtime';
import { AssetManager, type ExtendedDragonBonesAsset } from '../../core/AssetManager';
import { DragonBonesManager } from '../../core/DragonBonesManager';
import * as PIXI from 'pixi.js';

/**
 * Advanced DragonBones animation controller component
 * Supports multiple animations, blending, and battle sequences
 * 
 * @example
 * ```typescript
 * const animation = new DragonBonesAnimation(app);
 * await animation.loadCharacter('Absolution');
 * 
 * // Play animation
 * animation.play('Attack A', 1); // Play once
 * animation.play('Idle'); // Loop infinitely
 * 
 * // Get available animations
 * const animations = animation.listAnimations();
 * ```
 */
export class DragonBonesAnimation {
  private armatureDisplay: PixiArmatureDisplay | null = null;
  private currentAnimation: string = 'Idle';
  private availableAnimations: string[] = [];
  private settings?: any;
  private characterName: string = '';
  private dragonBonesManager: DragonBonesManager;

  /**
   * Creates a new DragonBones animation controller
   * @param app - The PixiJS application instance
   */
  constructor(app: PIXI.Application) {
    this.dragonBonesManager = new DragonBonesManager(app);
  }

  /**
   * Load character with all animations
   * @param characterName - e.g., "Absolution", "Agravain"
   * 
   * @example
   * await animation.loadCharacter('Absolution');
   * console.log('Loaded with animations:', animation.listAnimations());
   */
  async loadCharacter(characterName: string): Promise<void> {
    try {
      const asset = await AssetManager.getInstance()
        .loadDragonBonesCharacter(characterName);

      // Create armature display using the actual armature name from skeleton data
      this.armatureDisplay = this.dragonBonesManager.createDisplay(asset, asset.armatureName);
      
      if (!this.armatureDisplay) {
        throw new Error(`Failed to create armature display for ${characterName}`);
      }

      this.characterName = characterName;
      this.availableAnimations = asset.animations;
      this.settings = asset.settings;

      // Set default scale (adjust per character if needed)
      this.armatureDisplay.scale.set(0.5);

      // Validate animation controller before playing
      if (!this.armatureDisplay.animation) {
        throw new Error(`Animation controller not initialized for ${characterName}`);
      }

      // Play idle by default
      this.play('Idle');

      console.log(`✅ Character loaded: ${characterName}`, {
        animations: this.availableAnimations,
        hasSettings: !!this.settings
      });
    } catch (error) {
      const errorMsg = `Failed to load character ${characterName}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Play animation with optional loop count
   * @param animationName - e.g., "Idle", "Attack A"
   * @param loops - 0 = infinite, 1 = play once, 2+ = multiple times
   * 
   * @example
   * // Loop idle animation
   * animation.play('Idle');
   * 
   * // Play attack once
   * animation.play('Attack A', 1);
   */
  play(animationName: string, loops: number = 0): void {
    if (!this.armatureDisplay) {
      console.warn(`Cannot play animation: armature display not set for character "${this.characterName}"`);
      return;
    }

    // Validate animation object exists
    if (!this.armatureDisplay.animation) {
      console.warn(`Cannot play animation: animation controller not initialized for "${this.characterName}"`);
      return;
    }

    // Find best match if exact name not found
    const matchedAnim = this.findAnimation(animationName);

    if (matchedAnim) {
      this.currentAnimation = matchedAnim;
      this.dragonBonesManager.playAnimation(this.armatureDisplay, matchedAnim, loops);
    } else {
      console.warn(`Animation "${animationName}" not found. Available:`, this.availableAnimations);
    }
  }

  /**
   * Find animation by partial name match
   * E.g., "attack" matches "Attack A", "AttackA", etc.
   * @private
   */
  private findAnimation(partialName: string): string | null {
    const lower = partialName.toLowerCase();

    // Exact match first
    const exact = this.availableAnimations.find(a => a.toLowerCase() === lower);
    if (exact) return exact;

    // Partial match
    const partial = this.availableAnimations.find(a =>
      a.toLowerCase().includes(lower) || lower.includes(a.toLowerCase())
    );

    // Fallback to first animation if nothing found
    return partial || (this.availableAnimations.length > 0 ? this.availableAnimations[0] : null);
  }

  /**
   * Play battle attack sequence
   * @param attackType - 'A' | 'B' | 'C' | 'D'
   * @returns Promise that resolves when animation completes
   * 
   * @example
   * await animation.playBattleSequence('A');
   * console.log('Attack animation complete');
   */
  async playBattleSequence(attackType: 'A' | 'B' | 'C' | 'D' = 'A'): Promise<void> {
    if (!this.settings) {
      // No settings, play generic attack
      return this.playAttackAnimation(attackType);
    }

    // TODO: Parse and execute action sequence from settings
    // For now, play attack animation
    return this.playAttackAnimation(attackType);
  }

  /**
   * Play attack animation and return to idle
   * @private
   */
  private async playAttackAnimation(type: string): Promise<void> {
    const attackName = `Attack ${type}`;
    const matchedAnim = this.findAnimation(attackName) || this.findAnimation('attack');

    if (matchedAnim && this.armatureDisplay) {
      this.play(matchedAnim, 1); // Play once

      // Get animation duration
      const duration = AssetManager.getInstance()
        .getAnimationDuration(this.characterName, matchedAnim);

      // Wait for animation to finish
      await new Promise(resolve => setTimeout(resolve, duration * 1000));

      // Return to idle
      this.play('Idle');
    }
  }

  /**
   * Flip sprite horizontally
   * @param flipX - true to flip, false for normal
   * 
   * @example
   * animation.setFlip(true); // Face left
   */
  setFlip(flipX: boolean): void {
    if (!this.armatureDisplay) return;
    this.armatureDisplay.scale.x = Math.abs(this.armatureDisplay.scale.x) * (flipX ? -1 : 1);
  }

  /**
   * Set position of the armature display
   * @param x - X position
   * @param y - Y position
   */
  setPosition(x: number, y: number): void {
    if (this.armatureDisplay) {
      this.armatureDisplay.x = x;
      this.armatureDisplay.y = y;
    }
  }

  /**
   * Set scale of the armature display
   * @param scaleX - X scale
   * @param scaleY - Y scale (optional, defaults to scaleX)
   */
  setScale(scaleX: number, scaleY?: number): void {
    if (this.armatureDisplay) {
      this.armatureDisplay.scale.set(scaleX, scaleY ?? scaleX);
    }
  }

  /**
   * Get armature display for adding to scene
   * @returns The DragonBones armature display or null if not loaded
   */
  getDisplay(): PixiArmatureDisplay | null {
    return this.armatureDisplay;
  }

  /**
   * List all available animations (for debugging)
   * @returns Array of animation names
   */
  listAnimations(): string[] {
    return [...this.availableAnimations];
  }

  /**
   * Get current playing animation name
   */
  getCurrentAnimation(): string {
    return this.currentAnimation;
  }

  /**
   * Check if character is loaded
   */
  isLoaded(): boolean {
    return this.armatureDisplay !== null;
  }

  /**
   * Stop current animation
   */
  stop(): void {
    if (this.armatureDisplay) {
      this.dragonBonesManager.stopAnimation(this.armatureDisplay);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.armatureDisplay) {
      this.armatureDisplay.dispose();
      this.armatureDisplay = null;
    }
    this.availableAnimations = [];
    this.settings = undefined;
    this.characterName = '';
  }
}
