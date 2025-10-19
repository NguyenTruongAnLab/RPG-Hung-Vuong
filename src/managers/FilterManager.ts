/**
 * FilterManager - Wrapper for pixi-filters
 * 
 * Manages visual filters for status effects, damage feedback, and atmosphere.
 * Uses the official pixi-filters v6 package (compatible with PixiJS v8).
 * 
 * @example
 * ```typescript
 * const manager = FilterManager.getInstance();
 * 
 * // Apply status effect filter
 * manager.applyStatusEffect(sprite, 'poison');
 * 
 * // Apply damage flash
 * manager.applyDamageFlash(sprite);
 * 
 * // Apply critical hit glow
 * manager.applyCriticalGlow(sprite);
 * ```
 */
import * as PIXI from 'pixi.js';
import { GlowFilter, BloomFilter, AdjustmentFilter, ShockwaveFilter } from 'pixi-filters';
// Note: BlurFilter is built into PixiJS core
import gsap from 'gsap';

/**
 * Status effect types
 */
export type StatusEffect = 'poison' | 'freeze' | 'burn' | 'stun' | 'confusion';

/**
 * Filter animation tracking
 */
interface FilterAnimation {
  filter: PIXI.Filter;
  timeline: gsap.core.Timeline;
  sprite: PIXI.Sprite | PIXI.Container;
}

/**
 * FilterManager singleton class
 */
