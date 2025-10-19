# Roadmap - Development Plan

<!-- AUTO-UPDATED: Agent updates this file after completing tasks -->

**Last Updated**: 2025-10-19  
**Current Sprint**: Phase 3 - Overworld Polish & Game Core Functionality  
**Overall Progress**: 70%

---

## 🎯 Current Sprint: Phase 3 - Overworld Functionality (In Progress)

### ✅ Recently Completed (2025-10-19)
**Major Accomplishments**:
1. **Fixed WeatherManager** - PropertyList config using proper hex numbers (0xRRGGBB)
2. **Loaded DragonBones Assets** - Player character (Absolution) with animations displays correctly
3. **Fixed Player Animations** - Flexible animation name system with intelligent fallbacks
4. **Fixed Critical Physics Bug** - Reordered update loop: input → physics → rendering
5. **Re-enabled Weather System** - Light leaves falling in overworld
6. **Refactored Story** - Companion system (explorer + 3 Divine Beasts instead of 4-character party)

### Next Priority: Test & Verify Core Gameplay Loop
**Status**: Next Up  
**Due**: 2025-10-20  
**Estimated**: 1-2 hours

#### Tasks
- [ ] **Test complete movement loop**
  - Verify WASD movement works in 8 directions
  - Confirm collisions prevent clipping through walls
  - Check animations play correctly (Walk/Idle)
  - Ensure no console errors
  
- [ ] **Test weather & visual effects**
  - Verify leaves falling in background
  - Check particle effects render correctly
  - Confirm NPCs display and move
  
- [ ] **Test story flow**
  - Verify character selection UI works
  - Test transition to overworld
  - Check initial story state

#### Success Criteria
```bash
npm run dev
# Open localhost:5173
# Verify:
# - Player character visible with animations
# - WASD moves player in all 8 directions
# - No console errors
# - Weather particles visible
# - NPCs present in scene
```

**Deliverables**:
- [ ] Working movement mechanics (video/screenshots for VERIFICATION.md)
- [ ] No console animation errors
- [ ] Physics & rendering in sync
- [ ] Initial playability confirmed

---

### Priority 2: Complete Tilemap System (After verification)

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

### Recently Resolved (2025-10-17)
- ✅ PixiJS v8 deprecation warnings - All updated to new API
- ✅ DragonBones initialization errors - Module properly exposed to window
- ✅ Audio 404 errors - Already handled gracefully, no code changes needed

### Potential Risks
1. **Performance**: Large tilemaps may impact FPS
   - **Mitigation**: Use @pixi/tilemap, optimize rendering
   - **Status**: Monitoring

2. **Type Errors**: Legacy .js integration with TypeScript
   - **Mitigation**: Gradual migration, @ts-ignore as needed
   - **Status**: Acceptable technical debt

3. **Testing Coverage**: E2E tests need expansion
   - **Mitigation**: Add human playability verification (VERIFICATION.md)
   - **Status**: Documentation added 2025-10-17

---

## 📝 Notes & Decisions

### Recent Decisions
- **2025-10-17**: Added human playability verification checklist (VERIFICATION.md)
- **2025-10-17**: Fixed PixiJS v8 API deprecations across 5 files
- **2025-10-17**: Fixed DragonBones initialization order
- **2025-10-17**: Modular documentation system adopted
- **2025-10-16**: Component-based player entity confirmed
- **2025-10-15**: Matter.js chosen over custom physics

### Lessons Learned
- Splitting files early prevents refactoring pain
- JSDoc with examples greatly helps AI agents
- Automated tests catch regressions immediately
- **Human playability testing is critical** - automated tests alone are insufficient

---

**Version**: 1.0.0  
**Next Review**: 2025-10-20

---

## 🎨 Phase 5+: Ultimate Polish & Visual Effects

**Status**: Future Planning  
**Prerequisites**: Phase 4 complete  
**Guiding Principle**: **Leverage mature, community-supported plugins. Never reinvent wheels.**

### Plugin Integration Strategy

