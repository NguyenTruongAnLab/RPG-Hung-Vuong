# Common Tasks - Recipes & Examples

This document provides copy-paste code examples for common development tasks.

---

## 📋 Task: Add New Core Manager

### Template
```typescript
// src/core/NewManager.ts
/**
 * NewManager handles [brief description]
 * 
 * Uses singleton pattern for global access.
 * 
 * @example
 * const manager = NewManager.getInstance();
 * manager.doSomething();
 */
export class NewManager {
  private static instance: NewManager;
  
  private constructor() {
    // Initialize resources
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): NewManager {
    if (!this.instance) {
      this.instance = new NewManager();
    }
    return this.instance;
  }
  
  /**
   * Initialize the manager
   */
  public initialize(): void {
    // Setup code
  }
  
  /**
   * Update called every frame
   * @param delta - Time since last frame (ms)
   */
  public update(delta: number): void {
    // Update logic
  }
  
  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Cleanup code
  }
}
```

### Test Template
```typescript
// tests/unit/core/NewManager.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { NewManager } from '../../../src/core/NewManager';

describe('NewManager', () => {
  let manager: NewManager;
  
  beforeEach(() => {
    manager = NewManager.getInstance();
  });
  
  it('should be singleton', () => {
    const m1 = NewManager.getInstance();
    const m2 = NewManager.getInstance();
    expect(m1).toBe(m2);
  });
  
  it('should initialize correctly', () => {
    expect(() => manager.initialize()).not.toThrow();
  });
});
```

### Checklist
- [ ] File <400 lines
- [ ] JSDoc with @example
- [ ] Singleton pattern
- [ ] Tests written (10+ tests)
- [ ] Added to `src/core/README.md`
- [ ] Exported from module

---

## 📋 Task: Add Entity Component

### Template
```typescript
// src/entities/components/NewComponent.ts
/**
 * NewComponent handles [specific responsibility]
 * 
 * Part of component-based entity architecture.
 * 
 * @example
 * const component = new NewComponent(entity);
 * component.update(16);
 */
export class NewComponent {
  constructor(private parent: Entity) {
    // Initialize
  }
  
  /**
   * Update called every frame
   * @param delta - Time since last frame (ms)
   */
  public update(delta: number): void {
    // Update logic
  }
  
  /**
   * Get current state
   */
  public getState(): ComponentState {
    return {
      // State data
    };
  }
  
  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Cleanup
  }
}
```

### Integrating Component
```typescript
// src/entities/Entity.ts
import { NewComponent } from './components/NewComponent';

export class Entity {
  public newComponent: NewComponent;
  
  constructor() {
    this.newComponent = new NewComponent(this);
  }
  
  update(delta: number): void {
    this.newComponent.update(delta);
  }
  
  destroy(): void {
    this.newComponent.destroy();
  }
}
```

---

## 📋 Task: Add Matter.js Body

### Circle Body (Player/Enemy)
```typescript
import Matter from 'matter-js';

// Create circle body
const body = Matter.Bodies.circle(x, y, radius, {
  label: 'player',
  friction: 0.1,
  frictionAir: 0.05,
  restitution: 0,
  density: 0.001
});

// Add to world
const physics = PhysicsManager.getInstance();
physics.addBody(body);
```

### Rectangle Body (Wall/Platform)
```typescript
import Matter from 'matter-js';

// Create static rectangle (wall)
const wall = Matter.Bodies.rectangle(x, y, width, height, {
  isStatic: true,
  label: 'wall',
  friction: 1
});

// Add to world
physics.addBody(wall);
```

### Apply Force (Movement)
```typescript
// Apply force for movement
const force = 0.001; // Adjust for speed
Matter.Body.applyForce(body, body.position, {
  x: direction.x * force,
  y: direction.y * force
});
```

### Collision Detection
```typescript
// Listen for collision events
const collisionSystem = CollisionSystem.getInstance();
collisionSystem.on('collision', (event) => {
  const { bodyA, bodyB } = event;
  
  if (bodyA.label === 'player' && bodyB.label === 'enemy') {
    // Handle player-enemy collision
  }
});
```

---

## 📋 Task: Add GSAP Animation

### Simple Tween
```typescript
import gsap from 'gsap';

// Move sprite to position
gsap.to(sprite, {
  x: 100,
  y: 200,
  duration: 0.5,
  ease: 'power2.out'
});
```

### With Callback
```typescript
gsap.to(sprite, {
  alpha: 0,
  duration: 0.3,
  onComplete: () => {
    sprite.visible = false;
  },
  onUpdate: () => {
    console.log('Animating...');
  }
});
```

