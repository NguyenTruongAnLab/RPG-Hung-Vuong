# Roadmap - Development Plan

<!-- AUTO-UPDATED: Agent updates this file after completing tasks -->

## 🎯 ROADMAP: Pokemon 2.5D + Don't Starve Hybrid

### ✅ Week 1: Procedural World & Resources - COMPLETE! 🎉

**Status**: ✅ COMPLETE (100%)  

#### Priority 1: Procedural Map Generation System ✅ COMPLETE
- [x] **Install procedural generation libraries** (30 min) ✅
- [x] **Create BiomeGenerator.ts** (374 lines) ✅
  - Generate biome map using Simplex noise
  - Define 7 biomes: Forest, Plains, Mountains, Water, Desert, Swamp, Tundra
  - Each biome has resource spawn tables
  - Use seedrandom for deterministic generation
- [x] **Create ChunkSystem.ts** (490 lines) ✅
  - Chunk-based world generation (32x32 tile chunks)
  - Load/unload chunks dynamically as player moves
  - Cache generated chunks to localStorage with LZ-String compression
  - Infinite world generation
- [x] **Create InventorySystem.ts** (380 lines) ✅
  - Item storage with slot-based grid (40 slots)
  - Stacking system (max stack sizes per item type)
  - Add/remove/transfer items
  - Save/load to localforage (IndexedDB)
  - Crafting integration (hasItems/removeItems)

#### Priority 2: Resource Gathering System ✅ COMPLETE
- [x] **Create ResourceNode.ts** (328 lines) ✅
  - Base class for all harvestable resources (tree, rock, bush, grass, ore, crystal)
  - Health/durability system with tool damage
  - Drop tables (what items to give)
  - Visual feedback on hit with health bars
  - Respawn timers (30-90 seconds)
- [x] **Create GatheringSystem.ts** (389 lines) ✅
  - Player interaction with resources (E key)
  - Harvest animation + particle effects (@pixi/particle-emitter)
  - Tool requirements (axe for trees, pickaxe for rocks, hand for bushes/grass)
  - Tool-specific damage amounts (hand:10, axe:50, pickaxe:40)
  - Add items to inventory on harvest
  - Biome-based resource population
- [x] **Update InputManager.ts** ✅
  - Add 'harvest' action (E key) - isHarvestPressed()
  - Add 'open inventory' action (Tab/I key) - isInventoryPressed()

#### Priority 3: Crafting System ✅ COMPLETE
- [x] **Create CraftingSystem.ts** (385 lines) ✅
  - Recipe database with 10+ recipes
  - 6 categories (tools, weapons, structures, consumables, materials, misc)
  - Check ingredient requirements via InventorySystem.hasItems()
  - Consume materials on craft
  - Crafting stations (none, campfire, workbench, furnace, alchemy_table)
  - Recipe unlocking system
- [x] **Create CraftingUI.ts** (508 lines) ✅
  - Recipe list with category tabs
  - Material requirement display (green if has enough, red if not)
  - "Can craft" visual indicator (green border)
  - Craft button with hover animations
  - Real-time inventory sync

#### Priority 4: Survival Stats System ✅ COMPLETE
- [x] **Create SurvivalStats.ts** (256 lines) ✅
  - Hunger (depletes 0.5%/sec, starvation deals -2 HP/sec)
  - Health (damage from enemies/environment, 0 = death)
  - Sanity (depletes 0.2%/sec, low sanity causes random damage)
  - Temperature (cold/heat deals -0.5 HP/sec)
  - Event callbacks for stat changes and death
- [x] **Create SurvivalUI.ts** (324 lines) ✅
  - 4 animated stat bars (hunger, health, sanity, temp)
  - Warning flash at critical levels (<25%) using GSAP
  - Color-coded bars (green/yellow/orange/red)
  - Emoji icons (🍖❤️🧠🌡️)
  - Death overlay with respawn button

