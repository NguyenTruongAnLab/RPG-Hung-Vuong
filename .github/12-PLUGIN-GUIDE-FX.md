# Plugin Guide: Particles & Filters

**Purpose**: Complete reference for particle effects and visual filters using PixiJS plugins.

**Last Updated**: 2025-10-17  
**Version**: 1.0.0

---

## 📋 Philosophy

### Use Plugins, Not Custom Code

**The Golden Rule**: If a mainstream PixiJS plugin exists, USE IT.

**Why?**
- ✅ Battle-tested by thousands of developers
- ✅ Optimized for performance
- ✅ Regularly maintained and updated
- ✅ Comprehensive documentation
- ✅ TypeScript support
- ✅ AI assistants are trained on them
- ✅ 10x faster development

**Build Custom Only For**:
- ✅ Vietnamese mythology content (monsters, story, lore)
- ✅ Game-specific logic (battle rules, Ngũ Hành system)
- ✅ Integration wrappers around plugins
- ✅ Data management (monster DB, quest system)

**NEVER Build Custom**:
- ❌ Particle systems (use @pixi/particle-emitter)
- ❌ Visual filters/shaders (use @pixi/filters)

---

## 🎆 Particle System

### @pixi/particle-emitter

**Installation**:
```bash
npm install @pixi/particle-emitter
```

**Documentation**: https://github.com/pixijs/particle-emitter

### Basic Usage

```typescript
import { Emitter, upgradeConfig } from '@pixi/particle-emitter';
import * as PIXI from 'pixi.js';

// Load texture
const texture = PIXI.Texture.from('/assets/particle.png');

// Create container
const container = new PIXI.Container();

// Particle configuration
const config = {
  lifetime: { min: 0.5, max: 1.5 },
  frequency: 0.01,
  emitterLifetime: 0.5,
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
      type: 'scale',
      config: {
        scale: {
          list: [
            { time: 0, value: 0.5 },
            { time: 1, value: 1 }
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
            { time: 1, value: 'ff0000' }
          ]
        }
      }
    },
    {
      type: 'moveSpeed',
      config: {
        speed: {
          list: [
            { time: 0, value: 100 },
            { time: 1, value: 50 }
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
        type: 'point'
      }
    }
  ]
};

// Create emitter
const emitter = new Emitter(
  container,
  upgradeConfig(config, [texture])
);

// Start emission
emitter.emit = true;

// Update in game loop
app.ticker.add((delta) => {
  emitter.update(delta.deltaTime * 0.001); // Convert to seconds
});

// Stop and cleanup
emitter.emit = false;
emitter.cleanup();
```

### Element-Specific Particle Configs

#### Kim (Metal) - Metallic Sparks
```typescript
const kimConfig = {
  lifetime: { min: 0.3, max: 0.8 },
  frequency: 0.005,
  maxParticles: 50,
  behaviors: [
    {
      type: 'color',
      config: {
        color: {
          list: [
            { time: 0, value: 'ffffff' },
            { time: 0.5, value: 'c0c0c0' },
            { time: 1, value: '808080' }
          ]
        }
      }
    },
    {
      type: 'moveSpeed',
      config: {
        speed: { list: [{ time: 0, value: 200 }, { time: 1, value: 0 }] }
      }
    },
    {
      type: 'spawnShape',
      config: {
        type: 'burst',
        data: {
          x: 0, y: 0,
          radius: 10,
          minStart: 0,
          maxStart: 360,
          minParticles: 20,
          maxParticles: 30
        }
      }
    }
  ]
};
```

#### Mộc (Wood) - Leaf Swirl
```typescript
const mocConfig = {
  lifetime: { min: 1, max: 2 },
  frequency: 0.02,
  maxParticles: 30,
  behaviors: [
    {
      type: 'color',
      config: {
        color: {
          list: [
            { time: 0, value: '00ff00' },
            { time: 1, value: '006400' }
          ]
        }
      }
    },
    {
      type: 'rotation',
      config: {
        accel: 0,
        minSpeed: 50,
        maxSpeed: 100,
        minStart: 0,
        maxStart: 360
      }
    },
    {
      type: 'moveSpeed',
      config: {
        speed: { list: [{ time: 0, value: 50 }, { time: 1, value: 20 }] }
      }
    }
  ]
};
```