**Core Philosophy**:
- Use proven PixiJS plugins for ALL generic features (particles, filters, UI, lighting)
- Build only custom game logic, Vietnamese content, and integration wrappers
- Maximize visual impact while minimizing development time

### Feature-to-Plugin Mapping

| Feature | Plugin(s) / Library | Purpose |
|---------|---------------------|---------|
| **Battle Effects** | @pixi/particle-emitter, @pixi/filter-glow, @pixi/filter-bloom | Hit impacts, critical hits, skill animations |
| **Weather/Atmosphere** | @pixi/particle-emitter, @pixi/filter-godray | Rain, snow, leaves, sacred areas |
| **UI/Menus** | @pixi/ui, @pixi/layout | Buttons, sliders, checkboxes, responsive layouts |
| **Inventory System** | @pixi/ui (ScrollBox), @pixi/layout | Grid layout, drag-drop, sorting |
| **Lighting Effects** | pixi-lights | Day/night cycle, torch, campfire, dungeons |
| **Screen Transitions** | GSAP, @pixi/filter-blur | Scene changes, fade effects, letterbox |
| **Status Effects** | @pixi/filter-adjustment, @pixi/filter-glow | Poison, freeze, burn visual feedback |
| **Dialogue/Story** | @pixi/ui, GSAP | Typewriter effect, portrait animations |
| **Retro/Special FX** | @pixi/filter-crt, @pixi/filter-old-film | Flashback scenes, glitch effects |
| **Impact Effects** | @pixi/filter-shockwave, @pixi/particle-emitter | Powerful attacks, explosions |
| **Audio/SFX** | Howler.js (already included) | Spatial audio, smooth fades |
| **Physics** | Matter.js (already included) | Collision, movement |

### Epic 1: Battle Visual Polish (3 days)

**Goal**: Transform battles into visually stunning experiences using particle effects and filters.

#### Tasks
- [ ] **Install particle system** (30 min)
  ```bash
  npm install @pixi/particle-emitter
  ```
  - Create ParticleManager wrapper
  - Configure emission profiles for 5 elements
  
- [ ] **Install battle filters** (30 min)
  ```bash
  npm install @pixi/filter-glow @pixi/filter-bloom @pixi/filter-shockwave
  ```
  - Add to BattleSceneV2
  - Configure filter presets

- [ ] **Implement element particle effects** (4 hours)
  - Kim (Metal): Metallic sparks, clang particles
  - Mộc (Wood): Leaf swirl, vine growth
  - Thủy (Water): Water splash, wave ripple  
  - Hỏa (Fire): Fire sparks, ember trails
  - Thổ (Earth): Rock debris, dust clouds
  - Use @pixi/particle-emitter with custom configs

- [ ] **Add critical hit effects** (2 hours)
  - GlowFilter on attacker
  - AdvancedBloomFilter screen flash
  - Particle burst at impact point
  
- [ ] **Add super effective feedback** (2 hours)
  - ShockwaveFilter at impact
  - Color-coded particle explosion
  - Screen shake (already implemented, enhance)

- [ ] **Victory/Capture effects** (2 hours)
  - Confetti particle emitter
  - Bloom filter on captured monster
  - GSAP scale/rotate animation

**Deliverables**:
- ParticleManager.ts (<300 lines) - wraps @pixi/particle-emitter
- 5 particle config JSON files (one per element)
- Enhanced BattleSceneV2.ts with filter integration
- 15 unit tests

**Success Criteria**:
- Each element has unique visual particle effect
- Critical hits show dramatic glow/bloom
- Super effective shows shockwave
- Victory screen has celebration particles

### Epic 2: Atmospheric Effects (2 days)

**Goal**: Create immersive environments with weather, lighting, and zone effects.

#### Tasks
- [ ] **Install atmosphere plugins** (30 min)
  ```bash
  npm install @pixi/filter-godray @pixi/filter-adjustment
  npm install pixi-lights
  ```

