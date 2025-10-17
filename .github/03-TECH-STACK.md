# Tech Stack - Libraries & Versions

This document lists all required libraries, their versions, installation commands, and usage guidelines.

---

## ✅ Core Stack (Mandatory)

### Rendering Engine
```bash
npm install pixi.js@^8.0.0
```

**Purpose**: WebGL rendering, sprite management, scene graph  
**When to use**: All rendering, sprites, containers, textures  
**Documentation**: https://pixijs.com/docs

**Example**:
```typescript
import * as PIXI from 'pixi.js';
const app = new PIXI.Application();
const sprite = PIXI.Sprite.from('path/to/image.png');
```

### Animation Library
```bash
npm install gsap@^3.12.0
```

**Purpose**: Tweening, timelines, animation control  
**When to use**: Smooth transitions, camera follow, UI animations  
**Documentation**: https://greensock.com/docs/

**Example**:
```typescript
import gsap from 'gsap';
gsap.to(sprite, { x: 100, y: 200, duration: 0.5, ease: 'power2.out' });
```

### Physics Engine
```bash
npm install matter-js@^0.19.0
npm install -D @types/matter-js
```

**Purpose**: 2D physics, collision detection, rigid bodies  
**When to use**: Overworld collisions, player movement, enemy AI  
**Documentation**: https://brm.io/matter-js/docs/

**Example**:
```typescript
import Matter from 'matter-js';
const engine = Matter.Engine.create();
const body = Matter.Bodies.circle(x, y, radius);
Matter.World.add(engine.world, body);
```

### Tilemap Rendering
```bash
npm install @pixi/tilemap@^5.0.0
```

**Purpose**: Efficient large tilemap rendering  
**When to use**: Rendering Tiled JSON maps  
**Documentation**: https://github.com/pixijs/tilemap

**Example**:
```typescript
import { CompositeTilemap } from '@pixi/tilemap';
const tilemap = new CompositeTilemap();
tilemap.tile(texture, x, y);
```

### Skeletal Animation
```bash
# Already included in dependencies
# dragonbones.js@^5.7.0
```

**Purpose**: Skeletal animation for monsters  
**When to use**: Animating 200 Thần Thú characters  
**Documentation**: https://github.com/DragonBones/DragonBonesJS

**Example**:
```typescript
import * as dragonBones from 'dragonbones';
const factory = dragonBones.PixiFactory.factory;
factory.parseDragonBonesData(skeletonData);
```

---

## 🛠️ Development Tools (Mandatory)

### TypeScript
```bash
npm install -D typescript@^5.0.0
```

**Purpose**: Type safety, better IDE support, catch bugs early  
**Configuration**: `tsconfig.json`

### Build Tool
```bash
npm install -D vite@^5.0.0
```

**Purpose**: Fast dev server, optimized production builds  
**Commands**:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

### Testing Framework
```bash
npm install -D vitest@^1.0.0
npm install -D @vitest/ui
```

**Purpose**: Unit testing with Vite integration  
**Commands**:
- `npm run test` - Run all tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report

### E2E Testing
```bash
npm install -D playwright@^1.40.0
npm install -D @playwright/test
```

**Purpose**: End-to-end browser testing  
**Commands**:
- `npm run test:e2e` - Run E2E tests
- `npx playwright codegen` - Record tests

---

## 📦 Utilities (Recommended)

### Lodash
```bash
npm install lodash@^4.17.0
npm install -D @types/lodash
```

**Purpose**: Array, object, and collection utilities  
**When to use**: Instead of writing custom utility functions

**Example**:
```typescript
import _ from 'lodash';
const unique = _.uniq([1, 2, 2, 3]);
const grouped = _.groupBy(monsters, 'element');
```

---

## 📚 Library Usage Rules

### Matter.js (Physics)

**When to use:**
- Overworld collision detection
- Player movement (force-based)
- Enemy AI (pathfinding around obstacles)
- Projectile physics

**When NOT to use:**
- Battle mode (no physics, pure logic)
- UI elements
- Simple position updates

**Key Concepts:**
```typescript
// Create physics engine (singleton)
const engine = Matter.Engine.create({
  gravity: { x: 0, y: 0 } // Top-down = no gravity
});

// Create bodies
const playerBody = Matter.Bodies.circle(x, y, 16, {
  label: 'player',
  friction: 0.1,
  restitution: 0
});

// Static bodies (walls)
const wall = Matter.Bodies.rectangle(x, y, w, h, {
  isStatic: true
});

// Add to world
Matter.World.add(engine.world, [playerBody, wall]);

// Update (in game loop)
Matter.Engine.update(engine, deltaMs);

// Apply force (movement)
Matter.Body.applyForce(playerBody, playerBody.position, {
  x: velocity.x * 0.01,
  y: velocity.y * 0.01
});
```

