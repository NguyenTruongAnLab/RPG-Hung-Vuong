# GitHub Copilot Instructions - Thần Thú Văn Lang (RPG Hùng Vương)

## 🎯 PROJECT VISION

**Vietnamese Mythology Pokemon-Style RPG**

This is a Vietnamese mythology-based RPG game featuring 200 Thần Thú (Divine Beasts) with a Ngũ Hành (Five Elements) combat system. The game combines Pokemon-style overworld exploration with turn-based battles.

### Core Gameplay Loop
- **Setting**: Văn Lang era (Hùng Vương dynasty, 2879-258 BCE)
- **Platforms**: Web (GitHub Pages), Desktop (Tauri), Mobile (Capacitor)
- **Tech Stack**: PixiJS 8, Matter.js, GSAP, DragonBones
- **Game Modes**: 
  - **Overworld**: Real-time top-down exploration with Matter.js physics
  - **Battle**: Turn-based combat with Ngũ Hành (Five Elements) advantages

---

## 🏛️ ARCHITECTURAL COMMANDMENTS

### Commandment 1: The 500-Line Law (ABSOLUTE RULE)

**NO FILE SHALL EXCEED 500 LINES. PERIOD.**

**Enforcement Process:**
1. Before saving any file: `wc -l filename.ts`
2. If ≥400 lines → Yellow flag, plan extraction
3. If ≥500 lines → Red flag, STOP and split immediately
4. After split → Update folder README.md

**How to Split:**
```
❌ BAD: Player.ts (850 lines)

✅ GOOD:
├── Player.ts (280 lines)         # Orchestrator
├── PlayerMovement.ts (180 lines) # Movement component
├── PlayerCombat.ts (170 lines)   # Combat component
└── PlayerStats.ts (120 lines)    # Stats management
```

**Consequences of Violation:**
- AI agents struggle to understand context
- Harder to maintain and test
- Code review nightmares
- Integration conflicts

**Exemptions:** NONE. No exceptions. Split ruthlessly.

---

### Commandment 2: Use Popular Libraries (AI Training Data Advantage)

**ALWAYS prefer industry-standard libraries over custom implementations.**

**✅ REQUIRED LIBRARIES:**

| Purpose | Library | Why | AI Knowledge |
|---------|---------|-----|--------------|
| Physics | `matter-js` | Industry standard, 16K+ stars | Extensive |
| Animation | `gsap` | Animation standard, ubiquitous | Complete |
| Tilemap | `@pixi/tilemap` | Official PixiJS plugin | Official docs |
| Utils | `lodash` | Universal utilities | Total |

**Why This Matters:**
- ✅ AI already trained on these APIs → Faster, accurate code generation
- ✅ Millions of examples on GitHub/StackOverflow
- ✅ Community support and maintenance
- ✅ No need for AI to read custom implementations

**❌ FORBIDDEN:**
- Custom physics/collision systems
- Custom animation engines
- Custom tilemap renderers
- Reinventing solved problems

---

### Commandment 3: Extreme Modularity (Composition > Inheritance)

**Single Responsibility Principle on steroids.**

**Pattern: Component-Based Entities**
```typescript
// ✅ GOOD: Composition
class Player {
  movement: PlayerMovement;   // <200 lines
  combat: PlayerCombat;       // <200 lines
  stats: PlayerStats;         // <150 lines
  animation: PlayerAnimation; // <180 lines
  
  constructor() {
    this.movement = new PlayerMovement(this);
    this.combat = new PlayerCombat(this);
    this.stats = new PlayerStats();
    this.animation = new PlayerAnimation(this);
  }
  
  update(delta: number) {
    this.movement.update(delta);
    this.combat.update(delta);
    this.animation.update(delta);
  }
}

// ❌ BAD: Monolith
class Player {
  // 800 lines of everything mixed together
}
```

---

### Commandment 4: Documentation = AI Success

**Every file must be understandable WITHOUT reading implementation.**

**Required Documentation:**

