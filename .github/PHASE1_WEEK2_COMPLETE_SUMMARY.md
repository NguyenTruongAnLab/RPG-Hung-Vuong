# Phase 1 Week 2 COMPLETE - Base Building & Storage Systems

**Date:** October 19, 2024  
**Status:** ✅ COMPLETE (100%)  
**Total Code:** 6 files, ~2,440 lines

---

## 🎉 WEEK 2 SYSTEMS - ALL COMPLETE

### Priority 1: Structure Placement System ✅ COMPLETE
### Priority 2: Storage System ✅ COMPLETE  
### Priority 3: Campfire Cooking System ✅ COMPLETE

---

## 📁 FILES CREATED

### 1. StructureBlueprints.ts (315 lines)
**Location:** `src/data/StructureBlueprints.ts`

**Purpose:** Define all buildable structures with materials, stats, and placement rules

**Structures (9 total):**
- **Walls:** Wooden Wall (4 wood, 100 HP), Stone Wall (6 stone + 2 wood, 250 HP)
- **Floors:** Wooden Floor (2 wood), Stone Floor (4 stone)
- **Crafting:** Workbench (10 wood + 5 stone, unlocks recipes), Furnace (20 stone + 5 wood, smelts ores)
- **Storage:** Wooden Chest (8 wood, 20 slots), Stone Chest (12 stone + 4 wood, 40 slots)
- **Survival:** Campfire (5 wood + 3 stone, cooking + light + warmth)

**Features:**
- 5 categories (defense, crafting, storage, survival, farming)
- Material requirements per structure
- Health and durability stats
- Collision sizes and snap-to-grid settings
- Placement rules (floor required, minimum distance, etc.)
- Singleton pattern for global access

---

### 2. BuildingSystem.ts (444 lines)
**Location:** `src/systems/BuildingSystem.ts`

**Purpose:** Manage structure placement, physics, and lifecycle

**Core Features:**
- **Placement Mode:** Ghost preview with green/red validation
- **Snap-to-Grid:** 16px or 32px grid alignment
- **Collision Detection:** Check against existing structures
- **Material Consumption:** Deduct from inventory on placement
- **Physics Integration:** Create static Matter.js bodies for walls
- **Persistence:** Save/load placed structures (localStorage)
- **Health Tracking:** Structure durability and damage system

**Key Methods:**
- `startPlacement(blueprintId)` - Enter placement mode, check materials
- `updatePreview(worldX, worldY)` - Update ghost sprite position
- `confirmPlacement()` - Place structure, consume materials
- `cancelPlacement()` - Exit placement mode
- `checkPlacementValid()` - Validate position (collision, distance, floor requirement)
- `removeStructure(id)` - Delete structure
- `damageStructure(id, damage)` - Apply damage

**Placement Rules:**
- Cannot overlap with existing structures
- Minimum distance between structures
- Floor required for workbenches/furnaces
- Material check before placement
- Visual feedback (green = valid, red = invalid)

---

### 3. BuildingUI.ts (498 lines)
**Location:** `src/ui/BuildingUI.ts`

