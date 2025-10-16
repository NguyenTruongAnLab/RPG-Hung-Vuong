# Game Systems

Gameplay systems that implement core mechanics.

## Files

### Existing Files
- `BattleSystem.js` (76 lines) - Turn-based combat system
  - ✅ **GOOD SIZE**: Focused and clean
  - Features: Speed-based turns, element advantages, damage calculation
  
- `CaptureSystem.js` (88 lines) - Monster capture mechanics
  - ✅ **GOOD SIZE**: Single responsibility
  - Features: Capture rate calculation, success/failure determination
  
- `MapExplorer.js` (95 lines) - Map navigation between locations
  - ✅ **GOOD SIZE**: Well-organized
  - Features: 6 locations, connections, travel system

## Planned Files (Phase 2)

- `CollisionSystem.ts` (<300 lines) - Matter.js collision handling
- `EncounterSystem.ts` (<250 lines) - Random encounters in overworld
- `MovementSystem.ts` (<200 lines) - Player movement logic
- `InventorySystem.ts` (<300 lines) - Item management
- `EvolutionSystem.ts` (<200 lines) - Monster evolution mechanics

## System Design Principles

### Independence
Systems should be loosely coupled:
- Communicate via EventBus
- Don't directly reference other systems
- Use dependency injection

### Testability
Each system should be testable in isolation:
- Mock dependencies
- Test public API
- No side effects in tests

### State Management
Systems manage their own state:
- Encapsulate internal data
- Provide clear getter/setter APIs
- Emit events on state changes

## Battle System Flow

```
BattleSystem.initialize(player, enemy)
  ↓
Determine turn order (by speed)
  ↓
Player/Enemy turn → Attack
  ↓
Calculate damage (with element advantage)
  ↓
Apply damage (reduce HP)
  ↓
Check for KO
  ↓
Switch turns OR End battle
```

## Capture System Flow

```
Player encounters wild monster
  ↓
CaptureSystem.attemptCapture(monster, playerLevel)
  ↓
Calculate capture rate (base rate × HP factor × level factor)
  ↓
Roll random number
  ↓
Success: Add monster to team
Failure: Monster breaks free
```

## Map Explorer Flow

```
MapExplorer.initialize(locations)
  ↓
Player at current location
  ↓
MapExplorer.travel(destination)
  ↓
Check if connection exists
  ↓
Valid: Move to destination, trigger encounter check
Invalid: Show error message
```

## File Size Policy

- **Target**: <300 lines per file
- **Limit**: 500 lines maximum
- **Action when exceeded**: Extract helpers or split responsibilities

## Ngũ Hành (Five Elements) System

All systems respect element advantages:

```
Kim (Metal) > Mộc (Wood)   - 1.5x damage
Mộc (Wood) > Thổ (Earth)   - 1.5x damage
Thổ (Earth) > Thủy (Water) - 1.5x damage
Thủy (Water) > Hỏa (Fire)  - 1.5x damage
Hỏa (Fire) > Kim (Metal)   - 1.5x damage
```

## Testing Requirements

Each system must have:
- [ ] Unit tests for all public methods
- [ ] Edge case tests (0 HP, max stats, etc.)
- [ ] Integration tests with EventBus
- [ ] Coverage ≥75%

## Phase 2 System Architecture

### Planned: CollisionSystem.ts
```typescript
/**
 * Handles Matter.js collision events
 * Responsibilities:
 * - Register collision pairs (player-wall, player-enemy)
 * - Handle collision events
 * - Emit game events (encounter, damage, etc.)
 * Max lines: 300
 */
```

### Planned: EncounterSystem.ts
```typescript
/**
 * Manages random encounters in overworld
 * Responsibilities:
 * - Track player steps in encounter zones
 * - Calculate encounter probability
 * - Select random enemy based on location
 * - Trigger battle transition
 * Max lines: 250
 */
```

### Planned: MovementSystem.ts
```typescript
/**
 * Handles player movement logic
 * Responsibilities:
 * - Process input from InputManager
 * - Calculate velocity
 * - Apply forces to Matter.js body
 * - Update facing direction
 * Max lines: 200
 */
```

---

**Rule**: Systems should be independent, testable, and well-documented.