1. **Folder README.md** (Every folder)
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
```

2. **JSDoc for Every Public Method**
```typescript
/**
 * Applies force to player body for movement
 * Uses Matter.js Body.applyForce internally
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
move(direction: Vector2D, speed: number = 3): void
```

3. **Implementation Comments (Why, not What)**
```typescript
// ✅ GOOD: Explain WHY
// Normalize diagonal movement to prevent 1.4x speed exploit
const length = Math.sqrt(x * x + y * y);

// ❌ BAD: Explain WHAT (code already shows this)
// Calculate the square root of x squared plus y squared
const length = Math.sqrt(x * x + y * y);
```

---

## 🔧 EXISTING CODE RULES

### ❌ CRITICAL DON'Ts
- **NEVER** delete existing working code without understanding it fully
- **NEVER** refactor the entire codebase at once
- **NEVER** break existing GitHub Pages deployment
- **NEVER** modify MonsterDatabase.js structure without careful planning
- **NEVER** remove working game systems (Battle, Capture, Map, i18n)
- **NEVER** create files exceeding 500 lines
- **NEVER** write custom implementations when popular libraries exist

### ✅ ALWAYS DO
- **READ** all existing code before making changes
- **TEST** after every change to ensure nothing breaks
- **PRESERVE** existing functionality while adding new features
- **ADD** tests for any new code or refactored code
- **DOCUMENT** all design decisions and changes
- **COMMIT** frequently with clear, descriptive messages
- **UPDATE** ROADMAP.md after completing tasks
- **CHECK** file line count before committing: `wc -l filename.ts`
- **USE** popular libraries (Matter.js, GSAP, @pixi/tilemap)
- **WRITE** comprehensive JSDoc with @example tags
- **UPDATE** folder README.md when adding files

---

## 🎮 GAME ARCHITECTURE

### Dual Mode System

```
┌─────────────────────────────────────────────┐
│           OVERWORLD MODE                     │
│  (Real-time, Matter.js Physics)              │
│                                              │
│  - Player explores Văn Lang map              │
│  - WASD/Arrow movement                       │
│  - Space: Player attacks enemies directly    │
│  - E: Interact with NPCs/items               │
│  - Random encounters in zones                │
│                                              │
│  Trigger: Step into encounter zone           │
│         ↓                                    │
└─────────────────────────────────────────────┘
                    ↓ Transition (GSAP)
┌─────────────────────────────────────────────┐
│           BATTLE MODE                        │
│  (Turn-based, No Physics)                   │
│                                              │
│  - Player's Thần Thú vs Wild Thần Thú       │
│  - Ngũ Hành (Five Elements) advantages      │
│  - Speed-based turn order                   │
│  - Capture mechanics available              │
│                                              │
│  Victory → Return to OVERWORLD               │
└─────────────────────────────────────────────┘
```

### Technology Stack

**Core Libraries:**
- **PixiJS 8**: Rendering engine
- **Matter.js**: 2D physics (overworld collisions)
- **GSAP**: Animations and transitions
- **@pixi/tilemap**: Efficient tilemap rendering
- **DragonBones**: Skeletal animation for monsters
- **Lodash**: Utility functions

**Development Tools:**
- **TypeScript**: Type safety
- **Vitest**: Unit testing
- **Playwright**: E2E testing
- **Vite**: Build tool

---

## 📂 DIRECTORY STRUCTURE (Target State)

```
RPG-Hung-Vuong/
├── .github/
│   ├── copilot-instructions.md      # This file
│   └── workflows/
│       └── deploy.yml               # CI/CD
├── src/
│   ├── core/                        # Core managers (each <400 lines)
│   │   ├── README.md
│   │   ├── Engine.ts                # <250 lines - main loop
│   │   ├── SceneManager.ts          # <250 lines - scene switching
│   │   ├── AssetManager.ts          # <400 lines - asset loading
│   │   ├── EventBus.ts              # <200 lines - pub/sub
│   │   ├── InputManager.ts          # <200 lines - keyboard/touch
│   │   ├── PhysicsManager.ts        # <300 lines - Matter.js wrapper
│   │   └── DragonBonesManager.ts    # <300 lines - animation manager
│   ├── systems/                     # Game systems (each <350 lines)
│   │   ├── README.md
│   │   ├── BattleSystem.ts          # <400 lines - turn-based combat
│   │   ├── ElementSystem.ts         # <250 lines - Ngũ Hành advantages
│   │   ├── CaptureSystem.ts         # <300 lines - capture mechanics
│   │   ├── CollisionSystem.ts       # <300 lines - Matter.js callbacks
│   │   ├── EncounterSystem.ts       # <250 lines - random encounters
│   │   └── MovementSystem.ts        # <200 lines - movement helpers
│   ├── entities/                    # Game entities (component-based)
│   │   ├── README.md
│   │   ├── Player.ts                # <300 lines - orchestrator
│   │   ├── components/
│   │   │   ├── PlayerMovement.ts    # <200 lines
│   │   │   ├── PlayerCombat.ts      # <200 lines
│   │   │   ├── PlayerStats.ts       # <150 lines
│   │   │   └── PlayerAnimation.ts   # <180 lines
│   │   ├── Monster.ts               # <300 lines
│   │   └── Enemy.ts                 # <250 lines
│   ├── world/                       # World/map systems
│   │   ├── README.md
│   │   ├── Tilemap.ts               # <350 lines - @pixi/tilemap rendering
│   │   ├── TilemapCollision.ts     # <200 lines - Matter.js static bodies
│   │   ├── TilemapEncounters.ts    # <200 lines - encounter zones
│   │   ├── Camera.ts                # <250 lines - GSAP smooth follow
│   │   └── MapLoader.ts             # <250 lines - Tiled JSON loader
│   ├── scenes/                      # Game scenes (split if >400 lines)
│   │   ├── README.md
│   │   ├── OverworldScene.ts        # <400 lines - exploration
│   │   ├── OverworldUI.ts           # <200 lines - HP bar, minimap
│   │   ├── OverworldEntities.ts     # <250 lines - entity spawning
│   │   ├── BattleScene.ts           # <400 lines - turn-based
│   │   └── BattleUI.ts              # <200 lines - battle interface
│   ├── ui/                          # Reusable UI components
│   │   ├── README.md
│   │   ├── Button.ts                # <150 lines
│   │   ├── HealthBar.ts             # <120 lines
│   │   ├── DialogBox.ts             # <180 lines
│   │   └── Menu.ts                  # <200 lines
│   ├── data/                        # Game data (JSON)
│   │   ├── monsters.json            # 200 Thần Thú
│   │   ├── skills.json              # Skills/abilities
│   │   ├── elements.json            # Ngũ Hành rules
│   │   ├── encounters.json          # Encounter tables
│   │   ├── maps/
│   │   │   ├── world-map.json       # Tiled format
│   │   │   ├── forest.json
│   │   │   └── mountain.json
│   │   └── i18n/
│   │       └── vi.json              # Vietnamese text
│   ├── utils/                       # Pure utility functions
│   │   ├── README.md
│   │   ├── MatterHelpers.ts         # <200 lines
│   │   ├── TilemapHelpers.ts        # <150 lines
│   │   └── AnimationHelpers.ts      # <180 lines
│   └── main.ts                      # <100 lines - entry point
├── tests/
│   ├── unit/                        # Vitest unit tests
│   │   ├── core/
│   │   ├── systems/
│   │   ├── entities/
│   │   └── utils/
│   └── e2e/                         # Playwright E2E tests
│       ├── overworld.spec.ts
│       └── battle.spec.ts
├── public/
│   └── assets/
│       ├── monsters/                # DragonBones assets (char001-200)
│       ├── tilesets/                # Tilemap graphics
│       └── audio/                   # Sound effects
├── docs/
│   ├── ARCHITECTURE.md              # System design
│   ├── ROADMAP.md                   # Development plan
│   ├── GAMEPLAY.md                  # Game mechanics
│   ├── LIBRARIES.md                 # Why each library chosen
│   ├── CODING_STYLE.md              # Code standards
│   └── PHASE2_IMPLEMENTATION_GUIDE.md
└── README.md
```

---

## 📂 CURRENT STRUCTURE (Must Respect)

### ✅ Already Implemented
- **MonsterDatabase**: 200 creatures in JSON format with Ngũ Hành classification
- **Ngũ Hành System**: Five Elements (Kim, Mộc, Thủy, Hỏa, Thổ) with advantages
- **Turn-based Battle**: Speed-based combat with damage calculation
- **CaptureSystem**: Monster catching with rate calculation
- **MapExplorer**: 6 locations with connections (menu-based, Phase 1)
- **i18n System**: Vietnamese localization
- **GitHub Pages**: Automated deployment
- **Testing Infrastructure**: Vitest + Playwright configured
- **TypeScript Support**: tsconfig.json, gradual migration
- **Core Managers**: SceneManager, AssetManager, EventBus, DragonBonesManager (Phase 1)

### ❌ Missing (Add These - Phase 2+)
- Matter.js physics integration
- GSAP animation system
- @pixi/tilemap for overworld
- Pokemon-style overworld navigation
- Real-time player movement
- InputManager for controls
- Player entity with components
- Camera system
- Encounter zones on map
- Complete unit test coverage
- UI component library

---

## 🏗️ ARCHITECTURE GUIDELINES

### Code Organization Principles

**File Size Hierarchy:**
- **Utilities**: <200 lines (pure functions)
- **Components**: <200 lines (single responsibility)
- **Entities**: <300 lines (orchestrators)
- **Systems**: <350 lines (game logic)
- **Managers**: <400 lines (core infrastructure)
- **Scenes**: <400 lines (split if larger: Scene, UI, Entities)

**Organization Rules:**
1. One class/concept per file
2. Related files grouped in folders
3. Every folder has README.md
4. Shared utilities in utils/
5. Data/config in data/

### Adding New Core Systems
When creating new managers (PhysicsManager, InputManager, etc.):
1. Create as TypeScript files in `src/core/`
2. Export as ES modules
3. Write comprehensive JSDoc with @example for all public methods
4. Keep under 400 lines (300 preferred)
5. Add unit tests in `tests/unit/core/`
6. Update `src/core/README.md`
7. Update ARCHITECTURE.md if significant

### Component-Based Entity Pattern

**Always use composition over inheritance:**

```typescript
// ✅ GOOD: Composition pattern
// Player.ts (~280 lines)
export class Player {
  private body: Matter.Body;
  public movement: PlayerMovement;
  public combat: PlayerCombat;
  public stats: PlayerStats;
  
  constructor(x: number, y: number) {
    this.body = Matter.Bodies.circle(x, y, 16);
    this.stats = new PlayerStats();
    this.movement = new PlayerMovement(this.body);
    this.combat = new PlayerCombat(this.stats);
  }
  
  update(delta: number): void {
    this.movement.update(delta);
    this.combat.update(delta);
  }
}

// PlayerMovement.ts (~180 lines)
export class PlayerMovement {
  constructor(private body: Matter.Body) {}
  
  update(delta: number): void {
    const input = InputManager.getInstance();
    const velocity = input.getMovementVector();
    this.applyMovement(velocity);
  }
  
  private applyMovement(velocity: Vector2D): void {
    Matter.Body.applyForce(this.body, this.body.position, {
      x: velocity.x * 0.01,
      y: velocity.y * 0.01
    });
  }
}

// PlayerCombat.ts (~170 lines)
export class PlayerCombat {
  constructor(private stats: PlayerStats) {}
  
  attack(target: Enemy): void {
    const damage = this.calculateDamage(target);
    target.takeDamage(damage);
  }
}
```

**❌ BAD: Monolithic pattern**
```typescript
// Player.ts (800+ lines) - FORBIDDEN!
export class Player {
  // 200 lines of movement
  // 200 lines of combat
  // 200 lines of stats
  // 200 lines of animation
}
```

### Migration Strategy
- **Phase 1**: Add new TypeScript files alongside JavaScript ✅
- **Phase 2**: Gradually convert JavaScript to TypeScript (current)
- **Phase 3**: Enable strict TypeScript mode after all conversions

---

## 🎮 GAME SYSTEMS DETAILS

### Dual-Mode Gameplay

**OVERWORLD MODE (Phase 2):**
- Real-time top-down exploration
- Matter.js physics for collisions
- WASD/Arrow keys movement
- Direct player attacks (spacebar)
- NPC interactions (E key)
- Encounter zones trigger battles
- @pixi/tilemap for rendering

**BATTLE MODE (Existing):**
- Turn-based combat
- Ngũ Hành element advantages
- Speed-based turn order
- Capture mechanics
- No physics (pure logic)

### Monster Database Format
```javascript
{
  id: 'char001',              // char001 to char200
  name: 'Rồng Kim',           // Vietnamese name
  element: 'kim',             // kim, moc, thuy, hoa, tho
  tier: 1-4,                  // Rarity tier
  baseStats: { hp, attack, defense, speed, magic },
  skills: [...],
  evolveFrom: 'char000' | null,
  evolveTo: 'char005' | null,
  captureRate: 10-50,
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}
```

### Element Advantages (Ngũ Hành - Five Elements)

**Element Cycle (Super Effective = 1.5x damage):**
```
Kim (Metal)  →  Mộc (Wood)    "Metal cuts Wood"
Mộc (Wood)   →  Thổ (Earth)   "Wood penetrates Earth"  
Thổ (Earth)  →  Thủy (Water)  "Earth dams Water"
Thủy (Water) →  Hỏa (Fire)    "Water extinguishes Fire"
Hỏa (Fire)   →  Kim (Metal)   "Fire melts Metal"
```

**Not Very Effective (0.67x damage):**
- Reverse of above cycle
- Kim ← Hỏa (Fire can't melt Metal easily)
- Mộc ← Kim (Wood resists Metal)
- Etc.

**Neutral (1.0x damage):**
- Same element vs same
- Non-cycle matchups

### Battle System Flow
1. Initialize battle with player and enemy monsters
2. Sort combatants by speed (descending)
3. **Turn Loop:**
   - Display battle UI
   - Get player input (Attack/Skill/Item/Run)
   - Calculate damage with element advantage
   - Apply defense reduction: `damage - floor(defense / 2)`
   - Update HP, check for KO
   - Switch to next combatant
4. Check victory/defeat conditions
5. Award EXP and items
6. Return to overworld or game over

### Damage Calculation (Existing)
```typescript
/**
 * Calculate battle damage with element advantages
 * @param attacker - The attacking monster
 * @param defender - The defending monster
 * @param skill - Optional skill (adds power)
 * @returns Final damage number
 */
