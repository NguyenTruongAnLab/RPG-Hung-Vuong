# Phase 2 Implementation Guide - AI Agent Instructions

## 🎯 Quick Start for AI Agents

This guide provides step-by-step instructions for implementing Phase 2 features. AI agents should follow these instructions precisely while adhering to the architectural principles defined in `.github/copilot-instructions.md`.

---

## 📋 Pre-Implementation Checklist

Before starting ANY Phase 2 task, verify:

- [ ] Read `.github/copilot-instructions.md` completely
- [ ] Read `docs/LIBRARIES.md` - understand why we use each library
- [ ] Read relevant folder README.md files
- [ ] Check current line counts: `find src -name "*.ts" -exec wc -l {} + | sort -n`
- [ ] All existing tests passing: `npm test`
- [ ] Build working: `npm run build`

---

## 🚀 Implementation Order (Critical)

Follow this exact order to minimize breaking changes:

### Step 1: Library Installation (Week 2, Day 1)
```bash
# Install physics engine
npm install matter-js @types/matter-js

# Install animation library
npm install gsap

# Install tilemap plugin
npm install @pixi/tilemap

# Optional utilities
npm install lodash @types/lodash

# Verify installation
npm list matter-js gsap @pixi/tilemap
```

**Commit**: `chore(deps): Add Phase 2 dependencies (Matter.js, GSAP, @pixi/tilemap)`

### Step 2: Physics Foundation (Week 2, Day 1-2)

#### Task 2.1: Create PhysicsManager.ts
```typescript
// Location: src/core/PhysicsManager.ts
// Max Lines: 300
// Purpose: Wrapper around Matter.js Engine

/**
 * Responsibilities:
 * - Initialize Matter.js Engine
 * - Create Matter.js World
 * - Run physics simulation loop (sync with PixiJS ticker)
 * - Provide API to add/remove bodies
 * - Sync Matter.js bodies with PixiJS sprites
 */
```

**Implementation Steps:**
1. Create file: `src/core/PhysicsManager.ts`
2. Import Matter.js: `import Matter from 'matter-js'`
3. Implement singleton pattern
4. Initialize engine in constructor
5. Create update() method that steps simulation
6. Create addBody(), removeBody() methods
7. Add JSDoc with @example for all public methods
8. Write 15 unit tests in `tests/unit/PhysicsManager.test.ts`
9. Run tests: `npm test`
10. Check line count: `wc -l src/core/PhysicsManager.ts` (must be <300)

**Commit**: `feat(physics): Add PhysicsManager with Matter.js integration`

#### Task 2.2: Create CollisionSystem.ts
```typescript
// Location: src/systems/CollisionSystem.ts
// Max Lines: 300
// Purpose: Handle Matter.js collision events

/**
 * Responsibilities:
 * - Register collision pairs (player-wall, player-enemy)
 * - Listen to Matter.js collision events
 * - Emit game events via EventBus
 * - Manage collision categories and masks
 */
```

**Implementation Steps:**
1. Create file: `src/systems/CollisionSystem.ts`
2. Import PhysicsManager and EventBus
3. Define collision categories (const COLLISION_CATEGORIES)
4. Implement collision event handlers
5. Use Matter.Events.on('collisionStart', ...)
6. Emit events to EventBus on collision
7. Add JSDoc with collision pair examples
8. Write 20 unit tests
9. Check line count (<300)

**Commit**: `feat(physics): Add CollisionSystem for Matter.js events`

#### Task 2.3: Create MatterHelpers.ts
```typescript
// Location: src/utils/MatterHelpers.ts
// Max Lines: 200
// Purpose: Utility functions for Matter.js

/**
 * Pure helper functions:
 * - createCircleBody(x, y, radius)
 * - createRectangleBody(x, y, width, height)
 * - syncSpriteToBody(sprite, body)
 * - coordsPixiToMatter(x, y)
 * - coordsMatterToPixi(x, y)
 */
```

**Implementation Steps:**
1. Create file: `src/utils/MatterHelpers.ts`
2. Create utility functions (all pure, no state)
3. Each function <30 lines
4. Comprehensive JSDoc with @example
5. Write 10 unit tests
6. Check line count (<200)

**Commit**: `feat(physics): Add MatterHelpers utility functions`

### Step 3: Input Management (Week 2, Day 2)