#### Thủy (Water) - Water Splash
```typescript
const thuyConfig = {
  lifetime: { min: 0.4, max: 1 },
  frequency: 0.01,
  maxParticles: 40,
  behaviors: [
    {
      type: 'color',
      config: {
        color: {
          list: [
            { time: 0, value: '00ffff' },
            { time: 1, value: '0000ff' }
          ]
        }
      }
    },
    {
      type: 'moveAcceleration',
      config: {
        accel: { x: 0, y: 200 }, // Gravity
        minStart: 0,
        maxStart: 0
      }
    },
    {
      type: 'spawnShape',
      config: {
        type: 'burst',
        data: {
          x: 0, y: 0,
          radius: 15,
          minStart: 45,
          maxStart: 135
        }
      }
    }
  ]
};
```

#### Hỏa (Fire) - Fire Sparks
```typescript
const hoaConfig = {
  lifetime: { min: 0.5, max: 1.2 },
  frequency: 0.008,
  maxParticles: 60,
  behaviors: [
    {
      type: 'color',
      config: {
        color: {
          list: [
            { time: 0, value: 'ffff00' },
            { time: 0.5, value: 'ff8800' },
            { time: 1, value: 'ff0000' }
          ]
        }
      }
    },
    {
      type: 'moveSpeed',
      config: {
        speed: { list: [{ time: 0, value: 150 }, { time: 1, value: 50 }] }
      }
    },
    {
      type: 'moveAcceleration',
      config: {
        accel: { x: 0, y: -50 } // Rise up like fire
      }
    }
  ]
};
```

#### Thổ (Earth) - Rock Debris
```typescript
const thoConfig = {
  lifetime: { min: 0.6, max: 1.5 },
  frequency: 0.015,
  maxParticles: 35,
  behaviors: [
    {
      type: 'color',
      config: {
        color: {
          list: [
            { time: 0, value: '8b4513' },
            { time: 1, value: '654321' }
          ]
        }
      }
    },
    {
      type: 'rotation',
      config: {
        accel: 10,
        minSpeed: 20,
        maxSpeed: 100
      }
    },
    {
      type: 'moveAcceleration',
      config: {
        accel: { x: 0, y: 300 } // Heavy gravity
      }
    }
  ]
};
```

### ParticleManager Wrapper

```typescript
/**
 * Manages particle effects throughout the game
 * Wraps @pixi/particle-emitter for easy usage
 */
export class ParticleManager {
  private emitters: Map<string, Emitter> = new Map();
  private configs: Map<string, any> = new Map();
  private textures: Map<string, PIXI.Texture> = new Map();

  /**
   * Load particle configuration and texture
   */
  loadConfig(id: string, config: any, texture: PIXI.Texture): void {
    this.configs.set(id, config);
    this.textures.set(id, texture);
  }

  /**
   * Emit particles at position
   */
  emit(
    id: string,
    container: PIXI.Container,
    x: number,
    y: number,
    autoCleanup = true
  ): Emitter {
    const config = this.configs.get(id);
    const texture = this.textures.get(id);
    
    if (!config || !texture) {
      throw new Error(`Particle config '${id}' not found`);
    }

    // Clone config and set position
    const instanceConfig = JSON.parse(JSON.stringify(config));
    instanceConfig.pos = { x, y };

    // Create emitter
    const emitter = new Emitter(
      container,
      upgradeConfig(instanceConfig, [texture])
    );

    emitter.emit = true;

    // Auto-cleanup after emission
    if (autoCleanup) {
      emitter.playOnceAndDestroy(() => {
        emitter.destroy();
      });
    } else {
      this.emitters.set(id, emitter);
    }

    return emitter;
  }

  /**
   * Update all active emitters
   */
  update(deltaMs: number): void {
    const deltaSeconds = deltaMs * 0.001;
    this.emitters.forEach((emitter) => {
      emitter.update(deltaSeconds);
    });
  }

  /**
   * Stop and cleanup emitter
   */
  stop(id: string): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.emit = false;
      emitter.cleanup();
      this.emitters.delete(id);
    }
  }

  /**
   * Cleanup all emitters
   */
  destroy(): void {
    this.emitters.forEach((emitter) => {
      emitter.cleanup();
    });
    this.emitters.clear();
  }
}
```

### Particle Pooling (Performance)

```typescript
class ParticlePool {
  private pool: Emitter[] = [];
  
  get(config: any, texture: PIXI.Texture): Emitter {
    let emitter = this.pool.pop();
    if (!emitter) {
      emitter = new Emitter(container, upgradeConfig(config, [texture]));
    }
    emitter.resetPositionTracking();
    emitter.emit = true;
    return emitter;
  }
  
  release(emitter: Emitter): void {
    emitter.emit = false;
    emitter.cleanup();
    this.pool.push(emitter);
  }
}
```