function calculateDamage(
  attacker: Monster,
  defender: Monster,
  skill?: Skill
): number {
  // Base damage from stats + skill power
  let baseDamage = attacker.stats.attack + (skill?.power ?? 0);
  
  // Apply Ngũ Hành element advantage
  const advantage = getElementAdvantage(
    attacker.element, 
    defender.element
  );
  baseDamage *= advantage; // 1.5x, 1.0x, or 0.67x
  
  // Apply defense reduction
  const defenseReduction = Math.floor(defender.stats.defense / 2);
  let finalDamage = Math.floor(baseDamage - defenseReduction);
  
  // Minimum 1 damage
  finalDamage = Math.max(1, finalDamage);
  
  // Critical hit (10% chance, 2x damage)
  if (Math.random() < 0.1) {
    finalDamage *= 2;
  }
  
  return finalDamage;
}
```

### Capture System (Existing)
```typescript
/**
 * Attempt to capture a wild monster
 * @param monster - Target monster
 * @param ball - Capture item used
 * @param playerLevel - Player's current level
 * @returns Success boolean
 */
function attemptCapture(
  monster: Monster,
  ball: CaptureItem,
  playerLevel: number
): boolean {
  const baseRate = monster.captureRate / 100; // 0.1 to 0.5
  const hpFactor = 1 - (monster.hp / monster.maxHp); // Lower HP = higher rate
  const levelFactor = playerLevel / monster.level; // Higher level = easier
  const ballMultiplier = ball.multiplier; // 1.0, 1.5, or 2.0
  
  const captureChance = 
    baseRate * 
    (0.5 + hpFactor * 0.5) * 
    Math.sqrt(levelFactor) * 
    ballMultiplier;
  
  return Math.random() < captureChance;
}
```

---

## 🛠️ PHASE 2: OVERWORLD IMPLEMENTATION

### Required Libraries (Install First)

```bash
# Physics engine
npm install matter-js @types/matter-js