#### Task 3.1: Create InputManager.ts
```typescript
// Location: src/core/InputManager.ts
// Max Lines: 200
// Purpose: Handle keyboard, mouse, touch input

/**
 * Responsibilities:
 * - Listen to keyboard events (WASD, arrows)
 * - Listen to mouse/touch events
 * - Provide query API: isKeyPressed(), getMovementVector()
 * - Cleanup on destroy
 */
```

**Implementation Steps:**
1. Create file: `src/core/InputManager.ts`
2. Implement singleton pattern
3. Add event listeners for keyboard
4. Track pressed keys in Set or Map
5. Implement getMovementVector() -> {x, y}
6. Add mobile touch support
7. Write 12 unit tests
8. Check line count (<200)

**Commit**: `feat(input): Add InputManager for keyboard and touch`

### Step 4: Player Entity Components (Week 2, Day 3)

#### Task 4.1: Create Player.ts (Orchestrator)
```typescript
// Location: src/entities/Player.ts
// Max Lines: 300
// Purpose: Main player entity (composition pattern)

/**
 * Responsibilities:
 * - Compose PlayerMovement, PlayerCombat, PlayerStats
 * - Hold Matter.js body reference
 * - Delegate update() to components
 * - Emit events
 */
```

**Implementation Steps:**
1. Create file: `src/entities/Player.ts`
2. Import components (will create next)
3. Composition: this.movement, this.combat, this.stats
4. Create Matter.js body for player
5. update(delta) delegates to components
6. Write 15 unit tests
7. Check line count (<300)

#### Task 4.2: Create PlayerMovement.ts
```typescript
// Location: src/entities/PlayerMovement.ts
// Max Lines: 200
// Purpose: Player movement logic

/**
 * Responsibilities:
 * - Calculate velocity from InputManager
 * - Apply forces to Matter.js body
 * - Handle facing direction
 * - Walking animation states
 */
```

**Implementation Steps:**
1. Create file: `src/entities/PlayerMovement.ts`
2. Inject InputManager and Matter.js body
3. update(delta) calculates velocity
4. Apply forces: Matter.Body.applyForce()
5. Track facing direction (left, right, up, down)
6. Write 12 unit tests
7. Check line count (<200)

**Commit**: `feat(entities): Add Player with component architecture`

#### Task 4.3: Create PlayerCombat.ts
```typescript
// Location: src/entities/PlayerCombat.ts
// Max Lines: 200
// Purpose: Player combat actions
```

**Commit**: `feat(entities): Add PlayerCombat component`

#### Task 4.4: Create PlayerStats.ts
```typescript
// Location: src/entities/PlayerStats.ts
// Max Lines: 150
// Purpose: Player stats management
```

**Commit**: `feat(entities): Add PlayerStats component`

#### Task 4.5: Create src/entities/README.md
Document the composition pattern and component responsibilities.

**Commit**: `docs(entities): Add entities folder documentation`

### Step 5: Tilemap System (Week 2, Day 4)

#### Task 5.1: Create Tilemap.ts
```typescript
// Location: src/world/Tilemap.ts
// Max Lines: 350
// Purpose: Render tilemaps using @pixi/tilemap
```

**Implementation Steps:**
1. Create file: `src/world/Tilemap.ts`
2. Import @pixi/tilemap: `import { CompositeTilemap } from '@pixi/tilemap'`
3. Load Tiled JSON format
4. Render layers (ground, decoration, foreground)
5. Write 15 unit tests
6. Check line count (<350)

**Commit**: `feat(world): Add Tilemap renderer with @pixi/tilemap`

#### Task 5.2: Create TilemapCollision.ts
```typescript
// Location: src/world/TilemapCollision.ts
// Max Lines: 200
// Purpose: Parse collision layer and create Matter.js bodies
```

**Commit**: `feat(world): Add TilemapCollision for Matter.js integration`

#### Task 5.3: Create TilemapEncounters.ts
**Commit**: `feat(world): Add TilemapEncounters system`

#### Task 5.4: Create MapLoader.ts
**Commit**: `feat(world): Add MapLoader for Tiled JSON`

#### Task 5.5: Create src/world/README.md
**Commit**: `docs(world): Add world systems documentation`

### Step 6: Camera System (Week 2, Day 4)

#### Task 6.1: Create Camera.ts
```typescript
// Location: src/world/Camera.ts
// Max Lines: 250
// Purpose: Camera follow and effects using GSAP
```

