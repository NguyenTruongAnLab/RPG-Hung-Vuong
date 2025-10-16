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

## 📦 Phase 2: Core Systems Refactor (Week 2)

### Goal
Refactor existing systems to TypeScript with proper architecture patterns.

### 2.1 Core Managers
- [ ] Create `src/core/SceneManager.ts`
  - [ ] Abstract Scene base class
  - [ ] Scene lifecycle methods (init, update, destroy)
  - [ ] Scene switching with transitions
  - [ ] Write unit tests
  
- [ ] Create `src/core/AssetManager.ts`
  - [ ] Lazy loading for monster assets
  - [ ] Caching system
  - [ ] Batch loading (chunks of 10)
  - [ ] Progress tracking
  - [ ] Write unit tests
  
- [ ] Create `src/core/EventBus.ts`
  - [ ] Event emitter pattern
  - [ ] Type-safe event system
  - [ ] Listener management
  - [ ] Write unit tests
  
- [ ] Implement `src/core/DragonBonesManager.ts`
  - [ ] Factory initialization
  - [ ] Asset parsing
  - [ ] Armature display creation
  - [ ] Animation controls
  - [ ] Write unit tests

### 2.2 System Conversion (JS → TS)
- [ ] Convert `BattleSystem.js` → `BattleSystem.ts`
  - [ ] Add type definitions
  - [ ] Extract ElementSystem logic
  - [ ] Write comprehensive unit tests
  - [ ] Document all methods
  
- [ ] Convert `CaptureSystem.js` → `CaptureSystem.ts`
  - [ ] Add type definitions
  - [ ] Add persistence hooks (for future save system)
  - [ ] Write unit tests
  - [ ] Document capture algorithm
  
- [ ] Convert `MapExplorer.js` → `MapSystem.ts`
  - [ ] Add type definitions
  - [ ] Improve location unlock system
  - [ ] Write unit tests
  
- [ ] Create `src/systems/ElementSystem.ts`
  - [ ] Extract from BattleSystem
  - [ ] Pure functions for element calculations
  - [ ] Write extensive unit tests

### 2.3 Scene Implementation
- [ ] Create `src/scenes/Scene.ts` (base class)
- [ ] Create `src/scenes/MenuScene.ts`
  - [ ] Migrate menu code from Game.js
  - [ ] Add to/from transitions
  - [ ] Write E2E test
  
- [ ] Create `src/scenes/ExploreScene.ts`
  - [ ] Migrate explore code from Game.js
  - [ ] Integrate with MapSystem
  - [ ] Write E2E test
  
- [ ] Create `src/scenes/BattleScene.ts`
  - [ ] Migrate battle code from Game.js
  - [ ] Integrate BattleSystem and UI components
  - [ ] Write E2E test
  
- [ ] Refactor `src/core/Game.ts`
  - [ ] Convert to TypeScript
  - [ ] Simplify to bootstrap only
  - [ ] Use SceneManager
  - [ ] Remove 80% of code

### 2.4 Placeholder Assets
- [ ] Create asset structure: `public/assets/monsters/`
- [ ] Generate 3 placeholder DragonBones assets
  - [ ] `char001/` (Rồng Kim - Kim element)
  - [ ] `char041/` (Rồng Mộc - Mộc element)
  - [ ] `char081/` (Rồng Thủy - Thủy element)
- [ ] Write script to generate simple colored squares as placeholders
- [ ] Test loading with AssetManager

**Status**: 📅 Planned  
**Target Date**: End of Week 2  
**Success Criteria**:
- All JS systems converted to TS
- SceneManager working with 3 scenes
- AssetManager can load placeholder assets
- EventBus connecting systems
- Unit test coverage ≥ 60%
- Game still fully functional

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