# Animation library  
npm install gsap

# Tilemap plugin
npm install @pixi/tilemap

# Optional utilities
npm install lodash @types/lodash
```

### Implementation Order (CRITICAL)

**Week 2, Day 1: Physics Foundation**
1. Create `PhysicsManager.ts` (<300 lines)
   - Initialize Matter.js Engine + World
   - Update loop synced with PixiJS ticker
   - Add/remove body methods
   
2. Create `CollisionSystem.ts` (<300 lines)
   - Register collision pairs
   - Handle Matter.js events
   - Emit to EventBus
   
3. Create `MatterHelpers.ts` (<200 lines)
   - Body creation helpers
   - Coordinate conversion
   - Sprite-body sync

**Week 2, Day 2: Input & Movement**
1. Create `InputManager.ts` (<200 lines)
   - Keyboard listeners (WASD + arrows)
   - Touch/mouse support
   - Query API: getMovementVector()
   
2. Create Player components:
   - `Player.ts` (<300 lines) - Orchestrator
   - `PlayerMovement.ts` (<200 lines) - Movement logic
   - `PlayerCombat.ts` (<200 lines) - Attack logic
   - `PlayerStats.ts` (<150 lines) - HP, stats

**Week 2, Day 3-4: World & Tilemap**
1. Create `Tilemap.ts` (<350 lines)
   - Render with @pixi/tilemap
   - Load Tiled JSON
   
2. Create `TilemapCollision.ts` (<200 lines)
   - Parse collision layer
   - Create static bodies
   
3. Create `TilemapEncounters.ts` (<200 lines)
   - Encounter zones
   - Step tracking
   
4. Create `Camera.ts` (<250 lines)
   - Follow player with GSAP
   - Screen shake effects

**Week 2, Day 5: Scene Integration**
1. Create `OverworldScene.ts` (<400 lines)
2. Create `OverworldUI.ts` (<200 lines)
3. Create `OverworldEntities.ts` (<250 lines)

### Key Implementation Patterns

**1. Matter.js Integration Example:**
```typescript
// PhysicsManager.ts
import Matter from 'matter-js';

export class PhysicsManager {
  private static instance: PhysicsManager;
  private engine: Matter.Engine;
  private world: Matter.World;
  
  private constructor() {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 } // Top-down, no gravity
    });
    this.world = this.engine.world;
  }
  
  public update(deltaMs: number): void {
    Matter.Engine.update(this.engine, deltaMs);
  }
  
  public addBody(body: Matter.Body): void {
    Matter.World.add(this.world, body);
  }
}
```

**2. GSAP Camera Follow:**
```typescript
// Camera.ts
import gsap from 'gsap';

export class Camera {
  follow(target: { x: number; y: number }): void {
    gsap.to(this.container, {
      x: -target.x + this.viewport.width / 2,
      y: -target.y + this.viewport.height / 2,
      duration: 0.3,
      ease: 'power2.out'
    });
  }
  