### Timeline (Sequence)
```typescript
const tl = gsap.timeline();

tl.to(sprite, { x: 100, duration: 0.5 })
  .to(sprite, { y: 200, duration: 0.5 })
  .to(sprite, { alpha: 0, duration: 0.3 });
```

### Camera Follow
```typescript
// Smooth camera follow
gsap.to(camera.position, {
  x: -player.x + viewportWidth / 2,
  y: -player.y + viewportHeight / 2,
  duration: 0.3,
  ease: 'power2.out'
});
```

### Screen Shake
```typescript
function shakeScreen(intensity: number = 5): void {
  const camera = Camera.getInstance();
  
  gsap.to(camera.container, {
    x: `+=${intensity}`,
    yoyo: true,
    repeat: 5,
    duration: 0.05,
    onComplete: () => {
      camera.container.x = 0;
    }
  });
}
```

---

## 📋 Task: Add Event to EventBus

### Emit Event
```typescript
import { EventBus } from '../core/EventBus';

// Emit event
EventBus.getInstance().emit('battle:start', {
  enemy: enemyMonster,
  location: 'forest'
});
```

### Listen for Event
```typescript
// Subscribe to event
const eventBus = EventBus.getInstance();
eventBus.on('battle:start', (data) => {
  console.log('Battle started:', data);
});

// Unsubscribe
eventBus.off('battle:start', handler);
```

### Once Listener
```typescript
// Listen once (auto-unsubscribe after first call)
eventBus.once('game:ready', () => {
  console.log('Game is ready!');
});
```

---

## 📋 Task: Load Asset with AssetManager

### Load Texture
```typescript
import { AssetManager } from '../core/AssetManager';

// Load single texture
const assetManager = AssetManager.getInstance();
await assetManager.loadTexture('player', '/assets/player.png');

// Get texture
const texture = assetManager.getTexture('player');
const sprite = new PIXI.Sprite(texture);
```

### Load Multiple Assets
```typescript
const assets = [
  { name: 'player', url: '/assets/player.png' },
  { name: 'enemy', url: '/assets/enemy.png' },
  { name: 'tileset', url: '/assets/tileset.png' }
];

await assetManager.loadAssets(assets);
```

---

## 📋 Task: Handle Input

### Check Key State
```typescript
import { InputManager } from '../core/InputManager';

const input = InputManager.getInstance();

// Check if key is pressed
if (input.isKeyDown('w')) {
  player.moveUp();
}

// Get movement vector
const movement = input.getMovementVector();
// Returns { x: -1 to 1, y: -1 to 1 }
```

### Listen for Key Events
```typescript
input.on('keydown:space', () => {
  player.attack();
});

input.on('keyup:e', () => {
  player.interact();
});
```

---

## 📋 Task: Create PixiJS Sprite

### Basic Sprite
```typescript
import * as PIXI from 'pixi.js';

// From texture
const texture = PIXI.Texture.from('/assets/sprite.png');
const sprite = new PIXI.Sprite(texture);

// Set position
sprite.position.set(100, 200);

// Set anchor (pivot point)
sprite.anchor.set(0.5, 0.5); // Center

// Set scale
sprite.scale.set(2, 2); // 2x size

// Add to stage
app.stage.addChild(sprite);
```

### Animated Sprite
```typescript
// Create animation frames
const frames = [];
for (let i = 0; i < 8; i++) {
  frames.push(PIXI.Texture.from(`walk_${i}.png`));
}

// Create animated sprite
const animatedSprite = new PIXI.AnimatedSprite(frames);
animatedSprite.animationSpeed = 0.1;
animatedSprite.play();
```

---

## 📋 Task: Render Tilemap

### Basic Tilemap
```typescript
import { CompositeTilemap } from '@pixi/tilemap';
import * as PIXI from 'pixi.js';

// Create tilemap
const tilemap = new CompositeTilemap();

// Load tileset
const tileset = PIXI.Texture.from('/assets/tileset.png');
const tileSize = 32;
const tilesPerRow = 16;

// Render tiles
for (let y = 0; y < mapHeight; y++) {
  for (let x = 0; x < mapWidth; x++) {
    const gid = mapData[y * mapWidth + x];
    
    if (gid > 0) {
      // Calculate tile position in tileset
      const tileX = (gid % tilesPerRow) * tileSize;
      const tileY = Math.floor(gid / tilesPerRow) * tileSize;
      
      // Add tile to tilemap
      tilemap.tile(
        tileset,
        x * tileSize,
        y * tileSize,
        {
          u: tileX,
          v: tileY,
          tileWidth: tileSize,
          tileHeight: tileSize
        }
      );
    }
  }
}

// Add to stage
app.stage.addChild(tilemap);
```

