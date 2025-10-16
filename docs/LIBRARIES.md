# Recommended Libraries - RPG Hùng Vương

## 🎯 Philosophy: Use AI-Trained, Popular Libraries

**Core Principle**: Prefer industry-standard libraries that AI agents (like GitHub Copilot) have been extensively trained on. This makes the codebase more maintainable and AI-friendly.

---

## 📦 Required Libraries (Phase 2+)

### Matter.js - Physics Engine
**Status**: 🔴 To Install  
**Why**: Industry standard 2D physics engine  
**GitHub Stars**: 16,000+  
**AI Training**: Extensive - thousands of examples on GitHub/Stack Overflow

```bash
npm install matter-js @types/matter-js
```

**Use Cases**:
- Player movement and collision
- Wall collision detection
- Overworld physics simulation
- Enemy pathfinding obstacles
- Attack hitbox detection

**Why Not Custom Physics**:
- ❌ AI must read 500+ lines of custom code
- ❌ Bugs in edge cases (tunneling, corner collision)
- ❌ No community support
- ✅ Matter.js: AI instantly understands API
- ✅ Battle-tested by thousands of projects
- ✅ Performance optimized

**API Examples AI Knows**:
```typescript
// Create world
const engine = Matter.Engine.create();
const world = engine.world;

// Create bodies
const body = Matter.Bodies.circle(x, y, radius);
Matter.World.add(world, body);

// Apply forces
Matter.Body.applyForce(body, position, force);

// Collision detection
Matter.Events.on(engine, 'collisionStart', (event) => {
  // Handle collision
});
```

---

### GSAP - Animation Library
**Status**: 🔴 To Install  
**Why**: Industry standard animation library  
**GitHub Stars**: 18,000+  
**AI Training**: Extensive - used in 90% of web animation tutorials

```bash
npm install gsap
```

**Use Cases**:
- Smooth camera follow (lerp)
- UI transitions (fade in/out)
- Battle animations (attack, damage)
- Scene transitions
- Camera shake effects
- Number tweening (HP bar animations)

**Why Not Custom Animation**:
- ❌ Custom interpolation code = 200+ lines
- ❌ No easing functions library
- ❌ Performance not optimized
- ✅ GSAP: AI knows all syntax
- ✅ 100+ easing functions built-in
- ✅ Timeline management
- ✅ Performance optimized (GPU acceleration)

**API Examples AI Knows**:
```typescript
// Basic tween
gsap.to(sprite, { x: 100, y: 200, duration: 1 });

// With easing
gsap.to(sprite, { 
  alpha: 0, 
  duration: 0.5, 
  ease: "power2.out" 
});

// Timeline
const tl = gsap.timeline();
tl.to(sprite, { x: 100 })
  .to(sprite, { y: 200 })
  .to(sprite, { alpha: 0 });

// Camera shake
gsap.to(camera, { 
  x: "+=10", 
  yoyo: true, 
  repeat: 5, 
  duration: 0.1 
});
```

---

### @pixi/tilemap - Tilemap Plugin
**Status**: 🔴 To Install  
**Why**: Official PixiJS plugin for tilemap rendering  
**GitHub Stars**: Part of PixiJS ecosystem  
**AI Training**: Documented in PixiJS official docs

```bash
npm install @pixi/tilemap
```

**Use Cases**:
- Render game world maps
- Multi-layer maps (ground, decoration, foreground)
- Tile-based collision
- Large maps with performance optimization

**Why Not Custom Tilemap**:
- ❌ Custom rendering = 300+ lines
- ❌ Performance issues with large maps
- ❌ No batch rendering optimization
- ✅ @pixi/tilemap: AI knows API
- ✅ Official plugin - well maintained
- ✅ Optimized batch rendering
- ✅ Supports Tiled Map Editor format

**API Examples AI Knows**:
```typescript
import { CompositeTilemap } from '@pixi/tilemap';

// Create tilemap
const tilemap = new CompositeTilemap();

// Add tiles
tilemap.tile(tileTexture, x, y);

// Add to stage
app.stage.addChild(tilemap);
```

---

### Lodash - Utility Library
**Status**: 🟢 Optional (Recommended)  
**Why**: Ubiquitous JavaScript utility library  
**NPM Downloads**: 50M+ per week  
**AI Training**: Extensive - every AI knows lodash

```bash
npm install lodash @types/lodash
```

**Use Cases**:
- Array operations (filter, map, reduce)
- Object manipulation
- Deep cloning
- Debouncing/throttling
- Collection utilities

