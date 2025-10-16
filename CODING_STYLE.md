# Coding Style Guide - RPG Hùng Vương

## 🎯 Overview

This document defines coding standards for RPG Hùng Vương to ensure consistency, maintainability, and quality across the codebase.

---

## 📊 Current Code Issues (To Fix Gradually)

### Existing Problems
1. **No TypeScript strict mode** → Enable gradually after conversion
2. **Missing JSDoc comments** → Add when refactoring each file
3. **Global variables in Game.js** → Encapsulate into managers
4. **No error handling** → Add try-catch blocks
5. **Hardcoded values** → Move to config files
6. **Long functions (>50 lines)** → Refactor into smaller functions
7. **Deep nesting (>3 levels)** → Extract functions
8. **No input validation** → Add validation utilities

---

## ✅ Target Standards

### 1. File Organization

#### TypeScript Files
```typescript
// 1. Imports (grouped and sorted)
import * as PIXI from 'pixi.js';
import type { Monster, Battle } from '@/types';
import { calculateDamage } from '@/utils/BattleUtils';

// 2. Type definitions
interface BattleOptions {
  turnLimit?: number;
  allowItems?: boolean;
}

// 3. Constants
const DEFAULT_TURN_LIMIT = 100;
const CRITICAL_HIT_CHANCE = 0.1;

// 4. Class definition
export class BattleSystem {
  // Private fields first
  private turn: number = 0;
  private participants: Monster[] = [];
  
  // Constructor
  constructor(options: BattleOptions = {}) {
    // Initialize
  }
  
  // Public methods
  public initBattle(monsters: Monster[]): void {
    // Implementation
  }
  
  // Private methods
  private calculateTurnOrder(): void {
    // Implementation
  }
}
```

#### File Structure
- **One class per file** (exception: small related types)
- **Filename matches class name**: `BattleSystem.ts` for `class BattleSystem`
- **Index files** for barrel exports: `src/systems/index.ts`

---

### 2. Naming Conventions

#### Cases
```typescript
// PascalCase for classes, interfaces, types
class MonsterDatabase { }
interface BattleResult { }
type ElementType = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

// camelCase for functions, variables, methods
function calculateDamage() { }
const playerMonster = getMonster();
this.currentHP = 100;

// UPPER_SNAKE_CASE for constants
const MAX_MONSTERS = 200;
const ELEMENT_ADVANTAGES = {
  kim: 'moc',
  // ...
};

// kebab-case for file names (if multi-word)
// battle-system.ts OR BattleSystem.ts (prefer PascalCase)
```

#### Prefixes and Suffixes
```typescript
// Interfaces: 'I' prefix (optional, prefer descriptive names)
interface Monster { }  // ✅ Preferred
interface IMonster { } // ✅ Also acceptable

// Private fields: '_' prefix (optional, prefer 'private' keyword)
class Game {
  private _score = 0;     // ✅ Explicit with underscore
  private score = 0;      // ✅ Also acceptable (TypeScript private)
}

// Boolean variables: 'is', 'has', 'can' prefixes
const isGameOver = false;
const hasEvolved = monster.evolveTo !== null;
const canCapture = calculateCaptureRate() > 0;

// Event handlers: 'on' or 'handle' prefix
function onButtonClick() { }
function handlePlayerAttack() { }

// Getters: No 'get' prefix
class Monster {
  get health() { return this._hp; }  // ✅ Good
  getHealth() { return this._hp; }   // ❌ Verbose for getter
}
```

---

### 3. Code Formatting

#### Indentation & Spacing
```typescript
// 2 spaces for indentation (no tabs)
function example() {
  if (condition) {
    doSomething();
  }
}

// Spaces around operators
const sum = a + b;           // ✅
const sum=a+b;               // ❌

// Space after keywords
if (condition) { }           // ✅
if(condition){ }             // ❌

// No space before function params
function foo(a, b) { }       // ✅
function foo (a, b) { }      // ❌

// Trailing commas in objects/arrays
const monster = {
  name: 'Rồng',
  element: 'kim',  // ✅ Trailing comma
};
```

