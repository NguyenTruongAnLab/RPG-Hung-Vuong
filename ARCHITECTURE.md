# Architecture - RPG Hùng Vương

## 📊 Current Structure Analysis

### Existing Implementation (JavaScript-based)

The codebase currently uses a **monolithic architecture** with basic game systems implemented directly in JavaScript. Here's the current structure:

#### File Organization
```
RPG-Hung-Vuong/
├── src/
│   ├── core/
│   │   ├── Game.js          # Main game controller (500+ lines)
│   │   └── I18n.js          # Internationalization system
│   ├── data/
│   │   ├── MonsterDatabase.js  # 200 monsters generator
│   │   └── vi.json             # Vietnamese translations
│   ├── systems/
│   │   ├── BattleSystem.js     # Turn-based combat logic
│   │   ├── CaptureSystem.js    # Monster capture mechanics
│   │   └── MapExplorer.js      # World navigation
│   └── main.js              # Entry point
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages deployment
├── index.html
├── package.json
└── vite.config.js
```

#### Core Components

##### 1. Game.js (Main Controller)
**Responsibilities**: Too many (violates Single Responsibility Principle)
- Application initialization
- Scene rendering (menu, explore, battle)
- UI creation and management
- Event handling
- State management

**Issues**:
- ❌ No clear scene separation
- ❌ Direct DOM manipulation in game logic
- ❌ Tight coupling between systems
- ❌ No abstraction layers
- ❌ Hard to test

**Stats**: ~500 lines, manages 5+ screens

##### 2. BattleSystem.js
**Responsibilities**: Combat logic ✅
- Damage calculation
- Element advantage system (Ngũ Hành)
- Turn management
- Victory/defeat detection

**Strengths**:
- ✅ Well-defined purpose
- ✅ Pure logic (no UI)
- ✅ Easy to test

**Issues**:
- ❌ No unit tests yet
- ❌ Lacks TypeScript types

##### 3. CaptureSystem.js
**Responsibilities**: Monster capturing ✅
- Capture rate calculation
- Monster collection management
- Evolution logic

**Strengths**:
- ✅ Decoupled from battle
- ✅ Clear API

**Issues**:
- ❌ No persistence layer
- ❌ Evolution system not fully integrated

##### 4. MonsterDatabase.js
**Responsibilities**: Data generation ✅
- Procedurally generates 200 monsters
- Assigns Ngũ Hành elements
- Creates evolution chains

**Strengths**:
- ✅ Scalable approach
- ✅ Consistent data structure

**Issues**:
- ❌ All data generated at runtime (performance)
- ❌ No actual DragonBones assets
- ❌ Should be pre-generated JSON

##### 5. MapExplorer.js
**Responsibilities**: World navigation ✅
- Location management
- Random encounters
- Map connections

**Strengths**:
- ✅ Simple and effective

**Issues**:
- ❌ Static location data
- ❌ No unlock progression system

### Data Flow

```
User Input
    ↓
Game.js (handles everything)
    ↓
├─→ BattleSystem.js (combat)
├─→ CaptureSystem.js (capture)
├─→ MapExplorer.js (navigation)
└─→ MonsterDatabase.js (data)
    ↓
PixiJS Rendering
```

**Problems**:
- Everything flows through Game.js (bottleneck)
- No event bus for decoupled communication
- Direct method calls create tight coupling

---

## 🎯 Target Architecture

### Principles
1. **Separation of Concerns**: Each system has one job
2. **Dependency Injection**: Systems don't create dependencies
3. **Event-Driven**: Loose coupling via EventBus
4. **Scene-Based**: Clear state management
5. **Testable**: Pure logic separated from rendering

### Proposed Structure

