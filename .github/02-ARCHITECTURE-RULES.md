# Architecture Rules - The 4 Commandments

These are **non-negotiable rules** that must be followed at all times. Violating these rules leads to unmaintainable code and project failure.

---

## Commandment 1: The 500-Line Law (ABSOLUTE)

### The Rule

**NO FILE SHALL EXCEED 500 LINES. PERIOD.**

**Exemptions**: NONE. No exceptions. Split ruthlessly.

### Why This Matters

When files exceed 500 lines:
- ❌ AI agents struggle to understand full context
- ❌ Code reviews become nightmares
- ❌ Bugs hide in complexity
- ❌ Testing becomes difficult
- ❌ Merge conflicts multiply
- ❌ Maintenance becomes impossible

When files stay under 500 lines:
- ✅ AI can understand entire file at once
- ✅ Code reviews are fast and focused
- ✅ Bugs are easier to spot
- ✅ Tests are simple and clear
- ✅ Merge conflicts are rare
- ✅ Maintenance is straightforward

### Enforcement Process

**Before saving any file:**
```bash
wc -l filename.ts
```

**Watch these thresholds:**
1. **≥ 300 lines** → Green - OK, keep monitoring
2. **≥ 400 lines** → Yellow - Plan extraction now
3. **≥ 500 lines** → Red - STOP! Split immediately

**After splitting:**
- Update folder `README.md` with new files
- Ensure all tests still pass
- Update imports in dependent files

### How to Split Files

**Identify Responsibilities:**
1. Read through the file
2. Identify 2-3 distinct responsibilities
3. Each responsibility becomes its own file
4. Original file becomes orchestrator

**Target File Sizes After Split:**
- Utilities: <200 lines (pure functions)
- Components: <200 lines (single responsibility)
- Entities: <300 lines (orchestrators)
- Systems: <350 lines (game logic)
- Managers: <400 lines (core infrastructure)

**Example - BAD (Monolithic):**
```
❌ Player.ts (850 lines)
   - Movement logic (200 lines)
   - Combat logic (200 lines)
   - Animation logic (180 lines)
   - Stats management (120 lines)
   - Inventory management (150 lines)
```

**Example - GOOD (Modular):**
```
✅ Split into multiple files:
   ├── Player.ts (280 lines)              # Orchestrator
   ├── PlayerMovement.ts (180 lines)      # Movement only
   ├── PlayerCombat.ts (170 lines)        # Combat only
   ├── PlayerAnimation.ts (160 lines)     # Animation only
   ├── PlayerStats.ts (120 lines)         # Stats only
   └── PlayerInventory.ts (140 lines)     # Inventory only
```

### Splitting Strategy

**1. Component-Based Splitting (Preferred):**
```typescript
// Player.ts (280 lines) - Orchestrator
import { PlayerMovement } from './components/PlayerMovement';
import { PlayerCombat } from './components/PlayerCombat';
import { PlayerStats } from './components/PlayerStats';

export class Player {
  public movement: PlayerMovement;
  public combat: PlayerCombat;
  public stats: PlayerStats;
  
  constructor(x: number, y: number) {
    this.stats = new PlayerStats();
    this.movement = new PlayerMovement(this, x, y);
    this.combat = new PlayerCombat(this);
  }
  
  update(delta: number): void {
    this.movement.update(delta);
    this.combat.update(delta);
  }
}
```

**2. Utility Function Splitting:**
```typescript
// Before: GameHelpers.ts (600 lines)
// After: Split by category
├── MathHelpers.ts (150 lines)
├── StringHelpers.ts (120 lines)
├── DateHelpers.ts (100 lines)
└── CollectionHelpers.ts (180 lines)
```

**3. Feature-Based Splitting:**
```typescript
// Before: BattleScene.ts (800 lines)
// After: Split by feature
├── BattleScene.ts (350 lines)        # Core logic
├── BattleUI.ts (200 lines)           # UI rendering
├── BattleAnimations.ts (150 lines)   # Animations
└── BattleEffects.ts (100 lines)      # Visual effects
```

---

## Commandment 2: Use Popular Libraries

### The Rule

**ALWAYS prefer industry-standard libraries over custom implementations.**

**NO CUSTOM IMPLEMENTATIONS of solved problems!**

### Why This Matters

**Benefits of Popular Libraries:**
- ✅ AI already trained on these APIs → Faster, accurate code generation
- ✅ Millions of examples on GitHub/StackOverflow
- ✅ Community support and maintenance
- ✅ Battle-tested and optimized
- ✅ Regular security updates
- ✅ Extensive documentation

**Problems with Custom Implementations:**
- ❌ AI must read and understand your code
- ❌ No community support
- ❌ You must maintain it
- ❌ Likely to have bugs
- ❌ Reinventing the wheel
- ❌ Wastes development time

### Required Libraries

| Purpose | Library | Why | AI Knowledge |
|---------|---------|-----|--------------|
| Physics | `matter-js` | Industry standard, 16K+ stars | Extensive |
| Animation | `gsap` | Animation standard, ubiquitous | Complete |
| Tilemap | `@pixi/tilemap` | Official PixiJS plugin | Official docs |
| Rendering | `pixi.js` | Most popular WebGL library | Total |
| Utils | `lodash` | Universal utilities | Total |

### What Is FORBIDDEN

Never create custom implementations of these:

❌ **Custom physics/collision systems**
- Use Matter.js instead
- Even for simple collisions

❌ **Custom animation engines**
- Use GSAP instead
- Even for simple tweens

❌ **Custom tilemap renderers**
- Use @pixi/tilemap instead
- Even for small maps

❌ **Custom utility functions** (if lodash has it)
- Use lodash instead
- Check lodash docs first

