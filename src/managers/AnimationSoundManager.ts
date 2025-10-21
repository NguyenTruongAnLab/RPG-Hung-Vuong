/**
 * AnimationSoundManager - Maps DragonBones animations to sound effects
 * 
 * Automatically plays appropriate SFX when animations are played.
 * Supports animation categories: Attack, Damage, Walk, Idle, etc.
 * 
 * @example
 * ```typescript
 * const soundManager = AnimationSoundManager.getInstance();
 * soundManager.playAnimationSound('Attack A'); // Plays attack SFX
 * soundManager.playAnimationSound('Damage'); // Plays damage SFX
 * ```
 */
import { AudioManager } from '../core/AudioManager';

export class AnimationSoundManager {
  private static instance: AnimationSoundManager;
  private audioManager: AudioManager;
  private lastSoundTime = new Map<string, number>();
  private readonly SOUND_COOLDOWN = 100; // 100ms cooldown per sound type
  
  private constructor() {
    this.audioManager = AudioManager.getInstance();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): AnimationSoundManager {
    if (!this.instance) {
      this.instance = new AnimationSoundManager();
    }
    return this.instance;
  }
  
  /**
   * Play sound effect based on animation name
   * 
   * @param animationName - Name of the DragonBones animation
   * @param force - Force play even if on cooldown
   * 
   * @example
   * ```typescript
   * soundManager.playAnimationSound('Attack A');
   * soundManager.playAnimationSound('Damage', true); // Force play
   * ```
   */
  playAnimationSound(animationName: string, force: boolean = false): void {
    const category = this.categorizeAnimation(animationName);
    if (!category) return;
    
    // Check cooldown (prevent spam)
    if (!force) {
      const lastTime = this.lastSoundTime.get(category) || 0;
      const now = Date.now();
      if (now - lastTime < this.SOUND_COOLDOWN) {
        return; // Skip if on cooldown
      }
      this.lastSoundTime.set(category, now);
    }
    
    // Play appropriate sound
    switch (category) {
      case 'attack':
        this.audioManager.playSFX('sfx_attack');
        break;
      case 'critical':
        this.audioManager.playSFX('sfx_critical');
        break;
      case 'damage':
        this.audioManager.playSFX('sfx_damage');
        break;
      // Idle and walk sounds can be added later if needed
      // For now, only combat sounds for better UX
    }
  }
  
  /**
   * Categorize animation by name pattern
   * 
   * @param animationName - Animation name from DragonBones
   * @returns Sound category or null
   */
  private categorizeAnimation(animationName: string): string | null {
    const name = animationName.toLowerCase();
    
    // Attack animations
    if (name.includes('attack') || name.includes('slash') || name.includes('strike')) {
      // Check for critical/special attacks
      if (name.includes('critical') || name.includes('special') || name.includes('ultimate')) {
        return 'critical';
      }
      return 'attack';
    }
    
    // Damage/hurt animations
    if (name.includes('damage') || name.includes('hurt') || name.includes('hit') || name.includes('pain')) {
      return 'damage';
    }
    
    // Walk animations (optional - can add footstep sounds later)
    if (name.includes('walk') || name.includes('run') || name.includes('move')) {
      return 'walk';
    }
    
    // Idle animations (optional - can add ambient sounds later)
    if (name.includes('idle') || name.includes('stand')) {
      return 'idle';
    }
    
    return null; // No sound for this animation
  }
  
  /**
   * Play impact sound (for when attack connects with target)
   */
  playImpact(): void {
    this.audioManager.playSFX('sfx_impact');
  }
  
  /**
   * Set master SFX volume
   */
  setVolume(volume: number): void {
    this.audioManager.setSFXVolume(volume);
  }
}
