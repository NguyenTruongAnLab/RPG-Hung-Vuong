# Phase 2 Week 3 - Quick Reference Guide

## 🎮 NEW KEYBOARD CONTROLS

### Combat
- **Shift + W/A/S/D** - Dodge Roll (1 second cooldown)
- **B** - Block (0.8 second cooldown)
- **Left Click** - Attack (when weapon equipped)

### UI
- **Q** - Toggle Quest Log
- **Space** - Skip dialogue / Continue conversation

---

## ⚔️ WEAPON SYSTEM

### Available Weapons

| Weapon | Type | Damage | Speed | Range | Durability |
|--------|------|--------|-------|-------|------------|
| Wooden Sword | Sword | 10 | 2.0 | 40px | 50 |
| Iron Sword | Sword | 25 | 2.0 | 45px | 150 |
| Wooden Spear | Spear | 12 | 1.2 | 60px | 40 |
| Wooden Bow | Bow | 15 | 1.5 | 200px | 60 |
| Wooden Staff | Staff | 8 | 1.0 | 80px | 70 |
| Stone Axe | Tool | 5 | 1.5 | 35px | 100 |
| Stone Pickaxe | Tool | 5 | 1.5 | 35px | 100 |
| Iron Hammer | Tool | 30 | 0.8 | 40px | 200 |

### Creating Weapons
```typescript
// Get weapon system
const weaponSystem = new WeaponSystem(eventBus);

// Create weapon instance
const sword = weaponSystem.createWeapon('iron_sword');

// Execute attack
weaponSystem.attack('player', sword, direction, position);
```

### Repairing Weapons
```typescript
// Repair costs 50% of crafting materials
const materials = new Map([
  ['iron_bar', 10],
  ['wood', 5]
]);

weaponSystem.repairWeapon(weapon, materials);
```

---

## 🛡️ COMBAT SYSTEM

### Dodge Roll
- **Activation:** Shift + Direction
- **Duration:** 400ms
- **Cooldown:** 1 second
- **Distance:** 80 pixels
- **Effect:** Invulnerability frames

```typescript
// Trigger dodge roll
const direction = { x: 1, y: 0 }; // Right
combatSystem.dodgeRoll('player', direction);
```

### Block
- **Activation:** B key
- **Duration:** 500ms
- **Cooldown:** 0.8 seconds
- **Effect:** 70% damage reduction

```typescript
// Start blocking
combatSystem.startBlock('player');
```

### Damage System
- **Invulnerability:** 200ms after taking damage
- **Knockback:** Applied on hit
- **Critical Hits:** System ready (not yet implemented)

```typescript
// Apply damage
const actualDamage = combatSystem.applyDamage(
  'enemy_id',
  25,
  'player',
  attackPosition
);
```

---

## 💬 DIALOGUE SYSTEM

### Simple Dialogue
```typescript
const dialogue = DialogueSystem.getInstance();

dialogue.showDialogue({
  npcName: 'Thôn Trưởng',
  text: 'Chào mừng đến Văn Lang!',
  choices: [
    { text: 'Xin chào', action: 'greet' },
    { text: 'Tạm biệt', action: 'goodbye' }
  ]
});
```

### Yarn Spinner Dialogue
```typescript
// Load Yarn file
await dialogue.loadYarnFile(yarnContent);

// Run dialogue node
await dialogue.runYarnNode('StartNode');

// Check state
const visited = dialogue.hasVisitedNode('intro');
const gold = dialogue.getVariable('player_gold');
dialogue.setVariable('quest_complete', true);
```

### Dialogue Events
```typescript
// Listen for choices
eventBus.on('dialogue:choice', (data) => {
  console.log('Selected:', data.action);
});

// Listen for commands
eventBus.on('dialogue:command', (data) => {
  if (data.command === 'give_item') {
    // Grant item to player
  }
});
```

---

## 📜 QUEST SYSTEM

### Sample Quests (12 Available)

**Tutorial Quests (3):**
- `tutorial_001` - Welcome to Văn Lang
- `tutorial_battle` - First Battle
- `tutorial_capture` - Capture Monster

**Main Story (3):**
- `main_001` - Elder's Summons
- `main_002` - Forest Mystery
- `main_temple_quest` - Temple Pilgrimage

**Side Quests (3):**
- `side_herbs` - Collect Herbs
- `side_forest_mystery` - Hermit's Secret
- `side_hunting` - Hunt Wild Monsters

**Daily Quests (3):**
- `daily_training` - Daily Training (3 battles)
- `daily_gathering` - Daily Gathering (20 resources)
- `daily_blessing` - Daily Prayer

### Quest Management
```typescript
const quests = QuestSystem.getInstance();

// Start quest
quests.startQuest('tutorial_001');

// Update objective
quests.updateObjective('tutorial_001', 'move_around', 1);

// Check quest status
const isActive = quests.isQuestActive('tutorial_001');
const progress = quests.getQuestProgress('tutorial_001');

// Get quests
const activeQuests = quests.getActiveQuests();
const completedQuests = quests.getCompletedQuests();
```

