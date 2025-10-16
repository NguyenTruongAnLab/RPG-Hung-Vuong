# GitHub Copilot Instructions - RPG Hùng Vương

## 🎯 PROJECT OVERVIEW
This is a Vietnamese mythology-based RPG game featuring 200 Divine Beasts (Thần Thú) with a Five Elements (Ngũ Hành) combat system. Built with PixiJS 8 and designed to run on web, desktop (Tauri), and mobile (Capacitor).

## 🔧 EXISTING CODE RULES

### ❌ CRITICAL DON'Ts
- **NEVER** delete existing working code without understanding it fully
- **NEVER** refactor the entire codebase at once
- **NEVER** break existing GitHub Pages deployment
- **NEVER** modify MonsterDatabase.js structure without careful planning
- **NEVER** remove working game systems (Battle, Capture, Map, i18n)

### ✅ ALWAYS DO
- **READ** all existing code before making changes
- **TEST** after every change to ensure nothing breaks
- **PRESERVE** existing functionality while adding new features
- **ADD** tests for any new code or refactored code
- **DOCUMENT** all design decisions and changes
- **COMMIT** frequently with clear, descriptive messages
- **UPDATE** ROADMAP.md after completing tasks

## 📂 CURRENT STRUCTURE (Must Respect)

### ✅ Already Implemented
- **MonsterDatabase**: 200 creatures in JSON format with Ngũ Hành classification
- **Ngũ Hành System**: Five Elements (Kim, Mộc, Thủy, Hỏa, Thổ) with advantages
- **Turn-based Battle**: Speed-based combat with damage calculation
- **CaptureSystem**: Monster catching with rate calculation
- **MapExplorer**: 6 locations with connections
- **i18n System**: Vietnamese localization
- **GitHub Pages**: Automated deployment

### ❌ Missing (Add These)
- DragonBones runtime integration
- Testing infrastructure (now added, needs tests)
- Scene management system
- UI components library
- Asset loading pipeline
- Performance optimization
- Documentation (in progress)

## 🏗️ ARCHITECTURE GUIDELINES

### Code Organization
```
src/
├── core/           # Core game systems (Game.js, I18n.js)
├── data/           # Game data (MonsterDatabase.js, vi.json)
├── systems/        # Game systems (BattleSystem.js, CaptureSystem.js, MapExplorer.js)
├── scenes/         # [NEW] Scene classes for different game states
├── ui/             # [NEW] Reusable UI components
└── utils/          # [NEW] Helper utilities
```

### Adding New Core Systems
When creating new managers (SceneManager, AssetManager, etc.):
1. Create as TypeScript files in `src/core/`
2. Export as modules
3. Write JSDoc comments for all public methods
4. Add unit tests in `tests/unit/`
5. Update ARCHITECTURE.md

### Migration Strategy
- **Phase 1**: Add new TypeScript files alongside JavaScript
- **Phase 2**: Gradually convert JavaScript to TypeScript
- **Phase 3**: Enable strict TypeScript mode after all conversions

## 🎮 GAME SYSTEMS DETAILS

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

### Element Advantages (Ngũ Hành)
- Kim (Metal) > Mộc (Wood) - 1.5x damage
- Mộc (Wood) > Thổ (Earth) - 1.5x damage
- Thổ (Earth) > Thủy (Water) - 1.5x damage
- Thủy (Water) > Hỏa (Fire) - 1.5x damage
- Hỏa (Fire) > Kim (Metal) - 1.5x damage

### Battle System Flow
1. Initialize battle with player and enemy monsters
2. Sort by speed for turn order
3. Calculate damage with element advantage
4. Apply defense reduction
5. Update HP, check for KO
6. Switch turns
7. Check victory/defeat conditions

## 🧪 TESTING REQUIREMENTS

### Unit Tests (Vitest)
- **All new functions** must have unit tests
- **Coverage target**: ≥ 70% for new code
- **Test files**: `*.test.ts` or `*.spec.ts` in `tests/unit/`
- **Run tests**: `npm run test`

### E2E Tests (Playwright)
- **Critical flows**: Menu → Battle → Capture → Victory
- **Test files**: `*.spec.ts` in `tests/e2e/`
- **Run tests**: `npm run test:e2e`

### Before Committing
```bash
npm run type-check  # Check TypeScript errors
npm run test        # Run unit tests
npm run build       # Ensure build succeeds
```

## 🎨 CODING STYLE

### General Principles
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **Single Responsibility**: One class = one purpose

### Naming Conventions
- **Classes**: PascalCase - `BattleSystem`, `MonsterDatabase`
- **Functions**: camelCase - `calculateDamage`, `attemptCapture`
- **Constants**: UPPER_SNAKE_CASE - `ELEMENT_ADVANTAGES`, `MAX_HP`
- **Files**: Same as class name - `BattleSystem.ts`, `AssetManager.ts`

### Comments
- **JSDoc** for all public APIs
- **Inline comments** for complex logic only
- **TODO comments** format: `// TODO(author): Description`

