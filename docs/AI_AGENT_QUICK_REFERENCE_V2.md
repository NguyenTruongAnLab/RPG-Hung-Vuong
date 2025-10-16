# AI Agent Quick Reference - RPG Hùng Vương

> **⚡ Quick lookup for AI agents working on the project**

---

## 🚨 THE THREE LAWS (NEVER VIOLATE)

### 1. 500-Line Law
```bash
# Check before EVERY commit:
wc -l filename.ts

# If >400 → Plan extraction
# If ≥500 → STOP and split NOW
```

### 2. Use Popular Libraries
- ✅ Matter.js for physics
- ✅ GSAP for animations  
- ✅ @pixi/tilemap for tilemaps
- ❌ NO custom implementations

### 3. Extreme Modularity
- Composition over inheritance
- Components for entities
- One responsibility per file
- Every folder has README.md

---

## 📋 Pre-Commit Checklist

**Run these BEFORE every commit:**
```bash
# 1. Type check
npm run type-check

# 2. Tests
npm run test

# 3. Build
npm run build

# 4. File sizes
find src -name "*.ts" -exec wc -l {} + | awk '$1 > 500 {print $2, $1}'
# Should output nothing!
```

---

## 🎯 File Size Limits

| Type | Max Lines | Target |
|------|-----------|--------|
| Utils | 200 | <150 |
| Components | 200 | <180 |
| Entities | 300 | <250 |
| Systems | 350 | <300 |
| Managers | 400 | <350 |
| Scenes | 400 | <350 |

---

## 📂 Directory Structure

```
src/
├── core/         # Managers (<400 lines)
├── systems/      # Game systems (<350 lines)
├── entities/     # Player, Monster (<300 lines)
│   └── components/  # PlayerMovement, etc (<200 lines)
├── world/        # Tilemap, Camera (<350 lines)
├── scenes/       # OverworldScene, BattleScene (<400 lines)
├── ui/           # Button, HealthBar (<200 lines)
├── data/         # JSON data files
└── utils/        # Pure functions (<200 lines)
```

---

## 🛠️ Phase 2 Libraries

**Install these for Pokemon-style overworld:**
```bash
npm install matter-js @types/matter-js
npm install gsap
npm install @pixi/tilemap
npm install lodash @types/lodash
```

---

## 💻 Code Patterns

### Component Composition (ALWAYS USE)
```typescript
// ✅ GOOD: Player.ts (~280 lines)
export class Player {
  movement: PlayerMovement;  // <200 lines
  combat: PlayerCombat;      // <200 lines
  stats: PlayerStats;        // <150 lines
  
  update(delta: number) {
    this.movement.update(delta);
    this.combat.update(delta);
  }
}

// ❌ BAD: Everything in one file (800+ lines)
```

### JSDoc (REQUIRED)
```typescript
/**
 * Description of function
 * 
 * @param param1 - What it is
 * @returns What it returns
 * 
 * @example
 * // Show how to use it
 * doSomething(value);
 */
```

---

## 🧪 Testing Rules

### Test Public API, NOT Implementation
```typescript
// ✅ GOOD
test('player moves right when D pressed', () => {
  player.handleInput({ right: true });
  player.update(16);
  expect(player.x).toBeGreaterThan(0);
});

// ❌ BAD
test('internal velocity calculation', () => {
  expect(player._calculateVelocity()).toBe(5);
});
```

### Minimum Tests by File Size
- <150 lines: 5-8 tests
- 150-250 lines: 10-15 tests
- 250-350 lines: 15-20 tests
- 350-500 lines: 20-30 tests

---

## 📝 Commit Format

```
type(scope): subject

body

footer
```

**Types**: feat, fix, docs, style, refactor, test, chore, perf

**Examples**:
```
feat(overworld): add player movement with Matter.js

- Implemented PlayerMovement component (180 lines)
- Uses Matter.js Body.applyForce for physics
- WASD and arrow key support
- Tests: 12 unit tests added

Closes #23
```

---

## 🔍 Quick Debugging

### Build Fails
```bash
npm run type-check  # Check TypeScript
npm run build -- --debug  # Vite debug mode
```

### Tests Fail
```bash
npm run test -- --reporter=verbose
npm run test -- BattleSystem.test.ts  # Single file
```

### Game Issues
- F12 → Console for errors
- Network tab → Asset loading
- `npm run dev` → Hot reload

---

## 📚 Essential Docs

1. **`.github/copilot-instructions.md`** - Full guide (1,581 lines)
2. **`docs/PHASE2_IMPLEMENTATION_GUIDE.md`** - Step-by-step Phase 2
3. **`docs/ROADMAP.md`** - Development tasks
4. **Folder README.md** - Architecture for each folder

---

## ✅ Task Completion Checklist

**Before marking ANY task complete:**
- [ ] File <500 lines (`wc -l filename.ts`)
- [ ] Used popular library if applicable
- [ ] Composition pattern for entities
- [ ] JSDoc with @example
- [ ] Tests written (≥70% coverage)
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Folder README.md updated
- [ ] ROADMAP.md updated
- [ ] Conventional commit message

---

## 🎮 Game Architecture

```
OVERWORLD (Real-time, Matter.js)
    ↓ Random encounter
BATTLE (Turn-based, Ngũ Hành)
    ↓ Victory
OVERWORLD (Continue exploring)
```

**Overworld**: WASD movement, Matter.js physics, @pixi/tilemap
**Battle**: Turn-based, speed order, element advantages

---

## 🔗 Quick Links

- [Matter.js Docs](https://brm.io/matter-js/docs/)
- [GSAP Docs](https://greensock.com/docs/)
- [PixiJS v8 Docs](https://pixijs.com/docs)
- [@pixi/tilemap](https://github.com/pixijs/tilemap)
- [Vitest](https://vitest.dev/guide/)

---

**Last Updated**: 2025-10-16
**Keep This Handy**: Bookmark for quick reference during development!
