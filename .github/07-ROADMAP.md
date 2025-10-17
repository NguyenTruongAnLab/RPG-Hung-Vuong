# Roadmap - Development Plan

<!-- AUTO-UPDATED: Agent updates this file after completing tasks -->

**Last Updated**: 2025-10-17  
**Current Sprint**: Phase 2 - Overworld Implementation  
**Overall Progress**: 40%

---

## 🎯 Current Sprint: Phase 2 Week 2

### Priority 1: Complete Tilemap System (This Week)
**Status**: Not Started  
**Assignee**: AI Agent  
**Due**: 2025-10-20  
**Estimated**: 1-2 days

#### Tasks
- [ ] Create `src/world/Tilemap.ts` (<350 lines)
  - Implement @pixi/tilemap rendering
  - Load Tiled JSON format
  - Layer rendering (ground, objects, overlay)
  - **Estimated**: 3 hours

- [ ] Create `src/world/TilemapCollision.ts` (<200 lines)
  - Parse collision layer from Tiled
  - Generate Matter.js static bodies
  - Add to PhysicsManager
  - **Estimated**: 2 hours

- [ ] Create `src/world/TilemapEncounters.ts` (<200 lines)
  - Parse encounter zones from Tiled
  - Detect player in zone
  - Emit encounter events
  - **Estimated**: 2 hours

- [ ] Write 30 unit tests
  - Tilemap.test.ts (12 tests)
  - TilemapCollision.test.ts (10 tests)
  - TilemapEncounters.test.ts (8 tests)
  - **Estimated**: 1 hour

#### Success Criteria
```bash
npm run test -- Tilemap
# 30 tests passing

wc -l src/world/Tilemap*.ts
# All files <350 lines
```

**Deliverables**:
- [ ] 3 new files in `src/world/`
- [ ] 30 new unit tests
- [ ] Updated `src/world/README.md`
- [ ] Sample Tiled map working in overworld

---

### Priority 2: Encounter System (Next)
**Status**: Not Started  
**Estimated**: 1 day

#### Tasks
- [ ] Create `src/systems/EncounterSystem.ts` (<250 lines)
  - Random encounter logic
  - Encounter rate calculation
  - Transition to battle scene
  - Zone-based encounter tables

- [ ] Update `src/scenes/OverworldScene.ts`
  - Integrate encounter system
  - Handle encounter triggers
  - Scene transition

- [ ] Write 15 unit tests
  - EncounterSystem.test.ts (15 tests)

#### Success Criteria
- [ ] Walking in grass triggers battles
- [ ] Encounter rate matches design (1 per 10 steps average)
- [ ] Transition to battle scene smooth

---

### Priority 3: Complete Overworld UI (After P2)
**Status**: Not Started  
**Estimated**: 1 day

#### Tasks
- [ ] Create `src/ui/Minimap.ts` (<180 lines)
  - Real-time minimap display
  - Player position indicator
  - Fog of war (visited areas)

- [ ] Create `src/ui/QuestLog.ts` (<200 lines)
  - Quest list display
  - Active quest tracking
  - Quest completion notifications

- [ ] Update `src/scenes/OverworldUI.ts`
  - Integrate minimap
  - Integrate quest log
  - Keyboard shortcuts (M for map, Q for quests)

- [ ] Write 20 unit tests

---

## 📅 Phase Timeline

### Phase 1: Foundation ✅ COMPLETE
**Completion**: 2025-10-15  
**Duration**: 2 weeks  
**Outcome**: 122 tests passing, TypeScript setup, core managers

**Completed**:
- [x] Project setup (Vite, TypeScript, testing)
- [x] Core managers (SceneManager, AssetManager, EventBus, etc.)
- [x] Battle system (turn-based, legacy .js)
- [x] Capture system
- [x] Monster database (200 creatures)
- [x] GitHub Pages deployment
- [x] Initial documentation

---

### Phase 2: Overworld 🚧 IN PROGRESS (40%)
**Start**: 2025-10-16  
**Target**: 2025-10-23  
**Current Progress**: 40%

#### Completed ✅
- [x] Install dependencies (Matter.js, GSAP, @pixi/tilemap)
- [x] PhysicsManager.ts (290 lines)
- [x] InputManager.ts (185 lines)
- [x] CollisionSystem.ts (275 lines)
- [x] Player.ts (275 lines)
- [x] PlayerMovement.ts (180 lines)
- [x] PlayerCombat.ts (165 lines)
- [x] PlayerStats.ts (120 lines)
- [x] Camera.ts (220 lines)
- [x] OverworldScene.ts (385 lines)
- [x] OverworldUI.ts (198 lines)

#### Remaining Tasks
- [ ] **Week 2** (This week):
  - [ ] Tilemap system (3 files, Priority 1)
  - [ ] Encounter system (1 file, Priority 2)
  - [ ] Complete overworld UI (2 files, Priority 3)

- [ ] **Week 3**:
  - [ ] NPC interaction system
  - [ ] Dialogue system
  - [ ] Item pickup system
  - [ ] Multiple map connections

