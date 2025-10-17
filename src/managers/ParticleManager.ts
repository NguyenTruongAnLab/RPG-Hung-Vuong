/**
 * ParticleManager - Wrapper for @pixi/particle-emitter
 * 
 * Manages particle effects for battles, UI, and atmospheric elements.
 * Uses the mature @pixi/particle-emitter plugin for all particle effects.
 * 
 * @example
 * ```typescript
 * const manager = ParticleManager.getInstance();
 * await manager.init(app);
 * 
 * // Emit elemental particles
 * manager.emitElementalEffect('hoa', 100, 200);
 * 
 * // Emit battle effect
 * manager.emitBattleEffect('critical-hit', sprite.x, sprite.y);
 * ```
 */
import * as PIXI from 'pixi.js';
import { Emitter, EmitterConfigV3 } from '@pixi/particle-emitter';

/**
 * Element types for particle effects
 */
export type Element = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

/**
 * Battle effect types
 */
export type BattleEffect = 'critical-hit' | 'super-effective' | 'victory' | 'capture' | 'level-up' | 'hit-impact';

/**
 * Active emitter tracking
 */
interface ActiveEmitter {
  emitter: Emitter;
  container: PIXI.Container;
  elapsed: number;
}

/**
 * ParticleManager singleton class
 */
export class ParticleManager {
  private static instance: ParticleManager;
  private app: PIXI.Application | null = null;
  private particleTexture: PIXI.Texture | null = null;
  private activeEmitters: ActiveEmitter[] = [];
  private configs: Map<string, EmitterConfigV3> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ParticleManager {
    if (!ParticleManager.instance) {
      ParticleManager.instance = new ParticleManager();
    }
    return ParticleManager.instance;
  }

  /**
   * Initialize particle manager
   * @param app - PixiJS application
   */
  async init(app: PIXI.Application): Promise<void> {
    this.app = app;
    
    // Create simple particle texture (white circle)
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 8);
    graphics.fill({ color: 0xffffff });
    
    const texture = app.renderer.generateTexture(graphics);
    this.particleTexture = texture;
    