❌ **Reinventing any wheel**
- Google first: "npm package for [feature]"
- Use popular solution (>1K stars on GitHub)

### When to Use What

**Physics & Collision → Matter.js**
```typescript
import Matter from 'matter-js';
const body = Matter.Bodies.circle(x, y, radius);
Matter.World.add(engine.world, body);
```

**Animations & Tweens → GSAP**
```typescript
import gsap from 'gsap';
gsap.to(sprite, { x: 100, duration: 0.5 });
```

**Tilemap Rendering → @pixi/tilemap**
```typescript
import { CompositeTilemap } from '@pixi/tilemap';
const tilemap = new CompositeTilemap();
```

**Array/Object Utils → Lodash**
```typescript
import _ from 'lodash';
const unique = _.uniq(array);
```

---

## Commandment 3: Extreme Modularity

### The Rule

**Single Responsibility Principle on steroids.**

**Composition over inheritance. Always.**

### Pattern: Component-Based Entities

**✅ GOOD - Composition:**
```typescript
// Each component has ONE responsibility
class Player {
  movement: PlayerMovement;    // Handles ONLY movement
  combat: PlayerCombat;        // Handles ONLY combat
  stats: PlayerStats;          // Handles ONLY stats
  animation: PlayerAnimation;  // Handles ONLY animation
  
  constructor() {
    this.stats = new PlayerStats();
    this.movement = new PlayerMovement(this);
    this.combat = new PlayerCombat(this);
    this.animation = new PlayerAnimation(this);
  }
  
  update(delta: number) {
    this.movement.update(delta);
    this.combat.update(delta);
    this.animation.update(delta);
  }
}
```

**❌ BAD - Monolithic:**
```typescript
// Everything mixed together
class Player {
  // 200 lines of movement code
  // 200 lines of combat code
  // 200 lines of stats code
  // 200 lines of animation code
  // Total: 800+ lines of chaos
}
```

### Component Design Rules

**1. Single Responsibility:**
Each component does ONE thing and does it well.

**2. Loose Coupling:**
Components don't directly depend on each other.

**3. High Cohesion:**
Related functionality stays together.

**4. Small Interface:**
Public API is minimal and clear.

**Example - PlayerMovement Component:**
```typescript
// PlayerMovement.ts (180 lines)
export class PlayerMovement {
  private body: Matter.Body;
  private speed: number = 3;
  
  constructor(private player: Player, x: number, y: number) {
    this.body = Matter.Bodies.circle(x, y, 16);
  }
  
  update(delta: number): void {
    const input = InputManager.getInstance();
    const velocity = input.getMovementVector();
    this.applyMovement(velocity);
  }
  
  private applyMovement(velocity: Vector2D): void {
    // Movement implementation
  }
  
  getPosition(): Vector2D {
    return { x: this.body.position.x, y: this.body.position.y };
  }
}
```

### Benefits of Modularity

- ✅ Easy to test (test each component independently)
- ✅ Easy to understand (one file = one concept)
- ✅ Easy to modify (change one thing at a time)
- ✅ Easy to reuse (components work in different contexts)
- ✅ Easy to debug (isolate problems quickly)
- ✅ Easy for AI (understand each piece separately)

---

## Commandment 4: Documentation = AI Success

### The Rule

**Every file must be understandable WITHOUT reading implementation.**

### Required Documentation

**1. Folder README.md (Every folder)**
```markdown
# src/entities/

Game entities with component-based architecture.

## Files
- `Player.ts` (280 lines) - Main player entity, orchestrates components
- `PlayerMovement.ts` (180 lines) - Handles WASD/arrow movement with Matter.js
- `PlayerCombat.ts` (170 lines) - Attack mechanics and hitbox management

## Design Pattern
Uses composition. Components are independent and testable.
Player.ts coordinates, components don't directly communicate.

## Dependencies
- Matter.js for physics
- InputManager for controls
- EventBus for game events
```

**2. JSDoc for Every Public Method**
```typescript
/**
 * Applies force to player body for movement
 * Uses Matter.js Body.applyForce internally
 * Automatically normalizes diagonal movement
 * 
 * @param direction - Normalized movement vector {x: -1 to 1, y: -1 to 1}
 * @param speed - Movement speed multiplier (default: 3)
 * 
 * @example
 * // Move player right
 * playerMovement.move({ x: 1, y: 0 }, 3);
 * 
 * @example
 * // Move diagonally (normalized automatically)
 * playerMovement.move({ x: 1, y: -1 }, 2.5);
 */
move(direction: Vector2D, speed: number = 3): void {
  // Implementation
}
```

**3. Inline Comments (Explain WHY, not WHAT)**
```typescript
// ✅ GOOD: Explain WHY
// Normalize diagonal movement to prevent 1.4x speed exploit
const length = Math.sqrt(x * x + y * y);
if (length > 1) {
  x /= length;
  y /= length;
}

// ❌ BAD: Explain WHAT (code already shows this)
// Calculate the square root of x squared plus y squared
const length = Math.sqrt(x * x + y * y);
```

### Documentation Checklist

Before committing any file:
- [ ] File has JSDoc header comment
- [ ] All public methods have JSDoc with @example
- [ ] Complex logic has WHY comments
- [ ] Folder has README.md explaining files
- [ ] README.md lists all files with line counts

---

## Summary: The 4 Commandments

1. **500-Line Law**: No file >500 lines. Split at 400.
2. **Use Popular Libraries**: Matter.js, GSAP, @pixi/tilemap. No custom implementations.
3. **Extreme Modularity**: Component-based entities. Composition over inheritance.
4. **Documentation = Success**: Folder READMEs, JSDoc with examples, WHY comments.

**Violate these at your own peril!**

---

**Last Updated**: 2025-10-17  
**Version**: 1.0.0