- [ ] **Create weather system** (3 hours)
  - WeatherManager.ts (<250 lines)
  - Rain particles (using @pixi/particle-emitter)
  - Snow particles
  - Leaf/petal particles for Mộc zones
  - Integrate with OverworldScene

- [ ] **Implement day/night cycle** (3 hours)
  - Use pixi-lights ambient lighting
  - Smooth transitions with GSAP
  - Time-based color adjustment filters
  - Torch light following player at night

- [ ] **Sacred zone effects** (2 hours)
  - GodrayFilter for temples/shrines
  - Ambient glow with lights
  - Mystical particle effects

**Deliverables**:
- WeatherManager.ts (<250 lines)
- LightingManager.ts (<200 lines)
- 3 weather particle configs
- Enhanced OverworldScene with atmosphere
- 12 unit tests

**Success Criteria**:
- Rain/snow can be triggered in zones
- Day/night transitions smoothly
- Player has torch light in dark areas
- Sacred zones have godray effects

### Epic 3: Professional UI System (3 days)

**Goal**: Replace custom UI with @pixi/ui components for polish and consistency.

#### Tasks
- [ ] **Install UI framework** (30 min)
  ```bash
  npm install @pixi/ui @pixi/layout
  ```

- [ ] **Refactor main menu** (4 hours)
  - Use Button component from @pixi/ui
  - Add hover/press states
  - Smooth transitions with GSAP
  - Replace current custom buttons

- [ ] **Create inventory UI** (5 hours)
  - Use ScrollBox from @pixi/ui
  - Grid layout with @pixi/layout
  - Drag-drop item functionality
  - Item tooltips on hover
  - Sort/filter buttons

- [ ] **Enhance settings menu** (2 hours)
  - CheckBox for toggles (sound, music, etc.)
  - Slider for volume controls
  - Responsive layout with @pixi/layout

- [ ] **Create dialog box system** (3 hours)
  - Use @pixi/ui panel components
  - Typewriter effect with GSAP
  - Portrait display
  - Choice buttons

**Deliverables**:
- InventoryUI.ts (<350 lines) - using @pixi/ui
- SettingsMenu.ts (<200 lines) - using @pixi/ui
- DialogBox.ts (<250 lines) - using @pixi/ui + GSAP
- Enhanced main menu
- 20 unit tests

**Success Criteria**:
- All buttons use @pixi/ui Button
- Inventory scrolls smoothly with ScrollBox
- Settings sliders work with @pixi/ui Slider
- Dialog box has typewriter effect

### Epic 4: Status & Feedback Effects (2 days)

**Goal**: Clear visual feedback for all game states using filters.

#### Tasks
- [ ] **Install status effect filters** (30 min)
  ```bash
  npm install @pixi/filter-adjustment @pixi/filter-blur
  ```

- [ ] **Implement status effects** (4 hours)
  - Poison: Green tint (AdjustmentFilter)
  - Freeze: Blue tint + slower animation
  - Burn: Red glow (GlowFilter) + particles
  - Stun: Yellow flash + stars
  - Confusion: Blur + twist filter

- [ ] **Add damage feedback** (2 hours)
  - Flash white on damage (AdjustmentFilter)
  - Red vignette at low HP
  - Shake sprite on hit (GSAP)

- [ ] **HP bar animations** (2 hours)
  - Smooth depletion with GSAP
  - Flash effect on critical damage
  - Color gradient based on health %

**Deliverables**:
- StatusEffectManager.ts (<250 lines)
- Enhanced BattleSceneV2 with status visuals
- HP bar smooth animations
- 15 unit tests

**Success Criteria**:
- Each status has unique visual filter
- Damage causes sprite to flash
- HP bar depletes smoothly
- Low HP shows red vignette

### Epic 5: Cutscene & Story Polish (3 days)

**Goal**: Cinematic storytelling with professional transitions and effects.

#### Tasks
- [ ] **Install cutscene filters** (30 min)
  ```bash
  npm install @pixi/filter-old-film @pixi/filter-crt @pixi/filter-pixelate
  ```

