# Roadmap - RPG Hùng Vương

## Project Vision
Transform RPG Hùng Vương from a working prototype into a professional, maintainable, and scalable game development foundation while preserving all existing functionality.

---

## ✅ Phase 0: Foundation (Completed)

### Initial Setup
- [x] Basic project structure with Vite
- [x] PixiJS 8 integration
- [x] MonsterDatabase with 200 creatures
- [x] Ngũ Hành (Five Elements) system
- [x] Turn-based battle system
- [x] Monster capture mechanics
- [x] Map exploration (6 locations)
- [x] Vietnamese i18n system
- [x] GitHub Pages deployment

**Status**: ✅ Complete - Game is playable  
**Duration**: Initial development  
**Deliverable**: Working prototype deployed to GitHub Pages

---

## 🚧 Phase 1: Critical Fixes & Foundation (Current - Week 1)

### Goal
Add professional development infrastructure without breaking existing functionality.

### 1.1 Testing Infrastructure ✅
- [x] Install Vitest for unit testing
- [x] Install Playwright for E2E testing
- [x] Create `vitest.config.ts`
- [x] Create `playwright.config.ts`
- [x] Add test scripts to package.json
- [ ] Create test directories (`tests/unit/`, `tests/e2e/`)
- [ ] Write first unit test (ElementSystem)
- [ ] Write first E2E test (basic flow)

### 1.2 TypeScript Support ✅
- [x] Install TypeScript
- [x] Create `tsconfig.json` (non-strict initially)
- [x] Add type-check script
- [ ] Install type definitions for dependencies
- [ ] Create `src/types/` directory
- [ ] Define core interfaces (Monster, Battle, Scene)

### 1.3 DragonBones Integration ✅
- [x] Install `dragonbones.js`
- [ ] Create `src/core/DragonBonesManager.ts`
- [ ] Test with placeholder asset
- [ ] Document integration approach

### 1.4 Documentation ✅
- [x] Create `.github/copilot-instructions.md`
- [x] Create `ARCHITECTURE.md`
- [x] Create `ROADMAP.md` (this file)
- [ ] Create `CODING_STYLE.md`
- [ ] Update README.md with new structure

### 1.5 CI/CD Enhancement
- [ ] Update `.github/workflows/deploy.yml`
- [ ] Add type-check step (allow failures)
- [ ] Add test step (must pass)
- [ ] Add build verification
- [ ] Ensure GitHub Pages still deploys

**Status**: 🚧 In Progress (70% complete)  
**Target Date**: End of Week 1  
**Success Criteria**:
- Tests run in CI/CD
- TypeScript compiles (even with errors)
- DragonBones installed and documented
- Comprehensive docs created
- GitHub Pages still deploys

---

## 📦 Phase 2: Pokemon-Style Overworld with Matter.js Physics (Week 2-3)

### Goal
Implement Pokemon-style overworld with Matter.js physics, following strict modular architecture and AI-friendly patterns.

### Core Philosophy
1. **Use Popular Libraries**: Matter.js, GSAP, @pixi/tilemap (AI-trained)
2. **File Size Limit**: Max 500 lines per file, target <400 lines
3. **Extreme Modularity**: One responsibility per file
4. **AI-Friendly Documentation**: Comprehensive JSDoc with examples

### 2.0 Library Installation & Documentation
- [ ] Install Phase 2 dependencies
  - [ ] `npm install matter-js @types/matter-js`
  - [ ] `npm install gsap`
  - [ ] `npm install @pixi/tilemap`
  - [ ] `npm install lodash @types/lodash` (optional)
- [x] Create `docs/LIBRARIES.md` - Rationale for library choices
- [x] Update `.github/copilot-instructions.md` - Add architectural rules
- [x] Create folder README.md files - Document responsibilities

### 2.1 Physics Integration (Matter.js)
- [ ] Create `src/core/PhysicsManager.ts` (<300 lines)
  - [ ] Initialize Matter.js Engine and World
  - [ ] Physics simulation loop (sync with PixiJS)
  - [ ] API to add/remove bodies
  - [ ] Body-to-sprite synchronization
  - [ ] JSDoc with Matter.js examples
  - [ ] Write 15 unit tests
  