    // Initialize particle configs
    this.initConfigs();
  }

  /**
   * Initialize particle configurations for all effects
   */
  private initConfigs(): void {
    // Kim (Metal) - Metallic sparks
    this.configs.set('kim', this.createElementConfig(0xcccccc, 0xffffff, 200));
    
    // Mộc (Wood) - Leaf particles
    this.configs.set('moc', this.createElementConfig(0x00ff00, 0x88ff88, 150));
    
    // Thủy (Water) - Water droplets
    this.configs.set('thuy', this.createElementConfig(0x0088ff, 0x88ccff, 180));
    
    // Hỏa (Fire) - Fire sparks
    this.configs.set('hoa', this.createElementConfig(0xff4400, 0xffff00, 250));
    
    // Thổ (Earth) - Rock debris
    this.configs.set('tho', this.createElementConfig(0x8b4513, 0xccaa88, 120));
    
    // Critical hit effect
    this.configs.set('critical-hit', this.createBurstConfig(0xffff00, 0xffffff, 300, 50));
    
    // Super effective effect
    this.configs.set('super-effective', this.createBurstConfig(0xff00ff, 0xffffff, 400, 80));
    
    // Victory confetti
    this.configs.set('victory', this.createConfettiConfig());
    
    // Capture effect
    this.configs.set('capture', this.createSwirlConfig(0x00ffff, 0x0088ff));
    
    // Level up burst
    this.configs.set('level-up', this.createBurstConfig(0xffd700, 0xffffff, 500, 100));
    
    // Hit impact
    this.configs.set('hit-impact', this.createImpactConfig());
  }

  /**
   * Create elemental particle config
   */
  private createElementConfig(color1: number, color2: number, speed: number): EmitterConfigV3 {
    return {
      lifetime: {
        min: 0.3,
        max: 0.8
      },
      frequency: 0.005,
      emitterLifetime: 0.3,
      maxParticles: 30,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 1 },
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
                { time: 0, value: speed },
                { time: 1, value: speed * 0.3 }
              ]
            }
          }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { time: 0, value: 0.3 },
                { time: 1, value: 0.1 }
              ]
            }
          }
        },
        {
          type: 'color',
          config: {
            color: {
              list: [
                { time: 0, value: color1.toString(16).padStart(6, '0') },
                { time: 1, value: color2.toString(16).padStart(6, '0') }
              ]
            }
          }
        },
        {
          type: 'rotationStatic',
          config: {
            min: 0,
            max: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'torus',
            data: {
              x: 0,
              y: 0,
              radius: 5,
              innerRadius: 0,
              affectRotation: false
            }
          }
        }
      ]
    };
  }

  /**
   * Create burst particle config (for critical hits, super effective, level up)
   */
  private createBurstConfig(color1: number, color2: number, speed: number, maxParticles: number): EmitterConfigV3 {
    return {
      lifetime: {
        min: 0.4,
        max: 1.0
      },
      frequency: 0.001,
      emitterLifetime: 0.15,
      maxParticles,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 1 },
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
                { time: 0, value: speed },
                { time: 1, value: 0 }
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
                { time: 0.5, value: 0.8 },
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
                { time: 0, value: color1.toString(16).padStart(6, '0') },
                { time: 1, value: color2.toString(16).padStart(6, '0') }
              ]
            }
          }
        },
        {
          type: 'rotationStatic',
          config: {
            min: 0,
            max: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'burst',
            data: {
              x: 0,
              y: 0,
              radius: 10,
              innerRadius: 0,
              affectRotation: false
            }
          }
        }
      ]
    };
  }

  /**
   * Create confetti config (for victory)
   */
  private createConfettiConfig(): EmitterConfigV3 {
    return {
      lifetime: {
        min: 1.0,
        max: 2.0
      },
      frequency: 0.01,
      emitterLifetime: 1.0,
      maxParticles: 100,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 1 },
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
                { time: 0, value: 200 },
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
                { time: 0, value: 0.4 },
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
                { time: 0, value: 'ff0000' },
                { time: 0.33, value: '00ff00' },
                { time: 0.67, value: '0000ff' },
                { time: 1, value: 'ffff00' }
              ]
            }
          }
        },
        {
          type: 'rotation',
          config: {
            accel: 0,
            minSpeed: 50,
            maxSpeed: 200,
            minStart: 0,
            maxStart: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'rect',
            data: {
              x: -200,
              y: -100,
              w: 400,
              h: 50
            }
          }
        }
      ]
    };
  }

  /**
   * Create swirl config (for capture)
   */
  private createSwirlConfig(color1: number, color2: number): EmitterConfigV3 {
    return {
      lifetime: {
        min: 0.8,
        max: 1.5
      },
      frequency: 0.005,
      emitterLifetime: 0.8,
      maxParticles: 60,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 0 },
                { time: 0.3, value: 1 },
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
                { time: 0, value: 300 },
                { time: 1, value: 100 }
              ]
            }
          }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { time: 0, value: 0.2 },
                { time: 1, value: 0.5 }
              ]
            }
          }
        },
        {
          type: 'color',
          config: {
            color: {
              list: [
                { time: 0, value: color1.toString(16).padStart(6, '0') },
                { time: 1, value: color2.toString(16).padStart(6, '0') }
              ]
            }
          }
        },
        {
          type: 'rotationStatic',
          config: {
            min: 0,
            max: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'ring',
            data: {
              x: 0,
              y: 0,
              radius: 80,
              innerRadius: 60,
              affectRotation: false
            }
          }
        }
      ]
    };
  }

  /**
   * Create impact config (for hit impacts)
   */
  private createImpactConfig(): EmitterConfigV3 {
    return {
      lifetime: {
        min: 0.2,
        max: 0.4
      },
      frequency: 0.001,
      emitterLifetime: 0.1,
      maxParticles: 20,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 1 },
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
                { time: 0, value: 150 },
                { time: 1, value: 0 }
              ]
            }
          }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { time: 0, value: 0.3 },
                { time: 1, value: 0.1 }
              ]
            }
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
          type: 'rotationStatic',
          config: {
            min: 0,
            max: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'burst',
            data: {
              x: 0,
              y: 0,
              radius: 5,
              innerRadius: 0,
              affectRotation: false
            }
          }
        }
      ]
    };
  }

  /**
   * Emit elemental particle effect
   * @param element - Element type
   * @param x - X position
   * @param y - Y position
   * @param container - Optional container (defaults to stage)
   */
  emitElementalEffect(element: Element, x: number, y: number, container?: PIXI.Container): void {
    const config = this.configs.get(element);
    if (!config || !this.particleTexture || !this.app) return;

    const emitterContainer = container || this.app.stage;
    this.createEmitter(config, x, y, emitterContainer);
  }

  /**
   * Emit battle effect
   * @param effect - Battle effect type
   * @param x - X position
   * @param y - Y position
   * @param container - Optional container
   */
  emitBattleEffect(effect: BattleEffect, x: number, y: number, container?: PIXI.Container): void {
    const config = this.configs.get(effect);
    if (!config || !this.particleTexture || !this.app) return;

    const emitterContainer = container || this.app.stage;
    this.createEmitter(config, x, y, emitterContainer);
  }

  /**
   * Create and track an emitter
   */
  private createEmitter(config: EmitterConfigV3, x: number, y: number, container: PIXI.Container): void {
    if (!this.particleTexture) return;

    const emitterContainer = new PIXI.Container();
    emitterContainer.position.set(x, y);
    container.addChild(emitterContainer);

    // @ts-ignore - Emitter API typing issue with PixiJS v8
    const emitter = new Emitter(emitterContainer, config);
    // @ts-ignore - init method signature variance
    emitter.init([this.particleTexture]);
    emitter.emit = true;

    this.activeEmitters.push({
      emitter,
      container: emitterContainer,
      elapsed: 0
    });
  }

  /**
   * Update all active emitters
   * @param deltaSeconds - Time elapsed in seconds
   */
  update(deltaSeconds: number): void {
    for (let i = this.activeEmitters.length - 1; i >= 0; i--) {
      const active = this.activeEmitters[i];
      active.elapsed += deltaSeconds;
      active.emitter.update(deltaSeconds);

      // Remove completed emitters
      if (active.elapsed > 3.0 || !active.emitter.emit) {
        active.emitter.destroy();
        active.container.parent?.removeChild(active.container);
        active.container.destroy();
        this.activeEmitters.splice(i, 1);
      }
    }
  }

  /**
   * Clean up all emitters
   */
  cleanup(): void {
    for (const active of this.activeEmitters) {
      active.emitter.destroy();
      active.container.parent?.removeChild(active.container);
      active.container.destroy();
    }
    this.activeEmitters = [];
  }
}