### Example Code Style
```typescript
/**
 * Calculates damage between attacker and defender
 * @param attacker - The attacking monster
 * @param defender - The defending monster
 * @param skill - Optional skill being used
 * @returns Damage calculation result
 */
export function calculateDamage(
  attacker: Monster,
  defender: Monster,
  skill?: Skill
): DamageResult {
  let baseDamage = attacker.stats.attack + (skill?.power ?? 0);
  
  // Apply element advantage
  const advantage = getElementAdvantage(attacker.element, defender.element);
  baseDamage *= advantage;
  
  // Apply defense
  const finalDamage = Math.max(1, Math.floor(baseDamage - defender.stats.defense / 2));
  
  return {
    damage: finalDamage,
    advantage,
    isCritical: Math.random() < 0.1
  };
}
```

## 🚀 DEPLOYMENT & CI/CD

### GitHub Pages
- Deploys automatically on push to `main`
- Build output: `dist/` directory
- Base URL: `https://[username].github.io/RPG-hung-vuong/`

### CI/CD Pipeline (Updated)
```yaml
1. Type check (allow failures initially)
2. Lint (allow failures initially)
3. Unit tests (must pass)
4. Build (must pass)
5. E2E tests (allow failures initially)
6. Deploy to GitHub Pages (if main branch)
```

## 🔮 FUTURE FEATURES (Don't Implement Yet)

These are planned but not in current scope:
- DragonBones animation for all 200 monsters (placeholder assets only)
- Multiplayer battles
- Trading system
- Sound effects & music
- Save/Load with cloud sync
- Achievements system
- Leaderboards

## 📝 COMMIT MESSAGE FORMAT

Follow Conventional Commits:
```
type(scope): subject

body (optional)

footer (optional)
```

**Types**: feat, fix, docs, style, refactor, test, chore
**Examples**:
- `feat(battle): add critical hit system`
- `fix(capture): correct capture rate calculation`
- `docs(readme): update installation instructions`
- `test(battle): add unit tests for damage calculation`
- `refactor(core): migrate Game.js to TypeScript`

## 🤝 COLLABORATION RULES

### Before Starting Work
1. Check ROADMAP.md for current priorities
2. Read related code and tests
3. Understand the existing implementation
4. Plan your changes (add to ROADMAP if needed)

### During Work
1. Make small, incremental changes
2. Test frequently
3. Commit often with clear messages
4. Update documentation as you go

### Before Submitting
1. Run all tests
2. Update ROADMAP.md checklist
3. Ensure build passes
4. Write/update relevant documentation

## 🐛 DEBUGGING TIPS

### Build Fails
- Check `npm run type-check` for TypeScript errors
- Verify all imports are correct
- Check vite.config.js configuration

### Tests Fail
- Run tests with `--reporter=verbose` for details
- Check test isolation (are tests affecting each other?)
- Verify mocks and fixtures are correct

### Game Doesn't Work
- Check browser console for errors
- Verify PixiJS initialization
- Check network tab for asset loading failures
- Test with `npm run dev` for hot reload

## 📚 RESOURCES