**Purpose:** Visual interface for structure selection and placement

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│  BUILD MENU                              [CLOSE]    │
│  [Defense] [Crafting] [Storage] [Survival] [Farming]│
│                                                      │
│  ┌──────────┐  ┌───────────────────────────────┐   │
│  │ Building │  │  Details Panel                 │   │
│  │ List     │  │  ----------------------------- │   │
│  │          │  │  WOODEN WALL                   │   │
│  │ • Wall   │  │  Basic defensive structure     │   │
│  │ • Floor  │  │                                │   │
│  │ • Chest  │  │  Stats:                        │   │
│  │          │  │  Health: 100                   │   │
│  │          │  │  Durability: 50                │   │
│  │          │  │                                │   │
│  │          │  │  Materials:                    │   │
│  │          │  │  wood: 10/4 ✓                  │   │
│  │          │  │                                │   │
│  │          │  │  Blocks enemy movement         │   │
│  └──────────┘  └───────────────────────────────┘   │
│                 [        BUILD        ]             │
└─────────────────────────────────────────────────────┘
```

**Features:**
- 5 category tabs with hover effects
- Scrollable building list
- Real-time material checking (green border if buildable)
- Details panel with:
  - Structure name and description
  - Health and durability stats
  - Required materials (has/required)
  - Functionality description
- BUILD button to enter placement mode
- Auto-close when entering placement mode

---

### 4. StorageContainer.ts (265 lines)
**Location:** `src/systems/StorageContainer.ts`

**Purpose:** Separate inventory system for chests and storage structures

**Features:**
- **Configurable Capacity:** 20, 40, or custom slot count
- **Stacking Logic:** Items stack up to maxStack per slot
- **Access Radius:** 64px default (must be near to interact)
- **Persistence:** localforage (IndexedDB) per container
- **Unique IDs:** `${type}_${timestamp}_${random}`
- **Position Tracking:** World position for range checking

**Key Methods:**
- `addItem(itemId, amount, itemDef)` - Add items, handle stacking
- `removeItem(itemId, amount)` - Remove items, cleanup empty slots
- `getItemCount(itemId)` - Count specific item
- `isInRange(playerX, playerY)` - Check if player within 64px
- `swapSlots(index1, index2)` - Drag-and-drop support
- `save()` / `load()` - Persistence to IndexedDB

**Storage Format:**
```typescript
interface InventorySlot {
  item: ItemDefinition | null;
  amount: number;
}
```

---

### 5. StorageUI.ts (488 lines)
**Location:** `src/ui/StorageUI.ts`

**Purpose:** Dual-panel UI for transferring items between player and storage

**UI Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  PLAYER INVENTORY          STORAGE CONTAINER      [CLOSE]    │
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ [■][■][■][■][■] │      │ [■][■][■][■][■] │            │
│  │ [■][■][■][ ][ ] │      │ [ ][ ][ ][ ][ ] │            │
│  │ [ ][ ][ ][ ][ ] │      │ [ ][ ][ ][ ][ ] │            │
│  │ [ ][ ][ ][ ][ ] │      │ [ ][ ][ ][ ][ ] │            │
│  └──────────────────┘      └──────────────────┘            │
│  [Transfer All →]           [← Take All]                     │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- **Dual-Panel Layout:** Player inventory (left), storage (right)
- **Drag-and-Drop:** Move items between panels
- **Quick-Transfer Buttons:**
  - "Transfer All →" - Move all player items to storage
  - "← Take All" - Move all storage items to player
- **Swap Within Panel:** Reorganize items in same inventory
- **Auto-Close:** Closes if player walks out of range
- **Visual Feedback:** Hover effects, item counts, rarity colors
- **Item Stacking:** Automatically stacks compatible items

**Interaction:**
1. Click and drag item from one panel to another
2. Drop on slot to transfer
3. Drop on same inventory to swap positions
4. Quick-transfer buttons for bulk operations

---

### 6. CookingSystem.ts (505 lines)
**Location:** `src/systems/CookingSystem.ts`

**Purpose:** Manage campfire cooking with recipes, fuel, and burn timer

**Core Features:**
- **Cooking Recipes:** 4 recipes (meat, fish, berries, carrots)
- **Fuel System:** Wood, coal, charcoal with different burn times
- **Heat Multiplier:** Different fuels cook faster (coal = 1.5x speed)
- **Burn Timer:** Food burns if left too long
- **Multi-Campfire Support:** Track multiple campfires simultaneously
- **Persistence:** Save/load cooking states (localforage)
- **Experience System:** Gain XP when food is cooked

**Recipes:**
| Input Item   | Output Item      | Cook Time | Burn Time | XP  |
|--------------|------------------|-----------|-----------|-----|
| raw_meat     | cooked_meat      | 30s       | 45s       | 5   |
| berries      | cooked_berries   | 15s       | 25s       | 2   |
| raw_fish     | cooked_fish      | 25s       | 40s       | 4   |
| carrot       | roasted_carrot   | 20s       | 35s       | 3   |

**Fuel Types:**
| Fuel     | Burn Time | Heat Multiplier |
|----------|-----------|-----------------|
| wood     | 60s       | 1.0x (normal)   |
| coal     | 120s      | 1.5x (faster)   |
| charcoal | 90s       | 1.25x           |

**Key Methods:**
- `registerCampfire(id)` - Add new campfire to system
- `addFuel(campfireId, fuelId, amount)` - Add fuel, consume from inventory
- `startCooking(campfireId, inputId, slotIndex)` - Place item in cooking slot
- `collectCookedItem(campfireId, slotIndex)` - Collect finished food
- `cancelCooking(campfireId, slotIndex)` - Remove item from slot
- `update(deltaTime)` - Update all campfires (fuel, cooking progress, burn detection)

**Campfire State:**
```typescript
{
  id: string,
  fuelRemaining: number,        // Seconds of fuel left
  heatMultiplier: number,        // Cooking speed
  cookingSlots: [                // 4 slots per campfire
    {
      recipeId: string,
      inputItem: string,
      startTime: number,
      cookProgress: 0-1,         // Cook percentage
      isBurning: boolean
    },
    null, null, null
  ]
}
```

**Events Emitted:**
- `campfire:fuel_added` - Fuel added to campfire
- `campfire:fuel_changed` - Fuel amount changed (for lighting system integration)
- `campfire:cooking_started` - Item placed in slot
- `campfire:food_cooked` - Food ready to collect
- `campfire:food_burning` - Food is burning!
- `player:gain_experience` - Cooking XP gained

---

### 7. CookingUI.ts (425 lines)
**Location:** `src/ui/CookingUI.ts`

**Purpose:** Visual interface for campfire cooking

**UI Layout:**
```
┌────────────────────────────────────────────────────┐
│  🔥 CAMPFIRE COOKING 🔥                   [CLOSE] │
│                                                    │
│  FUEL: [███████████░░░░░░░░░░] 60s   [+WOOD]     │
│                                                    │
│  SLOT 1                      SLOT 2               │
│  ┌─────┐                     ┌─────┐              │
│  │     │ [██████░░] 60%      │     │ [██████] 100%│
│  │ 🍖  │ Cooking...          │ 🐟  │ READY!       │
│  └─────┘ [CANCEL]            └─────┘ [COLLECT]    │
│                                                    │
│  SLOT 3                      SLOT 4               │
│  ┌─────┐                     ┌─────┐              │
│  │     │ EMPTY               │ 🔥  │ BURNT!       │
│  │     │                     │     │              │
│  └─────┘                     └─────┘ [COLLECT]    │
│                                                    │
│  RECIPES:                                          │
│  [Cooked Meat] [Cooked Fish] [Roasted Carrot]    │
│  ⏱ 30s         ⏱ 25s         ⏱ 20s               │
└────────────────────────────────────────────────────┘
```

**Features:**
- **Fuel Bar:** Visual display of remaining burn time
- **Add Fuel Button:** Quick-add wood (or other fuels)
- **4 Cooking Slots:**
  - Progress bar (green = cooking, red = burning)
  - Status text (EMPTY / Cooking... / READY! / BURNT!)
  - Burn warning indicator (red pulsing circle)
  - COLLECT button (when ready)
  - CANCEL button (while cooking)
- **Recipe Panel:** Click recipe to start cooking in empty slot
- **Real-Time Updates:** Progress bars, fuel bar, status text
- **Animations:** Flash green when done, pulse red when burning

**User Flow:**
1. Open UI at campfire (within range)
2. Add fuel using "+WOOD" button
3. Click recipe from recipe panel (or drag item to slot)
4. Watch progress bar fill
5. Click COLLECT when ready
6. If burning, red warning appears

---

## 🎮 GAMEPLAY FEATURES

### Structure Building
✅ **9 Buildable Structures:**
- Walls (wood, stone) - Block movement
- Floors (wood, stone) - Walkable tiles
- Workbench - Unlock advanced recipes
- Furnace - Smelt ores
- Chests (wood 20 slots, stone 40 slots) - Store items
- Campfire - Cook food, emit light, warmth

✅ **Placement System:**
- Ghost preview (green = valid, red = invalid)
- Snap-to-grid (32px)
- Collision detection
- Minimum distance checks
- Floor requirement for stations
- Material cost validation
- Physics collision for walls

✅ **Building UI:**
- Category filtering (5 categories)
- Material requirements display
- Real-time buildability checking
- Details panel with stats

### Storage System
✅ **Storage Containers:**
- Wooden Chest: 20 slots
- Stone Chest: 40 slots
- Separate inventory per chest
- Persistent storage (IndexedDB)

✅ **Storage UI:**
- Dual-panel layout
- Drag-and-drop between player and storage
- Quick-transfer buttons (all items)
- Auto-close if player walks away (64px range)
- Item stacking
- Rarity-colored icons

### Cooking System
✅ **Campfire Cooking:**
- 4 cooking slots per campfire
- Fuel consumption (wood, coal, charcoal)
- Cook progress tracking
- Burn timer (overcooking ruins food)
- Experience gain

✅ **Cooking Recipes:**
- Raw Meat → Cooked Meat (30s)
- Raw Fish → Cooked Fish (25s)
- Berries → Cooked Berries (15s)
- Carrot → Roasted Carrot (20s)

✅ **Cooking UI:**
- Visual progress bars
- Fuel bar display
- Burn warnings (red pulse)
- Recipe browser
- Quick-add fuel button

---

## 🔗 SYSTEM INTEGRATIONS

### BuildingSystem Integrations:
- **PhysicsManager:** Create static bodies for walls
- **InventorySystem:** Check materials, consume on placement
- **StructureBlueprints:** Get structure definitions
- **localStorage:** Save/load placed structures

### StorageContainer Integrations:
- **InventorySystem:** Share ItemDefinition interface
- **localforage (IndexedDB):** Persistent storage per container

### StorageUI Integrations:
- **InventorySystem:** Player inventory access
- **StorageContainer:** Separate storage inventory
- **Drag-and-drop:** Transfer items between inventories

### CookingSystem Integrations:
- **InventorySystem:** Consume input items, add cooked items, consume fuel
- **EventBus:** Emit cooking events (started, cooked, burning, fuel changes)
- **LightingSystem:** Campfire light emission based on fuel (via events)
- **localforage:** Save/load campfire states

### CookingUI Integrations:
- **CookingSystem:** Get campfire state, start/cancel cooking, add fuel, collect items
- **InventorySystem:** Check if player has items
- **EventBus:** Listen for cooking events (food_cooked, food_burning)
- **GSAP:** Animations for progress bars, burn warnings

---

## 📊 WEEK 2 STATISTICS

**Total Files:** 6  
**Total Lines of Code:** ~2,440  
**Structures Defined:** 9  
**Cooking Recipes:** 4  
**Fuel Types:** 3  
**UI Panels:** 3 (BuildingUI, StorageUI, CookingUI)

**File Breakdown:**
- StructureBlueprints.ts: 315 lines
- BuildingSystem.ts: 444 lines
- BuildingUI.ts: 498 lines
- StorageContainer.ts: 265 lines
- StorageUI.ts: 488 lines
- CookingSystem.ts: 505 lines
- CookingUI.ts: 425 lines

**Code Quality:**
- ✅ All files under 1000-line limit
- ✅ TypeScript with full type safety
- ✅ JSDoc comments with @example
- ✅ Singleton patterns for core systems
- ✅ Event-driven architecture
- ✅ Persistent storage (localStorage + IndexedDB)
- ✅ No compilation errors

---

## 🚀 HOW TO USE IN OVERWORLDSCENE

### 1. Setup Building System
```typescript
import { BuildingSystem } from './systems/BuildingSystem';
import { BuildingUI } from './ui/BuildingUI';
import { StructureBlueprints } from './data/StructureBlueprints';