**Why Not Custom Utilities**:
- ❌ Reinventing the wheel
- ❌ Edge case bugs
- ✅ Lodash: AI knows every function
- ✅ Battle-tested
- ✅ Performance optimized
- ✅ Tree-shakeable (only import what you use)

**API Examples AI Knows**:
```typescript
import _ from 'lodash';

// Array utilities
_.chunk(array, size);
_.uniq(array);
_.sortBy(array, ['property']);

// Object utilities
_.cloneDeep(object);
_.merge(obj1, obj2);

// Function utilities
const debounced = _.debounce(fn, 300);
const throttled = _.throttle(fn, 100);
```

---

## 🚫 Libraries to Avoid

### Custom Physics Engine
**Problem**: AI must read entire codebase  
**Alternative**: Use Matter.js

### Custom Animation System
**Problem**: Complex, unmaintainable  
**Alternative**: Use GSAP

### Custom Tilemap Renderer
**Problem**: Performance issues, no standard format  
**Alternative**: Use @pixi/tilemap

### jQuery
**Problem**: Outdated, not needed with modern JS  
**Alternative**: Vanilla JS or Lodash

### Moment.js
**Problem**: Deprecated, large bundle size  
**Alternative**: Native Date or date-fns

---

## 📊 Library Decision Matrix

When choosing a library, ask:

1. **Is it industry standard?**
   - ✅ Yes → AI likely trained on it
   - ❌ No → AI must read docs

2. **GitHub stars > 10,000?**
   - ✅ Yes → Large community, many examples
   - ❌ No → Limited examples, might be abandoned

3. **Active maintenance?**
   - ✅ Last commit < 3 months → Active
   - ❌ Last commit > 1 year → Dead project

4. **TypeScript support?**
   - ✅ @types package or built-in types
   - ❌ No types → Hard to use

5. **Bundle size impact?**
   - ✅ <100KB → Acceptable
   - ⚠️ 100-500KB → Consider alternatives
   - ❌ >500KB → Too heavy

---

## 🎯 Library Integration Checklist

When adding new library:

- [ ] Install library: `npm install <library>`
- [ ] Install types: `npm install @types/<library>` (if needed)
- [ ] Create wrapper/manager in `src/core/` or `src/utils/`
- [ ] Add JSDoc with @example showing usage
- [ ] Update this file (LIBRARIES.md) with rationale
- [ ] Add to ARCHITECTURE.md
- [ ] Write unit tests for wrapper
- [ ] Update package.json scripts if needed
- [ ] Document in folder README.md

---

## 📝 Current Dependencies Status

### Production Dependencies
- ✅ **pixi.js** (v8.0.0) - Core game engine
- ✅ **dragonbones.js** (v5.7.4) - Animation runtime
- 🔴 **matter-js** - TO ADD (Phase 2)
- 🔴 **gsap** - TO ADD (Phase 2)
- 🔴 **@pixi/tilemap** - TO ADD (Phase 2)

### Development Dependencies
- ✅ **typescript** - Type checking
- ✅ **vitest** - Unit testing
- ✅ **@playwright/test** - E2E testing
- ✅ **vite** - Build tool
- 🟢 **lodash** - OPTIONAL (recommended)

---

## 🚀 Phase 2 Installation Script

Run this to install all Phase 2 libraries:

```bash
# Physics engine
npm install matter-js @types/matter-js

# Animation library
npm install gsap

# Tilemap plugin
npm install @pixi/tilemap

# Optional utilities
npm install lodash @types/lodash

# Verify installation
npm list matter-js gsap @pixi/tilemap lodash
```

---

## 📚 Learning Resources

### Matter.js
- Official Docs: https://brm.io/matter-js/
- Examples: https://brm.io/matter-js/demo/
- GitHub: https://github.com/liabru/matter-js

### GSAP
- Official Docs: https://gsap.com/docs/
- Getting Started: https://gsap.com/docs/v3/Installation
- Cheat Sheet: https://gsap.com/cheatsheet/

### @pixi/tilemap
- GitHub: https://github.com/pixijs/tilemap
- PixiJS Docs: https://pixijs.download/dev/docs/index.html

### Lodash
- Official Docs: https://lodash.com/docs/
- You Might Not Need Lodash: https://youmightnotneed.com/lodash/

---

**Key Principle**: If AI agent needs to read custom code to understand it, use a popular library instead.
