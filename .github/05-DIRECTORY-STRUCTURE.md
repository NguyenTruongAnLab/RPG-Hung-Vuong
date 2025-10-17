# Directory Structure - File Organization

This document explains where every file goes and how the codebase is organized.

---

## 📁 Complete Project Structure

```
RPG-Hung-Vuong/
├── .github/                          # GitHub-specific files
│   ├── 00-START-HERE.md              # Documentation entry point
│   ├── 01-PROJECT-VISION.md          # Game concept
│   ├── 02-ARCHITECTURE-RULES.md      # The 4 Commandments
│   ├── 03-TECH-STACK.md              # Required libraries
│   ├── 04-CODING-STANDARDS.md        # Style guide
│   ├── 05-DIRECTORY-STRUCTURE.md     # This file
│   ├── 06-CURRENT-STATE.md           # What's implemented
│   ├── 07-ROADMAP.md                 # Task list
│   ├── 08-TESTING-GUIDE.md           # Testing standards
│   ├── 09-COMMON-TASKS.md            # Code recipes
│   ├── 10-TROUBLESHOOTING.md         # Debug guide
│   ├── copilot-instructions.md       # Index file
│   └── workflows/
│       └── deploy.yml                # CI/CD pipeline
│
├── src/                              # Source code
│   ├── core/                         # Core managers (<400 lines each)
│   │   ├── README.md                 # Folder documentation
│   │   ├── Engine.ts                 # <250 lines - Main game loop
│   │   ├── SceneManager.ts           # <250 lines - Scene switching
│   │   ├── AssetManager.ts           # <400 lines - Asset loading
│   │   ├── EventBus.ts               # <200 lines - Event pub/sub
│   │   ├── InputManager.ts           # <200 lines - Keyboard/touch input
│   │   ├── PhysicsManager.ts         # <300 lines - Matter.js wrapper
│   │   └── DragonBonesManager.ts     # <300 lines - Animation manager
│   │
│   ├── systems/                      # Game systems (<350 lines each)
│   │   ├── README.md
│   │   ├── BattleSystem.ts           # <400 lines - Turn-based combat
│   │   ├── ElementSystem.ts          # <250 lines - Ngũ Hành advantages
│   │   ├── CaptureSystem.ts          # <300 lines - Monster capture
│   │   ├── CollisionSystem.ts        # <300 lines - Matter.js callbacks
│   │   ├── EncounterSystem.ts        # <250 lines - Random encounters
│   │   └── MovementSystem.ts         # <200 lines - Movement helpers
│   │
│   ├── entities/                     # Game entities (component-based)
│   │   ├── README.md
│   │   ├── Player.ts                 # <300 lines - Main player orchestrator
│   │   ├── Monster.ts                # <300 lines - Monster entity
│   │   ├── Enemy.ts                  # <250 lines - Overworld enemy
│   │   └── components/
│   │       ├── PlayerMovement.ts     # <200 lines - Movement logic
│   │       ├── PlayerCombat.ts       # <200 lines - Combat logic
│   │       ├── PlayerStats.ts        # <150 lines - Stats management
│   │       └── PlayerAnimation.ts    # <180 lines - Animation control
│   │
│   ├── world/                        # World/map systems
│   │   ├── README.md
│   │   ├── Tilemap.ts                # <350 lines - @pixi/tilemap rendering
│   │   ├── TilemapCollision.ts       # <200 lines - Static body generation
│   │   ├── TilemapEncounters.ts      # <200 lines - Encounter zone detection
│   │   ├── Camera.ts                 # <250 lines - GSAP smooth camera
│   │   └── MapLoader.ts              # <250 lines - Tiled JSON loader
│   │
│   ├── scenes/                       # Game scenes (<400 lines each)
│   │   ├── README.md
│   │   ├── OverworldScene.ts         # <400 lines - Real-time exploration
│   │   ├── OverworldUI.ts            # <200 lines - Overworld UI (HP, minimap)
│   │   ├── OverworldEntities.ts      # <250 lines - Entity spawning
│   │   ├── BattleScene.ts            # <400 lines - Turn-based battle
│   │   └── BattleUI.ts               # <200 lines - Battle interface
│   │
│   ├── ui/                           # Reusable UI components (<200 lines)
│   │   ├── README.md
│   │   ├── Button.ts                 # <150 lines - Clickable button
│   │   ├── HealthBar.ts              # <120 lines - HP bar display
│   │   ├── DialogBox.ts              # <180 lines - NPC dialogue
│   │   └── Menu.ts                   # <200 lines - Menu system
│   │
│   ├── data/                         # Game data (JSON files)
│   │   ├── monsters.json             # 200 Thần Thú definitions
│   │   ├── skills.json               # Skills and abilities
│   │   ├── elements.json             # Ngũ Hành rules
│   │   ├── encounters.json           # Encounter rate tables
│   │   ├── maps/
│   │   │   ├── world-map.json        # Tiled JSON format
│   │   │   ├── forest.json
│   │   │   └── mountain.json
│   │   └── i18n/
│   │       └── vi.json               # Vietnamese translations
│   │
│   ├── utils/                        # Pure utility functions (<200 lines)
│   │   ├── README.md
│   │   ├── MatterHelpers.ts          # <200 lines - Matter.js utilities
│   │   ├── TilemapHelpers.ts         # <150 lines - Tilemap utilities
│   │   └── AnimationHelpers.ts       # <180 lines - Animation utilities
│   │
│   └── main.ts                       # <100 lines - Entry point
│
├── tests/                            # Test files
│   ├── unit/                         # Vitest unit tests
│   │   ├── core/
│   │   ├── systems/
│   │   ├── entities/
│   │   └── utils/
│   └── e2e/                          # Playwright E2E tests
│       ├── overworld.spec.ts
│       └── battle.spec.ts
│
├── public/                           # Static assets
│   └── assets/
│       ├── monsters/                 # DragonBones assets (char001-200)
│       ├── tilesets/                 # Tilemap graphics
│       └── audio/                    # Sound effects/music
│
├── docs/                             # Additional documentation
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── GAMEPLAY.md
│   ├── LIBRARIES.md
│   ├── CODING_STYLE.md
│   └── PHASE2_IMPLEMENTATION_GUIDE.md
│
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript config
├── vite.config.js                    # Vite build config
├── vitest.config.ts                  # Vitest test config
├── playwright.config.ts              # Playwright E2E config
├── .gitignore                        # Git ignore rules
└── README.md                         # Project overview
```

