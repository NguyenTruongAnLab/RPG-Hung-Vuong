import * as PIXI from 'pixi.js';
import { ParticleManager, Element } from './ParticleManager';
import gsap from 'gsap';

/**
 * HitEffectsManager
 * Handles visual effects for combat: hit sparks, critical bursts, impact waves
 * Uses ParticleManager for particle effects and GSAP for animation effects
 * 
 * Features:
 * - Hit sparks (delegates to ParticleManager 'hit-impact')
 * - Critical hit bursts (delegates to ParticleManager 'critical-hit')
 * - Super-effective bursts (delegates to ParticleManager 'super-effective')
 * - Impact waves (animated shockwave circles)
 * - Screen flash effects
 * 
 * @example
 * const hitFx = HitEffectsManager.getInstance();
 * hitFx.playHitSpark(container, x, y); // Normal hit
 * hitFx.playCriticalBurst(container, x, y); // Critical hit
 * hitFx.playElementalBurst(container, x, y, 'hoa'); // Element burst
 * hitFx.playImpactWave(container, x, y); // Shockwave
 */
export class HitEffectsManager {
  private static instance: HitEffectsManager;
  private particleManager: ParticleManager;

  private constructor() {
    this.particleManager = ParticleManager.getInstance();
  }

  static getInstance(): HitEffectsManager {
    if (!HitEffectsManager.instance) {
      HitEffectsManager.instance = new HitEffectsManager();
    }
    return HitEffectsManager.instance;
  }

  /**
   * Play hit spark effect (normal hit)
   * Delegates to ParticleManager 'hit-impact' effect
   * @param container - Container to add particles to
   * @param x - X position
   * @param y - Y position
   */
  playHitSpark(container: PIXI.Container, x: number, y: number): void {
    this.particleManager.emitBattleEffect('hit-impact', x, y, container);
  }

  /**
   * Play critical hit burst (gold explosion)
   * Delegates to ParticleManager 'critical-hit' effect
   * @param container - Container to add particles to
   * @param x - X position
   * @param y - Y position
   */
  playCriticalBurst(container: PIXI.Container, x: number, y: number): void {
    this.particleManager.emitBattleEffect('critical-hit', x, y, container);
  }

  /**
   * Play super-effective burst
   * Delegates to ParticleManager 'super-effective' effect
   * @param container - Container to add particles to
   * @param x - X position
   * @param y - Y position
   */
  playSuperEffectiveBurst(container: PIXI.Container, x: number, y: number): void {
    this.particleManager.emitBattleEffect('super-effective', x, y, container);
  }

  /**
   * Play elemental burst (fire, water, grass, etc.)
   * @param container - Container to add particles to
   * @param x - X position
   * @param y - Y position
   * @param element - Element type
   */
  playElementalBurst(
    container: PIXI.Container,
    x: number,
    y: number,
    element: Element = 'hoa'
  ): void {
    this.particleManager.emitElementalEffect(element, x, y, container);
  }

  /**
   * Play impact wave (shockwave circle expanding outward)
   * @param container - Container to add effect to
   * @param x - X position
   * @param y - Y position
   * @param color - Wave color (hex number)
   */
  playImpactWave(
    container: PIXI.Container,
    x: number,
    y: number,
    color: number = 0xFFFFFF
  ): void {
    const wave = new PIXI.Graphics();
    wave.circle(0, 0, 5);
    wave.stroke({ width: 3, color: color });
    wave.position.set(x, y);
    wave.alpha = 0.8;
    container.addChild(wave);

    // Expand and fade animation using GSAP
    gsap.timeline({
      onComplete: () => {
        container.removeChild(wave);
        wave.destroy();
      }
    })
    .to(wave.scale, {
      x: 5,
      y: 5,
      duration: 0.4,
      ease: 'power2.out'
    })
    .to(wave, {
      alpha: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, 0);
  }

  /**
   * Play screen flash effect
   * @param container - Container to add flash to
   * @param color - Flash color (hex number)
   * @param duration - Flash duration in seconds
   */
  playScreenFlash(
    container: PIXI.Container,
    color: number = 0xFFFFFF,
    duration: number = 0.2
  ): void {
    const flash = new PIXI.Graphics();
    flash.rect(0, 0, container.width || 1920, container.height || 1080);
    flash.fill({ color: color, alpha: 0.7 });
    container.addChild(flash);

    gsap.timeline({
      onComplete: () => {
        container.removeChild(flash);
        flash.destroy();
      }
    })
    .to(flash, {
      alpha: 0,
      duration: duration,
      ease: 'power2.out'
    });
  }

  /**
   * Play level up effect
   * @param container - Container to add effect to
   * @param x - X position
   * @param y - Y position
   */
  playLevelUpEffect(container: PIXI.Container, x: number, y: number): void {
    this.particleManager.emitBattleEffect('level-up', x, y, container);
  }

  /**
   * Play victory effect
   * @param container - Container to add effect to
   * @param x - X position
   * @param y - Y position
   */
  playVictoryEffect(container: PIXI.Container, x: number, y: number): void {
    this.particleManager.emitBattleEffect('victory', x, y, container);
  }

  /**
   * Play capture effect
   * @param container - Container to add effect to
   * @param x - X position
   * @param y - Y position
   */
  playCaptureEffect(container: PIXI.Container, x: number, y: number): void {
    this.particleManager.emitBattleEffect('capture', x, y, container);
  }
}

