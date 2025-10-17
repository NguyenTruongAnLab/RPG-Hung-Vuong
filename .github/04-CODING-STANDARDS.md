# Coding Standards - Style Guide & Conventions

This document defines coding standards, naming conventions, TypeScript style, and commit message format.

---

## 🎯 General Principles

### Design Principles
- **DRY** (Don't Repeat Yourself) - Extract common code
- **KISS** (Keep It Simple, Stupid) - Simplest solution wins
- **YAGNI** (You Aren't Gonna Need It) - Don't build for future
- **Single Responsibility** - One class = one clear purpose
- **Composition > Inheritance** - Use components, not class hierarchies

### Code Quality
- Write code that is easy to read and understand
- Prefer explicit over implicit
- Fail fast with clear error messages
- Test public APIs, not implementation details

---

## 📛 Naming Conventions

### Classes
**Format**: PascalCase  
**Examples**: `BattleSystem`, `MonsterDatabase`, `PlayerMovement`, `AssetManager`

```typescript
class BattleSystem { }
class PlayerMovement { }
```

### Functions & Methods
**Format**: camelCase  
**Examples**: `calculateDamage`, `attemptCapture`, `getMonsterById`, `initializeGame`

```typescript
function calculateDamage() { }
function attemptCapture() { }
```

### Constants
**Format**: UPPER_SNAKE_CASE  
**Examples**: `ELEMENT_ADVANTAGES`, `MAX_HP`, `CAPTURE_RATES`, `DEFAULT_SPEED`

```typescript
const MAX_HP = 100;
const ELEMENT_ADVANTAGES = { /* ... */ };
```

### Variables
**Format**: camelCase  
**Examples**: `playerHealth`, `monsterList`, `currentScene`, `deltaTime`

```typescript
let playerHealth = 100;
const monsterList = [];
```

### Files
**Format**: Same as primary export (PascalCase for classes)  
**Examples**: `BattleSystem.ts`, `AssetManager.ts`, `PlayerMovement.ts`

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

### Interfaces & Types
**Interfaces**: PascalCase (optionally with 'I' prefix)  
**Types**: PascalCase  
**Enums**: PascalCase

```typescript
// Interfaces (both styles acceptable)
interface Monster { }
interface IMonster { }

// Type aliases
type Vector2D = { x: number; y: number };
type GameState = 'menu' | 'playing' | 'paused';
type ElementType = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

// Enums
enum Element {
  Kim = 'kim',
  Moc = 'moc',
  Thuy = 'thuy',
  Hoa = 'hoa',
  Tho = 'tho'
}

enum BattleState {
  Idle = 'IDLE',
  PlayerTurn = 'PLAYER_TURN',
  EnemyTurn = 'ENEMY_TURN',
  Victory = 'VICTORY'
}
```

---

## 💬 Comments & Documentation

### 1. JSDoc for Public APIs (MANDATORY)

Every public method must have JSDoc with `@example` tags:

```typescript
/**
 * Applies force to player's Matter.js body for movement
 * 
 * Automatically normalizes diagonal movement to prevent
 * the 1.4x speed exploit when moving diagonally.
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

### 2. Inline Comments (Explain WHY, not WHAT)

Comments should explain reasoning, not restate code:

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

### 3. TODO Comments

Use TODO comments for future work:

```typescript
// TODO(username): Description of what needs to be done
// TODO(AnLab): Add animation for critical hits
// TODO(AnLab): Optimize collision detection for 100+ entities
```

### 4. File Header Comments

Every file should start with a brief description:

```typescript
/**
 * Player entity with component-based architecture
 * 
 * Orchestrates PlayerMovement, PlayerCombat, and PlayerStats components
 * Uses Matter.js for physics and GSAP for animations
 */
export class Player {
  // ...
}
```

---

## 🔷 TypeScript Style

### Use Modern TypeScript Features

```typescript
// ✅ Use interfaces for object contracts
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

// ✅ Use const assertions
const ELEMENT_ORDER = ['kim', 'moc', 'thuy', 'hoa', 'tho'] as const;

// ✅ Use utility types
type Partial<T> = { [P in keyof T]?: T[P] };
type ReadOnly<T> = { readonly [P in keyof T]: T[P] };
```

### Type Annotations

```typescript
// ✅ Explicit return types for public methods
public calculateDamage(attacker: Monster, defender: Monster): number {
  // ...
}

// ✅ Type function parameters
function movePlayer(velocity: Vector2D, speed: number): void {
  // ...
}

// ❌ Avoid 'any'
let data: any; // BAD

// ✅ Use 'unknown' if type is truly unknown
let data: unknown; // GOOD
```

### Strict Mode

We aim for strict TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

---

## 📝 Code Formatting

### Indentation
- **2 spaces** (not tabs)
- Configured in `.editorconfig`

### Line Length
- **Maximum**: 100 characters preferred, 120 absolute max
- Break long lines logically

### Braces
```typescript
// ✅ GOOD: Braces on same line
if (condition) {
  doSomething();
}

// ❌ BAD: Braces on new line
if (condition) 
{
  doSomething();
}
```

### Semicolons
- **Always use semicolons** (no ASI)

### Quotes
- **Prefer single quotes** for strings: `'hello'`
- Use double quotes for JSX/HTML: `<div class="name">`
- Use backticks for template literals: `` `Hello ${name}` ``

---

## 📋 Complete Code Example

```typescript
/**
 * Calculates damage between attacker and defender with Ngũ Hành advantages
 * 
 * Applies elemental advantage/disadvantage based on the Ngũ Hành cycle,
 * reduces damage by half of defender's defense stat, and applies
 * critical hit chance.
 * 
 * @param attacker - The attacking monster
 * @param defender - The defending monster  
 * @param skill - Optional skill being used (adds power)
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

## 📝 Commit Message Format

Follow **Conventional Commits** specification:

### Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Commit Types
- **feat** - New feature
- **fix** - Bug fix
- **docs** - Documentation only
- **style** - Code style (formatting, semicolons)
- **refactor** - Code change (no bug fix or feature)
- **test** - Adding/updating tests
- **chore** - Maintenance (deps, config)
- **perf** - Performance improvement

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

## ✅ Pre-commit Checklist

Before committing any code:

- [ ] File is <500 lines (`wc -l filename.ts`)
- [ ] All public methods have JSDoc with @example
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] All tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Commit message follows Conventional Commits
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code

---

**Last Updated**: 2025-10-17  
**Version**: 1.0.0
