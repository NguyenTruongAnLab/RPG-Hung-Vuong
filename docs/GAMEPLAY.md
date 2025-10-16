# Gameplay Documentation - RPG Hùng Vương

## 🎮 Overview

RPG Hùng Vương is a Vietnamese mythology-based RPG featuring Pokemon-style overworld exploration with turn-based battles. The game features 200 Thần Thú (Divine Beasts) with a Ngũ Hành (Five Elements) combat system.

---

## 🗺️ Overworld System (Phase 2+)

### Movement Controls

**Keyboard:**
- **WASD** or **Arrow Keys** - Move in 4 directions
- **Shift** - Sprint (faster movement)
- **Space** - Interact with NPCs/objects
- **E** - Open menu
- **Tab** - Toggle minimap

**Mobile/Touch:**
- **Virtual D-Pad** - Movement
- **Tap** - Move to location
- **Double Tap** - Sprint
- **Swipe** - Camera pan
- **Pinch** - Zoom in/out

### Physics System

**Powered by Matter.js:**
- Realistic collision detection
- Smooth player movement
- Wall boundaries
- Dynamic obstacles
- Attack hitboxes

### Encounter System

**Random Encounters:**
- Each location has encounter zones
- Probability based on steps taken
- Different monsters per location/element
- Visual warning before encounter (grass rustling)

**Encounter Mechanics:**
```
Player steps in encounter zone
  ↓
Step counter increments
  ↓
Roll random number
  ↓
If (roll < encounter_rate × step_counter):
  → Trigger random encounter
  → Reset step counter
```

**Encounter Rate Factors:**
- Base rate: 15% per step
- Location modifier: Forest (high), Cave (medium), Plains (low)
- Time of day: Night encounters more frequent
- Repel items: Reduce encounter rate

### Battle Transition

**Sequence:**
1. Player walking in overworld
2. Random encounter triggered
3. Screen flash effect (white)
4. Spiral transition (GSAP animation)
5. Battle scene loads
6. Battle begins with selected Thần Thú

**No Encounter Zones:**
- Towns/villages
- Safe zones
- Indoor areas
- Near healing stations

---

## ⚔️ Battle System (Existing)

### Turn-Based Combat

**Turn Order:**
- Determined by Speed stat
- Higher speed = acts first
- If speed equal → random selection

**Battle Flow:**
```
Battle Start
  ↓
Sort combatants by speed
  ↓
┌─────────────────┐
│ Turn Loop       │
├─────────────────┤
│ 1. Display UI   │
│ 2. Player input │
│ 3. Execute move │
│ 4. Check KO     │
│ 5. Next turn    │
└─────────────────┘
  ↓
Victory or Defeat
  ↓
Rewards (EXP, items)
  ↓
Return to overworld
```

### Actions

**Attack:**
- Basic physical attack
- Power based on Attack stat
- Affected by element advantage
- Can critical hit (10% chance)

**Skill:**
- Special move with element
- Costs PP (Power Points)
- Higher damage than basic attack
- Element advantage bonus

**Item:**
- Use item from inventory
- Healing items (HP, status)
- Capture items (Pokeball-style)
- Battle items (stat buffs)

**Run:**
- Attempt to flee
- Success rate based on Speed difference
- Cannot run from boss battles
- Guaranteed success if Speed > Enemy Speed × 1.5

### Damage Calculation

```typescript
// Base damage
let damage = attacker.attack + skill.power;

// Element advantage
const advantage = getElementAdvantage(
  attacker.element, 
  defender.element
);
damage *= advantage; // 1.5x if super effective

// Defense reduction
damage -= Math.floor(defender.defense / 2);

// Minimum damage
damage = Math.max(1, damage);

// Critical hit (10% chance)
if (isCritical) {
  damage *= 2;
}

// Apply damage
defender.hp = Math.max(0, defender.hp - damage);
```

### Element Advantages (Ngũ Hành)

**Super Effective (1.5x damage):**
```
Kim (Metal)  → Mộc (Wood)   "Metal cuts Wood"
Mộc (Wood)   → Thổ (Earth)  "Wood penetrates Earth"
Thổ (Earth)  → Thủy (Water) "Earth dams Water"
Thủy (Water) → Hỏa (Fire)   "Water extinguishes Fire"
Hỏa (Fire)   → Kim (Metal)  "Fire melts Metal"
```

**Not Very Effective (0.67x damage):**
```
Kim  ← Hỏa  (reverse of advantage)
Mộc  ← Kim
Thổ  ← Mộc
Thủy ← Thổ
Hỏa  ← Thủy
```

**Neutral (1.0x damage):**
- Same element vs same element
- Non-advantaged matchups

### Battle UI

**Player Side:**
- Thần Thú sprite (facing right)
- HP bar (green → yellow → red)
- Name and level
- Status conditions
- Action menu

**Enemy Side:**
- Thần Thú sprite (facing left)
- HP bar
- Name and level
- Status conditions

**Battle Log:**
- Action descriptions
- Damage numbers
- Effect messages
- Critical hit notifications

---

## 🎣 Capture System (Existing)

### Capture Mechanics

**Capture Items:**
- Bẫy Cơ Bản (Basic Trap) - 1.0x rate
- Bẫy Siêu Cấp (Super Trap) - 1.5x rate
- Bẫy Tối Thượng (Master Trap) - 2.0x rate