#### Line Length
- **Max 100 characters per line**
- Break long lines at logical points
- Use Prettier to auto-format

```typescript
// ❌ Too long
const result = this.battleSystem.calculateDamage(playerMonster, enemyMonster, selectedSkill, elementAdvantage);

// ✅ Broken appropriately
const result = this.battleSystem.calculateDamage(
  playerMonster,
  enemyMonster,
  selectedSkill,
  elementAdvantage
);
```

#### Braces
```typescript
// Opening brace on same line (K&R style)
if (condition) {
  doSomething();
} else {
  doSomethingElse();
}

// Single-line: braces optional for very short statements
if (isValid) return true;  // ✅ OK for simple returns

// But generally prefer braces for clarity
if (isValid) {
  return true;  // ✅ Preferred
}
```

---

### 4. TypeScript Specifics

#### Type Annotations
```typescript
// Explicit types for public APIs
public calculateDamage(attacker: Monster, defender: Monster): number {
  // Implementation
}

// Type inference OK for local variables
const damage = attacker.attack - defender.defense;  // ✅ Inferred as number

// Prefer interfaces over type aliases for objects
interface Monster {  // ✅ Preferred
  name: string;
  hp: number;
}

type Monster = {     // ✅ Also OK
  name: string;
  hp: number;
};
```

#### Avoid `any`
```typescript
// ❌ Bad
function process(data: any) { }

// ✅ Good: Use specific types
function process(data: Monster) { }

// ✅ Good: Use generics
function process<T>(data: T) { }

// ✅ Good: Use unknown for truly unknown types
function process(data: unknown) {
  if (typeof data === 'string') {
    // Type narrowing
  }
}
```

#### Null Safety
```typescript
// Use optional chaining
const hp = monster?.stats?.hp ?? 0;

// Use nullish coalescing
const name = monster.name ?? 'Unknown';

// Prefer null over undefined for intentional absence
let selectedMonster: Monster | null = null;  // ✅
let selectedMonster: Monster | undefined;    // ❌ (unless optional param)
```

---

### 5. Comments & Documentation

#### JSDoc for Public APIs
```typescript
/**
 * Calculates damage between attacker and defender based on stats and elements
 * 
 * Damage formula:
 * - Base damage = attacker.attack + skill.power
 * - Apply element advantage multiplier (0.5x, 1.0x, or 1.5x)
 * - Subtract defender.defense / 2
 * - Minimum damage is always 1
 * 
 * @param attacker - The monster performing the attack
 * @param defender - The monster being attacked
 * @param skill - Optional skill being used (adds power to base damage)
 * @returns Object containing final damage, advantage multiplier, and critical hit status
 * 
 * @example
 * ```typescript
 * const result = calculateDamage(dragonMonster, tigerMonster, fireSkill);
 * console.log(`Dealt ${result.damage} damage!`);
 * ```
 */
export function calculateDamage(
  attacker: Monster,
  defender: Monster,
  skill?: Skill
): DamageResult {
  // Implementation
}
```

#### Inline Comments
```typescript
// ✅ Good: Explain WHY, not WHAT
// Multiply by 1.5 because Ngũ Hành advantage is 50% bonus
damage *= 1.5;

// ❌ Bad: Obvious comment
// Set damage to damage times 1.5
damage *= 1.5;

// ✅ Good: Clarify complex logic
// Check evolution prerequisites: level must be tier * 10 and evolveTo must exist
if (monster.level >= monster.tier * 10 && monster.evolveTo) {
  evolveMonster(monster);
}
```

#### TODO Comments
```typescript
// TODO(author): Description of what needs to be done
// TODO(john): Add animation for critical hits

// FIXME: Description of bug
// FIXME: Capture rate calculation incorrect for legendary monsters

// NOTE: Important information
// NOTE: This function is called 60 times per second, keep it optimized
```