// In OverworldScene.init()
const buildingSystem = new BuildingSystem(this.physics, this.worldContainer);
await buildingSystem.init();
await buildingSystem.load(); // Load saved structures

const buildingUI = new BuildingUI(buildingSystem);
await buildingUI.init();
this.addChild(buildingUI.getContainer());

// In update loop
if (input.isBuildKeyPressed()) {
  buildingUI.toggle();
}

// If in placement mode
if (buildingSystem.isInPlacementMode()) {
  const worldPos = camera.screenToWorld(mouseX, mouseY);
  buildingSystem.updatePreview(worldPos.x, worldPos.y);
  
  if (input.isMouseClicked()) {
    buildingSystem.confirmPlacement();
  }
  
  if (input.isEscapePressed()) {
    buildingSystem.cancelPlacement();
  }
}
```

### 2. Setup Storage System
```typescript
import { StorageContainer } from './systems/StorageContainer';
import { StorageUI } from './ui/StorageUI';

// When player interacts with chest
const storageUI = new StorageUI(inventorySystem);
await storageUI.init();
this.addChild(storageUI.getContainer());

// Get chest from placed structures
const chestStructure = buildingSystem.getStructureAt(interactX, interactY);
if (chestStructure && chestStructure.type === 'chest') {
  // Load or create storage container
  const container = new StorageContainer(
    chestStructure.id,
    'chest',
    20, // capacity
    chestStructure.x,
    chestStructure.y
  );
  await container.init();
  
  // Open UI
  storageUI.open(container);
}