---

## 🎨 Visual Filters

### @pixi/filters

**Installation** (install individually as needed):
```bash
npm install @pixi/filter-glow
npm install @pixi/filter-bloom
npm install @pixi/filter-blur
npm install @pixi/filter-adjustment
npm install @pixi/filter-shockwave
npm install @pixi/filter-godray
npm install @pixi/filter-old-film
npm install @pixi/filter-crt
npm install @pixi/filter-pixelate
```

**Documentation**: https://github.com/pixijs/filters

### GlowFilter - Skills & Critical Hits
```typescript
import { GlowFilter } from '@pixi/filter-glow';

const glowFilter = new GlowFilter({
  distance: 15,      // Glow spread
  outerStrength: 2,  // Glow intensity
  innerStrength: 1,
  color: 0xffaa00,   // Glow color
  quality: 0.5       // Performance vs quality
});

sprite.filters = [glowFilter];

// Animate glow with GSAP
gsap.to(glowFilter, {
  outerStrength: 4,
  duration: 0.3,
  yoyo: true,
  repeat: 1
});
```

### AdvancedBloomFilter - Legendary Effects
```typescript
import { AdvancedBloomFilter } from '@pixi/filter-bloom';

const bloomFilter = new AdvancedBloomFilter({
  threshold: 0.5,    // Brightness threshold
  bloomScale: 1.5,   // Bloom intensity
  brightness: 1.2,   // Overall brightness
  blur: 4,           // Bloom blur
  quality: 7         // Sample quality
});

container.filters = [bloomFilter];
```

### ShockwaveFilter - Impact Effects
```typescript
import { ShockwaveFilter } from '@pixi/filter-shockwave';

const shockwave = new ShockwaveFilter(
  [centerX, centerY],  // Center point
  {
    radius: 100,       // Shockwave radius
    wavelength: 30,    // Wave spacing
    amplitude: 60,     // Wave height
    brightness: 1.5,
    speed: 500
  }
);

container.filters = [shockwave];

// Animate shockwave
gsap.to(shockwave, {
  time: 1,
  duration: 0.5,
  onComplete: () => {
    container.filters = [];
  }
});
```

### GodrayFilter - Sacred Areas
```typescript
import { GodrayFilter } from '@pixi/filter-godray';

const godrayFilter = new GodrayFilter({
  angle: 30,         // Light angle
  gain: 0.5,         // Light intensity
  lacunarity: 2.5,   // Turbulence
  time: 0            // Animated
});

// Animate godrays
app.ticker.add(() => {
  godrayFilter.time += 0.01;
});
```

### AdjustmentFilter - Color/Mood Changes
```typescript
import { AdjustmentFilter } from '@pixi/filter-adjustment';

const adjustmentFilter = new AdjustmentFilter({
  gamma: 1.0,
  saturation: 1.0,
  contrast: 1.0,
  brightness: 1.0,
  red: 1.0,
  green: 1.0,
  blue: 1.0,
  alpha: 1.0
});

// Poison effect - green tint
adjustmentFilter.green = 1.5;
adjustmentFilter.red = 0.8;
adjustmentFilter.blue = 0.8;

// Low HP - red vignette
adjustmentFilter.red = 1.3;
adjustmentFilter.saturation = 0.7;
```

### OldFilmFilter - Flashback Scenes
```typescript
import { OldFilmFilter } from '@pixi/filter-old-film';

const oldFilmFilter = new OldFilmFilter({
  sepia: 0.5,      // Sepia tone
  noise: 0.3,      // Film grain
  noiseSize: 1.0,  // Grain size
  scratch: 0.5,    // Scratch lines
  scratchDensity: 0.3,
  vignetting: 0.3  // Dark edges
});

// Animate for flickering effect
gsap.to(oldFilmFilter, {
  noise: 0.5,
  duration: 0.1,
  repeat: -1,
  yoyo: true
});
```

### CRTFilter - Retro/Glitch Effects
```typescript
import { CRTFilter } from '@pixi/filter-crt';

const crtFilter = new CRTFilter({
  curvature: 1.0,    // Screen curve
  lineWidth: 1.0,    // Scanline width
  lineContrast: 0.25, // Scanline intensity
  verticalLine: false,
  noise: 0.3,        // Static noise
  noiseSize: 1.0,
  seed: Math.random(),
  vignetting: 0.3,   // Dark edges
  vignettingAlpha: 1.0,
  vignettingBlur: 0.3,
  time: 0            // Animated
});

// Animate CRT effect
app.ticker.add(() => {
  crtFilter.time += 0.5;
});
```

