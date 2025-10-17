/**
 * PlayerAnimation - Manages player character animations
 * 
 * Handles DragonBones animation playback for the player character,
 * including walk, idle, and attack animations with directional support.
 * 
 * @example
 * ```typescript
 * const animation = new PlayerAnimation(sprite);
 * animation.play('walk');
 * animation.setDirection('right');
 * ```
 */
import { PixiArmatureDisplay } from 'dragonbones-pixijs';
import * as PIXI from 'pixi.js';

export type AnimationState = 'idle' | 'walk' | 'attack';
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * PlayerAnimation component
 * 
 * Manages animation state and playback for the player character.
 */
export class PlayerAnimation {
  private armatureDisplay: PixiArmatureDisplay | null = null;
  private currentAnimation: AnimationState = 'idle';
  private currentDirection: Direction = 'down';
  private isPlaying: boolean = false;

  /**
   * Creates a new PlayerAnimation component
   * 
   * @param container - Optional parent container for the animation
   */
  constructor(container?: PIXI.Container) {
    // Animation will be set up later when DragonBones asset is loaded
  }

  /**
   * Sets the DragonBones armature display
   * 
   * @param armatureDisplay - The DragonBones armature display
   * 
   * @example
   * ```typescript
   * const display = dragonBonesManager.createDisplay(asset);
   * animation.setArmatureDisplay(display);
   * ```
   */
  setArmatureDisplay(armatureDisplay: PixiArmatureDisplay): void {
    this.armatureDisplay = armatureDisplay;
    
    // Start with idle animation
    this.play('idle');
  }

  /**
   * Plays an animation
   * 
   * @param animation - Animation to play ('idle', 'walk', or 'attack')
   * @param playTimes - Number of times to play (0 = loop, default: 0 for idle/walk, 1 for attack)
   * 
   * @example
   * ```typescript
   * animation.play('walk'); // Loops
   * animation.play('attack', 1); // Plays once
   * ```
   */
  play(animation: AnimationState, playTimes?: number): void {
    if (!this.armatureDisplay || !this.armatureDisplay.animation) {
      console.warn('Cannot play animation: armature display not set');
      return;
    }

    // Don't restart the same animation
    if (this.currentAnimation === animation && this.isPlaying) {
      return;
    }

    this.currentAnimation = animation;
    this.isPlaying = true;

    // Determine play times based on animation type
    let times = playTimes;
    if (times === undefined) {
      times = animation === 'attack' ? 1 : 0; // Attack plays once, others loop
    }

    // Get animation name with direction suffix if needed
    const animationName = this.getAnimationName(animation);

    try {
      this.armatureDisplay.animation.play(animationName, times);
    } catch (error) {
      console.warn(`Animation '${animationName}' not found, using default`);
      // Fallback to default animation without direction
      this.armatureDisplay.animation.play(animation, times);
    }
  }

  /**
   * Stops the current animation
   * 
   * @example
   * ```typescript
   * animation.stop();
   * ```
   */
  stop(): void {
    if (!this.armatureDisplay || !this.armatureDisplay.animation) {
      return;
    }

    this.armatureDisplay.animation.stop();
    this.isPlaying = false;
  }

  /**
   * Sets the character's facing direction
   * 
   * @param direction - Direction to face ('up', 'down', 'left', 'right')
   * 
   * @example
   * ```typescript
   * animation.setDirection('right');
   * animation.play('walk'); // Will play walk_right animation
   * ```
   */
  setDirection(direction: Direction): void {
    if (this.currentDirection === direction) {
      return;
    }

    this.currentDirection = direction;

    // Update sprite flip/rotation based on direction
    if (this.armatureDisplay) {
      // DragonBones armature display extends PIXI.Container, so it has scale
      const display = this.armatureDisplay as any;
      
      // For left/right, we can flip the sprite
      if (direction === 'left') {
        display.scale.x = -Math.abs(display.scale.x);
      } else if (direction === 'right') {
        display.scale.x = Math.abs(display.scale.x);
      } else {
        // Reset scale for up/down
        display.scale.x = Math.abs(display.scale.x);
      }
    }

    // Replay current animation with new direction
    if (this.isPlaying) {
      const currentAnim = this.currentAnimation;
      this.isPlaying = false; // Reset flag so play() doesn't skip
      this.play(currentAnim);
    }
  }

  /**
   * Gets the full animation name including direction suffix
   * 
   * @param animation - Base animation name
   * @returns Full animation name (e.g., 'walk_down')
   */
  private getAnimationName(animation: AnimationState): string {
    // For simple animations, we might not have directional variants
    // This is a placeholder for when we have full directional animations
    return animation;
  }

  /**
   * Gets the current animation state
   * 
   * @returns Current animation name
   */
  getCurrentAnimation(): AnimationState {
    return this.currentAnimation;
  }

  /**
   * Gets the current direction
   * 
   * @returns Current direction
   */
  getCurrentDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Checks if an animation is currently playing
   * 
   * @returns True if playing, false otherwise
   */
  isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Gets the armature display
   * 
   * @returns The DragonBones armature display or null
   */
  getArmatureDisplay(): PixiArmatureDisplay | null {
    return this.armatureDisplay;
  }

  /**
   * Updates the animation component
   * Called each frame to handle animation state
   * 
   * @param deltaMs - Time since last update in milliseconds
   */
  update(deltaMs: number): void {
    // Update any animation state logic here if needed
    // DragonBones handles most animation updates internally
  }

  /**
   * Disposes of the animation component
   */
  dispose(): void {
    if (this.armatureDisplay) {
      this.stop();
      this.armatureDisplay = null;
    }
    this.isPlaying = false;
  }
}