**Capture Rate Formula:**
```typescript
const baseRate = monster.captureRate / 100; // 0.1 to 0.5
const hpFactor = 1 - (monster.hp / monster.maxHp); // 0 to 1
const levelFactor = playerLevel / monster.level; // relative strength
const ballMultiplier = ball.multiplier; // 1.0, 1.5, or 2.0

const captureChance = 
  baseRate * 
  (0.5 + hpFactor * 0.5) * // HP affects 50% of rate
  Math.sqrt(levelFactor) * // Level affects capture
  ballMultiplier;

const success = Math.random() < captureChance;
```

**Capture Attempt Sequence:**
1. Player selects capture item
2. Item is thrown at enemy
3. Item animation (wobble 3 times)
4. Calculate capture rate
5. Success: Monster added to team
6. Failure: Monster breaks free, battle continues

**Factors Affecting Capture:**
- ✅ Lower HP = Higher success
- ✅ Higher player level = Higher success
- ✅ Better capture item = Higher success
- ✅ Lower enemy level = Higher success
- ✅ Status conditions = Bonus (future)
- ❌ Legendary monsters = Lower base rate

---

## 🌍 Map System (Existing)

### Current Locations (Phase 1)

1. **Cố Loa Citadel** (Thành Cố Loa)
   - Starting location
   - Safe zone
   - NPCs for tutorials

2. **Ancient Forest** (Rừng Cổ Thụ)
   - Mộc (Wood) element monsters
   - Dense trees, natural paths
   - Easy encounters

3. **Dragon Mountain** (Núi Rồng Bay)
   - Mixed element encounters
   - Rocky terrain
   - Medium difficulty

4. **Golden Valley** (Thung Lũng Vàng)
   - Kim (Metal) element focus
   - Open plains
   - Valuable items

5. **Sacred Lake** (Hồ Thiêng)
   - Thủy (Water) element monsters
   - Healing fountain
   - Fishing mini-game (future)

6. **Flame Peak** (Đỉnh Lửa)
   - Hỏa (Fire) element monsters
   - Volcanic environment
   - Hard encounters

### Map Navigation (Phase 1)

**Current System:**
- Select location from menu
- Instant travel (no walking)
- Random encounter on arrival
- Location-specific monster pools

**Phase 2 Upgrade:**
- Actual 2D overworld map
- Walk between locations
- Visible paths and obstacles
- Encounter zones on map
- NPCs to interact with
- Items to collect
- Hidden areas to discover

---

## 📊 Monster System

### Stats

**Base Stats (All Monsters Have):**
- **HP** (Hit Points) - Health, determines survival
- **Attack** - Physical damage output
- **Defense** - Physical damage reduction
- **Speed** - Turn order priority
- **Magic** - Special move power (future)

**Stat Growth:**
- Stats increase on level up
- Growth rate varies by monster
- Evolution provides stat boost
- Items can permanently boost stats

### Evolution

**Evolution Triggers:**
- Reach specific level (most common)
- Use evolution stone (special items)
- High friendship + level up (future)
- Trade with another player (future)

**Evolution Example:**
```
char001: Rồng Kim Nhỏ (Level 1)
  ↓ Level 16
char005: Rồng Kim (Level 16)
  ↓ Level 36
char010: Rồng Kim Vương (Level 36)
```

**Evolution Effects:**
- +30% to all base stats
- Learn new skills
- Change appearance
- May change element type (rare)

### Rarity Tiers

**Tier 1 - Common:**
- 45-50% capture rate
- Found everywhere
- Basic stats
- Easy to train

**Tier 2 - Uncommon:**
- 30-40% capture rate
- Specific locations
- Good stats
- Useful abilities

**Tier 3 - Rare:**
- 15-25% capture rate
- Limited spawns
- High stats
- Powerful skills

**Tier 4 - Legendary:**
- 5-10% capture rate
- Unique encounters
- Exceptional stats
- Exclusive moves
- Cannot evolve (already perfect)

---

## 🎯 Future Features (Not Yet Implemented)

### Phase 3+
- Team management (6 monsters max)
- Monster storage system (PC)
- Item inventory UI
- Shop system
- NPC battles
- Quest system
- Trading between players
- Breeding system
- PvP battles
- Leaderboards
- Achievements

### Quality of Life
- Auto-save
- Fast travel after first visit
- Running shoes (faster movement)
- Bike/mount system
- Fly ability (teleport to visited locations)
- Encounter repel items
- Lucky egg (2x EXP)

---

## 🎨 Visual Style

**Art Direction:**
- Vietnamese mythology themes
- Dragon-based creature designs
- Ancient Vietnam aesthetics
- Vibrant element colors:
  - Kim (Metal) - Silver/white
  - Mộc (Wood) - Green
  - Thủy (Water) - Blue
  - Hỏa (Fire) - Red/orange
  - Thổ (Earth) - Brown/yellow

**Animation:**
- DragonBones skeletal animation
- Smooth movement transitions
- Attack effects (GSAP)
- Damage number pop-ups
- Screen shake on critical hits

---

## 📱 Platform Support

**Current:**
- ✅ Web (Desktop browsers)
- ✅ GitHub Pages deployment

**Planned:**
- 📅 Desktop (Tauri) - Windows, macOS, Linux
- 📅 Mobile (Capacitor) - iOS, Android
- 📅 Touch controls optimization
- 📅 Responsive UI for all screen sizes

---

## 🌐 Localization

**Current:**
- ✅ Vietnamese (primary)
- All monster names in Vietnamese
- All UI text in Vietnamese
- All dialogue in Vietnamese

**Future:**
- 📅 English translation
- 📅 Language switcher in settings
- 📅 Bilingual monster names

---

**This gameplay guide will be updated as new features are implemented in each phase.**