  shake(intensity: number = 5): void {
    gsap.to(this.container, {
      x: `+=${intensity}`,
      yoyo: true,
      repeat: 3,
      duration: 0.1
    });
  }
}
```

**3. @pixi/tilemap Usage:**
```typescript
// Tilemap.ts
import { CompositeTilemap } from '@pixi/tilemap';

export class Tilemap {
  private tilemap: CompositeTilemap;
  
  constructor() {
    this.tilemap = new CompositeTilemap();
  }
  
  render(tiledJson: any, tileset: Texture): void {
    const layer = tiledJson.layers[0];
    for (let i = 0; i < layer.data.length; i++) {
      const gid = layer.data[i];
      if (gid === 0) continue;
      
      const x = (i % layer.width) * 32;
      const y = Math.floor(i / layer.width) * 32;
      
      this.tilemap.tile(tileset, x, y);
    }
  }
}
```

---

## 🧪 TESTING REQUIREMENTS

### Testing Philosophy

**Test Public API, Not Implementation Details**

✅ **GOOD Test:**
```typescript
test('player moves right when D key pressed', () => {
  const player = new Player(0, 0);
  const input = InputManager.getInstance();
  
  // Simulate D key press
  input.setKey('d', true);
  
  // Update player
  player.update(16); // 1 frame at 60fps
  
  // Player should have moved right
  expect(player.x).toBeGreaterThan(0);
});
```

❌ **BAD Test:**
```typescript
test('internal velocity calculation', () => {
  // Don't test private methods or implementation
  expect(player._calculateInternalVelocity()).toBe(5);
});
```

**Why:** Tests should verify behavior, not implementation. This allows refactoring without breaking tests.

### Unit Tests (Vitest)

**Requirements:**
- **All new functions** must have unit tests
- **Coverage target**: ≥ 70% for new code
- **Test files**: `*.test.ts` or `*.spec.ts` in `tests/unit/`
- **Run tests**: `npm run test`
- **Watch mode**: `npm run test:watch`
- **Coverage**: `npm run test:coverage`

**Test Structure:**
```typescript
// tests/unit/systems/BattleSystem.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BattleSystem } from '../../../src/systems/BattleSystem';

describe('BattleSystem', () => {
  let battleSystem: BattleSystem;
  
  beforeEach(() => {
    battleSystem = new BattleSystem();
  });
  
  describe('calculateDamage', () => {
    it('should apply element advantage correctly', () => {
      const kimMonster = createMonster({ element: 'kim', attack: 50 });
      const mocMonster = createMonster({ element: 'moc', defense: 10 });
      
      const damage = battleSystem.calculateDamage(kimMonster, mocMonster);
      
      // Kim > Moc = 1.5x
      // (50 * 1.5) - (10 / 2) = 75 - 5 = 70
      expect(damage).toBe(70);
    });
    
    it('should enforce minimum 1 damage', () => {
      const weakMonster = createMonster({ attack: 1 });
      const tankMonster = createMonster({ defense: 100 });
      
      const damage = battleSystem.calculateDamage(weakMonster, tankMonster);
      
      expect(damage).toBeGreaterThanOrEqual(1);
    });
  });
});
```

**Minimum Test Count by File Size:**
- <150 lines: 5-8 tests
- 150-250 lines: 10-15 tests
- 250-350 lines: 15-20 tests
- 350-500 lines: 20-30 tests

### E2E Tests (Playwright)

**Critical Flows:**
- Menu → Battle → Capture → Victory
- Overworld exploration → Random encounter
- NPC interaction
- Map navigation
- Save/Load (future)

**Test files**: `*.spec.ts` in `tests/e2e/`
**Run tests**: `npm run test:e2e`

**E2E Test Example:**
```typescript
// tests/e2e/battle-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete battle flow', async ({ page }) => {
  await page.goto('/');
  
  // Start game
  await page.click('text=Bắt đầu');
  
  // Navigate to exploration
  await page.click('text=Khám phá');
  
  // Select location
  await page.click('text=Rừng Cổ Thụ');
  
  // Battle should start
  await expect(page.locator('.battle-scene')).toBeVisible();
  
  // Attack
  await page.click('text=Tấn công');
  
  // Battle log should show damage
  await expect(page.locator('.battle-log')).toContainText('gây');
});
```

### Before Committing

**Mandatory Checks:**
```bash
# 1. Type check
npm run type-check

# 2. Run unit tests
npm run test

# 3. Build succeeds
npm run build

# 4. Check file sizes
find src -name "*.ts" -exec wc -l {} + | awk '$1 > 500 {print $2, $1}'
# Should output nothing (0 files >500 lines)
```

**Pre-commit Checklist:**
- [ ] All tests passing
- [ ] No TypeScript errors (npm run type-check)
- [ ] Build succeeds (npm run build)
- [ ] No files >500 lines
- [ ] New code has tests (≥70% coverage)
- [ ] JSDoc added for public methods
- [ ] Folder README.md updated if needed
- [ ] ROADMAP.md updated with progress

---

## 🎨 CODING STYLE

### General Principles
- **DRY**: Don't Repeat Yourself - Extract common code
- **KISS**: Keep It Simple, Stupid - Simplest solution wins
- **YAGNI**: You Aren't Gonna Need It - Don't build for future
- **Single Responsibility**: One class = one clear purpose
- **Composition > Inheritance**: Use components, not class hierarchies

### Naming Conventions
- **Classes**: PascalCase - `BattleSystem`, `MonsterDatabase`, `PlayerMovement`
- **Functions**: camelCase - `calculateDamage`, `attemptCapture`, `getMonsterById`
- **Constants**: UPPER_SNAKE_CASE - `ELEMENT_ADVANTAGES`, `MAX_HP`, `CAPTURE_RATES`
- **Files**: Same as class name - `BattleSystem.ts`, `AssetManager.ts`, `PlayerMovement.ts`
- **Interfaces**: PascalCase with 'I' prefix (optional) - `IMonster` or `Monster`
- **Types**: PascalCase - `Vector2D`, `GameState`, `ElementType`
- **Enums**: PascalCase - `Element`, `BattleState`, `CaptureResult`

### File Naming
```
✅ GOOD:
src/entities/Player.ts
src/entities/PlayerMovement.ts  
src/systems/BattleSystem.ts
src/utils/MatterHelpers.ts