**Implementation Steps:**
1. Create file: `src/world/Camera.ts`
2. Import GSAP: `import gsap from 'gsap'`
3. Implement follow(target) with lerp
4. Implement clamp to world bounds
5. Implement shake effect
6. Write 12 unit tests
7. Check line count (<250)

**Commit**: `feat(world): Add Camera with GSAP animations`

### Step 7: Overworld Scene (Week 2, Day 5)

#### Task 7.1: Create OverworldScene.ts
```typescript
// Location: src/scenes/OverworldScene.ts
// Max Lines: 400
// Purpose: Main overworld scene orchestration
```

**Commit**: `feat(scenes): Add OverworldScene with physics integration`

#### Task 7.2: Create OverworldUI.ts
**Commit**: `feat(scenes): Add OverworldUI component`

#### Task 7.3: Create OverworldEntities.ts
**Commit**: `feat(scenes): Add OverworldEntities management`

#### Task 7.4: Create src/scenes/README.md
**Commit**: `docs(scenes): Add scenes documentation`

### Step 8: Testing & Documentation (Week 2, Day 6)

#### Task 8.1: Verify File Sizes
```bash
# Check all files
find src -name "*.ts" -exec wc -l {} + | sort -n

# Should show:
# - All files <500 lines
# - Most files <400 lines
# - No outliers
```

#### Task 8.2: Run Full Test Suite
```bash
npm run test
# Target: 100+ tests passing
# Coverage: ≥75%
```

#### Task 8.3: Generate Metrics Report
```bash
# File count
find src -name "*.ts" | wc -l

# Average lines per file
find src -name "*.ts" -exec wc -l {} + | awk '{sum+=$1; count++} END {print sum/count}'

# Library usage
grep -r "Matter\." src/ | wc -l
grep -r "gsap\." src/ | wc -l
```

#### Task 8.4: Update Documentation
- Update ARCHITECTURE.md with Matter.js integration
- Update README.md with new features
- Ensure all folder README.md files updated

**Commit**: `docs: Complete Phase 2 documentation and metrics`

---

## 🚨 Critical Rules During Implementation

### 1. File Size Enforcement
**BEFORE every commit:**
```bash
wc -l src/path/to/file.ts
```
If >400 lines → STOP → Extract logic → Create new file

### 2. Test First
**ALWAYS write tests before marking task complete:**
```bash
npm run test
npm run test:coverage
```

### 3. Library Usage Verification
**Ask yourself: "Can I use a popular library for this?"**
- Physics? → Use Matter.js
- Animation? → Use GSAP
- Tilemap? → Use @pixi/tilemap
- Utilities? → Use Lodash

### 4. Documentation Check
**Before committing:**
- [ ] JSDoc on all public methods
- [ ] @example tags showing usage
- [ ] Update folder README.md
- [ ] Update ARCHITECTURE.md if needed

### 5. No Breaking Changes
**Always verify:**
```bash
npm run build
npm test
```

---

## 📊 Success Metrics

At end of Phase 2, verify:

### File Size Metrics
```bash
# Should pass:
find src -name "*.ts" | xargs wc -l | awk '$1 > 500 {print $2, $1}' | wc -l
# Result: 0 (zero files >500 lines)
```

### Test Coverage
```bash
npm run test:coverage
# Target: ≥75% coverage
```

### Library Usage
```bash
# Should be high:
grep -r "Matter\." src/ | wc -l  # Should be >50
grep -r "gsap\." src/ | wc -l   # Should be >20
```

### Performance
```bash
npm run build
# Bundle size: <3MB
# Build time: <10 seconds
```

### Documentation
```bash
# Every folder should have README.md
find src -type d | while read dir; do
  [ ! -f "$dir/README.md" ] && echo "Missing: $dir/README.md"
done
# Result: No output (all folders documented)
```

---

## 🐛 Common Issues & Solutions

### Issue: File Exceeds 500 Lines
**Solution**: Extract logic into separate files
```typescript
// Before: Player.ts (600 lines)
// After:
// - Player.ts (250 lines) - orchestrator
// - PlayerMovement.ts (150 lines)
// - PlayerCombat.ts (150 lines)
// - PlayerStats.ts (100 lines)
```