---

## 📋 Where to Put New Files

### Adding Core Managers
**Location**: `src/core/`  
**Max Size**: <400 lines  
**Examples**: PhysicsManager, InputManager, AudioManager

**Create when**:
- Core infrastructure needed by multiple systems
- Singleton pattern required
- Global state management

### Adding Game Systems
**Location**: `src/systems/`  
**Max Size**: <350 lines  
**Examples**: CollisionSystem, EncounterSystem, SaveSystem

**Create when**:
- Game logic that doesn't fit in entities
- Cross-entity behavior
- State machine logic

### Adding Entities
**Location**: `src/entities/`  
**Max Size**: <300 lines (orchestrator), <200 lines (components)  
**Examples**: Player, Monster, NPC, Projectile

**Create when**:
- New game object type
- Use component-based pattern

**Component Location**: `src/entities/components/`

### Adding World/Map Files
**Location**: `src/world/`  
**Max Size**: <350 lines  
**Examples**: Tilemap, Camera, MapLoader, Pathfinding

**Create when**:
- Map rendering logic
- Camera behavior
- World-space calculations

### Adding Scenes
**Location**: `src/scenes/`  
**Max Size**: <400 lines (split if larger)  
**Examples**: MenuScene, ShopScene, CutscenePlayer

**Create when**:
- New game screen/mode
- If scene exceeds 400 lines, split into Scene + UI + Entities

### Adding UI Components
**Location**: `src/ui/`  
**Max Size**: <200 lines  
**Examples**: Button, HealthBar, Inventory, Tooltip