❌ BAD:
src/entities/player.ts (lowercase)
src/entities/player-movement.ts (kebab-case)
src/systems/battle_system.ts (snake_case)
```

### Comments

**1. JSDoc for Public APIs (MANDATORY):**
```typescript
/**
 * Applies force to player's Matter.js body for movement
 * 
 * Automatically normalizes diagonal movement to prevent
 * 1.4x speed exploit when moving diagonally.
 * 
 * @param direction - Normalized movement vector (-1 to 1 for x and y)
 * @param speed - Movement speed multiplier (default: 3)
 * @returns void
 * 
 * @example
 * // Move player right at normal speed
 * playerMovement.move({ x: 1, y: 0 }, 3);
 * 
 * @example
 * // Move diagonally (auto-normalized)
 * playerMovement.move({ x: 1, y: -1 }, 3);
 * 
 * @example
 * // Sprint (2x speed)
 * playerMovement.move({ x: 0, y: -1 }, 6);
 */
public move(direction: Vector2D, speed: number = 3): void {
  // Implementation...
}
```

**2. Inline Comments (Explain WHY, not WHAT):**
```typescript
// ✅ GOOD: Explains reasoning
// Normalize diagonal movement to prevent 1.4x speed exploit
const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
if (length > 1) {
  direction.x /= length;
  direction.y /= length;
}

// ❌ BAD: Explains what code already shows
// Calculate the square root
const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
```

**3. TODO Comments:**
```typescript
// TODO(username): Description of what needs to be done
// TODO(AnLab): Add animation for critical hits
// TODO(AnLab): Optimize collision detection for 100+ entities
```

### TypeScript Style

**Use TypeScript Features:**
```typescript
// ✅ Use interfaces for contracts
interface Monster {
  id: string;
  name: string;
  element: ElementType;
  stats: Stats;
}

// ✅ Use type aliases for unions
type ElementType = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

// ✅ Use enums for fixed sets
enum BattleAction {
  Attack = 'ATTACK',
  Skill = 'SKILL', 
  Item = 'ITEM',
  Run = 'RUN'
}

// ✅ Use optional chaining
const damage = attacker.skill?.power ?? 0;

// ✅ Use nullish coalescing
const speed = monster.stats.speed ?? 50;

// ✅ Use readonly for immutable data
interface Config {
  readonly MAX_LEVEL: number;
  readonly ELEMENTS: readonly string[];
}
```

### Example Code Style

**Complete Example:**
```typescript
/**
 * Calculates damage between attacker and defender with Ngũ Hành advantages
 * 
 * @param attacker - The attacking monster
 * @param defender - The defending monster  
 * @param skill - Optional skill being used
 * @returns Damage calculation result with metadata
 * 
 * @example
 * const result = calculateDamage(
 *   kimMonster,    // Metal attacker
 *   mocMonster,    // Wood defender  
 *   fireSkill      // Fire skill
 * );
 * console.log(result.damage); // Final damage
 * console.log(result.advantage); // 1.5 (super effective)
 * console.log(result.isCritical); // true/false
 */
export function calculateDamage(
  attacker: Monster,
  defender: Monster,
  skill?: Skill
): DamageResult {
  // Calculate base damage from stats and skill
  let baseDamage = attacker.stats.attack + (skill?.power ?? 0);
  
  // Apply Ngũ Hành element advantage
  const advantage = getElementAdvantage(attacker.element, defender.element);
  baseDamage *= advantage;
  
  // Apply defense reduction (half of defense stat)
  const defenseReduction = Math.floor(defender.stats.defense / 2);
  let finalDamage = Math.floor(baseDamage - defenseReduction);
  
  // Enforce minimum damage of 1
  finalDamage = Math.max(1, finalDamage);
  
  // 10% chance for critical hit (2x damage)
  const isCritical = Math.random() < 0.1;
  if (isCritical) {
    finalDamage *= 2;
  }
  
  return {
    damage: finalDamage,
    advantage,
    isCritical
  };
}
```

---

## 🚀 DEPLOYMENT & CI/CD

### GitHub Pages
- **Deploys automatically** on push to `main`
- **Build output**: `dist/` directory
- **Base URL**: `https://[username].github.io/RPG-hung-vuong/`
- **Workflow**: `.github/workflows/deploy.yml`

### CI/CD Pipeline (Current)
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Type check (allow failures initially)
      - Run tests (must pass)
      - Build (must pass)  
      - Deploy to GitHub Pages
```

**Pipeline Rules:**
1. **Type Check**: Runs but doesn't fail build (for now)
2. **Unit Tests**: Must pass or build fails
3. **Build**: Must succeed or deployment blocked
4. **E2E Tests**: Runs but doesn't fail (for now)
5. **Deploy**: Only on main branch, after all checks

### Build Configuration

**Vite Config (`vite.config.js`):**
```javascript
export default {
  base: '/RPG-hung-vuong/', // GitHub Pages base path
  build: {
    outDir: 'dist',
    sourcemap: true, // For debugging
    rollupOptions: {
      output: {
        manualChunks: {
          'pixi': ['pixi.js'],
          'matter': ['matter-js'],
          'gsap': ['gsap'],
          'dragonbones': ['dragonbones.js']
        }
      }
    }
  }
}
```

### Performance Targets

| Metric | Target | How to Check |
|--------|--------|--------------|
| Bundle Size | <3MB | `npm run build` → check dist/ size |
| Initial Load | <3s | Chrome DevTools Network tab |
| Build Time | <10s | Time `npm run build` |
| FPS | 60 | PixiJS ticker.FPS |
| Test Coverage | ≥70% | `npm run test:coverage` |

---

## 📝 COMMIT MESSAGE FORMAT

Follow **Conventional Commits**:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, semicolons)
- **refactor**: Code change (no bug fix or feature)
- **test**: Adding/updating tests
- **chore**: Maintenance (deps, config)
- **perf**: Performance improvement

### Examples

**Feature:**
```
feat(battle): add critical hit system