### Issue: Tests Breaking After Refactor
**Solution**: Test public API only
```typescript
// ❌ BAD: Testing implementation
expect(player._internalVelocity).toBe(5);

// ✅ GOOD: Testing public API
player.update(1);
expect(player.x).toBeGreaterThan(initialX);
```

### Issue: Matter.js Performance Issues
**Solution**: Use appropriate body types
- Static bodies for walls (doesn't move)
- Dynamic bodies for player/enemies (moves)
- Sensor bodies for triggers (no collision response)

### Issue: GSAP Animation Conflicts
**Solution**: Kill previous animations
```typescript
// Before new animation:
gsap.killTweensOf(target);
gsap.to(target, { ... });
```

---

## 📚 Reference Implementation Examples

### Example: Good PhysicsManager Structure
```typescript
/**
 * PhysicsManager - Matter.js integration
 * 
 * @example
 * const physics = PhysicsManager.getInstance();
 * physics.initialize();
 * 
 * const body = Matter.Bodies.circle(x, y, radius);
 * physics.addBody(body);
 * 
 * app.ticker.add(() => physics.update(app.ticker.deltaMS));
 */
export class PhysicsManager {
  private static instance: PhysicsManager;
  private engine: Matter.Engine;
  private world: Matter.World;
  
  private constructor() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
  }
  
  public static getInstance(): PhysicsManager {
    if (!PhysicsManager.instance) {
      PhysicsManager.instance = new PhysicsManager();
    }
    return PhysicsManager.instance;
  }
  
  public update(deltaMs: number): void {
    const delta = deltaMs / 1000; // Convert to seconds
    Matter.Engine.update(this.engine, deltaMs, delta);
  }
  
  public addBody(body: Matter.Body): void {
    Matter.World.add(this.world, body);
  }
  
  public removeBody(body: Matter.Body): void {
    Matter.World.remove(this.world, body);
  }
}
```

**Line Count**: ~50 lines (expandable to 300)

### Example: Good Component Composition
```typescript
// Player.ts (orchestrator)
export class Player {
  public movement: PlayerMovement;
  public combat: PlayerCombat;
  public stats: PlayerStats;
  private body: Matter.Body;
  
  constructor(x: number, y: number) {
    this.body = Matter.Bodies.circle(x, y, 16);
    this.stats = new PlayerStats();
    this.movement = new PlayerMovement(this.body);
    this.combat = new PlayerCombat(this.stats);
  }
  
  public update(delta: number): void {
    this.movement.update(delta);
    this.combat.update(delta);
  }
}
```

**Line Count**: ~30 lines (expandable to 300)

---

## ✅ Implementation Completion Checklist

Before marking Phase 2 as complete:

- [ ] All libraries installed (Matter.js, GSAP, @pixi/tilemap)
- [ ] PhysicsManager.ts created (<300 lines) with 15 tests
- [ ] CollisionSystem.ts created (<300 lines) with 20 tests
- [ ] MatterHelpers.ts created (<200 lines) with 10 tests
- [ ] InputManager.ts created (<200 lines) with 12 tests
- [ ] Player.ts created (<300 lines) with 15 tests
- [ ] PlayerMovement.ts created (<200 lines) with 12 tests
- [ ] PlayerCombat.ts created (<200 lines) with 12 tests
- [ ] PlayerStats.ts created (<150 lines) with 8 tests
- [ ] Tilemap.ts created (<350 lines) with 15 tests
- [ ] TilemapCollision.ts created (<200 lines) with 12 tests
- [ ] TilemapEncounters.ts created (<200 lines) with 10 tests
- [ ] MapLoader.ts created (<250 lines) with 8 tests
- [ ] Camera.ts created (<250 lines) with 12 tests
- [ ] OverworldScene.ts created (<400 lines) with E2E tests
- [ ] OverworldUI.ts created (<200 lines) with 10 tests
- [ ] OverworldEntities.ts created (<250 lines) with 12 tests
- [ ] All folder README.md files created
- [ ] ARCHITECTURE.md updated
- [ ] Zero files >500 lines
- [ ] 100+ total tests passing
- [ ] Test coverage ≥75%
- [ ] Build successful
- [ ] Bundle size <3MB
- [ ] 60 FPS gameplay
- [ ] Metrics report generated

---

**Last Updated**: Phase 2 Documentation Complete  
**Next Phase**: Phase 3 - UI/UX Components (see ROADMAP.md)
