# Testing Guide - Automated Testing Only

**All tests must run without user intervention.**

---

## 🎯 Testing Philosophy

### Test Public API, Not Implementation

Tests should verify **behavior**, not implementation details. This allows refactoring without breaking tests.

✅ **GOOD Test - Tests behavior:**
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

❌ **BAD Test - Tests implementation:**
```typescript
test('internal velocity calculation', () => {
  // Don't test private methods or implementation
  expect(player._calculateInternalVelocity()).toBe(5);
});
```

**Why**: If you refactor `_calculateInternalVelocity`, the good test still passes, but the bad test breaks.

---

## 🧪 Unit Tests (Vitest)

### Requirements
- **All new functions** must have unit tests
- **Coverage target**: ≥70% for new code
- **Test files**: `*.test.ts` or `*.spec.ts` in `tests/unit/`
- **Location**: Mirror source structure

### Commands
```bash
# Run all tests
npm run test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific file
npm run test PhysicsManager
```

### Test Structure
```typescript
// tests/unit/systems/BattleSystem.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BattleSystem } from '../../../src/systems/BattleSystem';

describe('BattleSystem', () => {
  let battleSystem: BattleSystem;
  
  beforeEach(() => {
    // Setup before each test
    battleSystem = new BattleSystem();
  });
  
  describe('calculateDamage', () => {
    it('should apply element advantage correctly', () => {
      const kimMonster = createMonster({ element: 'kim', attack: 50 });
      const mocMonster = createMonster({ element: 'moc', defense: 10 });
      
      const damage = battleSystem.calculateDamage(kimMonster, mocMonster);
      
      // Kim > Moc = 1.5x advantage
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

### Minimum Test Count by File Size
- **<150 lines**: 5-8 tests minimum
- **150-250 lines**: 10-15 tests minimum
- **250-350 lines**: 15-20 tests minimum
- **350-500 lines**: 20-30 tests minimum

### Test Organization
```
tests/
└── unit/
    ├── core/
    │   ├── PhysicsManager.test.ts
    │   ├── InputManager.test.ts
    │   └── EventBus.test.ts
    ├── systems/
    │   ├── BattleSystem.test.ts
    │   └── CollisionSystem.test.ts
    ├── entities/
    │   └── Player.test.ts
    └── utils/
        └── MatterHelpers.test.ts
```

---

## 🌐 E2E Tests (Playwright)

### Critical Flows to Test
- Menu → Battle → Capture → Victory
- Overworld exploration → Random encounter
- NPC interaction
- Map navigation
- Save/Load (future)

### Commands
```bash
# Run E2E tests (headless)
npm run test:e2e

# Run with browser visible (debug)
npx playwright test --headed

# Run specific test
npx playwright test battle-flow

# Generate test
npx playwright codegen http://localhost:5173
```

### E2E Test Example
```typescript
// tests/e2e/battle-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete battle flow', async ({ page }) => {
  // Navigate to game
  await page.goto('/');
  
  // Start game
  await page.click('text=Bắt đầu');
  
  // Navigate to exploration
  await page.click('text=Khám phá');
  
  // Select location
  await page.click('text=Rừng Cổ Thụ');
  
  // Battle should start
  await expect(page.locator('.battle-scene')).toBeVisible();
  
  // Attack enemy
  await page.click('text=Tấn công');
  
  // Battle log should show damage
  await expect(page.locator('.battle-log')).toContainText('gây');
});
```

### E2E Test Rules
- **Must run headless** (no manual clicking)
- **Must be deterministic** (same result every time)
- **Should be fast** (<30 seconds per test)
- **Should test user flows**, not implementation

---

## ✅ Pre-commit Checklist

**Before committing any code:**

### 1. Type Check
```bash
npm run type-check
# Should show 0 errors (warnings OK for now)
```

### 2. Run Unit Tests
```bash
npm run test
# All tests must pass
```

### 3. Build Succeeds
```bash
npm run build
# Should complete without errors
```

### 4. Check File Sizes
```bash
find src -name "*.ts" -exec wc -l {} + | awk '$1 > 500 {print $2, $1}'
# Should output nothing (0 files >500 lines)
```

### 5. Check Coverage (if adding new code)
```bash
npm run test:coverage
# New code should have ≥70% coverage
```

### Complete Pre-commit Checklist
- [ ] All tests passing (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] No files >500 lines
- [ ] New code has tests (≥70% coverage)
- [ ] JSDoc added for public methods
- [ ] Folder README.md updated (if new files added)
- [ ] Updated 06-CURRENT-STATE.md
- [ ] Updated 07-ROADMAP.md

---

## 🚫 What NOT to Do

### Forbidden in Tests

❌ **Tests requiring user approval**
```typescript
// BAD: Waits for user to click
test('user clicks button', async () => {
  prompt('Please click the button');
  // This won't work in CI/CD
});
```

❌ **Tests with test.skip()**
```typescript
// BAD: Skipped tests hide problems
test.skip('broken test', () => {
  // Fix the test instead of skipping!
});
```

❌ **Tests depending on external services**
```typescript
// BAD: External API may be down
test('fetch from API', async () => {
  const data = await fetch('https://api.example.com');
  // Use mocks instead
});
```

❌ **Tests with hardcoded delays**
```typescript
// BAD: Arbitrary timeout
test('animation completes', async () => {
  startAnimation();
  await sleep(1000); // Fragile!
  // Use proper async/await patterns
});
```

---

## 📊 Current Test Status

**Unit Tests**: 122 passing  
**E2E Tests**: 0 (not yet implemented)  
**Coverage**: ~85%  
**Test Files**: 7

**Files with tests**:
- ✅ InputManager.test.ts (20 tests)
- ✅ BattleSystem.test.ts (16 tests)
- ✅ CaptureSystem.test.ts (22 tests)
- ✅ PhysicsManager.test.ts (14 tests)
- ✅ EventBus.test.ts (15 tests)
- ✅ Player.test.ts (17 tests)
- ✅ Vector2D.test.ts (18 tests)

**Files needing tests**:
- [ ] CollisionSystem.ts
- [ ] Camera.ts
- [ ] OverworldScene.ts
- [ ] All src/world/ files

---

## 🎓 Writing Good Tests

### 1. Use Descriptive Names
```typescript
// ✅ GOOD
it('should apply 1.5x damage when Kim attacks Moc')

// ❌ BAD
it('test damage')
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should calculate correct damage', () => {
  // Arrange: Setup test data
  const attacker = createMonster({ attack: 50 });
  const defender = createMonster({ defense: 10 });
  
  // Act: Execute the function
  const damage = calculateDamage(attacker, defender);
  
  // Assert: Verify the result
  expect(damage).toBe(45);
});
```

### 3. Test Edge Cases
```typescript
describe('calculateDamage', () => {
  it('should handle normal case');
  it('should enforce minimum 1 damage');
  it('should handle 0 defense');
  it('should handle undefined skill');
  it('should handle critical hit');
});
```

### 4. Use beforeEach for Setup
```typescript
describe('BattleSystem', () => {
  let system: BattleSystem;
  
  beforeEach(() => {
    system = new BattleSystem();
  });
  
  // Tests use 'system' without recreating
});
```

---

**Last Updated**: 2025-10-17  
**Version**: 1.0.0