---

### 6. Functions

#### Function Size
- **Target: < 30 lines**
- **Max: 50 lines** (refactor if exceeded)
- One function = one responsibility

```typescript
// ❌ Too long, does too much
function handleBattle() {
  // 100 lines of battle logic
}

// ✅ Broken into smaller functions
function handleBattle() {
  initializeBattle();
  while (!isBattleOver()) {
    executeTurn();
  }
  showBattleResult();
}
```

#### Parameters
- **Max 4 parameters** (use options object if more needed)
- Required params first, optional params last

```typescript
// ❌ Too many parameters
function createMonster(name, hp, attack, defense, speed, magic, element, tier) { }

// ✅ Use options object
interface MonsterOptions {
  name: string;
  stats: Stats;
  element: Element;
  tier: number;
}

function createMonster(options: MonsterOptions): Monster { }
```

#### Return Early
```typescript
// ✅ Good: Early returns reduce nesting
function getMonster(id: string): Monster | null {
  if (!id) return null;
  if (!database.has(id)) return null;
  
  return database.get(id);
}

// ❌ Bad: Unnecessary nesting
function getMonster(id: string): Monster | null {
  if (id) {
    if (database.has(id)) {
      return database.get(id);
    } else {
      return null;
    }
  } else {
    return null;
  }
}
```

---

### 7. Classes

#### Class Structure Order
```typescript
class Monster {
  // 1. Static properties
  static readonly MAX_LEVEL = 100;
  
  // 2. Instance properties (public, then private)
  public id: string;
  public name: string;
  private _hp: number;
  
  // 3. Constructor
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this._hp = 100;
  }
  
  // 4. Getters and setters
  get hp(): number {
    return this._hp;
  }
  
  set hp(value: number) {
    this._hp = Math.max(0, value);
  }
  
  // 5. Public methods
  public attack(target: Monster): number {
    // Implementation
  }
  
  // 6. Private methods
  private calculateBaseDamage(): number {
    // Implementation
  }
}
```

#### Composition over Inheritance
```typescript
// ❌ Deep inheritance hierarchies
class Monster extends Creature extends Entity extends GameObject { }

// ✅ Composition with systems
class Monster {
  constructor(
    private stats: StatsComponent,
    private position: PositionComponent,
    private renderer: RenderComponent
  ) { }
}
```

---

### 8. Error Handling

#### Try-Catch for External Operations
```typescript
// File I/O, network requests, JSON parsing
async function loadMonster(id: string): Promise<Monster> {
  try {
    const response = await fetch(`/monsters/${id}.json`);
    const data = await response.json();
    return parseMonster(data);
  } catch (error) {
    console.error(`Failed to load monster ${id}:`, error);
    throw new Error(`Monster ${id} not found`);
  }
}
```

#### Validation
```typescript
// Validate inputs early
function setHP(monster: Monster, hp: number): void {
  if (hp < 0) {
    throw new Error('HP cannot be negative');
  }
  if (hp > monster.maxHP) {
    throw new Error(`HP cannot exceed maximum (${monster.maxHP})`);
  }
  monster.hp = hp;
}
```

---

### 9. Imports & Exports

#### Import Organization
```typescript
// 1. External libraries
import * as PIXI from 'pixi.js';
import * as dragonBones from 'dragonbones.js';

// 2. Internal modules (absolute paths with @/)
import { BattleSystem } from '@/systems/BattleSystem';
import { Monster } from '@/types/Monster';

// 3. Relative imports (if necessary)
import { calculateDamage } from './utils';

// 4. Type-only imports
import type { Scene } from '@/scenes/Scene';
```