- [ ] **Create letterbox system** (2 hours)
  - Black bars for cinematic feel
  - Smooth appear/disappear with GSAP
  - Use during important cutscenes

- [ ] **Implement transition effects** (4 hours)
  - Wipe transitions (left, right, up, down)
  - Circular wipe for battle entry
  - Flash effects (white, colored)
  - Blur transition using @pixi/filter-blur

- [ ] **Add flashback/dream effects** (3 hours)
  - OldFilmFilter for memories
  - Grayscale with AdjustmentFilter
  - Reduced saturation
  - Vignette effect

- [ ] **Enhance dialogue system** (3 hours)
  - Portrait slide-in animation (GSAP)
  - Text typewriter effect
  - Choice button animations
  - Voice line sync indicators

**Deliverables**:
- CutsceneManager.ts (<350 lines)
- TransitionEffects.ts (<250 lines) - enhanced with filters
- Enhanced DialogBox with animations
- 4 cinematic transitions implemented
- 18 unit tests

**Success Criteria**:
- Cutscenes have letterbox effect
- Scene transitions use wipes/fades
- Flashbacks have film grain effect
- Dialogue has smooth typewriter

### Epic 6: Survival Elements (Don't Starve Style) (4 days)

**Goal**: Add survival mechanics with visual polish inspired by Don't Starve.

#### Tasks
- [ ] **Create hunger/thirst UI** (3 hours)
  - Animated bars with @pixi/ui
  - Warning flash at low levels
  - Icon animations

- [ ] **Base building system** (6 hours)
  - Tile placement preview
  - Snap-to-grid with particles
  - Building animations with GSAP
  - Campfire with pixi-lights glow

- [ ] **Crafting UI** (5 hours)
  - Recipe list with @pixi/ui ScrollBox
  - Drag-drop materials
  - Crafting animation with particles
  - Success burst effect

- [ ] **Season effects** (4 hours)
  - Summer: Heat shimmer (distortion filter)
  - Autumn: Falling leaves (particles)
  - Winter: Snow + cold vignette
  - Spring: Rain + flowers

**Deliverables**:
- SurvivalUI.ts (<300 lines)
- CraftingSystem.ts (<350 lines)
- BuildingSystem.ts (<300 lines)
- SeasonManager.ts (<200 lines)
- 25 unit tests

**Success Criteria**:
- Hunger/thirst bars animate smoothly
- Crafting has visual feedback
- Seasons change atmosphere
- Base building feels satisfying

### Epic 7: Minion/Party System (Overlord Style) (3 days)

**Goal**: Recruit and command multiple monsters with AI behaviors.

#### Tasks
- [ ] **Formation system** (4 hours)
  - Define formations (line, circle, V-shape)
  - Position calculation
  - Visual indicators for positions
  - Smooth movement with GSAP

- [ ] **Monster AI behaviors** (5 hours)
  - Tank: Stays in front, taunts
  - DPS: Focuses high-damage attacks
  - Healer: Monitors ally HP
  - Scout: Auto-explores, picks up loot
  - Simple state machine per role

- [ ] **Command UI** (3 hours)
  - Formation selector (@pixi/ui)
  - Behavior assignment panel
  - Quick commands (attack, defend, heal)
  - Visual feedback on command

- [ ] **Auto-battle mode** (3 hours)
  - Enable/disable toggle
  - AI executes turns
  - Speed up animations
  - Skip to results option

**Deliverables**:
- FormationSystem.ts (<300 lines)
- MonsterAI.ts (<350 lines)
- CommandUI.ts (<250 lines)
- Auto-battle integration
- 20 unit tests

**Success Criteria**:
- Monsters follow formation
- Each role has distinct behavior
- Commands work smoothly
- Auto-battle completes correctly

### Epic 8: Juice & Feedback (2 days)

**Goal**: Add micro-interactions and feedback for every action.