#### Priority 5: Day/Night Cycle ✅ COMPLETE
- [x] **Create TimeManager.ts** (251 lines) ✅
  - 24-minute day/night cycle (configurable)
  - Current time tracking (0-1439 "minutes" since midnight)
  - 4 time periods: Dawn (5-7h), Day (7-18h), Dusk (18-20h), Night (20-5h)
  - Time-based events (hunger/sanity drain)
  - Save/load current time to localStorage
- [x] **Create LightingSystem.ts** (246 lines) ✅
  - Ambient light adjustment by time of day (30-100% intensity)
  - Player torch light (120px radius, flickering animation)
  - Campfire light sources (200px radius, warm glow)
  - Crystal lights (100px radius, blue tint)
  - Shadow overlay (color tint + alpha for darkness)
  - GSAP flicker animations
- [x] **Lighting library decision** ✅
  - Used PixiJS v8 built-in Graphics
  - Additive blend mode for light effects
  - Radial gradient circles for light sources

#### Priority 6: Inventory UI ✅ COMPLETE
- [x] **Create InventoryUI.ts** (475 lines) ✅
  - 8x5 grid layout (40 slots total)
  - Drag-and-drop item management
  - Item tooltips with descriptions
  - Visual item icons (color-coded placeholders)
  - Stack count display
  - Hover highlighting with orange border
  - Slot swapping via InventorySystem.swapSlots()
  - Toggle visibility (Tab/I key)

**Success Criteria Week 1**: ✅ ALL COMPLETE
- [x] Procedurally generated world with 7 distinct biomes ✅
- [x] Player can harvest trees, rocks, bushes for resources ✅
- [x] Inventory UI opens with Tab, shows collected items ✅
- [x] Crafting UI shows recipes, can craft basic items (torch, campfire) ✅
- [x] Hunger/health/sanity bars visible and functional ✅
- [x] Day/night cycle affects lighting and stat depletion ✅

**Documentation**: See `.github/PHASE1_WEEK1_COMPLETE_SUMMARY.md` for full details

### ✅ Week 2: Base Building & Storage - COMPLETE! 🎉

**Status**: ✅ COMPLETE (100%)  

#### Priority 1: Structure Placement System ✅ COMPLETE
- [x] **Create StructureBlueprints.ts** (315 lines) ✅
  - Define buildable structures (walls, floors, workbench, chest, campfire)
  - Material requirements per structure
  - Structure stats (health, functionality)
  - 9 structures across 5 categories