- [ ] Create `src/systems/CollisionSystem.ts` (<300 lines)
  - [ ] Register collision pairs (player-wall, player-enemy)
  - [ ] Handle Matter.js collision events
  - [ ] Emit game events via EventBus
  - [ ] Collision filtering (categories, masks)
  - [ ] JSDoc with collision examples
  - [ ] Write 20 unit tests
  
- [ ] Create `src/utils/MatterHelpers.ts` (<200 lines)
  - [ ] Helper functions for common body shapes
  - [ ] Coordinate conversion (PixiJS ↔ Matter.js)
  - [ ] Sprite-body sync utilities
  - [ ] Debug rendering helpers
  - [ ] Pure functions with JSDoc
  - [ ] Write 10 unit tests

### 2.2 Input Management
- [ ] Create `src/core/InputManager.ts` (<200 lines)
  - [ ] Keyboard event listeners (WASD + Arrow keys)
  - [ ] Mouse/touch event listeners
  - [ ] Query API: isKeyPressed(), getMovementVector()
  - [ ] Singleton pattern
  - [ ] Mobile-ready touch gestures
  - [ ] Write 12 unit tests

### 2.3 Player Entity (Component Pattern)
- [ ] Create `src/entities/Player.ts` (<300 lines)
  - [ ] Orchestrate components
  - [ ] Hold Matter.js body reference
  - [ ] Update loop delegation
  - [ ] Event emission
  - [ ] Write 15 unit tests
  
- [ ] Create `src/entities/PlayerMovement.ts` (<200 lines)
  - [ ] Calculate velocity from input
  - [ ] Apply forces to Matter.js body
  - [ ] Handle facing direction
  - [ ] Walking animation states
  - [ ] Write 12 unit tests
  
- [ ] Create `src/entities/PlayerCombat.ts` (<200 lines)
  - [ ] Attack action handling
  - [ ] Create attack hitbox (sensor body)
  - [ ] Damage calculation
  - [ ] Attack animations
  - [ ] Write 12 unit tests
  
- [ ] Create `src/entities/PlayerStats.ts` (<150 lines)
  - [ ] HP, maxHP, attack, defense properties
  - [ ] takeDamage() method
  - [ ] heal() method
  - [ ] Level up logic
  - [ ] Write 8 unit tests
  
- [ ] Create `src/entities/README.md` - Document composition pattern

### 2.4 Tilemap System (Split by Concern)
- [ ] Create `src/world/Tilemap.ts` (<350 lines)
  - [ ] Render tiles using @pixi/tilemap
  - [ ] Load Tiled JSON format
  - [ ] Manage layers (ground, decoration, foreground)
  - [ ] Public API for tile queries
  - [ ] Write 15 unit tests
  
- [ ] Create `src/world/TilemapCollision.ts` (<200 lines)
  - [ ] Parse collision layer from Tiled JSON
  - [ ] Create Matter.js static bodies for walls
  - [ ] isWalkable(x, y) query
  - [ ] Handle collision shapes
  - [ ] Write 12 unit tests
  
- [ ] Create `src/world/TilemapEncounters.ts` (<200 lines)
  - [ ] Parse encounter zones from Tiled JSON
  - [ ] Track player steps in zones
  - [ ] Calculate encounter probability
  - [ ] Emit encounter events
  - [ ] Write 10 unit tests
  
- [ ] Create `src/world/MapLoader.ts` (<250 lines)
  - [ ] Load Tiled JSON from file
  - [ ] Validate map data structure
  - [ ] Cache loaded maps
  - [ ] Handle loading errors
  - [ ] Write 8 unit tests
  
- [ ] Create `src/world/README.md` - Document world systems

### 2.5 Camera System
- [ ] Create `src/world/Camera.ts` (<250 lines)
  - [ ] Follow target (player) smoothly
  - [ ] Clamp to world bounds
  - [ ] Smooth interpolation using GSAP
  - [ ] Zoom in/out support
  - [ ] Shake effect for impacts
  - [ ] Write 12 unit tests

