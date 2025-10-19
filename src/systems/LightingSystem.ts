/**
 * LightingSystem - Dynamic lighting for day/night cycle
 * 
 * Manages ambient lighting, torches, and shadows.
 * Integrates with TimeManager for day/night transitions.
 * 
 * @example
 * ```typescript
 * const lighting = new LightingSystem(stage);
 * await lighting.init();
 * 
 * // Create torch light
 * lighting.createLight(x, y, 150, 0xffaa00);
 * ```
 */
import * as PIXI from 'pixi.js';
import { TimeManager } from './TimeManager';
import gsap from 'gsap';

/**
 * Light source
 */
export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: number;
  intensity: number;
  graphics: PIXI.Graphics;
}

/**
 * LightingSystem class
 */
export class LightingSystem {
  private stage: PIXI.Container;
  private lightingLayer: PIXI.Container;
  private ambientOverlay: PIXI.Graphics;
  private lights: Map<string, LightSource> = new Map();
  
  private nextLightId: number = 0;

  constructor(stage: PIXI.Container) {
    this.stage = stage;
    this.lightingLayer = new PIXI.Container();
    this.ambientOverlay = new PIXI.Graphics();
  }

  /**
   * Initialize lighting system
   */
  async init(): Promise<void> {
    // Create lighting layer (above gameplay, below UI)
    this.lightingLayer.zIndex = 1000;
    this.stage.addChild(this.lightingLayer);
    
    // Create ambient overlay
    this.ambientOverlay.alpha = 0;
    this.lightingLayer.addChild(this.ambientOverlay);
    
    // Subscribe to time changes
    const timeManager = TimeManager.getInstance();
    timeManager.onTimeChanged(() => {
      this.updateAmbientLighting();
    });
    
    // Initial lighting
    this.updateAmbientLighting();
    
    console.log('✅ LightingSystem initialized');
  }

  /**
   * Update ambient lighting based on time
   */
  private updateAmbientLighting(): void {
    const timeManager = TimeManager.getInstance();
    const intensity = timeManager.getAmbientLightIntensity();
    const timeOfDay = timeManager.getTimeOfDay();
    
    // Calculate darkness (inverse of light intensity)
    const darkness = 1 - intensity;
    
    // Color tint based on time of day
    let tintColor = 0x000033; // Default night blue
    
    if (timeOfDay === 'dawn') {
      tintColor = 0xff8800; // Orange dawn
    } else if (timeOfDay === 'day') {
      tintColor = 0xffffff; // Bright day
    } else if (timeOfDay === 'dusk') {
      tintColor = 0xff6600; // Red dusk
    }
    
    // Redraw ambient overlay
    this.ambientOverlay.clear();
    this.ambientOverlay.beginFill(tintColor, darkness * 0.6);
    this.ambientOverlay.drawRect(0, 0, 2000, 2000); // Large enough to cover viewport
    this.ambientOverlay.endFill();
  }

  /**
   * Create a light source
   */
  createLight(x: number, y: number, radius: number, color: number = 0xffaa00, intensity: number = 1): string {
    const id = `light_${this.nextLightId++}`;
    
    const graphics = new PIXI.Graphics();
    graphics.x = x;
    graphics.y = y;
    
    // Create radial gradient effect using circles
    const steps = 10;
    for (let i = steps; i > 0; i--) {
      const stepRadius = radius * (i / steps);
      const stepAlpha = intensity * (i / steps) * 0.8;
      
      graphics.beginFill(color, stepAlpha);
      graphics.drawCircle(0, 0, stepRadius);
      graphics.endFill();
    }
    
    // Apply blend mode for additive lighting
    graphics.blendMode = 'add';
    
    this.lightingLayer.addChild(graphics);
    
    const light: LightSource = {
      id,
      x,
      y,
      radius,
      color,
      intensity,
      graphics
    };
    
    this.lights.set(id, light);
    
    // Add flicker animation for torches
    this.addFlickerAnimation(graphics, intensity);
    
    return id;
  }

  /**
   * Add flicker animation to light
   */
  private addFlickerAnimation(graphics: PIXI.Graphics, baseIntensity: number): void {
    const flicker = () => {
      const randomIntensity = baseIntensity + (Math.random() * 0.2 - 0.1);
      gsap.to(graphics, {
        alpha: randomIntensity,
        duration: 0.1 + Math.random() * 0.2,
        onComplete: flicker
      });
    };
    
    flicker();
  }

  /**
   * Remove a light source
   */
  removeLight(id: string): void {
    const light = this.lights.get(id);
    if (!light) return;
    
    this.lightingLayer.removeChild(light.graphics);
    this.lights.delete(id);
  }

  /**
   * Move a light source
   */
  moveLight(id: string, x: number, y: number): void {
    const light = this.lights.get(id);
    if (!light) return;
    
    light.x = x;
    light.y = y;
    light.graphics.x = x;
    light.graphics.y = y;
  }

  /**
   * Update light intensity
   */
  setLightIntensity(id: string, intensity: number): void {
    const light = this.lights.get(id);
    if (!light) return;
    
    light.intensity = intensity;
    light.graphics.alpha = intensity;
  }

  /**
   * Create player torch light
   */
  createPlayerTorch(x: number, y: number): string {
    return this.createLight(x, y, 120, 0xffaa00, 0.8);
  }

  /**
   * Create campfire light
   */
  createCampfireLight(x: number, y: number): string {
    return this.createLight(x, y, 200, 0xff6600, 1);
  }

  /**
   * Create crystal light (blueish)
   */
  createCrystalLight(x: number, y: number): string {
    return this.createLight(x, y, 100, 0x00ffff, 0.6);
  }

  /**
   * Get all lights
   */
  getLights(): LightSource[] {
    return Array.from(this.lights.values());
  }

  /**
   * Clear all lights
   */
  clearLights(): void {
    this.lights.forEach(light => {
      this.lightingLayer.removeChild(light.graphics);
    });
    this.lights.clear();
  }

  /**
   * Update lighting (call each frame)
   */
  update(deltaTime: number): void {
    // Update any dynamic lighting effects here
    // Currently handled by GSAP flicker animations
  }

  /**
   * Set camera position (for moving ambient overlay)
   */
  setCameraPosition(x: number, y: number): void {
    this.ambientOverlay.x = x - 1000;
    this.ambientOverlay.y = y - 1000;
  }
}