#### Exports
```typescript
// Named exports (preferred)
export class BattleSystem { }
export function calculateDamage() { }

// Default export (use sparingly, only for main class)
export default class Game { }

// Barrel exports (index.ts)
export { BattleSystem } from './BattleSystem';
export { CaptureSystem } from './CaptureSystem';
export { MapSystem } from './MapSystem';
```

---

### 10. Testing

#### Test File Naming
- `Component.test.ts` or `Component.spec.ts`
- Same name as source file

#### Test Structure
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { BattleSystem } from './BattleSystem';

describe('BattleSystem', () => {
  let battleSystem: BattleSystem;
  
  beforeEach(() => {
    battleSystem = new BattleSystem();
  });
  
  describe('calculateDamage', () => {
    it('should calculate base damage correctly', () => {
      const result = battleSystem.calculateDamage(attacker, defender);
      expect(result.damage).toBe(15);
    });
    
    it('should apply element advantage', () => {
      const result = battleSystem.calculateDamage(kimMonster, mocMonster);
      expect(result.advantage).toBe(1.5);
    });
    
    it('should have minimum damage of 1', () => {
      const result = battleSystem.calculateDamage(weakMonster, strongMonster);
      expect(result.damage).toBeGreaterThanOrEqual(1);
    });
  });
});
```

---

### 11. Performance

#### Avoid Premature Optimization
- Write clean, readable code first
- Profile before optimizing
- Optimize only hot paths (called 60+ times/second)

#### Good Practices
```typescript
// ✅ Cache expensive calculations
private cachedDamage: Map<string, number> = new Map();

function getDamage(attacker: Monster, defender: Monster): number {
  const key = `${attacker.id}-${defender.id}`;
  if (this.cachedDamage.has(key)) {
    return this.cachedDamage.get(key)!;
  }
  
  const damage = this.calculateDamage(attacker, defender);
  this.cachedDamage.set(key, damage);
  return damage;
}

// ✅ Reuse objects instead of creating new ones
const tempVector = new PIXI.Point();

function updatePosition(x: number, y: number) {
  tempVector.set(x, y);  // Reuse
  // vs
  const newVector = new PIXI.Point(x, y);  // Creates garbage
}

// ✅ Use const for arrays/objects that won't be reassigned
const monsters = [];  // ✅
let monsters = [];    // ❌ (if not reassigned)
```

---

### 12. Git Commit Messages

#### Format
```
type(scope): subject

body

footer
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactor (no behavior change)
- `test`: Add/update tests
- `chore`: Build, dependencies, etc.

#### Examples
```
feat(battle): add critical hit system

Implemented 10% chance for critical hits that deal 2x damage.
Updated damage calculation formula to check for crits.

Closes #42

---

fix(capture): correct capture rate for legendary monsters

Legendary monsters had 100% capture rate due to inverted logic.
Fixed calculation to properly scale with HP and player level.

Fixes #38

---

docs(readme): update installation instructions

Added TypeScript setup steps and testing commands.

---

refactor(core): migrate Game.js to TypeScript

Converted Game.js to Game.ts with full type annotations.
No functional changes, only type safety improvements.
```

---

## 📏 Linting & Formatting Tools

### Recommended Tools
```bash
# Install (will be added to project)
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### ESLint Rules (Future)
- TypeScript strict rules
- No unused variables
- No console.log in production
- Consistent return types

### Prettier Config (Future)
- Single quotes
- 2 space indent
- Trailing commas
- 100 char line width

---

## 🎯 Summary Checklist

Before committing code, check:
- [ ] TypeScript compiles without errors
- [ ] Tests pass (`npm run test`)
- [ ] Code formatted with Prettier
- [ ] ESLint shows no errors
- [ ] JSDoc added for public APIs
- [ ] Complex logic has comments
- [ ] Functions are < 50 lines
- [ ] Classes follow structure order
- [ ] Imports organized correctly
- [ ] Build succeeds (`npm run build`)

---

**Last Updated**: 2025-10-16  
**Status**: Living document - will evolve as codebase matures