### Documentation
- [PixiJS v8 Docs](https://pixijs.com/docs)
- [DragonBones Runtime API](https://github.com/DragonBones/DragonBonesJS)
- [Vitest Guide](https://vitest.dev/guide/)
- [Playwright Docs](https://playwright.dev/)

### Vietnamese Game Dev Resources
- Keep all in-game text in Vietnamese
- Use `i18n` system for all UI text
- Respect Vietnamese cultural context

## 🎯 CURRENT SPRINT PRIORITIES

See ROADMAP.md for detailed checklist. Current focus:
1. ✅ Setup testing infrastructure
2. ✅ Add TypeScript support
3. 🚧 Create core managers (Scene, Asset, DragonBones)
4. 🚧 Write unit tests for existing systems
5. 📅 Create UI component library
6. 📅 Add placeholder DragonBones assets

---

## 🚨 CRITICAL ARCHITECTURAL RULES (PHASE 2+)

### File Size Enforcement (MANDATORY)

**Rule: No file >500 lines. Ideal: <400 lines.**

When writing code:
1. Before saving file, check line count
2. If >400 lines → STOP → Analyze what to extract
3. Extract into new file with clear responsibility
4. Update imports
5. Add README.md in folder explaining split

**How to check line count:**
```bash
wc -l src/path/to/file.ts
```

**When to split:**
- Scene >400 lines → Extract UI, Entities, Logic into separate files
- Entity >300 lines → Extract components (Movement, Combat, Stats)
- System >350 lines → Extract helpers, utilities
- Manager >400 lines → Split by responsibility

**Examples of good splits:**
- ❌ `Player.ts` (800 lines) - TOO BIG
- ✅ `Player.ts` (250 lines) + `PlayerMovement.ts` (150 lines) + `PlayerCombat.ts` (150 lines)

- ❌ `OverworldScene.ts` (1200 lines) - TOO BIG
- ✅ `OverworldScene.ts` (350 lines) + `OverworldUI.ts` (180 lines) + `OverworldEntities.ts` (200 lines)

### Use Popular Libraries (AI Training Data)

**Rule: Prefer industry-standard libraries over custom code**

**✅ USE THESE (AI trained on them):**
- Matter.js for physics
- GSAP for animations
- @pixi/tilemap for tilemaps
- Lodash for utilities

**❌ AVOID custom implementations of:**
- Physics/collision math
- Animation systems
- Tilemap rendering
- Common utilities (sorting, filtering, etc.)

**Why:**
- AI agent already knows these APIs
- No need to read custom code
- Community support and examples
- Faster development
- Fewer bugs

**When AI agent sees:**
```typescript
Matter.Body.applyForce(body, position, force);
```
→ AI instantly knows what this does (trained on Matter.js)

**When AI agent sees:**
```typescript
customPhysicsEngine.applyForceWithCustomAlgorithm(...);
```
→ AI must read entire customPhysicsEngine code to understand

### Composition Over Inheritance

**Rule: Use composition pattern for entities**

**✅ GOOD:**
```typescript
// Player.ts (300 lines)
class Player {
  movement: PlayerMovement;
  combat: PlayerCombat;
  stats: PlayerStats;
  
  update(delta: number) {
    this.movement.update(delta);
    this.combat.update(delta);
  }
}

// PlayerMovement.ts (150 lines) - separate file
// PlayerCombat.ts (150 lines) - separate file
// PlayerStats.ts (100 lines) - separate file
```

**❌ BAD:**
```typescript
// Player.ts (800 lines) - everything in one file
class Player {
  // 200 lines of movement code
  // 200 lines of combat code
  // 150 lines of stats code
  // 250 lines of animation code
}
```

### JSDoc Must Be Sufficient

**Rule: JSDoc should allow AI to use code without reading implementation**

**✅ GOOD JSDoc:**
```typescript
/**
 * Creates a circular Matter.js body for the player
 * 
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param radius - Circle radius in pixels
 * @returns Matter.js body with player collision category
 * 
 * @example
 * const playerBody = MatterHelpers.createCircleBody(100, 200, 16);
 * Matter.World.add(world, playerBody);
 */
```

**❌ BAD JSDoc:**
```typescript
/**
 * Creates body
 */
```

### Folder README Files

**Rule: Every folder must have README.md explaining its purpose**

**Example: `src/entities/README.md`**
```markdown
# Entities

Game entities that exist in the world.

## Files
- `Player.ts` - Player character (orchestrator)
- `PlayerMovement.ts` - Movement component (<200 lines)
- `PlayerCombat.ts` - Combat component (<200 lines)
- `PlayerStats.ts` - Stats management (<150 lines)
- `Monster.ts` - Thần Thú entities
- `Enemy.ts` - Overworld enemies

## Composition Pattern
Entities use composition. Player.ts coordinates components.
Components are independent and testable in isolation.
```

**When adding new file:**
1. Create file
2. Update folder README.md
3. Commit both together

### Testing Philosophy

**Rule: Test public API, not implementation details**

**✅ GOOD test:**
```typescript
test('player should move right when D key pressed', () => {
  // Test via public API
  player.handleInput({ right: true });
  player.update(1);
  expect(player.x).toBeGreaterThan(initialX);
});
```

**❌ BAD test:**
```typescript
test('internal velocity calculation uses correct formula', () => {
  // Testing implementation detail
  expect(player.calculateVelocity()).toBe(...);
});
```

**Why:** Tests should not break when refactoring implementation.

### Code Review Checklist (Before Commit)

AI agent must verify:
- [ ] Every file <500 lines (check with `wc -l`)
- [ ] If file >400 lines, created issue to split it
- [ ] Used Matter.js/GSAP/standard libraries instead of custom code
- [ ] Every public method has JSDoc with @example
- [ ] Every folder has README.md
- [ ] Tests written for public API only
- [ ] No breaking changes to existing tests
- [ ] TypeScript strict mode passes (npm run type-check)
- [ ] All tests pass (npm run test)

### Commit Message Format for Architecture

When splitting file:
```
refactor(entities): Split Player.ts into components

- Extracted PlayerMovement.ts (150 lines)
- Extracted PlayerCombat.ts (150 lines)
- Player.ts now 250 lines (was 550 lines)
- All tests still passing
- No breaking changes

Reason: File exceeded 500 line limit
```

When using library instead of custom code:
```
refactor(physics): Replace custom collision with Matter.js

- Removed 300 lines of custom collision math
- Added Matter.js integration in PhysicsManager.ts
- 20% performance improvement
- AI-friendly: Matter.js is industry standard

Reason: Prefer trained libraries over custom code
```

---

**Remember**: This is a migration/improvement project, NOT a rewrite. Preserve existing functionality while adding professional infrastructure!