### Filter Combinations

**Critical Hit Effect**:
```typescript
const criticalHitFilters = [
  new GlowFilter({ color: 0xffff00, outerStrength: 3 }),
  new AdvancedBloomFilter({ bloomScale: 2 })
];

sprite.filters = criticalHitFilters;
```

**Status: Poisoned**:
```typescript
const poisonFilters = [
  new AdjustmentFilter({ green: 1.5, red: 0.7, blue: 0.7 }),
  new GlowFilter({ color: 0x00ff00, outerStrength: 1 })
];
```

**Nightmare Zone**:
```typescript
const nightmareFilters = [
  new AdjustmentFilter({ saturation: 0.3, contrast: 1.2 }),
  new CRTFilter({ noise: 0.5, lineContrast: 0.3 })
];
```

### FilterManager Wrapper

```typescript
/**
 * Manages visual filters for game effects
 */
class FilterManager {
  private static instance: FilterManager;
  private presets: Map<string, () => any> = new Map();
  
  static getInstance(): FilterManager {
    if (!FilterManager.instance) {
      FilterManager.instance = new FilterManager();
    }
    return FilterManager.instance;
  }
  
  registerPreset(name: string, filterFn: () => any): void {
    this.presets.set(name, filterFn);
  }
  
  apply(target: PIXI.Container, presetName: string): void {
    const filterFn = this.presets.get(presetName);
    if (filterFn) {
      const filter = filterFn();
      target.filters = [...(target.filters || []), filter];
    }
  }
  
  remove(target: PIXI.Container, filterType: any): void {
    if (target.filters) {
      target.filters = target.filters.filter(f => !(f instanceof filterType));
    }
  }
  
  clear(target: PIXI.Container): void {
    target.filters = [];
  }
}

// Setup presets
const filterMgr = FilterManager.getInstance();
filterMgr.registerPreset('critical', () => new GlowFilter({ color: 0xffff00, outerStrength: 3 }));
filterMgr.registerPreset('poison', () => new AdjustmentFilter({ green: 1.5, red: 0.8 }));

// Usage
filterMgr.apply(sprite, 'critical');
```

### Performance Tips

**Filter Optimization**:
- **Limit filter count**: Max 3-4 filters per sprite
- **Use quality settings**: Lower quality for mobile
- **Cache filter results**: Use `cacheAsBitmap` for static filtered sprites
- **Disable when not visible**: Remove filters from off-screen objects

```typescript
// Optimize filters
sprite.filters = [filter];
sprite.filterArea = new PIXI.Rectangle(0, 0, 100, 100); // Limit filter area

// Cache if static
if (!sprite.isMoving) {
  sprite.cacheAsBitmap = true;
}
```

---

## 🎯 Event-Driven Effects Pattern

Tie plugin effects to game events:

```typescript
// In BattleScene
eventBus.on('battle:attack', (data: AttackData) => {
  const { attacker, defender, damage, isCritical } = data;
  
  // Particle effect
  particleManager.emit('hit-impact', this.container, defender.x, defender.y);
  
  // Critical hit filter
  if (isCritical) {
    const glow = new GlowFilter({ color: 0xffff00, outerStrength: 3 });
    attacker.filters = [glow];
    
    // Remove after delay
    setTimeout(() => {
      attacker.filters = [];
    }, 500);
  }
  
  // Screen shake (existing Camera class)
  camera.shake(5, 0.3);
});
```

---

## 📚 Quick Reference

**Filter Usage by Feature**:

| Feature | Filter(s) |
|---------|----------|
| Critical hits | GlowFilter, AdvancedBloomFilter |
| Super effective | ShockwaveFilter, GlowFilter |
| Sacred zones | GodrayFilter, AdjustmentFilter |
| Poison/status | AdjustmentFilter (color shift) |
| Flashback cutscenes | OldFilmFilter, PixelateFilter |
| Victory screen | AdvancedBloomFilter |
| Nightmare zones | CRTFilter, AdjustmentFilter |

**Remember**: Plugins = Faster development + Better quality + Less bugs

---

**Last Updated**: 2025-10-17  
**See Also**: 12-PLUGIN-GUIDE-UI.md for UI and lighting plugins
