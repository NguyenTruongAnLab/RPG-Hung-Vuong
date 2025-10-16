# AI Agent Quick Reference Card

## 🚨 BEFORE YOU CODE - READ THIS FIRST

### The Golden Rules

1. **File Size Limit: 500 lines MAX**
   ```bash
   wc -l src/path/to/file.ts
   # If >400 → STOP and split file
   ```

2. **Use Popular Libraries (AI-Trained)**
   - ✅ Matter.js for physics
   - ✅ GSAP for animations
   - ✅ @pixi/tilemap for tilemaps
   - ❌ NO custom physics/animation systems

3. **Composition Over Inheritance**
   ```typescript
   // ✅ GOOD
   class Player {
     movement: PlayerMovement;
     combat: PlayerCombat;
   }
   
   // ❌ BAD
   class Player extends BaseEntity {
     // 800 lines of mixed concerns
   }
   ```

4. **JSDoc With Examples Required**
   ```typescript
   /**
    * Creates a circle body
    * @param x - X coordinate
    * @param y - Y coordinate
    * @example
    * const body = createCircle(100, 200);
    */
   ```

---

## 📁 Project Structure Quick Lookup

```
src/
├── core/           # Managers (Physics, Scene, Asset, Input)
│   └── README.md   # Read this first!
├── systems/        # Game logic (Battle, Capture, Collision)
│   └── README.md
├── entities/       # Game objects (Player, Monster, Enemy)
│   └── README.md
├── world/          # Tilemap, Camera, MapLoader
│   └── README.md
├── scenes/         # Game scenes (Overworld, Battle, Menu)
│   └── README.md
├── ui/             # UI components
└── utils/          # Helpers and utilities
```

---

## 🔧 Common Commands

```bash
# Check file sizes
find src -name "*.ts" -exec wc -l {} + | sort -n

# Run tests
npm test

# Build
npm run build

# Type check
npm run type-check

# Install Phase 2 libs
npm install matter-js @types/matter-js gsap @pixi/tilemap lodash @types/lodash
```

---

## 📚 Quick Library Reference

### Matter.js (Physics)
```typescript
import Matter from 'matter-js';

// Create engine
const engine = Matter.Engine.create();

// Create body
const body = Matter.Bodies.circle(x, y, radius);
Matter.World.add(engine.world, body);

// Update
Matter.Engine.update(engine, deltaMs);

// Collision
Matter.Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach(pair => {
    // Handle collision
  });
});
```

### GSAP (Animation)
```typescript
import gsap from 'gsap';

// Basic tween
gsap.to(sprite, { x: 100, duration: 1 });

// With easing
gsap.to(sprite, { 
  alpha: 0, 
  duration: 0.5, 
  ease: "power2.out" 
});

// Kill before new animation
gsap.killTweensOf(sprite);
```

### @pixi/tilemap (Tilemap)
```typescript
import { CompositeTilemap } from '@pixi/tilemap';

const tilemap = new CompositeTilemap();
tilemap.tile(texture, x, y);
app.stage.addChild(tilemap);
```

---

## 🧪 Testing Rules

```typescript
// ✅ GOOD: Test public API
test('player moves right when D pressed', () => {
  player.handleInput({ right: true });
  player.update(1);
  expect(player.x).toBeGreaterThan(initialX);
});

// ❌ BAD: Test implementation details
test('velocity calculation formula', () => {
  expect(player._calculateVelocity()).toBe(5);
});
```

---

## 📝 Commit Message Format

```
type(scope): subject

Examples:
feat(physics): Add PhysicsManager with Matter.js
refactor(entities): Split Player into components (was 600 lines)
fix(collision): Handle edge case for wall corners
docs(readme): Update Phase 2 progress
test(battle): Add 15 unit tests for damage calculation
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## 🎯 File Size Targets

| Component Type | Target | Maximum |
|---------------|--------|---------|
| Manager       | <300   | 400     |
| System        | <250   | 350     |
| Entity        | <200   | 300     |
| Component     | <150   | 200     |
| Utility       | <150   | 200     |
| Scene         | <350   | 400     |

**If approaching limit**: Extract helpers, split into components

---

## 🚀 Phase 2 Implementation Priorities

**Week 2:**
1. Install libraries (Matter.js, GSAP, @pixi/tilemap)
2. PhysicsManager + CollisionSystem + MatterHelpers
3. InputManager
4. Player (orchestrator) + Components (Movement, Combat, Stats)
5. Tilemap system + Collision + Encounters + MapLoader
6. Camera with GSAP
7. OverworldScene + UI + Entities

**Daily Commits**: Commit after each completed component

---

## ⚠️ Common Mistakes to Avoid

### ❌ File Too Large
```
Player.ts (800 lines) ← TOO BIG!
```
**Fix**: Split into components
```
Player.ts (250 lines)
PlayerMovement.ts (150 lines)
PlayerCombat.ts (150 lines)
PlayerStats.ts (100 lines)
```

### ❌ Custom Physics
```typescript
// Don't do this!
class CustomPhysicsEngine {
  // 500 lines of collision math
}
```
**Fix**: Use Matter.js

### ❌ Missing JSDoc
```typescript
// Bad
function create(x, y) { ... }
```
**Fix**: Add comprehensive JSDoc
```typescript
/**
 * Creates a player entity
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Player instance
 * @example
 * const player = create(100, 200);
 */
```

### ❌ Testing Implementation Details
```typescript
// Don't do this
expect(player._velocity).toBe(5);
```
**Fix**: Test public behavior
```typescript
player.update(1);
expect(player.x).toBeGreaterThan(initialX);
```

---

## 📋 Pre-Commit Checklist

```bash
# 1. File size check
wc -l src/path/to/file.ts
# Must be <500

# 2. Run tests
npm test
# Must pass

# 3. Build check
npm run build
# Must succeed

# 4. Type check
npm run type-check
# Must pass (warnings OK initially)

# 5. Documentation check
# - JSDoc on all public methods? ✓
# - @example tags present? ✓
# - folder README.md updated? ✓

# 6. Library usage check
# - Used Matter.js instead of custom physics? ✓
# - Used GSAP instead of custom animation? ✓
```

---

## 🆘 When Stuck

1. **Read the folder README.md** - Explains purpose and patterns
2. **Check docs/LIBRARIES.md** - Library usage examples
3. **Check docs/PHASE2_IMPLEMENTATION_GUIDE.md** - Step-by-step guide
4. **Check .github/copilot-instructions.md** - Complete architectural rules
5. **Check existing code** - Look for similar patterns

---

## 📊 Success Criteria (Phase 2)

At end of Phase 2, verify:
- [ ] Zero files >500 lines
- [ ] 100+ tests passing
- [ ] Coverage ≥75%
- [ ] Matter.js used for all physics
- [ ] GSAP used for all animations
- [ ] Every folder has README.md
- [ ] All public methods have JSDoc
- [ ] Build successful (<10s)
- [ ] Bundle size <3MB
- [ ] 60 FPS gameplay

---

## 🎓 Learn More

- **Full Guide**: `docs/PHASE2_IMPLEMENTATION_GUIDE.md`
- **Libraries**: `docs/LIBRARIES.md`
- **Gameplay**: `docs/GAMEPLAY.md`
- **Architecture**: `.github/copilot-instructions.md`
- **Roadmap**: `ROADMAP.md`

---

**Remember**: Small files, popular libraries, comprehensive docs, test everything!