- 10% chance for 2x damage
- Visual flash effect on crit
- Critical sound effect (future)

Closes #42
```

**Bug Fix:**
```
fix(capture): correct capture rate calculation

The base rate was being multiplied instead of added.
This caused legendary monsters to be uncatchable.

Fixes #15
```

**Documentation:**
```
docs(readme): update installation instructions

Added Windows-specific npm install workaround
for DragonBones dependency.
```

**Refactoring:**
```
refactor(entities): split Player.ts into components

- Extracted PlayerMovement.ts (180 lines)
- Extracted PlayerCombat.ts (170 lines)  
- Extracted PlayerStats.ts (120 lines)
- Player.ts now 280 lines (was 650 lines)
- All tests still passing
- No breaking changes

Reason: File exceeded 500 line limit
```

**Testing:**
```
test(battle): add unit tests for damage calculation

- Element advantage tests (15 cases)
- Defense reduction tests (5 cases)
- Critical hit probability test
- Minimum damage test

Coverage: BattleSystem.ts now 95%
```

**Library Integration:**
```
chore(deps): add Phase 2 dependencies

- matter-js@0.19.0 for physics
- gsap@3.12.2 for animations
- @pixi/tilemap@4.0.0 for tilemap rendering

Reason: Pokemon-style overworld implementation
```

---

## 🤝 COLLABORATION RULES

### Before Starting Work

1. **Check ROADMAP.md** for current priorities
2. **Read related documentation:**
   - `.github/copilot-instructions.md` (this file)
   - `docs/PHASE2_IMPLEMENTATION_GUIDE.md` (implementation steps)
   - `docs/LIBRARIES.md` (library rationale)
   - Folder README.md files (architecture)
3. **Read related code and tests** to understand existing implementation
4. **Plan your changes:**
   - Will any file exceed 400 lines? → Plan to split
   - Can you use a popular library? → Use it instead of custom
   - What tests are needed? → Write test plan
5. **Add to ROADMAP.md** if task not listed

### During Work

1. **Make small, incremental changes** (1-3 files at a time)
2. **Test frequently** (after every significant change)
3. **Check file sizes** regularly: `wc -l filename.ts`
4. **Commit often** with clear messages (Conventional Commits)
5. **Update documentation** as you go (JSDoc, README.md)
6. **Use popular libraries** instead of reinventing
7. **Follow composition pattern** for entities
8. **Write tests** before marking task complete

### Before Committing

**Mandatory Pre-Commit Checklist:**
- [ ] Run `npm run type-check` (no errors)
- [ ] Run `npm run test` (all pass)
- [ ] Run `npm run build` (succeeds)
- [ ] Check file sizes: `find src -name "*.ts" -exec wc -l {} + | awk '$1 > 500'` (should be empty)
- [ ] All new public methods have JSDoc with @example
- [ ] Tests added for new code (≥70% coverage)
- [ ] Folder README.md updated if new files added
- [ ] ROADMAP.md checklist updated with progress
- [ ] Commit message follows Conventional Commits format

### Code Review Self-Checklist

Before requesting review:
- [ ] Every file <500 lines (check with `wc -l`)
- [ ] If file >400 lines, created issue to split it
- [ ] Used Matter.js/GSAP/standard libraries instead of custom code
- [ ] Every public method has JSDoc with @example
- [ ] Every folder has README.md explaining its purpose
- [ ] Tests written for public API only (not implementation details)
- [ ] No breaking changes to existing tests
- [ ] TypeScript strict mode passes (or issues documented)
- [ ] All unit tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console.log statements (use proper logging)
- [ ] Vietnamese text uses i18n system
- [ ] No hardcoded strings in UI

---

## 🐛 DEBUGGING TIPS

### Build Fails

**Common Issues:**
1. **TypeScript Errors**: `npm run type-check`
   - Check import paths (relative vs absolute)
   - Check missing type definitions
   - Check tsconfig.json settings

2. **Vite Build Errors**:
   ```bash
   npm run build -- --debug
   ```
   - Check vite.config.js configuration
   - Check for circular dependencies
   - Check asset import paths

3. **Module Not Found**:
   - Check `package.json` dependencies
   - Run `npm install`
   - Check file extensions (.ts vs .js)

### Tests Fail

**Debugging Steps:**
1. **Run with verbose output**:
   ```bash
   npm run test -- --reporter=verbose
   ```

2. **Run single test file**:
   ```bash
   npm run test -- BattleSystem.test.ts
   ```

3. **Check test isolation**:
   - Are tests affecting each other?
   - Use `beforeEach` to reset state
   - Mock external dependencies

4. **Check mocks and fixtures**:
   - Verify mock data matches actual format
   - Check spy/stub expectations

### Game Doesn't Work

**Troubleshooting:**
1. **Check browser console** for errors (F12)
2. **Check PixiJS initialization**:
   ```javascript
   console.log('PixiJS version:', PIXI.VERSION);
   ```
3. **Check network tab** for asset loading failures
4. **Test with dev server**: `npm run dev` for hot reload
5. **Check Matter.js debug rendering**:
   ```typescript
   const render = Matter.Render.create({
     element: document.body,
     engine: engine,
     options: { wireframes: true }
   });
   ```

### Performance Issues

**Profiling:**
1. **Chrome DevTools Performance Tab**
   - Record gameplay session
   - Look for long frames (>16ms)
   - Check for excessive redraws

2. **PixiJS Stats**:
   ```typescript
   app.ticker.add(() => {
     console.log('FPS:', app.ticker.FPS);
     console.log('Draw calls:', app.renderer.stats.drawCalls);
   });
   ```

3. **Matter.js Performance**:
   - Reduce body count
   - Use static bodies for walls
   - Increase timestep (less accurate, faster)

**Common Fixes:**
- Sprite pooling (reuse sprites)
- Texture atlases (reduce draw calls)
- Lazy loading assets
- Reduce particle count
- Optimize collision detection

---

## 📚 RESOURCES

### Official Documentation
- [PixiJS v8 Docs](https://pixijs.com/docs) - Rendering engine
- [Matter.js Docs](https://brm.io/matter-js/docs/) - Physics engine
- [GSAP Docs](https://greensock.com/docs/) - Animation library
- [@pixi/tilemap](https://github.com/pixijs/tilemap) - Tilemap plugin
- [DragonBones Runtime](https://github.com/DragonBones/DragonBonesJS) - Skeletal animation
- [Vitest Guide](https://vitest.dev/guide/) - Unit testing
- [Playwright Docs](https://playwright.dev/) - E2E testing
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript

### Tools & Editors
- [Tiled Map Editor](https://www.mapeditor.org/) - Create tilemaps
- [DragonBones Pro](http://dragonbones.com/) - Create animations
- [TexturePacker](https://www.codeandweb.com/texturepacker) - Create texture atlases

### Vietnamese Game Dev Resources
- **Language**: Keep all in-game text in Vietnamese
- **i18n System**: Use `src/data/i18n/vi.json` for all UI text
- **Cultural Context**: Respect Vietnamese mythology and Hùng Vương history
- **Monster Names**: Use Vietnamese names, avoid English

### Learning Resources
- [Pokemon Clone Tutorial](https://www.youtube.com/watch?v=yP5DKzriqXA) - Similar game structure
- [Matter.js Examples](https://brm.io/matter-js/demo/) - Physics patterns
- [GSAP Examples](https://greensock.com/examples-showcases/) - Animation patterns
- [PixiJS Examples](https://pixijs.com/examples) - Rendering techniques

---

## 🎯 CURRENT SPRINT PRIORITIES

**See ROADMAP.md for detailed checklist.**

### Phase 1: Foundation (70% Complete)
- [x] Testing infrastructure (Vitest + Playwright)
- [x] TypeScript support (tsconfig.json)
- [x] DragonBones integration
- [x] Core documentation
- [ ] First unit tests (BattleSystem, CaptureSystem)
- [ ] CI/CD enhancement

### Phase 2: Overworld (Next - Week 2-3)
- [ ] Install libraries (Matter.js, GSAP, @pixi/tilemap)
- [ ] PhysicsManager + CollisionSystem
- [ ] InputManager
- [ ] Player entity with components
- [ ] Tilemap system
- [ ] Camera system
- [ ] OverworldScene
- [ ] 100+ tests, ≥75% coverage

### Phase 3: UI/UX (Week 3)
- [ ] Reusable UI components
- [ ] Scene transitions
- [ ] Mobile responsive design

### Phase 4: Polish (Week 4)
- [ ] Strict TypeScript mode
- [ ] Performance optimization
- [ ] Complete documentation

---

## 🚨 CRITICAL ARCHITECTURAL RULES (SUMMARY)

### The Three Laws

**1. The 500-Line Law**
- NO file shall exceed 500 lines
- Target: <400 lines per file
- Check before every commit: `wc -l filename.ts`

**2. Use Popular Libraries**
- Matter.js for physics
- GSAP for animations
- @pixi/tilemap for tilemaps
- NO custom implementations

**3. Extreme Modularity**
- Composition over inheritance
- One responsibility per file
- Components for entities
- Every folder has README.md

---

## 🔮 FUTURE FEATURES (Don't Implement Yet)

These are planned but not in current scope:

**Phase 5+ (Week 5 onwards):**
- DragonBones animation for all 200 monsters (placeholder assets only for now)
- Desktop builds (Tauri) - Windows, macOS, Linux
- Mobile app (Capacitor) - iOS, Android
- Save/Load system with cloud sync
- Multiplayer battles
- Trading system
- Sound effects & music
- Achievements system
- Leaderboards
- Quest system
- Breeding mechanics
- Story mode with NPCs

**Quality of Life (Future):**
- Auto-save every 5 minutes
- Fast travel after first visit
- Running shoes (2x movement speed)
- Bike/mount system
- Fly ability (teleport to visited locations)
- Repel items (reduce encounter rate)
- Lucky egg (2x EXP)
- Shiny monsters (rare color variants)

---

## 📋 FINAL CHECKLIST (Before Considering Task Complete)

When you complete ANY task, verify:

**Code Quality:**
- [ ] File is <500 lines (check: `wc -l filename.ts`)
- [ ] Used popular library if applicable (Matter.js, GSAP, etc.)
- [ ] Followed composition pattern for entities
- [ ] All public methods have JSDoc with @example
- [ ] No custom implementations where library exists

**Testing:**
- [ ] Unit tests written (≥70% coverage for new code)
- [ ] Tests use public API, not implementation details
- [ ] All tests passing (`npm test`)
- [ ] E2E tests for critical flows (if applicable)

**Documentation:**
- [ ] Folder README.md updated (if new files added)
- [ ] ROADMAP.md checklist updated
- [ ] ARCHITECTURE.md updated (if significant change)
- [ ] Inline comments explain WHY, not WHAT

**Build:**
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in browser
- [ ] Performance acceptable (60 FPS)

**Git:**
- [ ] Commit message follows Conventional Commits
- [ ] Meaningful commit (not "wip" or "fix")
- [ ] No unnecessary files committed (.gitignore updated)
- [ ] No merge conflicts

---

**Remember**: This is a migration/improvement project, NOT a rewrite. Preserve existing functionality while adding professional infrastructure! 🎮🇻🇳

**Last Updated**: 2025-10-16
**Current Phase**: Phase 1 → Phase 2 (Overworld with Matter.js)
**Next Milestone**: Complete Pokemon-style overworld exploration