### Quest Events
```typescript
// Quest started
eventBus.on('quest:started', (data) => {
  console.log('Started:', data.quest.title);
});

// Objective complete
eventBus.on('quest:objective-complete', (data) => {
  console.log('Completed:', data.objective.description);
});

// Quest complete
eventBus.on('quest:completed', (data) => {
  // Grant rewards
  const rewards = data.rewards;
  if (rewards.exp) player.addExp(rewards.exp);
  if (rewards.gold) player.addGold(rewards.gold);
  if (rewards.items) grantItems(rewards.items);
});
```

---

## 🎨 UI SYSTEMS

### Quest Log
- **Toggle:** Q key
- **Filters:** All, Main, Side, Daily, Tutorial
- **Display:** Active quests with progress bars
- **Size:** 450x550 pixels

```typescript
const questLog = new QuestLog(450, 550);
questLog.show();
questLog.updateQuests(activeQuests);
```

### Tool Durability
- **Auto-display:** When using tools
- **Warning:** At 20% durability (orange)
- **Critical:** At 10% durability (red)
- **Broken:** Notification when durability reaches 0

```typescript
const durability = new ToolDurability(app, eventBus);

// Show durability bar
durability.showDurabilityBar(weapon, mouseX, mouseY);
```

---

## 🔧 INTEGRATION EXAMPLE

### Complete Combat Flow
```typescript
// 1. Create weapon
const weaponSystem = new WeaponSystem(eventBus);
const sword = weaponSystem.createWeapon('iron_sword');

// 2. Register player in combat
const combatSystem = new CombatSystem(physics, eventBus);
combatSystem.registerEntity('player', playerBody, 100, 100);

// 3. Attack
const direction = { x: 1, y: 0 };
const position = { x: playerX, y: playerY };
weaponSystem.attack('player', sword, direction, position);

// 4. Damage automatically applied by CombatSystem
// 5. Durability automatically decreases
// 6. Warning shown if low durability
```

---

## 📊 EVENT REFERENCE

### Weapon Events
- `weapon:attack` - Weapon attack executed
- `weapon:low-durability` - Durability below 20%
- `weapon:broken` - Durability reached 0
- `weapon:repaired` - Weapon successfully repaired
- `weapon:repair-failed` - Repair failed (insufficient materials)

### Combat Events
- `combat:damage-dealt` - Damage applied to entity
- `combat:damage-blocked` - Damage blocked by invulnerability
- `combat:damage-reduced` - Damage reduced by blocking
- `combat:dodge-start` - Dodge roll started
- `combat:dodge-end` - Dodge roll ended
- `combat:block-start` - Block started
- `combat:block-end` - Block ended
- `combat:entity-died` - Entity died
- `combat:healed` - Entity healed
- `combat:invulnerability-end` - Invulnerability ended

### Dialogue Events
- `dialogue:show` - Dialogue shown
- `dialogue:hide` - Dialogue hidden
- `dialogue:complete` - Text animation complete
- `dialogue:choice` - Choice selected
- `dialogue:command` - Command executed
- `dialogue:continue` - Player pressed continue

### Quest Events
- `quest:added` - Quest added to system
- `quest:started` - Quest started
- `quest:progress` - Objective progress updated
- `quest:objective-complete` - Objective completed
- `quest:completed` - Quest completed
- `quest:failed` - Quest failed
- `quest:reset` - Quest reset (for repeatables)

---

## 🐛 TROUBLESHOOTING

### Dodge Roll Not Working
- Check if on cooldown (1 second)
- Ensure movement key is pressed
- Verify Shift key is held down

### Block Not Activating
- Check cooldown (0.8 seconds)
- Press B key
- Verify player is registered in combat system

### Quest Log Not Opening
- Press Q key
- Ensure quest system is initialized
- Check if dialogue is active (conflicts)

### Durability Bar Not Showing
- Weapon must be used/attacked
- Check if weapon has durability > 0
- Verify ToolDurability system initialized

### Dialogue Not Skipping
- Press Space key
- Ensure dialogue is active
- Check if typewriter animation is running

---

## 📚 CODE EXAMPLES

### Complete New Game Setup
```typescript
// In OverworldScene.init()
async init() {
  // Initialize combat systems
  this.weaponSystem = new WeaponSystem(this.eventBus);
  this.combatSystem = new CombatSystem(this.physics, this.eventBus);
  this.toolDurability = new ToolDurability(this.app, this.eventBus);
  
  // Initialize dialogue & quests
  this.dialogueSystem = DialogueSystem.getInstance();
  this.questSystem = QuestSystem.getInstance();
  
  // Create UI
  this.questLog = new QuestLog(450, 550);
  this.addChild(this.questLog.getContainer());
  
  // Load quests
  for (const quest of ALL_SAMPLE_QUESTS) {
    this.questSystem.addQuest(quest);
  }
  
  // Start tutorial
  this.questSystem.startQuest('tutorial_001');
  
  // Register player
  this.combatSystem.registerEntity(
    'player',
    this.player.getBody(),
    this.player.getHp(),
    this.player.getMaxHp()
  );
}
```

---

**Quick Reference Version:** 1.0  
**Last Updated:** 2025-10-19  
**Systems Covered:** Weapon, Combat, Dialogue, Quest, Durability