```
src/
├── core/                    # Core engine systems
│   ├── Game.ts             # Application bootstrap
│   ├── SceneManager.ts     # Scene lifecycle management
│   ├── AssetManager.ts     # Asset loading/caching
│   ├── DragonBonesManager.ts # DragonBones integration
│   ├── EventBus.ts         # Event system
│   ├── I18n.ts             # Internationalization (converted)
│   └── SaveManager.ts      # [FUTURE] Save/load system
│
├── scenes/                 # Game scenes (states)
│   ├── Scene.ts            # Base scene class
│   ├── MenuScene.ts        # Main menu
│   ├── ExploreScene.ts     # Map exploration
│   ├── BattleScene.ts      # Combat
│   └── CollectionScene.ts  # Monster collection view
│
├── systems/                # Game logic systems
│   ├── BattleSystem.ts     # Combat logic (convert existing)
│   ├── CaptureSystem.ts    # Capture logic (convert existing)
│   ├── MapSystem.ts        # Map logic (convert from MapExplorer)
│   ├── ProgressionSystem.ts # [NEW] Level/XP/Evolution
│   └── ElementSystem.ts    # [NEW] Ngũ Hành calculator
│
├── ui/                     # Reusable UI components
│   ├── Button.ts
│   ├── HealthBar.ts
│   ├── DialogBox.ts
│   ├── MonsterCard.ts
│   └── Menu.ts
│
├── data/                   # Game data
│   ├── monsters/           # [NEW] Pre-generated monster JSONs
│   ├── MonsterDatabase.ts  # Database loader
│   ├── i18n/               # [NEW] Organized translations
│   │   └── vi.json
│   └── config/             # [NEW] Game configuration
│       └── GameConfig.ts
│
├── utils/                  # Helper utilities
│   ├── MathUtils.ts
│   ├── RandomUtils.ts
│   └── ValidationUtils.ts
│
└── types/                  # TypeScript type definitions
    ├── Monster.ts
    ├── Battle.ts
    └── Scene.ts
```

### New Data Flow

```
User Input
    ↓
SceneManager (current scene)
    ↓
Current Scene (MenuScene, BattleScene, etc.)
    ↓
├─→ System (BattleSystem, CaptureSystem, etc.)
│   └─→ EventBus.emit('event')
│
├─→ UI Components (Button, HealthBar, etc.)
│
└─→ AssetManager (lazy load DragonBones)
    ↓
EventBus
    ↓
Subscribers (other scenes/systems)
```

**Benefits**:
- ✅ Scenes are independent
- ✅ Systems don't know about each other
- ✅ Easy to add new scenes/systems
- ✅ Testable in isolation

---

## 🔧 Core Systems Design

### 1. SceneManager

**Purpose**: Manage scene lifecycle (init, update, destroy)

```typescript
abstract class Scene extends PIXI.Container {
  abstract init(): Promise<void>;
  abstract update(dt: number): void;
  abstract destroy(): void;
}

class SceneManager {
  private currentScene: Scene | null = null;
  
  async switchTo(scene: Scene): Promise<void> {
    // Cleanup old scene
    // Initialize new scene
    // Add to stage
  }
  
  update(dt: number): void {
    this.currentScene?.update(dt);
  }
}
```

**Usage**:
```typescript
await sceneManager.switchTo(new BattleScene());
```

### 2. AssetManager

**Purpose**: Lazy load and cache 200 DragonBones assets

```typescript
class AssetManager {
  private cache = new Map<string, DragonBonesAsset>();
  
  async loadMonster(id: string): Promise<DragonBonesAsset> {
    if (this.cache.has(id)) return this.cache.get(id);
    
    // Load skeleton, texture, atlas
    // Cache the result
    return asset;
  }
  
  async preloadMonsters(ids: string[]): Promise<void> {
    // Batch load in chunks of 10
  }
}
```

**Benefits**:
- Only loads monsters when needed
- Prevents memory overflow
- Supports preloading for common monsters

### 3. DragonBonesManager

**Purpose**: Interface with DragonBones library

```typescript
class DragonBonesManager {
  private factory: dragonBones.PixiFactory;
  
  createDisplay(
    asset: DragonBonesAsset
  ): dragonBones.PixiArmatureDisplay {
    // Parse skeleton and texture data
    // Build armature display
    return display;
  }
  
  playAnimation(display: ArmatureDisplay, name: string): void {
    display.animation.play(name);
  }
}
```

### 4. EventBus

**Purpose**: Decouple systems via pub/sub

```typescript
class EventBus {
  private listeners = new Map<string, Function[]>();
  
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
  
  off(event: string, callback: Function): void {
    // Remove listener
  }
}
```

**Usage**:
```typescript
// BattleSystem
eventBus.emit('monster:defeated', { monsterId: 'char001' });

// CaptureSystem (subscribes)
eventBus.on('monster:defeated', (data) => {
  // Enable capture option
});
```

---

## 📋 Refactoring Plan

