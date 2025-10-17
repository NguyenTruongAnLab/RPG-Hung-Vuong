/**
 * BattleAnimations - Visual effects for battle scenes
 * 
 * Provides attack animations, particle effects, and screen shake
 * for battle scenes.
 */
import * as PIXI from 'pixi.js';
import { ParticleSystem } from '../utils/ParticleSystem';
import { Camera } from '../world/Camera';
import { AudioManager } from '../core/AudioManager';
import gsap from 'gsap';

export class BattleAnimations {
  private particles: ParticleSystem;
  private camera: Camera;
  private audioManager: AudioManager;

  constructor(particles: ParticleSystem, camera: Camera) {
    this.particles = particles;
    this.camera = camera;
    this.audioManager = AudioManager.getInstance();
  }

  /**
   * Play attack animation with visual effects
   * 
   * @param attacker - Attacker sprite
   * @param defender - Defender sprite
   * @param isPlayerAttacking - True if player is attacking
   */
  async playAttackAnimation(
    attacker: PIXI.Graphics,
    defender: PIXI.Graphics,
    isPlayerAttacking: boolean
  ): Promise<void> {
    const originalX = attacker.x;

    // Play attack sound
    this.audioManager.playSFX('sfx_attack');

    // Lunge forward
    await gsap.to(attacker, {
      x: attacker.x + (isPlayerAttacking ? 100 : -100),
      duration: 0.2,
      ease: 'power2.out'
    });

    // Impact effects
    this.particles.emitParticles(defender.x, defender.y, 20, 0xFF6600, { speed: 8, size: 4 });
    
    // Screen shake
    this.camera.shake(8, 0.3);

    // Damage flash
    gsap.to(defender, {
      alpha: 0.3,
      duration: 0.1,
      yoyo: true,
      repeat: 3
    });

    // Return to position
    await gsap.to(attacker, {
      x: originalX,
      duration: 0.3,
      ease: 'power2.in'
    });
  }

  /**
   * Play victory animation
   * 
   * @param winner - Winner sprite
   */
  async playVictoryAnimation(winner: PIXI.Graphics): Promise<void> {
    // Victory particles
    this.particles.emitParticles(winner.x, winner.y, 30, 0xFFD700, { speed: 10, size: 5 });

    // Victory bounce
    await gsap.to(winner.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  }

  /**
   * Play defeat animation
   * 
   * @param loser - Loser sprite
   */
  async playDefeatAnimation(loser: PIXI.Graphics): Promise<void> {
    // Fade out
    await gsap.to(loser, {
      alpha: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  }
}