- [ ] **Integration** (1 day):
  - [ ] Connect overworld to battle seamlessly
  - [ ] Test full gameplay loop
  - [ ] Performance optimization

**Success Criteria**:
- [ ] Player can explore overworld with WASD
- [ ] Collisions with walls working
- [ ] Random encounters trigger battles
- [ ] Battles complete and return to overworld
- [ ] 60 FPS performance
- [ ] 100+ new unit tests passing
- [ ] Test coverage ≥75%

---

### Phase 3: Content & Polish 📅 PLANNED
**Start**: 2025-10-24  
**Duration**: 2 weeks  
**Status**: Not Started

#### Week 1: Content Creation
- [ ] Design 5 Văn Lang maps in Tiled
- [ ] Create basic tilesets (placeholder art)
- [ ] Write NPC dialogues (Vietnamese)
- [ ] Design 10 quests
- [ ] Add sound effects (placeholder)

#### Week 2: Polish
- [ ] Migrate all .js files to TypeScript
- [ ] Enable strict TypeScript mode
- [ ] Performance profiling and optimization
- [ ] Add loading screens
- [ ] Add screen transitions
- [ ] Complete JSDoc for all files

**Success Criteria**:
- [ ] 100% TypeScript codebase
- [ ] Strict mode enabled, 0 errors
- [ ] All files have JSDoc
- [ ] Performance: 60 FPS sustained
- [ ] 5 playable maps

---

### Phase 4: Multi-platform 🔮 FUTURE
**Start**: TBD  
**Duration**: 3 weeks  
**Status**: Future

#### Tasks
- [ ] Tauri setup for desktop
- [ ] Windows build
- [ ] macOS build
- [ ] Linux build
- [ ] Capacitor setup for mobile
- [ ] iOS build (TestFlight)
- [ ] Android build (APK)
- [ ] Mobile touch controls
- [ ] Mobile UI adaptation

---

## 🔄 Sprint Update Protocol

**After completing a task:**

1. **Update this file**:
   - Mark task as [x] completed
   - Update progress percentage
   - Add completion notes if needed

2. **Update 06-CURRENT-STATE.md**:
   - Move completed items from "In Progress" to "Completed"
   - Update statistics
   - Document any new files created

3. **Commit with message**:
   ```bash
   docs: Complete [task name] in Phase [X]
   
   - Completed [specific items]
   - [X] tests passing
   - Next: [what comes next]
   ```

---

## 📊 Weekly Progress Tracker

### Week 1 (Oct 10-16): Foundation ✅
- [x] Project setup
- [x] Core managers
- [x] Testing infrastructure
- **Result**: Phase 1 complete (100%)

### Week 2 (Oct 17-23): Overworld Start 🚧
- [x] Physics and input (Day 1-2)
- [x] Player entity (Day 3)
- [ ] Tilemap system (Day 4-5) ← **Current**
- [ ] Encounter system (Day 6)
- [ ] UI completion (Day 7)
- **Target**: 70% Phase 2 complete

### Week 3 (Oct 24-30): Overworld Complete
- [ ] NPC system
- [ ] Multiple maps
- [ ] Integration testing
- **Target**: Phase 2 complete (100%)

### Week 4 (Oct 31-Nov 6): Content
- [ ] Map design
- [ ] Quests
- [ ] Dialogues
- **Target**: 50% Phase 3 complete

---

## 🎯 Milestone Checklist

### Milestone 1: Playable Overworld ✅
**Target**: End of Week 2  
**Status**: 90% complete

- [x] Player can move with WASD
- [x] Collisions working
- [ ] Can trigger encounters (90%)
- [ ] Can return from battle (pending integration)

### Milestone 2: Full Gameplay Loop
**Target**: End of Week 3

- [ ] Explore → Encounter → Battle → Victory → Explore
- [ ] Multiple maps connected
- [ ] NPCs interactive
- [ ] Items collectible
- [ ] Save/Load basic

### Milestone 3: Content Complete
**Target**: End of Week 4

- [ ] 5 maps designed
- [ ] 20 NPCs with dialogue
- [ ] 10 quests
- [ ] All 200 monsters available
- [ ] Sound effects integrated

---

## 🚨 Blockers & Risks

### Current Blockers
None currently

### Potential Risks
1. **Performance**: Large tilemaps may impact FPS
   - **Mitigation**: Use @pixi/tilemap, optimize rendering
   - **Status**: Monitoring

2. **Type Errors**: Legacy .js integration with TypeScript
   - **Mitigation**: Gradual migration, @ts-ignore as needed
   - **Status**: Acceptable technical debt

3. **Testing Coverage**: E2E tests not yet written
   - **Mitigation**: Add after core features stable
   - **Status**: Scheduled for Week 3

---

## 📝 Notes & Decisions

### Recent Decisions
- **2025-10-17**: Modular documentation system adopted
- **2025-10-16**: Component-based player entity confirmed
- **2025-10-15**: Matter.js chosen over custom physics

### Lessons Learned
- Splitting files early prevents refactoring pain
- JSDoc with examples greatly helps AI agents
- Automated tests catch regressions immediately

---

**Version**: 1.0.0  
**Next Review**: 2025-10-20