export class FilterManager {
  private static instance: FilterManager;
  private activeAnimations: FilterAnimation[] = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): FilterManager {
    if (!FilterManager.instance) {
      FilterManager.instance = new FilterManager();
    }
    return FilterManager.instance;
  }

  /**
   * Apply status effect filter to sprite
   * @param sprite - Target sprite
   * @param status - Status effect type
   */
  applyStatusEffect(sprite: PIXI.Sprite | PIXI.Container, status: StatusEffect): void {
    // Remove any existing status filters
    this.removeStatusEffect(sprite);

    switch (status) {
      case 'poison':
        this.applyPoisonEffect(sprite);
        break;
      case 'freeze':
        this.applyFreezeEffect(sprite);
        break;
      case 'burn':
        this.applyBurnEffect(sprite);
        break;
      case 'stun':
        this.applyStunEffect(sprite);
        break;
      case 'confusion':
        this.applyConfusionEffect(sprite);
        break;
    }
  }

  /**
   * Remove status effect from sprite
   */
  removeStatusEffect(sprite: PIXI.Sprite | PIXI.Container): void {
    // Find and remove any active filter animations for this sprite
    for (let i = this.activeAnimations.length - 1; i >= 0; i--) {
      const anim = this.activeAnimations[i];
      if (anim.sprite === sprite) {
        anim.timeline.kill();
        this.activeAnimations.splice(i, 1);
      }
    }

    // Clear filters
    sprite.filters = null;
  }

  /**
   * Apply poison effect (green tint)
   */
  private applyPoisonEffect(sprite: PIXI.Sprite | PIXI.Container): void {
    // @ts-ignore - AdjustmentFilter typing issue with PixiJS v8
    const adjustFilter = new AdjustmentFilter({
      green: 1.3,
      red: 0.8,
      blue: 0.8
    }) as unknown as PIXI.Filter;

    sprite.filters = [adjustFilter];

    // Pulse animation
    const timeline = gsap.timeline({ repeat: -1 });
    timeline.to(adjustFilter, {
      green: 1.5,
      duration: 0.5,
      ease: 'sine.inOut'
    }).to(adjustFilter, {
      green: 1.3,
      duration: 0.5,
      ease: 'sine.inOut'
    });

    this.activeAnimations.push({ filter: adjustFilter, timeline, sprite });
  }

  /**
   * Apply freeze effect (blue tint + slower)
   */
  private applyFreezeEffect(sprite: PIXI.Sprite | PIXI.Container): void {
    // @ts-ignore - AdjustmentFilter typing issue with PixiJS v8
    const adjustFilter = new AdjustmentFilter({
      blue: 1.5,
      red: 0.7,
      green: 0.9,
      saturation: 0.5
    }) as unknown as PIXI.Filter;

    sprite.filters = [adjustFilter];

    // No animation needed for freeze (static effect)
    const timeline = gsap.timeline();
    this.activeAnimations.push({ filter: adjustFilter, timeline, sprite });
  }

  /**
   * Apply burn effect (red glow + particles handled separately)
   */
  private applyBurnEffect(sprite: PIXI.Sprite | PIXI.Container): void {
    // @ts-ignore - GlowFilter typing issue with PixiJS v8
    const glowFilter = new GlowFilter({
      distance: 15,
      outerStrength: 2,
      color: 0xff4400
    }) as unknown as PIXI.Filter;

    sprite.filters = [glowFilter];

    // Pulse animation
    const timeline = gsap.timeline({ repeat: -1 });
    timeline.to(glowFilter, {
      outerStrength: 3,
      duration: 0.3,
      ease: 'sine.inOut'
    }).to(glowFilter, {
      outerStrength: 2,
      duration: 0.3,
      ease: 'sine.inOut'
    });

    this.activeAnimations.push({ filter: glowFilter, timeline, sprite });
  }

  /**
   * Apply stun effect (yellow flash)
   */
  private applyStunEffect(sprite: PIXI.Sprite | PIXI.Container): void {
    // @ts-ignore - AdjustmentFilter typing issue with PixiJS v8
    const adjustFilter = new AdjustmentFilter({
      red: 1.3,
      green: 1.3,
      blue: 0.7
    }) as unknown as PIXI.Filter;

    sprite.filters = [adjustFilter];

    // Flash animation
    const timeline = gsap.timeline({ repeat: -1 });
    timeline.to(adjustFilter, {
      red: 1.5,
      green: 1.5,
      duration: 0.2,
      ease: 'sine.inOut'
    }).to(adjustFilter, {
      red: 1.3,
      green: 1.3,
      duration: 0.2,
      ease: 'sine.inOut'
    });

    this.activeAnimations.push({ filter: adjustFilter, timeline, sprite });
  }

  /**
   * Apply confusion effect (blur + color shift)
   */
  private applyConfusionEffect(sprite: PIXI.Sprite | PIXI.Container): void {
    const blurFilter = new PIXI.BlurFilter({ strength: 2 });

    // @ts-ignore - AdjustmentFilter typing issue with PixiJS v8
    const adjustFilter = new AdjustmentFilter({
      saturation: 1.5
    }) as unknown as PIXI.Filter;

    sprite.filters = [blurFilter, adjustFilter];

    // Wobble animation
    const timeline = gsap.timeline({ repeat: -1 });
    timeline.to(blurFilter, {
      strength: 3,
      duration: 0.4,
      ease: 'sine.inOut'
    }).to(blurFilter, {
      strength: 2,
      duration: 0.4,
      ease: 'sine.inOut'
    });

    this.activeAnimations.push({ filter: blurFilter, timeline, sprite });
  }

  /**
   * Apply damage flash effect (temporary white flash)
   */
  applyDamageFlash(sprite: PIXI.Sprite | PIXI.Container): void {
    // @ts-ignore - AdjustmentFilter typing issue with PixiJS v8
    const adjustFilter = new AdjustmentFilter({
      red: 2,
      green: 2,
      blue: 2
    }) as unknown as PIXI.Filter;

    const existingFilters = sprite.filters ? [...sprite.filters] : [];
    sprite.filters = [...existingFilters, adjustFilter];

    // Flash and remove
    gsap.to(adjustFilter, {
      red: 1,
      green: 1,
      blue: 1,
      duration: 0.1,
      onComplete: () => {
        const filters = sprite.filters ? [...sprite.filters] : [];
        const index = filters.indexOf(adjustFilter);
        if (index !== -1) {
          filters.splice(index, 1);
          sprite.filters = filters.length > 0 ? filters : null;
        }
      }
    });
  }

  /**
   * Apply critical hit glow effect
   */
  applyCriticalGlow(sprite: PIXI.Sprite | PIXI.Container): void {
    // @ts-ignore - GlowFilter typing issue with PixiJS v8
    const glowFilter = new GlowFilter({
      distance: 20,
      outerStrength: 3,
      color: 0xffff00
    }) as unknown as PIXI.Filter;

    const existingFilters = sprite.filters ? [...sprite.filters] : [];
    sprite.filters = [...existingFilters, glowFilter];

    // Pulse and remove
    const timeline = gsap.timeline({
      onComplete: () => {
        const filters = sprite.filters ? [...sprite.filters] : [];
        const index = filters.indexOf(glowFilter);
        if (index !== -1) {
          filters.splice(index, 1);
          sprite.filters = filters.length > 0 ? filters : null;
        }
      }
    });

    timeline.to(glowFilter, {
      outerStrength: 5,
      duration: 0.2,
      ease: 'power2.out'
    }).to(glowFilter, {
      outerStrength: 0,
      duration: 0.3,
      ease: 'power2.in'
    });
  }

  /**
   * Apply super effective glow effect
   */
  applySuperEffectiveGlow(sprite: PIXI.Sprite | PIXI.Container): void {
    // @ts-ignore - GlowFilter typing issue with PixiJS v8
    const glowFilter = new GlowFilter({
      distance: 25,
      outerStrength: 4,
      color: 0xff00ff
    }) as unknown as PIXI.Filter;

    // @ts-ignore - BloomFilter typing issue with PixiJS v8
    const bloomFilter = new BloomFilter(2) as unknown as PIXI.Filter;

    const existingFilters = sprite.filters ? [...sprite.filters] : [];
    sprite.filters = [...existingFilters, glowFilter, bloomFilter];

    // Pulse and remove
    const timeline = gsap.timeline({
      onComplete: () => {
        const filters = sprite.filters ? [...sprite.filters] : [];
        const glowIndex = filters.indexOf(glowFilter);
        const bloomIndex = filters.indexOf(bloomFilter);
        
        if (glowIndex !== -1) filters.splice(glowIndex, 1);
        if (bloomIndex !== -1) {
          const adjustedIndex = glowIndex < bloomIndex ? bloomIndex - 1 : bloomIndex;
          filters.splice(adjustedIndex, 1);
        }
        
        sprite.filters = filters.length > 0 ? filters : null;
      }
    });

    timeline.to(glowFilter, {
      outerStrength: 6,
      duration: 0.3,
      ease: 'power2.out'
    }).to(glowFilter, {
      outerStrength: 0,
      duration: 0.4,
      ease: 'power2.in'
    });
  }

  /**
   * Apply shockwave effect (for powerful impacts)
   */
  applyShockwave(x: number, y: number, container: PIXI.Container): void {
    // @ts-ignore - ShockwaveFilter typing issue with PixiJS v8
    const shockwave = new ShockwaveFilter(
      [x, y],
      {
        radius: 100,
        wavelength: 30,
        amplitude: 30,
        brightness: 1.3
      }
    ) as unknown as PIXI.Filter;

    const existingFilters = container.filters ? [...container.filters] : [];
    container.filters = [...existingFilters, shockwave];

    // Expand shockwave and remove
    gsap.to(shockwave, {
      radius: 400,
      amplitude: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        const filters = container.filters ? [...container.filters] : [];
        const index = filters.indexOf(shockwave);
        if (index !== -1) {
          filters.splice(index, 1);
          container.filters = filters.length > 0 ? filters : null;
        }
      }
    });
  }

  /**
   * Apply victory bloom effect
   */
  applyVictoryBloom(container: PIXI.Container): void {
    // @ts-ignore - BloomFilter typing issue with PixiJS v8
    const bloomFilter = new BloomFilter(2) as unknown as PIXI.Filter;

    const existingFilters = container.filters ? [...container.filters] : [];
    container.filters = [...existingFilters, bloomFilter];

    // Pulse bloom
    const timeline = gsap.timeline({ repeat: 2 });
    timeline.to(bloomFilter, {
      strength: 2.5,
      duration: 0.5,
      ease: 'sine.inOut'
    }).to(bloomFilter, {
      strength: 2.0,
      duration: 0.5,
      ease: 'sine.inOut'
    });

    // Remove after animation
    setTimeout(() => {
      const filters = container.filters ? [...container.filters] : [];
      const index = filters.indexOf(bloomFilter);
      if (index !== -1) {
        filters.splice(index, 1);
        container.filters = filters.length > 0 ? filters : null;
      }
    }, 3000);
  }

  /**
   * Clean up all active filter animations
   */
  cleanup(): void {
    for (const anim of this.activeAnimations) {
      anim.timeline.kill();
      if (anim.sprite.filters) {
        anim.sprite.filters = null;
      }
    }
    this.activeAnimations = [];
  }
}
