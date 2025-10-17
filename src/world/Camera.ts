/**
 * Camera - Smooth camera follow system using GSAP
 * 
 * Provides smooth camera tracking of player or other targets.
 * Uses GSAP for smooth animations and transitions.
 * 
 * @example
 * ```typescript
 * const camera = new Camera(app.stage, 1280, 720);
 * 
 * // In game loop
 * camera.follow(player.getPosition());
 * ```
 */
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { Vector2D } from '../utils/Vector2D';

export class Camera {
  private container: PIXI.Container;
  private viewportWidth: number;
  private viewportHeight: number;
  private followSpeed: number;
  private currentTarget: Vector2D | null = null;

  /**
   * Creates a new Camera
   * 
   * @param container - The container to apply camera transforms to
   * @param viewportWidth - Viewport width
   * @param viewportHeight - Viewport height
   * @param followSpeed - Camera follow speed (0-1, default: 0.3)
   */
  constructor(
    container: PIXI.Container,
    viewportWidth: number,
    viewportHeight: number,
    followSpeed: number = 0.3
  ) {
    this.container = container;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.followSpeed = followSpeed;
  }

  /**
   * Smoothly follows a target position
   * 
   * @param target - Target position to follow
   * @param immediate - If true, snap instantly without animation
   * 
   * @example
   * ```typescript
   * // Smooth follow
   * camera.follow(player.getPosition());
   * 
   * // Instant snap
   * camera.follow(player.getPosition(), true);
   * ```
   */
  public follow(target: Vector2D, immediate: boolean = false): void {
    this.currentTarget = target;

    // Calculate camera position (center target in viewport)
    const targetX = -target.x + this.viewportWidth / 2;
    const targetY = -target.y + this.viewportHeight / 2;

    if (immediate) {
      this.container.x = targetX;
      this.container.y = targetY;
    } else {
      // Smooth follow with GSAP
      gsap.to(this.container, {
        x: targetX,
        y: targetY,
        duration: this.followSpeed,
        ease: 'power2.out'
      });
    }
  }

  /**
   * Shakes the camera
   * 
   * @param intensity - Shake intensity (default: 10)
   * @param duration - Shake duration in seconds (default: 0.5)
   * 
   * @example
   * ```typescript
   * // Player hit
   * camera.shake(5, 0.3);
   * 
   * // Big explosion
   * camera.shake(20, 1);
   * ```
   */
  public shake(intensity: number = 10, duration: number = 0.5): void {
    const timeline = gsap.timeline();
    const originalX = this.container.x;
    const originalY = this.container.y;

    // Random shake
    for (let i = 0; i < 5; i++) {
      timeline.to(this.container, {
        x: originalX + gsap.utils.random(-intensity, intensity),
        y: originalY + gsap.utils.random(-intensity, intensity),
        duration: duration / 10,
        ease: 'power2.inOut'
      });
    }

    // Return to original position
    timeline.to(this.container, {
      x: originalX,
      y: originalY,
      duration: duration / 5,
      ease: 'power2.out'
    });
  }

  /**
   * Zooms the camera
   * 
   * @param scale - Target scale (1 = normal, 2 = 2x zoom)
   * @param duration - Zoom duration in seconds (default: 0.5)
   * 
   * @example
   * ```typescript
   * // Zoom in
   * camera.zoom(1.5, 1);
   * 
   * // Zoom out
   * camera.zoom(0.8, 1);
   * ```
   */
  public zoom(scale: number, duration: number = 0.5): void {
    gsap.to(this.container.scale, {
      x: scale,
      y: scale,
      duration,
      ease: 'power2.inOut'
    });
  }

  /**
   * Pans camera to a position
   * 
   * @param x - Target X position
   * @param y - Target Y position
   * @param duration - Pan duration in seconds (default: 1)
   * 
   * @example
   * ```typescript
   * camera.panTo(500, 300, 2);
   * ```
   */
  public panTo(x: number, y: number, duration: number = 1): void {
    gsap.to(this.container, {
      x: -x + this.viewportWidth / 2,
      y: -y + this.viewportHeight / 2,
      duration,
      ease: 'power2.inOut'
    });
  }

  /**
   * Sets camera position immediately
   * 
   * @param x - X position
   * @param y - Y position
   */
  public setPosition(x: number, y: number): void {
    this.container.x = -x + this.viewportWidth / 2;
    this.container.y = -y + this.viewportHeight / 2;
  }

  /**
   * Gets camera position
   * @returns Current camera position
   */
  public getPosition(): Vector2D {
    return {
      x: -this.container.x + this.viewportWidth / 2,
      y: -this.container.y + this.viewportHeight / 2
    };
  }

  /**
   * Sets follow speed
   * @param speed - Follow speed (0-1)
   */
  public setFollowSpeed(speed: number): void {
    this.followSpeed = Math.max(0, Math.min(1, speed));
  }

  /**
   * Gets follow speed
   * @returns Current follow speed
   */
  public getFollowSpeed(): number {
    return this.followSpeed;
  }

  /**
   * Resets camera to origin with normal zoom
   * 
   * @param duration - Reset duration in seconds (default: 0.5)
   */
  public reset(duration: number = 0.5): void {
    gsap.to(this.container, {
      x: 0,
      y: 0,
      duration,
      ease: 'power2.inOut'
    });
    
    gsap.to(this.container.scale, {
      x: 1,
      y: 1,
      duration,
      ease: 'power2.inOut'
    });
  }

  /**
   * Stops all camera animations
   */
  public stopAnimations(): void {
    gsap.killTweensOf(this.container);
    gsap.killTweensOf(this.container.scale);
  }
}