---

## 📋 Task: Scene Transition

### Switch Scene
```typescript
import { SceneManager } from '../core/SceneManager';
import { BattleScene } from '../scenes/BattleScene';

// Switch to new scene
const sceneManager = SceneManager.getInstance();
await sceneManager.switchTo(new BattleScene());
```

### With Fade Transition
```typescript
await sceneManager.switchTo(new BattleScene(), {
  fadeOut: 0.3,
  fadeIn: 0.3
});
```

---

## 📋 Task: Format Damage Number

### Display Floating Number
```typescript
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

function showDamage(x: number, y: number, damage: number): void {
  const text = new PIXI.Text(`-${damage}`, {
    fill: 0xff0000,
    fontSize: 24,
    fontWeight: 'bold'
  });
  
  text.position.set(x, y);
  text.anchor.set(0.5, 0.5);
  
  app.stage.addChild(text);
  
  // Animate
  gsap.to(text, {
    y: y - 50,
    alpha: 0,
    duration: 1,
    onComplete: () => {
      app.stage.removeChild(text);
    }
  });
}
```

---

## 📋 Task: Load DragonBones Character

### Basic Usage
```typescript
// src/scenes/BattleScene.ts
import { DragonBonesAnimation } from '../entities/components/DragonBonesAnimation';
import * as PIXI from 'pixi.js';

async function loadMonster(app: PIXI.Application, monsterName: string) {
  // Create animation controller
  const animation = new DragonBonesAnimation(app);
  
  // Load character
  await animation.loadCharacter(monsterName);
  
  // Get display and add to scene
  const display = animation.getDisplay();
  if (display) {
    display.position.set(600, 300);
    display.scale.set(0.8);
    this.addChild(display);
  }
  
  // Play idle animation
  animation.play('Idle');
  
  return animation;
}
```

### Attack Sequence
```typescript
async function performAttack(animation: DragonBonesAnimation) {
  // Play attack animation once
  animation.play('Attack A', 1);
  
  // Wait for animation duration
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return to idle
  animation.play('Idle');
}
```

### Check Available Animations
```typescript
function showAnimations(animation: DragonBonesAnimation) {
  const animations = animation.listAnimations();
  console.log('Available animations:', animations);
  // Output: ['Idle', 'Attack A', 'Attack B', 'Damage']
}
```

### Checklist
- [ ] Use `DragonBonesAnimation` component (not raw factory)
- [ ] Always `await` loadCharacter() before using
- [ ] Check animations list with listAnimations()
- [ ] Dispose on cleanup with destroy()
- [ ] Use Vietnamese names from monster-database.json

---

## 📋 Task: Use Monster Database

### Load Monster by Name
```typescript
import monsterDB from '../data/monster-database.json';
import vi from '../data/vi.json';

function getMonsterInfo(englishName: string) {
  const monster = monsterDB.monsters.find(
    m => m.englishName === englishName
  );
  
  if (!monster) return null;
  
  return {
    name: monster.name,           // Vietnamese name
    element: vi.elements[monster.element], // Translated element
    region: vi.regions[monster.region.toLowerCase().replace(/\s/g, '')],
    assetName: monster.assetName  // For loading DragonBones
  };
}

// Example usage
const info = getMonsterInfo('Absolution');
console.log(info);
// {
//   name: "Hổ Bọ Cạp Thần",
//   element: "Kim (Kim Loại)",
//   region: "Núi Kim Sơn",
//   assetName: "Absolution"
// }
```

### Filter Monsters by Element
```typescript
function getMonstersByElement(element: string) {
  return monsterDB.monsters.filter(m => m.element === element);
}

// Get all Fire monsters
const fireMonsters = getMonstersByElement('hoa');
console.log(`Found ${fireMonsters.length} Fire monsters`);
```

### Random Encounter
```typescript
function getRandomMonster(tier: number = 1) {
  const monstersInTier = monsterDB.monsters.filter(
    m => m.tier === tier
  );
  
  const randomIndex = Math.floor(Math.random() * monstersInTier.length);
  return monstersInTier[randomIndex];
}

// Get random tier 2 monster
const monster = getRandomMonster(2);
```

### Checklist
- [ ] Import from `../data/monster-database.json`
- [ ] Use Vietnamese names for UI display
- [ ] Use `assetName` for DragonBones loading
- [ ] Filter by tier for balanced encounters
- [ ] Use translations from vi.json for elements/regions

---

**Last Updated**: 2025-10-17  
**Version**: 1.1.0