### GSAP (Animation)

**When to use:**
- Smooth transitions (scene changes)
- Camera follow (smooth interpolation)
- UI animations (buttons, menus)
- Combat effects (damage numbers)
- Screen shake

**When NOT to use:**
- Skeletal animation (use DragonBones)
- Physics-based movement (use Matter.js)
- Frame-by-frame sprites (use PixiJS AnimatedSprite)

**Key Patterns:**
```typescript
// Simple tween
gsap.to(sprite, {
  x: 100,
  y: 200,
  duration: 0.5,
  ease: 'power2.out'
});

// With callback
gsap.to(sprite, {
  alpha: 0,
  duration: 0.3,
  onComplete: () => {
    sprite.visible = false;
  }
});

// Camera follow
gsap.to(camera, {
  x: -player.x + viewportWidth / 2,
  y: -player.y + viewportHeight / 2,
  duration: 0.3,
  ease: 'power2.out'
});

// Timeline (sequence)
const tl = gsap.timeline();
tl.to(sprite, { x: 100, duration: 0.5 })
  .to(sprite, { y: 200, duration: 0.5 })
  .to(sprite, { alpha: 0, duration: 0.3 });
```

### @pixi/tilemap (Tilemap)

**When to use:**
- Rendering large maps efficiently
- Tiled JSON map data
- Multiple tile layers

**When NOT to use:**
- Simple static images (use PIXI.Sprite)
- Small maps (<100 tiles)
- Animated tiles (not supported well)

**Key Patterns:**
```typescript
import { CompositeTilemap } from '@pixi/tilemap';

// Create tilemap
const tilemap = new CompositeTilemap();

// Add tiles
for (let y = 0; y < mapHeight; y++) {
  for (let x = 0; x < mapWidth; x++) {
    const gid = mapData[y * mapWidth + x];
    if (gid > 0) {
      tilemap.tile(
        tilesetTexture,
        x * tileSize,
        y * tileSize,
        {
          u: (gid % tilesPerRow) * tileSize,
          v: Math.floor(gid / tilesPerRow) * tileSize,
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

### Lodash (Utilities)

**Common Use Cases:**
```typescript
import _ from 'lodash';

// Array operations
_.uniq([1, 2, 2, 3]); // [1, 2, 3]
_.chunk([1, 2, 3, 4], 2); // [[1, 2], [3, 4]]
_.shuffle([1, 2, 3]); // Random order

// Object operations
_.pick(obj, ['id', 'name']); // Extract properties
_.omit(obj, ['password']); // Remove properties
_.merge(obj1, obj2); // Deep merge

// Collection operations
_.groupBy(monsters, 'element'); // Group by property
_.sortBy(monsters, 'speed'); // Sort by property
_.filter(monsters, { element: 'kim' }); // Filter

// Function operations
const throttled = _.throttle(fn, 100); // Limit call rate
const debounced = _.debounce(fn, 300); // Delay until idle
```

---

## 🚫 What NOT to Install

Never install these:

❌ **Alternative physics libraries**
- Box2D, Planck.js, etc.
- Reason: Matter.js is standard, AI knows it well

❌ **Alternative animation libraries**
- Anime.js, Velocity.js, etc.
- Reason: GSAP is industry standard

❌ **Custom game engines**
- Phaser, Babylon.js, Three.js, etc.
- Reason: We're building custom with PixiJS

❌ **Untyped packages**
- Always install @types/ definitions
- Example: `npm install -D @types/lodash`

❌ **Unnecessary dependencies**
- moment.js (use native Date)
- jquery (not needed)
- axios (use fetch API)

---

## 🔧 Version Management

### Checking Versions
```bash
# List installed packages
npm list

# Check specific package
npm list matter-js

# Check for updates
npm outdated
```

### Updating Packages
```bash
# Update within semver range (^)
npm update

# Update to latest (careful!)
npm install matter-js@latest

# Check breaking changes first
npm view matter-js versions
```

### Semantic Versioning
- `^5.0.0` - Allow minor and patch updates (5.x.x)
- `~5.0.0` - Allow patch updates only (5.0.x)
- `5.0.0` - Exact version (not recommended)

**Our Policy**: Use `^` for stability with updates

---

## 📊 Current Dependency List

```json
{
  "dependencies": {
    "pixi.js": "^8.0.0",
    "matter-js": "^0.19.0",
    "gsap": "^3.12.0",
    "@pixi/tilemap": "^5.0.0",
    "dragonbones.js": "^5.7.0",
    "lodash": "^4.17.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0",
    "@types/matter-js": "*",
    "@types/lodash": "*"
  }
}
```

---

**Last Updated**: 2025-10-17  
**Version**: 1.0.0