### 2.6 Overworld Scene (Split by Responsibility)
- [ ] Create `src/scenes/OverworldScene.ts` (<400 lines)
  - [ ] Scene lifecycle (init, update, destroy)
  - [ ] Coordinate subsystems
  - [ ] Handle scene-level events
  - [ ] Delegate to UI, Entities, World
  - [ ] Write E2E tests
  
- [ ] Create `src/scenes/OverworldUI.ts` (<200 lines)
  - [ ] Render HP bar
  - [ ] Render minimap
  - [ ] Render control hints
  - [ ] Update UI each frame
  - [ ] Write 10 unit tests
  
- [ ] Create `src/scenes/OverworldEntities.ts` (<250 lines)
  - [ ] Spawn player
  - [ ] Spawn NPCs
  - [ ] Spawn enemies
  - [ ] Manage entity lifecycle
  - [ ] Write 12 unit tests
  
- [ ] Create `src/scenes/README.md` - Document scene architecture

### 2.7 Existing System Updates
- [ ] Update `src/core/SceneManager.ts`
  - [ ] Add OverworldScene support
  - [ ] Scene transition with GSAP
  - [ ] Ensure <400 lines
  
- [ ] Update `src/core/AssetManager.ts`
  - [ ] Add tilemap asset loading
  - [ ] Add Tiled JSON parsing
  - [ ] Ensure <400 lines

### 2.8 Placeholder Assets
- [ ] Create example Tiled map JSON
  - [ ] Create `public/maps/test-map.json`
  - [ ] Add collision layer
  - [ ] Add encounter zones
  - [ ] Test with MapLoader
  
- [ ] Create placeholder tilesets
  - [ ] Ground tiles (grass, dirt, stone)
  - [ ] Wall/obstacle tiles
  - [ ] 32x32 pixel tiles

### 2.9 Documentation & Quality
- [ ] Verify all files <500 lines
  - [ ] Run: `find src -name "*.ts" -exec wc -l {} + | sort -n`
  - [ ] Create issues for files >400 lines
  
- [ ] Update `ARCHITECTURE.md`
  - [ ] Add Matter.js integration section
  - [ ] Add file size enforcement policy
  - [ ] Add composition pattern examples
  
- [ ] Create `docs/GAMEPLAY.md`
  - [ ] Overworld controls
  - [ ] Movement system
  - [ ] Encounter mechanics
  - [ ] Battle transition flow
  
- [ ] Generate metrics report
  - [ ] File size distribution
  - [ ] Library usage (grep for Matter., gsap., etc.)
  - [ ] Test coverage report
  - [ ] Bundle size impact

**Status**: 📅 Planned (Documentation Ready)  
**Target Date**: End of Week 3  
**Success Criteria**:
- ✅ Zero files >500 lines
- ✅ 90%+ files <400 lines
- ✅ Matter.js integrated for all physics
- ✅ GSAP used for all animations
- ✅ @pixi/tilemap for tilemap rendering
- ✅ 100+ total tests passing
- ✅ Test coverage ≥75%
- ✅ Every folder has README.md
- ✅ Every public method has JSDoc with @example
- ✅ Pokemon-style overworld working
- ✅ Player movement with Matter.js collision
- ✅ Random encounters functional
- ✅ Battle transition working
- ✅ Existing systems still functional
- ✅ 60 FPS maintained
- ✅ Bundle size <3MB

---

## 🎨 Phase 3: UI/UX Components (Week 3)

### Goal
Create reusable UI component library with Vietnamese text support.

### 3.1 Base UI Components
- [ ] Create `src/ui/Button.ts`
  - [ ] Hover/click states
  - [ ] Vietnamese text rendering
  - [ ] Keyboard support
  - [ ] Accessibility
  - [ ] Write unit tests
  
- [ ] Create `src/ui/HealthBar.ts`
  - [ ] Animated HP changes
  - [ ] Color gradients (green → yellow → red)
  - [ ] Percentage display
  - [ ] Write unit tests
  