**Create when**:
- Reusable UI element
- Custom PIXI display object

### Adding Utilities
**Location**: `src/utils/`  
**Max Size**: <200 lines  
**Examples**: MathHelpers, ColorHelpers, FormatHelpers

**Create when**:
- Pure functions (no side effects)
- Helper functions used in multiple places
- Check lodash first! Don't reinvent the wheel

### Adding Game Data
**Location**: `src/data/`  
**Format**: JSON  
**Examples**: monsters.json, skills.json, items.json

**Create when**:
- Configuration data
- Content data (monsters, items, etc.)
- Localization strings

### Adding Tests
**Unit Tests**: `tests/unit/[folder]/[filename].test.ts`  
**E2E Tests**: `tests/e2e/[feature].spec.ts`

**Test Location Rules**:
- Mirror source structure: `src/core/PhysicsManager.ts` → `tests/unit/core/PhysicsManager.test.ts`
- Group related tests in describe blocks

---

## 📝 Folder README.md Template

Every folder in `src/` must have a `README.md`:

```markdown
# [Folder Name]

**Purpose**: [Brief description of what files in this folder do]

## Files

- `File1.ts` (280 lines) - [What this file does]
- `File2.ts` (180 lines) - [What this file does]
- `File3.ts` (150 lines) - [What this file does]

## Design Pattern

[Explain the architectural pattern used in this folder]

## Dependencies

- [Library or manager this folder depends on]
- [Another dependency]

## Usage Example

[Brief code example showing how to use files in this folder]
```

**Example - `src/core/README.md`:**
```markdown
# Core Managers

**Purpose**: Singleton managers that provide global game services

## Files

- `Engine.ts` (245 lines) - Main game loop using PixiJS ticker
- `SceneManager.ts` (238 lines) - Scene switching with transitions
- `PhysicsManager.ts` (290 lines) - Matter.js engine wrapper
- `InputManager.ts` (185 lines) - Keyboard and touch input handling

## Design Pattern

All managers use **Singleton pattern** with `getInstance()` method.
Managers don't depend on each other directly; use EventBus for communication.

## Dependencies

- PixiJS for Engine
- Matter.js for PhysicsManager
- EventBus for inter-manager communication

## Usage Example

```typescript
// Get manager instance
const physics = PhysicsManager.getInstance();

// Use manager
physics.addBody(playerBody);
physics.update(deltaMs);
```
```

---

## 🔍 File Organization Rules

### 1. By Feature, Not Type
✅ **GOOD** (feature-based):
```
src/
├── entities/
│   ├── Player.ts
│   └── components/
│       ├── PlayerMovement.ts
│       └── PlayerCombat.ts
```

❌ **BAD** (type-based):
```
src/
├── classes/
│   └── Player.ts
├── movement/
│   └── PlayerMovement.ts
└── combat/
    └── PlayerCombat.ts
```

### 2. Shallow Hierarchy
- Maximum 3 levels deep: `src/entities/components/PlayerMovement.ts`
- Avoid deep nesting that makes imports difficult

### 3. Clear Naming
- Folder name should match content purpose
- File name should match primary export

### 4. README.md Always
- Every `src/` subfolder has README.md
- Update when adding/removing files
- Keep line counts accurate

---

## 🎯 Quick Reference

**Need to add...**

**Physics code?** → `src/core/PhysicsManager.ts` or `src/utils/MatterHelpers.ts`

**Battle logic?** → `src/systems/BattleSystem.ts` (if <400 lines, else split)

**Player feature?** → `src/entities/components/Player[Feature].ts`

**UI element?** → `src/ui/[ElementName].ts`

**Map code?** → `src/world/[Feature].ts`

**Game data?** → `src/data/[datatype].json`

**Helper function?** → Check lodash first! If unique, `src/utils/[Category]Helpers.ts`

**Test?** → `tests/unit/[mirror-src-path]/[filename].test.ts`

---

**Last Updated**: 2025-10-17  
**Version**: 1.0.0