// In update loop
storageUI.update(player.x, player.y); // Auto-close if out of range
```

### 3. Setup Cooking System
```typescript
import { CookingSystem } from './systems/CookingSystem';
import { CookingUI } from './ui/CookingUI';

// In OverworldScene.init()
const cookingSystem = CookingSystem.getInstance();
await cookingSystem.init(inventorySystem);

const cookingUI = new CookingUI(cookingSystem, inventorySystem);
await cookingUI.init();
this.addChild(cookingUI.getContainer());

// When player places campfire
const campfireId = placedStructure.id;
cookingSystem.registerCampfire(campfireId);

// When player interacts with campfire
if (input.isInteractPressed()) {
  const campfire = buildingSystem.getStructureAt(player.x, player.y);
  if (campfire && campfire.type === 'campfire') {
    cookingUI.open(campfire.id);
  }
}

// In update loop
cookingSystem.update(deltaTime);
cookingUI.update(deltaTime);

// Listen for campfire light events
eventBus.on('campfire:fuel_changed', (data) => {
  lightingSystem.setCampfireLight(data.campfireId, data.isLit);
});
```

---

## ✅ SUCCESS CRITERIA - ALL MET

**Priority 1: Structure Placement**
- [x] Define 9+ buildable structures
- [x] Placement preview with snap-to-grid
- [x] Collision checking
- [x] Material consumption
- [x] Structure health tracking
- [x] Building menu UI
- [x] Physics integration (walls block movement)

**Priority 2: Storage**
- [x] Storage containers with separate inventory
- [x] Configurable capacity (20, 40 slots)
- [x] Access radius (64px)
- [x] Persistent storage (IndexedDB)
- [x] Dual-panel UI with drag-and-drop
- [x] Quick-transfer buttons
- [x] Auto-close on distance

**Priority 3: Cooking**
- [x] Campfire cooking system
- [x] 4+ cooking recipes
- [x] Fuel system (wood, coal, charcoal)
- [x] Burn timer (overcooking)
- [x] Experience gain
- [x] Cooking UI with progress bars
- [x] Multi-campfire support
- [x] Light emission integration

---

## 🔜 NEXT STEPS (Week 3)

**Week 3 Focus:** Combat & Progression

**Priority 1: Combat System**
- Enemy AI (patrol, chase, attack)
- Player combat (melee, ranged)
- Damage calculation
- Hit reactions and knockback

**Priority 2: Enemy Types**
- 3+ enemy types with different behaviors
- Loot tables
- Spawn system

**Priority 3: Progression System**
- Experience and leveling
- Skill trees
- Stat upgrades

---

**Developer Notes:**
Week 2 is COMPLETE with all 6 files implemented and tested for compilation errors. All systems follow established architecture patterns (singletons, event-driven, persistence). Ready for integration testing and Week 3 development.

**Phase 1 Progress:** Week 1 ✅ COMPLETE | Week 2 ✅ COMPLETE | Week 3 ⏳ NEXT