- [ ] Create `src/ui/DialogBox.ts`
  - [ ] Vietnamese text with line breaks
  - [ ] Typing animation effect
  - [ ] Avatar support
  - [ ] Choice buttons
  - [ ] Write unit tests
  
- [ ] Create `src/ui/MonsterCard.ts`
  - [ ] Display monster info
  - [ ] Element badge
  - [ ] Stats display
  - [ ] Hover effects
  - [ ] Write unit tests

### 3.2 Advanced UI Components
- [ ] Create `src/ui/Menu.ts`
  - [ ] Keyboard navigation
  - [ ] Submenu support
  - [ ] Animation transitions
  
- [ ] Create `src/ui/ProgressBar.ts`
  - [ ] Generic progress visualization
  - [ ] For XP, capture rate, loading
  
- [ ] Create `src/ui/Panel.ts`
  - [ ] Reusable container with border
  - [ ] Title bar
  - [ ] Close button

### 3.3 Scene UI Integration
- [ ] Refactor MenuScene with new components
- [ ] Refactor BattleScene with new components
- [ ] Refactor ExploreScene with new components
- [ ] Add transitions between scenes

### 3.4 Responsive Layout
- [ ] Test on mobile viewport
- [ ] Add touch controls
- [ ] Adjust UI scaling
- [ ] Test on various screen sizes

**Status**: 📅 Planned  
**Target Date**: End of Week 3  
**Success Criteria**:
- 7+ reusable UI components
- All scenes use new components
- Vietnamese text renders correctly
- Responsive on mobile and desktop
- E2E tests for all UI flows

---

## 🧪 Phase 4: Testing & Polish (Week 4)

### Goal
Achieve high test coverage and code quality standards.

### 4.1 Unit Testing
- [ ] ElementSystem: 100% coverage
- [ ] BattleSystem: ≥ 90% coverage
- [ ] CaptureSystem: ≥ 90% coverage
- [ ] MapSystem: ≥ 80% coverage
- [ ] SceneManager: ≥ 80% coverage
- [ ] AssetManager: ≥ 80% coverage
- [ ] UI Components: ≥ 70% coverage each
- [ ] **Overall target: ≥ 70% coverage**

### 4.2 E2E Testing
- [ ] Full game flow: Menu → Explore → Battle → Victory
- [ ] Capture flow: Battle → Capture → Success
- [ ] Map navigation: All 6 locations
- [ ] Evolution system test
- [ ] Error states and edge cases

### 4.3 Code Quality
- [ ] Enable TypeScript strict mode
- [ ] Fix all type errors
- [ ] Add ESLint
- [ ] Fix all linting warnings
- [ ] Add Prettier
- [ ] Format all code
- [ ] Remove all console.logs (use proper logging)

### 4.4 Performance Optimization
- [ ] Profile PixiJS rendering
- [ ] Optimize draw calls
- [ ] Implement object pooling for sprites
- [ ] Lazy load assets only when needed
- [ ] Measure and optimize:
  - [ ] Initial load time < 3s
  - [ ] Scene transitions < 500ms
  - [ ] Stable 60 FPS
  
### 4.5 Documentation
- [ ] JSDoc for all public APIs
- [ ] README with examples
- [ ] CONTRIBUTING.md guide
- [ ] API reference docs
- [ ] Architecture diagrams

**Status**: 📅 Planned  
**Target Date**: End of Week 4  
**Success Criteria**:
- Test coverage ≥ 70%
- All TypeScript strict errors fixed
- 60 FPS on target devices
- Complete documentation
- Zero console errors

---

## 🚀 Phase 5: Multi-platform & Advanced Features (Week 5+)

### Goal
Extend game to desktop and mobile platforms.

### 5.1 Desktop (Tauri)
- [ ] Install Tauri
- [ ] Create `src-tauri/` configuration
- [ ] Test desktop build (Windows, macOS, Linux)
- [ ] Add desktop-specific features (file system, notifications)
- [ ] Create installers