#### Tasks
- [ ] **Screen effects** (3 hours)
  - Camera shake on impacts (enhance existing)
  - Slow motion on critical hits (time scale)
  - Freeze frame on capture
  - Zoom on level up

- [ ] **UI micro-interactions** (3 hours)
  - Button press ripple (@pixi/particle-emitter)
  - Hover glow on interactive elements
  - Click feedback particles
  - Drag visual trail

- [ ] **Achievement popups** (2 hours)
  - Slide-in animation (GSAP)
  - Sparkle particles
  - Sound effect integration
  - Auto-dismiss

- [ ] **Emote system** (3 hours)
  - NPC emote balloons (anger, question, etc.)
  - Float up animation
  - Auto-fade after duration
  - Player emotes

**Deliverables**:
- JuiceEffects.ts (<250 lines)
- EmoteSystem.ts (<200 lines)
- AchievementPopup.ts (<180 lines)
- Enhanced screen effects
- 12 unit tests

**Success Criteria**:
- Every button has hover/press feedback
- Screen shakes on big impacts
- NPCs show emotes
- Achievements slide in smoothly

### Development Guidelines

**Before implementing ANY visual feature:**

1. **Check for existing plugin** at:
   - https://github.com/pixijs (official)
   - https://pixijs.io/ui/ (UI)
   - https://github.com/pixijs/filters (filters)

2. **Verify plugin is:**
   - ✅ Maintained (updated within 6 months)
   - ✅ Compatible with PixiJS 8.x
   - ✅ Has documentation/examples
   - ✅ Has TypeScript support

3. **Use plugin for:**
   - ❌ Particle effects → @pixi/particle-emitter
   - ❌ Visual filters → @pixi/filters
   - ❌ UI controls → @pixi/ui
   - ❌ Lighting → pixi-lights
   - ❌ Animations → GSAP

4. **Write custom code ONLY for:**
   - ✅ Game logic (battle rules, stats)
   - ✅ Vietnamese content (text, story)
   - ✅ Monster database
   - ✅ Integration wrappers
   - ✅ Unique game mechanics

### Phase 5+ Success Criteria

**Technical**:
- [ ] All particle effects use @pixi/particle-emitter
- [ ] All visual filters use @pixi/filters
- [ ] All UI uses @pixi/ui components
- [ ] No custom particle/filter implementations
- [ ] All files remain <1000 lines
- [ ] 200+ tests passing
- [ ] 80%+ test coverage

**Visual**:
- [ ] Battles feel "juicy" with particles & filters
- [ ] Weather creates atmosphere
- [ ] Day/night cycle affects mood
- [ ] UI feels professional and responsive
- [ ] Every action has visual feedback
- [ ] Status effects are immediately recognizable

**Gameplay**:
- [ ] Survival mechanics add depth
- [ ] Minion system feels like Overlord
- [ ] Crafting is satisfying
- [ ] Base building is intuitive
- [ ] Auto-battle saves time

**Performance**:
- [ ] 60 FPS with all effects enabled
- [ ] Particle pooling prevents lag
- [ ] Filter usage optimized
- [ ] Lighting doesn't impact performance

### Resources & References

**Plugin Documentation**:
- Particle Emitter: https://github.com/pixijs/particle-emitter
- Filters: https://github.com/pixijs/filters
- PixiUI: https://pixijs.io/ui/
- Layout: https://github.com/pixijs/layout
- Lights: https://github.com/pixijs/pixi-lights
- GSAP: https://greensock.com/docs/

**Tutorials**:
- Particle Emitter Guide: https://github.com/pixijs/particle-emitter/wiki
- Filter Examples: https://pixijs.io/filters/tools/demo/
- UI Components: https://pixijs.io/ui/storybook/

**Community**:
- PixiJS Discord: https://discord.gg/pixijs
- PixiJS Forums: https://github.com/pixijs/pixijs/discussions

---

**Phase 5+ Estimated Duration**: 22 days (4-5 weeks)  
**Prerequisite**: Phase 4 complete  
**Target Outcome**: Visually stunning, ultra-polished game with professional feel