### Phase 1: Foundation (Week 1) ✅
- [x] Add TypeScript support
- [x] Install DragonBones
- [x] Create testing infrastructure
- [x] Create documentation files
- [ ] Create core managers (Scene, Asset, DragonBones, EventBus)

### Phase 2: Core Refactor (Week 2)
- [ ] Convert existing JS systems to TS
- [ ] Implement Scene pattern for all screens
- [ ] Add EventBus to decouple systems
- [ ] Write unit tests for all systems
- [ ] Create 3 placeholder DragonBones assets

### Phase 3: UI Components (Week 3)
- [ ] Extract UI code from Game.js
- [ ] Create reusable Button component
- [ ] Create HealthBar component
- [ ] Create DialogBox component
- [ ] Create MonsterCard component
- [ ] Add Vietnamese text rendering

### Phase 4: Testing & Polish (Week 4)
- [ ] Write E2E tests for main flows
- [ ] Enable TypeScript strict mode
- [ ] Fix all type errors
- [ ] Performance optimization
- [ ] Code coverage ≥ 70%

### Phase 5: Advanced Features (Week 5+)
- [ ] Multi-platform builds (Tauri, Capacitor)
- [ ] Asset pipeline for 200 monsters
- [ ] Save/load system
- [ ] Animation system
- [ ] Sound system

---

## 🎯 Migration Guidelines

### Converting JavaScript to TypeScript

**Step-by-step**:
1. Rename `.js` to `.ts`
2. Add type annotations gradually
3. Fix any type errors
4. Add JSDoc comments
5. Write unit tests
6. Verify build and runtime behavior

**Example**:

**Before (JavaScript)**:
```javascript
export class BattleSystem {
  calculateDamage(attacker, defender) {
    let damage = attacker.stats.attack - defender.stats.defense;
    return Math.max(1, damage);
  }
}
```

**After (TypeScript)**:
```typescript
export class BattleSystem {
  /**
   * Calculates damage between two monsters
   * @param attacker - Attacking monster
   * @param defender - Defending monster
   * @returns Final damage value (minimum 1)
   */
  calculateDamage(attacker: Monster, defender: Monster): number {
    const damage = attacker.stats.attack - defender.stats.defense;
    return Math.max(1, damage);
  }
}
```

### Scene Migration

**Before**: Everything in Game.js
```javascript
createMainMenu() {
  // 50 lines of UI code
}
startBattle() {
  // 100 lines of battle UI
}
```

**After**: Separate scenes
```typescript
class MenuScene extends Scene {
  async init() { /* Menu UI */ }
  update(dt) { /* Menu logic */ }
  destroy() { /* Cleanup */ }
}

class BattleScene extends Scene {
  async init() { /* Battle UI */ }
  update(dt) { /* Battle logic */ }
  destroy() { /* Cleanup */ }
}
```

---

## 📊 Metrics & Goals

### Code Quality Metrics
- **Test Coverage**: Target ≥ 70%
- **TypeScript Adoption**: 100% for new code, gradual for existing
- **Lines per File**: Target < 300 lines
- **Cyclomatic Complexity**: Target < 10 per function

### Performance Metrics
- **Initial Load**: < 3 seconds
- **Scene Transition**: < 500ms
- **Asset Load (per monster)**: < 100ms
- **Frame Rate**: 60 FPS stable

### Development Metrics
- **Build Time**: < 5 seconds
- **Test Execution**: < 10 seconds (unit tests)
- **Hot Reload**: < 1 second

---

## 🚀 Deployment Architecture

### GitHub Pages (Current)
```
Build → dist/ → GitHub Pages
```

### Multi-platform (Future)
```
Source Code
    ↓
Build Process
    ├─→ Web (Vite) → GitHub Pages
    ├─→ Desktop (Tauri) → Windows/Mac/Linux
    └─→ Mobile (Capacitor) → Android/iOS
```

---

## 📚 References

- [PixiJS Best Practices](https://pixijs.com/guides/basics/getting-started)
- [DragonBones Integration](https://github.com/DragonBones/DragonBonesJS)
- [TypeScript Game Dev](https://www.typescriptlang.org/)
- [Scene Pattern](https://gameprogrammingpatterns.com/state.html)
- [Event Bus Pattern](https://www.patterns.dev/posts/observer-pattern/)

---

**Last Updated**: 2025-10-16
**Status**: Phase 1 (Foundation) - In Progress