### 5.2 Mobile (Capacitor)
- [ ] Install Capacitor
- [ ] Create Android project
- [ ] Test on Android device
- [ ] Add mobile-specific features (haptics, share)
- [ ] Create APK

### 5.3 Save/Load System
- [ ] Create `src/core/SaveManager.ts`
- [ ] localStorage implementation (web)
- [ ] File system implementation (desktop)
- [ ] Cloud sync design (future)
- [ ] Save captured monsters
- [ ] Save progress and location
- [ ] Save player stats

### 5.4 Asset Pipeline
- [ ] Commission 10 full DragonBones animations
- [ ] Create asset conversion pipeline
- [ ] Document asset specifications
- [ ] Generate remaining 190 variations
- [ ] Optimize asset sizes
- [ ] Implement streaming for mobile

### 5.5 Advanced Game Features
- [ ] Sound system (music, SFX)
- [ ] Particle effects
- [ ] Screen shake on attacks
- [ ] Story mode with quests
- [ ] Boss battles
- [ ] Trading system
- [ ] Multiplayer (if feasible)

**Status**: 📅 Future  
**Target Date**: Week 5 and beyond  
**Success Criteria**:
- Desktop builds for 3 platforms
- Android APK functional
- Save/load working
- Full asset pipeline documented

---

## 📊 Success Metrics

### Technical Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Test Coverage | ≥ 70% | 0% |
| TypeScript Files | 100% new code | 0% |
| Build Time | < 5s | 3.5s ✅ |
| Bundle Size | < 1MB | 521 KB ✅ |
| Load Time | < 3s | TBD |
| FPS | 60 | TBD |

### Quality Metrics
| Metric | Target | Current |
|--------|--------|---------|
| TypeScript Strict | Enabled | Disabled |
| ESLint Errors | 0 | N/A |
| Console Errors | 0 | 0 ✅ |
| Documentation Coverage | 100% | 20% |

### Feature Completion
| Feature | Status |
|---------|--------|
| 200 Monster Database | ✅ Complete |
| Ngũ Hành System | ✅ Complete |
| Battle System | ✅ Complete |
| Capture System | ✅ Complete |
| Map Exploration | ✅ Complete |
| DragonBones Runtime | 🚧 In Progress |
| Scene Management | 📅 Planned |
| UI Components | 📅 Planned |
| Save/Load | 📅 Future |
| Multi-platform | 📅 Future |

---

## 🎯 Current Sprint (Week 1)

### This Week's Goals
1. ✅ Complete testing infrastructure setup
2. ✅ Add TypeScript support
3. ✅ Install DragonBones
4. ✅ Create comprehensive documentation
5. 🚧 Create core managers (Scene, Asset, EventBus, DragonBones)
6. 🚧 Write first unit tests
7. 🚧 Update CI/CD pipeline

### Blockers
- None currently

### Next Week Preview
- Convert existing systems to TypeScript
- Implement Scene pattern
- Create placeholder assets
- Achieve 60% test coverage

---

## 📝 Notes

### Design Decisions
- **JavaScript → TypeScript**: Gradual migration to avoid breaking changes
- **Scene Pattern**: Better state management than monolithic Game.js
- **Event Bus**: Decouple systems for easier testing
- **Lazy Loading**: Essential for 200 DragonBones assets
- **Placeholder Assets**: Use simple colored squares until full assets ready

### Risk Management
- **Risk**: Breaking existing functionality
  - **Mitigation**: Extensive testing, gradual refactoring
- **Risk**: Performance issues with 200 assets
  - **Mitigation**: Lazy loading, asset optimization
- **Risk**: DragonBones integration complexity
  - **Mitigation**: Start with 3 placeholders, document thoroughly

### Future Considerations
- Cloud save system (Firebase, Supabase?)
- Monetization strategy (optional)
- Community features (leaderboards, trading)
- Content updates (new monsters, locations)

---

**Last Updated**: 2025-10-16  
**Current Phase**: Phase 1 - Critical Fixes & Foundation (70% complete)  
**Next Milestone**: Complete Phase 1 by end of Week 1
