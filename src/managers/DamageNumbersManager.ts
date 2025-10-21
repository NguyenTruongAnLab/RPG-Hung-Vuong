import * as PIXI from 'pixi.js';
import gsap from 'gsap';

/**
 * DamageNumbersManager
 * Handles floating damage numbers, critical hits, and damage text effects
 * 
 * Features:
 * - Floating damage numbers that rise and fade
 * - Critical hit styling (larger, gold, with sparkle)
 * - Super-effective text (element-colored, with "SIÊU HIỆU QUẢ!")
 * - Miss/dodge text
 * - Combo counter
 * 
 * @example
 * const dmgManager = DamageNumbersManager.getInstance();
 * dmgManager.showDamage(container, 42, x, y, false); // Normal damage
 * dmgManager.showDamage(container, 125, x, y, true); // Critical hit
 * dmgManager.showSuperEffective(container, 89, x, y, 'fire'); // Super effective
 * dmgManager.showMiss(container, x, y); // Miss/dodge
 */
export class DamageNumbersManager {
  private static instance: DamageNumbersManager;

  private constructor() {}

  static getInstance(): DamageNumbersManager {
    if (!DamageNumbersManager.instance) {
      DamageNumbersManager.instance = new DamageNumbersManager();
    }
    return DamageNumbersManager.instance;
  }

  /**
   * Show damage number with floating animation
   * @param container - Container to add damage text to
   * @param damage - Damage amount
   * @param x - X position
   * @param y - Y position
   * @param isCritical - Is this a critical hit?
   */
  showDamage(
    container: PIXI.Container,
    damage: number,
    x: number,
    y: number,
    isCritical: boolean = false
  ): void {
    const text = new PIXI.Text({
      text: `-${Math.round(damage)}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: isCritical ? 48 : 32,
        fontWeight: 'bold',
        fill: isCritical ? 0xFFD700 : 0xFF4444,
        stroke: { color: 0x000000, width: 4 },
        dropShadow: {
          alpha: 0.7,
          angle: Math.PI / 6,
          blur: 4,
          color: 0x000000,
          distance: 4
        }
      }
    });

    text.anchor.set(0.5);
    text.position.set(x, y);
    text.scale.set(0.5);
    container.addChild(text);

    // Animation sequence
    const timeline = gsap.timeline({
      onComplete: () => {
        container.removeChild(text);
        text.destroy();
      }
    });

    // Pop in
    timeline.to(text.scale, {
      x: isCritical ? 1.2 : 1,
      y: isCritical ? 1.2 : 1,
      duration: 0.1,
      ease: 'back.out(3)'
    });

    // Float up and fade
    timeline.to(text, {
      y: y - (isCritical ? 80 : 60),
      alpha: 0,
      duration: isCritical ? 1.2 : 0.8,
      ease: 'power2.out'
    }, '-=0.05');

    // Slight horizontal drift
    timeline.to(text, {
      x: x + (Math.random() - 0.5) * 40,
      duration: isCritical ? 1.2 : 0.8,
      ease: 'sine.inOut'
    }, '-=1.2');
  }

  /**
   * Show super-effective damage with special styling
   * @param container - Container to add text to
   * @param damage - Damage amount
   * @param x - X position
   * @param y - Y position
   * @param element - Element type (fire, water, grass, lightning, etc.)
   */
  showSuperEffective(
    container: PIXI.Container,
    damage: number,
    x: number,
    y: number,
    element: string = 'normal'
  ): void {
    const elementColors: Record<string, number> = {
      fire: 0xFF4500,
      water: 0x1E90FF,
      grass: 0x32CD32,
      lightning: 0xFFFF00,
      ice: 0x87CEEB,
      normal: 0xFFFFFF
    };

    const color = elementColors[element] || elementColors.normal;

    // "SIÊU HIỆU QUẢ!" text
    const superText = new PIXI.Text({
      text: 'SIÊU HIỆU QUẢ!',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 24,
        fontWeight: 'bold',
        fill: color,
        stroke: { color: 0x000000, width: 3 },
        dropShadow: {
          alpha: 0.8,
          angle: Math.PI / 6,
          blur: 4,
          color: 0x000000,
          distance: 3
        }
      }
    });

    superText.anchor.set(0.5);
    superText.position.set(x, y - 40);
    superText.alpha = 0;
    container.addChild(superText);

    // Damage number (larger for super-effective)
    const dmgText = new PIXI.Text({
      text: `-${Math.round(damage)}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 52,
        fontWeight: 'bold',
        fill: color,
        stroke: { color: 0x000000, width: 5 },
        dropShadow: {
          alpha: 0.8,
          angle: Math.PI / 6,
          blur: 5,
          color: 0x000000,
          distance: 5
        }
      }
    });

