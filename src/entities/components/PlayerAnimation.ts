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
import { PixiArmatureDisplay } from 'pixi-dragonbones-runtime';
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
  private currentAnimation: string = ''; // Use flexible string instead of AnimationState
  private currentDirection: Direction = 'down';
  private isPlaying: boolean = false;
  private availableAnimations: string[] = []; // Track available animations

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
   * @param availableAnimations - Optional array of available animation names
   * 
   * @example
   * ```typescript
   * const display = dragonBonesManager.createDisplay(asset);
   * animation.setArmatureDisplay(display, asset.animations);
   * ```
   */
  setArmatureDisplay(armatureDisplay: PixiArmatureDisplay, availableAnimations?: string[]): void {
    this.armatureDisplay = armatureDisplay;
    
    // Store available animations for validation
    if (availableAnimations && availableAnimations.length > 0) {
      this.availableAnimations = availableAnimations;
      console.log('PlayerAnimation: Available animations:', availableAnimations.slice(0, 10).join(', '));
    }
    
    // Start with first available animation or try 'Idle'
    const startAnim = this.availableAnimations.includes('Idle') 
      ? 'Idle' 
      : (this.availableAnimations[0] || 'idle');
    this.play(startAnim);
  }

  /**
   * Plays an animation
   * 
   * @param animation - Animation to play (flexible name based on available animations)
   * @param playTimes - Number of times to play (0 = loop, default: 0)
   * 
   * @example
   * ```typescript
   * animation.play('Walk'); // Plays available walk animation
   * animation.play('Attack', 1); // Plays attack once
   * ```
   */
  play(animation: string, playTimes?: number): void {
    // Silently return if armatureDisplay not set
    if (!this.armatureDisplay || !this.armatureDisplay.animation) {
      return;
    }

    // Don't restart the same animation
    if (this.currentAnimation === animation && this.isPlaying) {
      return;
    }

    this.currentAnimation = animation;
    this.isPlaying = true;

    // Determine play times (default loop)
    const times = playTimes !== undefined ? playTimes : 0;

    try {
      // Try to play the animation
      this.armatureDisplay.animation.play(animation, times);
    } catch (error) {
      // Animation not found, try first available
      if (this.availableAnimations.length > 0 && animation !== this.availableAnimations[0]) {
        console.warn(`Animation '${animation}' not found, trying first available: '${this.availableAnimations[0]}'`);
        try {
          this.armatureDisplay.animation.play(this.availableAnimations[0], times);
          this.currentAnimation = this.availableAnimations[0];
        } catch (fallbackError) {
          console.warn(`Failed to play any animation: ${fallbackError}`);
          this.isPlaying = false;
        }
      } else {
        console.warn(`Animation '${animation}' not found and no fallback available`);
        this.isPlaying = false;
      }
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
  getCurrentAnimation(): string {
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
