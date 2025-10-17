/**
 * WeatherManager - Atmospheric weather effects using particles
 * 
 * Creates immersive weather effects like rain, snow, and leaves using
 * @pixi/particle-emitter. Supports zone-based weather and smooth transitions.
 * 
 * @example
 * ```typescript
 * const weather = WeatherManager.getInstance();
 * await weather.init(app);
 * 
 * // Set weather for a zone
 * weather.setWeather('rain', container);
 * 
 * // Transition to new weather
 * weather.transitionTo('snow', 2000);
 * ```
 */
import * as PIXI from 'pixi.js';
import { Emitter, EmitterConfigV3 } from '@pixi/particle-emitter';
import gsap from 'gsap';

/**
 * Weather types
 */
export type WeatherType = 'none' | 'rain' | 'snow' | 'leaves' | 'petals' | 'mist';

/**
 * Weather intensity levels
 */
export type WeatherIntensity = 'light' | 'medium' | 'heavy';

/**
 * Active weather state
 */
interface ActiveWeather {
  type: WeatherType;
  emitter: Emitter;
  container: PIXI.Container;
  intensity: WeatherIntensity;
}

/**
 * WeatherManager singleton class
 */
export class WeatherManager {
  private static instance: WeatherManager;
  private app: PIXI.Application | null = null;
  private particleTexture: PIXI.Texture | null = null;
  private activeWeather: ActiveWeather | null = null;
  private configs: Map<string, EmitterConfigV3> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): WeatherManager {
    if (!WeatherManager.instance) {
      WeatherManager.instance = new WeatherManager();
    }
    return WeatherManager.instance;
  }

  /**
   * Initialize weather manager
   * @param app - PixiJS application
   */
  async init(app: PIXI.Application): Promise<void> {
    this.app = app;
    
    // Create simple particle texture
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 4);
    graphics.fill({ color: 0xffffff });
    
    const texture = app.renderer.generateTexture(graphics);
    this.particleTexture = texture;
    
    // Initialize weather configs
    this.initConfigs();
  }

  /**
   * Initialize weather particle configurations
   */
  private initConfigs(): void {
    if (!this.particleTexture) return;

    // Rain configuration
    this.configs.set('rain', {
      lifetime: { min: 0.5, max: 1.0 },
      frequency: 0.01,
      emitterLifetime: -1,
      maxParticles: 200,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 0.6 },
                { time: 1, value: 0 }
              ]
            }
          }
        },
        {
          type: 'moveSpeed',
          config: {
            speed: {
              list: [
                { time: 0, value: 400 },
                { time: 1, value: 400 }
              ]
            }
          }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { time: 0, value: 0.5 },
                { time: 1, value: 0.2 }
              ]
            }
          }
        },
        {
          type: 'color',
          config: {
            color: {
              list: [
                { time: 0, value: 'aaaaff' },
                { time: 1, value: '6666aa' }
              ]
            }
          }
        },
        {
          type: 'rotation',
          config: {
            accel: 0,
            minSpeed: 80,
            maxSpeed: 80,
            minStart: 80,
            maxStart: 80
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'rect',
            data: { x: 0, y: -100, w: 1280, h: 1 }
          }
        }
      ]
    });

    // Snow configuration
    this.configs.set('snow', {
      lifetime: { min: 2.0, max: 4.0 },
      frequency: 0.05,
      emitterLifetime: -1,
      maxParticles: 150,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 0.8 },
                { time: 1, value: 0 }
              ]
            }
          }
        },
        {
          type: 'moveSpeed',
          config: {
            speed: {
              list: [
                { time: 0, value: 50 },
                { time: 1, value: 50 }
              ]
            }
          }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { time: 0, value: 0.8 },
                { time: 1, value: 1.2 }
              ]
            },
            minMult: 0.5
          }
        },
        {
          type: 'color',
          config: {
            color: {
              list: [
                { time: 0, value: 'ffffff' },
                { time: 1, value: 'cccccc' }
              ]
            }
          }
        },
        {
          type: 'rotation',
          config: {
            accel: 0,
            minSpeed: 0,
            maxSpeed: 0,
            minStart: 0,
            maxStart: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'rect',
            data: { x: 0, y: -100, w: 1280, h: 1 }
          }
        }
      ]
    });

    // Leaves configuration (for Mộc/Wood zones)
    this.configs.set('leaves', {
      lifetime: { min: 3.0, max: 5.0 },
      frequency: 0.1,
      emitterLifetime: -1,
      maxParticles: 100,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 0.9 },
                { time: 1, value: 0 }
              ]
            }
          }
        },
        {
          type: 'moveSpeed',
          config: {
            speed: {
              list: [
                { time: 0, value: 30 },
                { time: 1, value: 30 }
              ]
            }
          }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { time: 0, value: 1.0 },
                { time: 1, value: 0.5 }
              ]
            },
            minMult: 0.8
          }
        },
        {
          type: 'color',
          config: {
            color: {
              list: [
                { time: 0, value: '88ff88' },
                { time: 0.5, value: 'ffaa44' },
                { time: 1, value: '886644' }
              ]
            }
          }
        },
        {
          type: 'rotation',
          config: {
            accel: 20,
            minSpeed: 0,
            maxSpeed: 100,
            minStart: 0,
            maxStart: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'rect',
            data: { x: 0, y: -100, w: 1280, h: 1 }
          }
        }
      ]
    });

    // Petals configuration (decorative)
    this.configs.set('petals', {
      lifetime: { min: 4.0, max: 6.0 },
      frequency: 0.15,
      emitterLifetime: -1,
      maxParticles: 80,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 0.8 },
                { time: 1, value: 0 }
              ]
            }
          }
        },
        {
          type: 'moveSpeed',
          config: {
            speed: {
              list: [
                { time: 0, value: 20 },
                { time: 1, value: 20 }
              ]
            }
          }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { time: 0, value: 0.6 },
                { time: 1, value: 0.3 }
              ]
            }
          }
        },
        {
          type: 'color',
          config: {
            color: {
              list: [
                { time: 0, value: 'ffccff' },
                { time: 1, value: 'ff88ff' }
              ]
            }
          }
        },
        {
          type: 'rotation',
          config: {
            accel: 10,
            minSpeed: 0,
            maxSpeed: 50,
            minStart: 0,
            maxStart: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'rect',
            data: { x: 0, y: -100, w: 1280, h: 1 }
          }
        }
      ]
    });
  }

  /**
   * Set weather effect
   * @param type - Weather type
   * @param container - Container to add particles to
   * @param intensity - Weather intensity
   */
  setWeather(
    type: WeatherType,
    container: PIXI.Container,
    intensity: WeatherIntensity = 'medium'
  ): void {
    // Clear existing weather
    this.clearWeather();

    if (type === 'none') return;

    const config = this.configs.get(type);
    if (!config || !this.particleTexture) {
      console.warn(`Weather config not found: ${type}`);
      return;
    }

    // Adjust particle count based on intensity
    const intensityMultiplier = {
      light: 0.5,
      medium: 1.0,
      heavy: 1.5
    };
    
    const adjustedConfig = { ...config };
    adjustedConfig.maxParticles = Math.floor(
      (config.maxParticles || 100) * intensityMultiplier[intensity]
    );

    // Create emitter
    const emitter = new Emitter(container, adjustedConfig);
    // @ts-ignore - init method signature variance
    emitter.init([this.particleTexture]);
    emitter.emit = true;

    // Store active weather
    this.activeWeather = {
      type,
      emitter,
      container,
      intensity
    };
  }

  /**
   * Transition to new weather
   * @param type - Target weather type
   * @param duration - Transition duration in ms
   */
  transitionTo(type: WeatherType, duration: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.activeWeather) {
        // No current weather, just set new weather
        if (type !== 'none') {
          this.setWeather(type, this.activeWeather?.container || new PIXI.Container());
        }
        resolve();
        return;
      }

      const currentEmitter = this.activeWeather.emitter;
      const currentContainer = this.activeWeather.container;
      const currentIntensity = this.activeWeather.intensity;

      // Fade out current weather
      gsap.to(currentEmitter, {
        duration: duration / 1000,
        onUpdate: () => {
          // Gradually reduce emission
          if (currentEmitter.emit) {
            currentEmitter.maxParticles = Math.max(
              0,
              Math.floor(currentEmitter.maxParticles * 0.95)
            );
          }
        },
        onComplete: () => {
          currentEmitter.emit = false;
          currentEmitter.destroy();
          
          // Set new weather
          if (type !== 'none') {
            this.setWeather(type, currentContainer, currentIntensity);
          } else {
            this.activeWeather = null;
          }
          
          resolve();
        }
      });
    });
  }

  /**
   * Clear current weather
   */
  clearWeather(): void {
    if (this.activeWeather) {
      this.activeWeather.emitter.emit = false;
      this.activeWeather.emitter.destroy();
      this.activeWeather = null;
    }
  }

  /**
   * Update weather particles (call in game loop)
   * @param delta - Delta time in seconds
   */
  update(delta: number): void {
    if (this.activeWeather) {
      this.activeWeather.emitter.update(delta);
    }
  }

  /**
   * Get current weather type
   */
  getCurrentWeather(): WeatherType {
    return this.activeWeather?.type || 'none';
  }

  /**
   * Set weather intensity
   * @param intensity - New intensity level
   */
  setIntensity(intensity: WeatherIntensity): void {
    if (!this.activeWeather) return;

    const currentType = this.activeWeather.type;
    const container = this.activeWeather.container;
    
    // Recreate weather with new intensity
    this.setWeather(currentType, container, intensity);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearWeather();
    this.configs.clear();
    this.particleTexture?.destroy();
    this.particleTexture = null;
  }
}
