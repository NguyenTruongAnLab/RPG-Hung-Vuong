# Game Systems

Gameplay systems that implement core mechanics.

## Files

### Phase 1-3: Combat & Progression (Complete)
- `BattleSystem.js` (77 lines) - Legacy turn-based combat (replaced by BattleSceneV2)
- `CaptureSystem.js` (77 lines) - Legacy monster capture (integrated in BattleSceneV2)
- `MapExplorer.js` (77 lines) - Legacy Phase 1 menu navigation
- `ProgressionSystem.ts` (241 lines) - Player level, EXP, and captured monsters tracking
  - ✅ **Singleton pattern**: Player progression management
  - Features: Level system, EXP tracking, monster collection, save/load

### Phase 2: Physics & Collision (Complete)
- `CollisionSystem.ts` (275 lines) - Matter.js collision detection and handling
  - ✅ **GOOD SIZE**: Focused collision logic
  - Features: Collision callbacks, physics body management

### Phase 5: NPCs & Dialogue (NEW - Complete) ✨
- **`NPCSystem.ts`** (360 lines) - NPC placement, interaction, and proximity detection
  - ✅ **Singleton pattern**: Manages all NPCs in the game world
  - Features: NPC creation, proximity detection, interaction indicators
  - Supports: villager, elder, merchant, trainer, guide types
  - Integration: Works with DialogueSystem and QuestSystem
  
- **`DialogueSystem.ts`** (407 lines) - Dialogue display with typewriter effects
  - ✅ **Singleton pattern**: Manages all dialogue UI
  - Features: Typewriter animation (GSAP), dialogue choices, auto-close
  - Vietnamese text: Full UTF-8 support for Vietnamese characters
  - Visual: Smooth animations, choice buttons, NPC name display

### Phase 5: Quests & Tasks (NEW - Complete) ✨
- **`QuestSystem.ts`** (456 lines) - Quest tracking and completion
  - ✅ **Singleton pattern**: Manages all quests
  - Features: Quest lifecycle, objectives tracking, prerequisites
  - Quest types: main, side, daily, tutorial
  - Rewards: exp, gold, items, monsters
  - Save/Load: Full quest state persistence

## System Integration Examples

### NPCSystem + DialogueSystem
```typescript
// In OverworldScene.ts
import { NPCSystem } from '../systems/NPCSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { VILLAGE_NPCS } from '../data/sampleNPCs';
import { getDialogue } from '../data/sampleDialogues';

// Initialize systems
const npcSystem = NPCSystem.getInstance();
const dialogueSystem = DialogueSystem.getInstance();

npcSystem.init(app);
dialogueSystem.init(app);
npcSystem.setWorldContainer(worldContainer);

// Load NPCs
npcSystem.loadNPCs(VILLAGE_NPCS);

// Handle interaction in update loop
const nearbyNPC = npcSystem.getNearbyNPC(player.x, player.y, 50);
if (nearbyNPC && input.isKeyPressed('E')) {
  npcSystem.interact(nearbyNPC.id);
}

// Listen for NPC interaction events
eventBus.on('npc:interact', (data) => {
  if (data.dialogue) {
    const dialogue = getDialogue(data.dialogue);
    if (dialogue) {
      dialogueSystem.showDialogue(dialogue);
    }
  }
});
```

### QuestSystem Integration
```typescript
import { QuestSystem } from '../systems/QuestSystem';
import { ALL_SAMPLE_QUESTS } from '../data/sampleQuests';

// Initialize quest system
const questSystem = QuestSystem.getInstance();

// Add quests
ALL_SAMPLE_QUESTS.forEach(quest => questSystem.addQuest(quest));

// Listen for quest events
eventBus.on('quest:completed', (data) => {
  console.log(`Quest ${data.questId} completed!`);
  player.addExp(data.rewards.exp || 0);
  player.addGold(data.rewards.gold || 0);
});

// Update quest progress
questSystem.updateObjective('quest_001', 'talk_to_npc', 1);

// Show quest log
const questLog = new QuestLog();
questLog.updateQuests(questSystem.getActiveQuests());
app.stage.addChild(questLog.getContainer());
```

### Independence
Systems should be loosely coupled:
- Communicate via EventBus
- Don't directly reference other systems
- Use dependency injection

### Testability
Each system should be testable in isolation:
- Mock dependencies
- Test public API
- No side effects in tests

### State Management
Systems manage their own state:
- Encapsulate internal data
- Provide clear getter/setter APIs
- Emit events on state changes

## Battle System Flow

```
BattleSystem.initialize(player, enemy)
  ↓
Determine turn order (by speed)
  ↓
Player/Enemy turn → Attack
  ↓
Calculate damage (with element advantage)
  ↓
Apply damage (reduce HP)
  ↓
Check for KO
  ↓
Switch turns OR End battle
```

## Capture System Flow

```
Player encounters wild monster
  ↓
CaptureSystem.attemptCapture(monster, playerLevel)
  ↓
Calculate capture rate (base rate × HP factor × level factor)
  ↓
Roll random number
  ↓
Success: Add monster to team
Failure: Monster breaks free
```

## Map Explorer Flow

```
MapExplorer.initialize(locations)
  ↓
Player at current location
  ↓
MapExplorer.travel(destination)
  ↓
Check if connection exists
  ↓
Valid: Move to destination, trigger encounter check
Invalid: Show error message
```

## File Size Policy

- **Target**: <300 lines per file
- **Limit**: 500 lines maximum
- **Action when exceeded**: Extract helpers or split responsibilities

## Ngũ Hành (Five Elements) System

All systems respect element advantages:

```
Kim (Metal) > Mộc (Wood)   - 1.5x damage
Mộc (Wood) > Thổ (Earth)   - 1.5x damage
Thổ (Earth) > Thủy (Water) - 1.5x damage
Thủy (Water) > Hỏa (Fire)  - 1.5x damage
Hỏa (Fire) > Kim (Metal)   - 1.5x damage
```

## Testing Requirements

Each system must have:
- [ ] Unit tests for all public methods
- [ ] Edge case tests (0 HP, max stats, etc.)
- [ ] Integration tests with EventBus
- [ ] Coverage ≥75%

## Phase 2 System Architecture

### Planned: CollisionSystem.ts
```typescript
/**
 * Handles Matter.js collision events
 * Responsibilities:
 * - Register collision pairs (player-wall, player-enemy)
 * - Handle collision events
 * - Emit game events (encounter, damage, etc.)
 * Max lines: 300
 */
```

### Planned: EncounterSystem.ts
```typescript
/**
 * Manages random encounters in overworld
 * Responsibilities:
 * - Track player steps in encounter zones
 * - Calculate encounter probability
 * - Select random enemy based on location
 * - Trigger battle transition
 * Max lines: 250
 */
```

### Planned: MovementSystem.ts
```typescript
/**
 * Handles player movement logic
 * Responsibilities:
 * - Process input from InputManager
 * - Calculate velocity
 * - Apply forces to Matter.js body
 * - Update facing direction
 * Max lines: 200
 */
```

---

**Rule**: Systems should be independent, testable, and well-documented.