    dmgText.anchor.set(0.5);
    dmgText.position.set(x, y);
    dmgText.scale.set(0.5);
    container.addChild(dmgText);

    // Animate both texts
    const timeline = gsap.timeline({
      onComplete: () => {
        container.removeChild(superText);
        container.removeChild(dmgText);
        superText.destroy();
        dmgText.destroy();
      }
    });

    // Super-effective text fade in and rise
    timeline.to(superText, {
      alpha: 1,
      y: y - 60,
      duration: 0.3,
      ease: 'power2.out'
    });

    // Damage number pop
    timeline.to(dmgText.scale, {
      x: 1.3,
      y: 1.3,
      duration: 0.15,
      ease: 'back.out(4)'
    }, '-=0.2');

    // Both fade out
    timeline.to([superText, dmgText], {
      alpha: 0,
      y: '-=50',
      duration: 1,
      ease: 'power2.out'
    }, '+=0.3');
  }

  /**
   * Show miss/dodge text
   * @param container - Container to add text to
   * @param x - X position
   * @param y - Y position
   */
  showMiss(container: PIXI.Container, x: number, y: number): void {
    const text = new PIXI.Text({
      text: 'TRƯỢT!',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0xCCCCCC,
        stroke: { color: 0x000000, width: 3 },
        dropShadow: {
          alpha: 0.6,
          angle: Math.PI / 6,
          blur: 3,
          color: 0x000000,
          distance: 3
        }
      }
    });

    text.anchor.set(0.5);
    text.position.set(x, y);
    text.alpha = 0;
    container.addChild(text);

    // Quick side-to-side wobble then fade
    const timeline = gsap.timeline({
      onComplete: () => {
        container.removeChild(text);
        text.destroy();
      }
    });

    timeline.to(text, {
      alpha: 1,
      duration: 0.1
    });

    timeline.to(text, {
      x: x + 15,
      duration: 0.1,
      ease: 'sine.inOut'
    });

    timeline.to(text, {
      x: x - 15,
      duration: 0.1,
      ease: 'sine.inOut'
    });

    timeline.to(text, {
      x: x,
      duration: 0.1,
      ease: 'sine.inOut'
    });

    timeline.to(text, {
      alpha: 0,
      y: y - 30,
      duration: 0.6,
      ease: 'power2.out'
    });
  }

  /**
   * Show healing text
   * @param container - Container to add text to
   * @param healing - Healing amount
   * @param x - X position
   * @param y - Y position
   */
  showHealing(container: PIXI.Container, healing: number, x: number, y: number): void {
    const text = new PIXI.Text({
      text: `+${Math.round(healing)}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0x00FF00,
        stroke: { color: 0x004400, width: 4 },
        dropShadow: {
          alpha: 0.7,
          angle: Math.PI / 6,
          blur: 4,
          color: 0x004400,
          distance: 4
        }
      }
    });

    text.anchor.set(0.5);
    text.position.set(x, y);
    text.scale.set(0.5);
    container.addChild(text);

    const timeline = gsap.timeline({
      onComplete: () => {
        container.removeChild(text);
        text.destroy();
      }
    });

    timeline.to(text.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      ease: 'back.out(3)'
    });

    timeline.to(text, {
      y: y - 50,
      alpha: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.05');
  }

  /**
   * Show combo counter
   * @param container - Container to add text to
   * @param combo - Combo count
   * @param x - X position
   * @param y - Y position
   */
  showCombo(container: PIXI.Container, combo: number, x: number, y: number): void {
    if (combo < 2) return; // Only show for combos of 2+

    const text = new PIXI.Text({
      text: `${combo}x COMBO!`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 36,
        fontWeight: 'bold',
        fill: 0xFFAA00,
        stroke: { color: 0x000000, width: 4 },
        dropShadow: {
          alpha: 0.8,
          angle: Math.PI / 6,
          blur: 5,
          color: 0x000000,
          distance: 5
        }
      }
    });

    text.anchor.set(0.5);
    text.position.set(x, y);
    text.scale.set(0.3);
    container.addChild(text);

    const timeline = gsap.timeline({
      onComplete: () => {
        container.removeChild(text);
        text.destroy();
      }
    });

    // Explosive pop-in
    timeline.to(text.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.2,
      ease: 'back.out(5)'
    });

    // Hold briefly
    timeline.to(text.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      ease: 'sine.inOut'
    }, '+=0.3');

    // Fade out
    timeline.to(text, {
      alpha: 0,
      scale: 0.8,
      duration: 0.4,
      ease: 'power2.in'
    }, '+=0.2');
  }
}