- [x] **Create BuildingSystem.ts** (444 lines) ✅
  - Placement preview (ghost mode)
  - Snap to grid (32px)
  - Collision checking (can't place on resources/structures)
  - Material consumption on place
  - Structure health tracking
  - Physics body creation for walls
- [x] **Create BuildingUI.ts** (498 lines) ✅
  - Building menu with structure categories
  - Blueprint selection
  - Material requirement display
  - Real-time buildability checking

#### Priority 2: Storage System ✅ COMPLETE
- [x] **Create StorageContainer.ts** (265 lines) ✅
  - Base class for chests, fridges, etc.
  - Separate inventory (not player inventory)
  - Access radius (64px proximity required)
  - Save/load container contents (IndexedDB)
- [x] **Create StorageUI.ts** (488 lines) ✅
  - Dual-panel UI (player inventory + storage)
  - Drag-and-drop between panels
  - Quick-transfer buttons
  - Auto-close on distance

#### Priority 3: Campfire & Cooking ✅ COMPLETE
- [x] **Create CookingSystem.ts** (505 lines) ✅
  - Cooking recipes (raw meat → cooked meat)
  - Fuel system (wood burns for 60s)
  - Burn timer (overcooking ruins food)
  - Campfire light emission (event integration)
  - 4 recipes + 3 fuel types
- [x] **Create CookingUI.ts** (425 lines) ✅
  - Cooking slots (4 food + 1 fuel)
  - Cook progress bars
  - Recipe browser
  - Burn warnings

**Success Criteria Week 2**: ✅ ALL COMPLETE
- [x] Player can build walls, floors, and structures ✅
- [x] Structures snap to grid and check collisions ✅
- [x] Storage chests hold items, transfer UI works ✅
- [x] Campfire cooks food and provides light ✅
- [x] Base building feels satisfying with visual feedback ✅

---

## 🎮 Phase 2: Combat & Interaction (Weeks 3-4)

**Goal**: Merge real-time action combat with existing turn-based Pokemon battles

### Week 3: Real-Time Combat System

**Status**: ✅ COMPLETE (2025-10-19) 

#### Priority 1: Real-Time Combat Mechanics ✅ COMPLETE
- [x] **Create WeaponSystem.ts** (285 lines) ✅
  - Weapon types (sword, spear, bow, staff, axe, pickaxe, hammer)
  - Attack animations with hit boxes
  - Damage calculation
  - Weapon durability system
  - Tool crafting (axe, pickaxe, hammer)
- [x] **Create CombatSystem.ts** (349 lines) ✅
  - Real-time hit detection (Matter.js sensors)
  - Dodge roll (Shift + direction)
  - Block/parry system (B key)
  - Enemy AI (patrol, chase, attack) - Already in Enemy.ts
  - Damage feedback (flash, knockback)
- [x] **Create ToolDurability.ts** (174 lines) ✅
  - Track durability per item
  - Break warning at 20%
  - Repair system (materials required)
  - Visual durability bar on item hover

#### Priority 2: NPC Dialogue System ✅ COMPLETE
- [x] **Enhanced DialogueSystem.ts** ✅
  - Dialogue tree parsing
  - Choice selection UI
  - Vietnamese text support
  - Save dialogue state
- [x] **DialogueUI** (Already existed in DialogueSystem.ts) ✅
  - Portrait display
  - Typewriter text effect (GSAP)
  - Choice buttons
  - Skip/fast-forward controls (Space key)

#### Priority 3: Quest Tracking ✅ COMPLETE
- [x] **QuestSystem.ts** (Already existed) ✅
  - Quest database (JSON format)
  - Quest state machine (available, active, complete)
  - Objective tracking (kill X, collect Y, talk to Z)
  - Quest rewards (items, exp, unlock areas)
  - Save/load quest progress
- [x] **QuestLog.ts** (Already existed as QuestLog.ts) ✅
  - Quest log panel (press Q)
  - Active quest tracker (top-right corner)
  - Objective checklist
  - Quest complete notification

**Integration Complete**:
- [x] All systems integrated into OverworldScene
- [x] Keyboard controls: Q (Quest Log), Space (Skip Dialogue), Shift+Direction (Dodge Roll), B (Block)
- [x] Sample quests initialized from sampleQuests.ts
- [x] Combat system registered with player entity
- [x] Tool durability UI active

**Success Criteria Week 3**: ✅ ALL MET
- [x] Player can swing weapons in real-time (WeaponSystem implemented)
- [x] Enemies react to attacks, take damage, die (CombatSystem + Enemy.ts)
- [x] Weapons have durability, can be repaired (ToolDurability + WeaponSystem)
- [x] NPCs have dialogue trees with choices (DialogueSystem with Yarn Spinner)
- [x] Quests track objectives and show progress (QuestSystem + QuestLog)

### Week 4: Save System & Polish

**Status**: Not Started 

#### Priority 1: Comprehensive Save/Load System

- [ ] **Create SaveManager.ts** (<400 lines)
  - Save slots (3 slots)
  - Auto-save every 5 minutes
  - Save data structure:
    - Player position, stats, inventory
    - World state (structures, resources, chunks)
    - Quest progress
    - Time of day
    - Captured monsters
  - Compress saves with lz-string
  - Load game from slot
  - Delete save slot
  
- [ ] **Create SaveUI.ts** (<250 lines)
  - Save slot selection screen
  - Slot preview (thumbnail, play time, level)
  - Confirm overwrite dialog
  - Delete confirmation

#### Priority 2: Combat Polish
- [ ] **Enhance particle effects for combat**
  - Blood/impact particles on hit
  - Weapon trail effects
  - Death animations
  - Dodge roll particles
- [ ] **Add combat SFX**
  - Sword slash sounds
  - Impact sounds (hit, block, parry)
  - Enemy grunt/death sounds
  - Dodge roll sound

#### Priority 3: Integration Testing
- [ ] Test full gameplay loop:
  - Spawn → Gather resources → Craft tools → Build base
  - Hunt enemies → Complete quests → Save game
  - Load game → Continue progress
- [ ] Performance optimization (target 60 FPS)
- [ ] Bug fixes and polish

**Success Criteria Week 4**:
- [ ] Game can be saved and loaded correctly
- [ ] All systems persist across sessions
- [ ] Combat feels satisfying with effects
- [ ] Full gameplay loop works seamlessly

## 🎮 Phase 4: Pokemon Integration (Weeks 7-8)

**Goal**: Enhance creature collection with Pokemon-style depth

### Week 7: Enhanced Capture & Storage

**Status**: Not Started 

#### Priority 1: Advanced Capture System
- [ ] **Create CaptureSystemV2.ts** (<320 lines)
  - Weaken monsters before capture (HP threshold)
  - Capture items (basic ball, great ball, ultra ball)
  - Capture rate calculation (HP %, status effects, ball type)
  - Capture animation with particles
  - Wild monster stats (level, IVs, nature)
- [ ] **Create MonsterStatus.ts** (<200 lines)
  - Status effects affect capture rate:
    - Sleep: +2.5x capture rate
    - Paralyze: +1.5x capture rate
    - Poison: +1.5x capture rate
  - Status effect icons

#### Priority 2: Pokemon Storage (PC Boxes)
- [ ] **Create PCBoxSystem.ts** (<350 lines)
  - 30 boxes, 30 slots each (900 total)
  - Box names (custom)
  - Monster organization
  - Search/filter by element, level, name
  - Party vs. Box management
- [ ] **Create PCBoxUI.ts** (<400 lines)
  - Grid layout with monster sprites
  - Drag-and-drop between boxes
  - Monster summary on hover
  - Swap party members
  - Release monster confirmation

#### Priority 3: Monster Stats UI
- [ ] **Create MonsterSummaryUI.ts** (<350 lines)
  - Full stat display (HP, Atk, Def, SpA, SpD, Spd)
  - Nature and IV display
  - Move list with PP
  - Ability description
  - Experience bar to next level

**Success Criteria Week 7**:
- [ ] Capture system feels like Pokemon (weaken → throw ball)
- [ ] PC boxes store 900 monsters
- [ ] Monster summary shows all relevant info
- [ ] Party management is intuitive

## 🎮 Phase 5: Polish (Weeks 9-10)

Ultimate Polish & Visual Effects

### Plugin Integration Strategy

**Core Philosophy**:
- Use proven PixiJS plugins for ALL generic features (particles, filters, UI, lighting)
- Build only custom game logic, Vietnamese content, and integration wrappers
- Maximize visual impact while minimizing development time


- [ ] **Implement element particle effects** (4 hours)
  - Kim (Metal): Metallic sparks, clang particles
  - Mộc (Wood): Leaf swirl, vine growth
  - Thủy (Water): Water splash, wave ripple  
  - Hỏa (Fire): Fire sparks, ember trails
  - Thổ (Earth): Rock debris, dust clouds

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

**Success Criteria**:
- Each element has unique visual particle effect
- Critical hits show dramatic glow/bloom
- Super effective shows shockwave
- Victory screen has celebration particles

### Epic 2: Atmospheric Effects (2 days)

**Goal**: Create immersive environments with weather, lighting, and zone effects.

#### Tasks

- [ ] **Create weather system** (3 hours)
  - WeatherManager.ts (<250 lines)
  - Rain particles
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


**Success Criteria**:
- Rain/snow can be triggered in zones
- Day/night transitions smoothly
- Player has torch light in dark areas
- Sacred zones have godray effects

### Juice & Feedback (2 days)

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
