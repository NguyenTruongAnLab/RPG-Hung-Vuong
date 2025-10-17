/**
 * ProgressBar - Visual progress bar UI component
 * 
 * Displays progress with smooth animations.
 * 
 * @example
 * ```typescript
 * const bar = new ProgressBar(200, 20);
 * bar.setProgress(0.75); // 75%
 * scene.addChild(bar);
 * ```
 */
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

export class ProgressBar extends PIXI.Container {
  private bar: PIXI.Graphics;
  private background: PIXI.Graphics;
  private progress = 0;
  private barWidth: number;
  private barHeight: number;
  private barColor: number;
  private bgColor: number;
  
  /**
   * Create a progress bar
   * 
   * @param width - Bar width in pixels
   * @param height - Bar height in pixels
   * @param barColor - Fill color (default: green)
   * @param bgColor - Background color (default: dark gray)
   */
  constructor(
    width: number, 
    height: number,
    barColor: number = 0x4CAF50,
    bgColor: number = 0x333333
  ) {
    super();
    this.barWidth = width;
    this.barHeight = height;
    this.barColor = barColor;
    this.bgColor = bgColor;
    
    // Background
    this.background = new PIXI.Graphics();
    this.addChild(this.background);
    
    // Bar
    this.bar = new PIXI.Graphics();
    this.addChild(this.bar);
    
    this.redraw();
  }
  
  /**
   * Set progress value
   * 
   * @param value - Progress (0-1)
   * @param animate - Animate change (default: true)
   * 
   * @example
   * ```typescript
   * bar.setProgress(0.5); // 50%
   * bar.setProgress(1, false); // 100%, instant
   * ```
   */
  setProgress(value: number, animate: boolean = true): void {
    const newProgress = Math.max(0, Math.min(1, value));
    
    if (animate) {
      gsap.to(this, {
        progress: newProgress,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => this.redraw()
      });
    } else {
      this.progress = newProgress;
      this.redraw();
    }
  }
  
  /**
   * Get current progress
   */
  getProgress(): number {
    return this.progress;
  }
  
  /**
   * Set bar color
   */
  setColor(color: number): void {
    this.barColor = color;
    this.redraw();
  }
  
  /**
   * Flash the bar (e.g., on level up)
   */
  flash(color: number = 0xFFFFFF, duration: number = 0.5): void {
    const originalColor = this.barColor;
    
    gsap.to(this, {
      duration: duration / 2,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onUpdate: () => {
        const t = gsap.getProperty(this, 'progress') as number;
        this.barColor = this.lerpColor(originalColor, color, Math.sin(t * Math.PI));
        this.redraw();
      },
      onComplete: () => {
        this.barColor = originalColor;
        this.redraw();
      }
    });
  }
  
  private redraw(): void {
    // Clear
    this.background.clear();
    this.bar.clear();
    
    // Draw background
    this.background.roundRect(0, 0, this.barWidth, this.barHeight, this.barHeight / 2);
    this.background.fill(this.bgColor);
    
    // Draw bar
    if (this.progress > 0) {
      this.bar.roundRect(
        0, 
        0, 
        this.barWidth * this.progress, 
        this.barHeight, 
        this.barHeight / 2
      );
      this.bar.fill(this.barColor);
    }
  }
  
  private lerpColor(colorA: number, colorB: number, t: number): number {
    const ar = (colorA >> 16) & 0xFF;
    const ag = (colorA >> 8) & 0xFF;
    const ab = colorA & 0xFF;
    
    const br = (colorB >> 16) & 0xFF;
    const bg = (colorB >> 8) & 0xFF;
    const bb = colorB & 0xFF;
    
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const b = Math.round(ab + (bb - ab) * t);
    
    return (r << 16) | (g << 8) | b;
  }
}
