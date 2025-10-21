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
import { AnimationMapper } from '../../utils/AnimationMapper';

export type AnimationState = 'idle' | 'walk' | 'attack';
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * PlayerAnimation component
 * 
 * Manages animation state and playback for the player character.
 * Uses AnimationMapper for intelligent 200+ asset animation name detection.
 */
export class PlayerAnimation {
  private armatureDisplay: PixiArmatureDisplay | null = null;
  private currentAnimation: string = ''; // Use flexible string instead of AnimationState
  private currentDirection: Direction = 'down';
  private isPlaying: boolean = false;
  private availableAnimations: string[] = []; // Track available animations
  private animationMapper: AnimationMapper = new AnimationMapper([]); // Smart mapper

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
      this.animationMapper.setAvailableAnimations(availableAnimations);
      console.log('PlayerAnimation: Available animations:', availableAnimations.slice(0, 10).join(', '));
    }
    
    // Apply uniform scale to all characters for consistent size
    // Target: 64-80px tall character regardless of original DragonBones asset size
    // Scale 0.25 = smaller characters, 0.5 = larger characters
    // CRITICAL: Most DragonBones assets face LEFT by default, so we flip with negative scale
    if (this.armatureDisplay) {
      const uniformScale = 0.3; // Balanced size for overworld exploration
      this.armatureDisplay.scale.set(-uniformScale, uniformScale); // Negative X to face RIGHT
      console.log(`PlayerAnimation: Applied uniform scale ${uniformScale} (flipped to face right)`);
    }
    
    // Start with idle animation
    this.play('idle');
  }

  /**
   * Plays an animation
   * Uses AnimationMapper for intelligent animation name resolution
   * 
   * @param animation - Animation to play (e.g., 'idle', 'walk', 'attack')
   * @param playTimes - Number of times to play (0 = loop, default: 0 for loops, 1 for attack)
   * 
   * @example
   * ```typescript
   * animation.play('walk'); // Intelligently finds walk animation
   * animation.play('attack', 1); // Plays attack once
   * ```
   */
  play(animation: string, playTimes?: number): void {
    // Silently return if armatureDisplay not set
    if (!this.armatureDisplay || !this.armatureDisplay.animation) {
      return;
    }

    // Early exit if no animations available
    if (this.availableAnimations.length === 0) {
      return;
    }

    // Use AnimationMapper to find the best animation match
    const mapped = this.animationMapper.getAnimation(animation);
    const targetAnimation = mapped.animationName;

    // Don't restart the same animation
    if (this.currentAnimation === targetAnimation && this.isPlaying) {
      return;
    }

    this.currentAnimation = targetAnimation;
    this.isPlaying = true;

    // Determine play times: attack animations play once by default, others loop
    let times = playTimes !== undefined ? playTimes : 0;
    if (playTimes === undefined && targetAnimation === 'attack') {
      times = 1;
    }

    try {
      // Play the mapped animation
      this.armatureDisplay.animation.play(targetAnimation, times);
    } catch (error) {
      // If animation fails, try first available animation as fallback
      console.warn(`Failed to play animation "${targetAnimation}", using fallback`);
      try {
        this.armatureDisplay.animation.play(this.availableAnimations[0], times);
        this.currentAnimation = this.availableAnimations[0];
      } catch (fallbackError) {
        console.error('Failed to play fallback animation:', fallbackError);
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
        // Reset scale for up/down (face forward)
        display.scale.x = Math.abs(display.scale.x);
      }
    }
    
    // Replay current animation with new direction if playing
    if (this.isPlaying && this.currentAnimation) {
      this.armatureDisplay?.animation.play(this.currentAnimation, 0);
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
