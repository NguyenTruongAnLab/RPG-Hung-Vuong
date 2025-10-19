# Story Guide - Thần Thú Văn Lang: Complete Narrative Arc

## 🎭 Overview

**Thần Thú Văn Lang** tells the epic story of a young explorer discovering the ancient kingdom of Văn Lang during the reign of the Hùng Kings, capturing and befriending three divine beasts in a journey across Vietnamese mythology.

**Time Period**: 2879-258 BCE (Văn Lang/Hùng Vương dynasty)  
**Setting**: Ancient Vietnam (Văn Lang kingdom)  
**Theme**: Vietnamese mythology exploration + creature collection (like Pokémon) with 3 companion beasts  
**Gameplay Style**: Real-time top-down exploration with turn-based battles

---

## 📖 Story Synopsis

### The Beginning

In the prosperous land of Văn Lang, under the wise rule of the Hùng Kings, people live in harmony with mystical creatures called **Thần Thú** (Divine Beasts). These creatures embody the five elements of **Ngũ Hành** (Kim, Mộc, Thủy, Hỏa, Thổ) and roam the land freely.

An ancient legend speaks of a great explorer who would journey across Văn Lang, discover its secrets, and form bonds with three legendary Thần Thú. You are that explorer.

### The Hero's Call

You are a young explorer from **Làng Lạc Việt** (Lac Viet Village), setting out on a great adventure to discover the world, meet the Thần Thú, and learn the secrets of Văn Lang. With three divine beasts at your side, you'll explore vast forests, climb sacred mountains, cross mystical rivers, and uncover the legends hidden within this ancient land.

---

## 🌟 Main Characters

### Playable Character (Player-Named Explorer)

**Name**: Chosen by player (default: "Sasha")  
**Age**: 16-18  
**Origin**: Làng Lạc Việt  
**Role**: Young explorer and adventurer  
**Goal**: Discover Văn Lang, befriend three Divine Beasts, uncover ancient secrets  
**Personality**: Curious, brave, determined to explore the world

---

## 🐉 Companion System: Three Divine Beasts

Instead of a party of human companions, you journey with **3 Thần Thú (Divine Beasts)** that you'll encounter and befriend throughout your journey. Like Pokémon, each beast has unique abilities and element types.

### Companion Slot 1: First Thần Thú (Starter)
**How You Get It**: Gift from the village Elder at the start of your journey  
**Purpose**: Your primary companion in battles  
**Role**: Tank/defender for your team

### Companion Slot 2: Second Thần Thú  
**How You Get It**: Encounter and capture in the forest zone  
**Purpose**: Secondary attacker  
**Role**: Balanced offensive/defensive

### Companion Slot 3: Third Thần Thú  
**How You Get It**: Encounter and capture in a later zone  
**Purpose**: Special ability provider  
**Role**: Utility and special effects

---

## 👥 Key NPCs You'll Meet

### Tộc Trưởng (Village Elder)

**Age**: 68  
**Location**: Làng Lạc Việt (starting village)  
**Role**: Quest giver, mentor, story guide  
**Personality**: Wise, patient, knowledgeable about ancient legends  
**Voice Tone**: Deep, slow (lower frequency)  
**Key Moments**:
- Opening: Gives you your first Thần Thú
- Mid-journey: Shares legends and guidance
- Ending: Celebrates your discoveries

**Dialog Sample**:
> "Hành trình khám phá của em sẽ kể cho chúng ta những chuyện chưa bao giờ nghe!"  
> _"Your journey of discovery will tell us stories we've never heard!"_

### Lạc Nhi (Scholar - Optional)

**Age**: 17  
**Location**: Forest temple  
**Role**: Optional guide who explains element system  
**Personality**: Intelligent, curious, bookish  
**Specialty**: Knows about element types and Thần Thú lore

### Tự Xưa (Hermit - Optional)

**Age**: Unknown  
**Location**: Mountain peak  
**Role**: Optional wise guide  
**Personality**: Mysterious, speaks in riddles  
**Specialty**: Teaches ancient secrets and meditation techniques

---

## 🗺️ Act Structure

### ACT 1: AWAKENING (Làng Lạc Việt)

**Duration**: ~20 minutes  
**Goal**: Learn basics, choose starter Thần Thú, complete first battle

#### Scene 1.1 - Opening Cinematic
**File**: `IntroScene.ts`  
**Voice**: `voice_intro_welcome.mp3`, `voice_intro_mission.mp3`, `voice_intro_journey.mp3`

**Script**:
```
[Screen fades from black to scrolling landscape]
NARRATOR (V.O.):
"Chào mừng bạn đến với Văn Lang, thời đại của các vị Vua Hùng!"
(Welcome to Van Lang, the era of the Hung Kings!)

[Landscape transitions to village silhouette]
"Bạn là Chiến Sĩ Lạc Việt, sứ mệnh bảo vệ bộ lạc bằng sức mạnh Thần Thú."
(You are a Lac Viet Warrior, with the mission to protect the tribe with Divine Beast power.)

[Screen fades to village entrance]
"Hành trình của bạn bắt đầu từ đây. Hãy khám phá thế giới và thu phục các Thần Thú!"
(Your journey begins here. Explore the world and capture the Divine Beasts!)
```

**Duration**: 60 seconds  
**Skippable**: Yes (Press Space/ESC)

#### Scene 1.2 - Meet the Elder
**Location**: Village center  
**Trigger**: Automatic after intro  
**Voice**: `voice_elder_greeting.mp3`, `voice_elder_mission.mp3`

**Dialog**:
```
TỘC TRƯỞNG:
"Chào mừng bạn, nhà thám hiểm trẻ! Ta đã chờ ngươi."
(Welcome, young explorer! I've been waiting for you.)

[Player nods]

"Hãy khám phá Văn Lang. Gặp gỡ những Thần Thú, kết bạn với chúng, và biết thêm về thế giới của chúng ta."
(Explore Van Lang. Meet Divine Beasts, befriend them, and learn about our world.)

[Screen transitions to selection]
"Hãy chọn Thần Thú đầu tiên làm bạn đồng hành. Chọn khôn ngoan!"
(Choose your first Divine Beast companion. Choose wisely!)
```

**Outcome**: Player selects from 3 starter Thần Thú (Fire, Water, or Wood type)

#### Scene 1.3 - First Encounter
**Location**: Village outskirts  
**Trigger**: Walk to edge of village  
**Voice**: `voice_tutorial_encounter.mp3`, `voice_tutorial_battle.mp3`

**Dialog**:
```
TỘC TRƯỞNG:
"Chú ý! Một Thần Thú hoang dã!"
(Look! A wild Divine Beast!)

[Battle begins - easy enemy, 20 HP]

"Hãy thử chiến đấu! Sử dụng các kỹ năng để tấn công!"
(Try battling! Use skills to attack!)

[After victory]
"Tuyệt vời! Ngươi có thể cố gắng bắt nó nếu muốn."
(Great! You can try to catch it if you wish.)
```

**Outcome**: Learn battle mechanics, option to capture Thần Thú, unlock catch system

---

### ACT 2: JOURNEY (Exploring Văn Lang - Discovery & Collection)

**Duration**: ~3 hours  
**Goal**: Explore zones, encounter wild Thần Thú, befriend your companions, discover Văn Lang's secrets

#### Zone 1: Rừng Thần (Divine Forest - Wood Element)

**Description**: Ancient forest with towering trees, moss-covered stones, and mystical glowing flora. Home to many Wood-element Divine Beasts.

**Thần Thú Found**: Wood-type creatures you can encounter and catch

**Scene 2.1 - Enter Forest**
**Trigger**: Walk to forest entrance from village  
**Voice**: `voice_zone_forest_discover.mp3`

**Cutscene**:
```
[Camera pans through ancient trees, shafts of light through canopy]
NARRATOR:
"Rừng Thần - được gọi theo cách các Thần Thú Mộc hệ sinh sống tại đây."
(Divine Forest - named for the Wood-element Divine Beasts living here.)

[Soft forest ambiance plays]
"Khám phá rừng này. Gặp gỡ những Thần Thú mới. Hãy mạnh mẽ lên!"
(Explore this forest. Meet new Divine Beasts. Grow stronger!)
```

**What You'll Find**:
- Multiple wild Thần Thú encounters (Wood-type)
- Hidden items and treasures
- Optional NPC: Lạc Nhi (Scholar who explains element system)
- Opportunities to catch your second companion

#### Zone 2: Sông Hồng (Red River - Water Element)

**Description**: Mighty river with rushing waters, fishing villages, and ancient temples by the shore.

**Thần Thú Found**: Water-type creatures

**Scene 2.2 - River Discovery**
**Trigger**: Walk to river  
**Voice**: `voice_zone_water_discover.mp3`

**Cutscene**:
```
[Camera shows flowing river, waterfalls in distance]
NARRATOR:
"Sông Hồng - dòng sông thiêng của Văn Lang. Nơi đây sống những Thần Thú Thủy hệ."
(Red River - sacred river of Van Lang. Home to Water-element Divine Beasts.)

[Peaceful water sounds]
"Tìm hiểu những bí ẩn nơi bờ sông."
(Discover the mysteries along the river.)
```

**What You'll Find**:
- Water-type Thần Thú encounters
- Fishing village NPCs with stories
- Opportunity to catch your second or third companion
- Hidden underwater areas

#### Zone 3: Kim Sơn (Metal Mountain - Metal Element)

**Description**: Rocky peaks with ore veins, ancient mines, and metal-type Divine Beasts.

**Thần Thú Found**: Metal-type creatures

**Scene 2.3 - Mountain Ascent**
**Voice**: `voice_zone_metal_discover.mp3`

**Cutscene**:
```
[Camera pans up mountain peaks]
NARRATOR:
"Kim Sơn - ngọn núi có tầm nhìn rộng nhất Văn Lang."
(Metal Mountain - the highest-viewing mountain in Van Lang.)

"Lên đỉnh. Gặp gỡ những Thần Thú mạnh mẽ."
(Climb to the peak. Meet powerful Divine Beasts.)
```

**What You'll Find**:
- Metal-type Thần Thú encounters  
- Challenging battles
- Panoramic views and discoveries
- Final companion encounter opportunity

**Mini-Boss**: **Hổ Sắt** (Iron Tiger)
- HP: 200
- Element: Metal
- Weak to: Fire

#### Zone 4: Núi Lửa Hỏa Diệm (Fire Volcano)

**Description**: Active volcano with lava flows, ash fields, and fire spirits.

**Thần Thú Found**: Fire-type creatures (Phượng Hoàng, Hỏa Kỳ Lân, Linh Hỏa)

**Scene 2.5 - Volcanic Eruption**
**Voice**: `voice_zone_fire_warning.mp3`

**Cutscene**:
```
[Ground shakes, volcano rumbles]
NARRATOR:
"Núi lửa đang thức giấc! Hãy cẩn thận!"
(The volcano awakens! Be careful!)
```

**Mini-Boss**: **Phượng Hoàng Ma Hóa** (Corrupted Phoenix)
- HP: 250
- Element: Fire
- Weak to: Water

#### Zone 5: Đồng Bằng Thổ (Earth Plains)

**Description**: Vast plains with rice paddies, earthen mounds, and stone circles.

**Thần Thú Found**: Earth-type creatures (Thổ Linh, Đá Khổng Lồ, Khôn Ngưu)

**Mini-Boss**: **Đá Khổng Lồ** (Giant Stone Golem)
- HP: 300
- Element: Earth
- Weak to: Wood

---

### ACT 3: CONFRONTATION (Facing Evil)

**Duration**: ~2 hours  
**Goal**: Gather 5 elemental stones, uncover Ma Vương's plan

#### Scene 3.1 - Library of Legends
**Location**: Ancient library in capital city  
**Trigger**: After collecting 3+ elemental stones  
**Voice**: `voice_library_discovery.mp3`

**Cutscene**:
```
LẠC NHI (reading ancient texts):
"Ta tìm ra rồi! Ma Vương sẽ phá vỡ cân bằng Ngũ Hành!"
(I found it! The Demon Lord will break the Five Elements balance!)

[Shows ancient prophecy scroll]

"Chỉ có người thu phục được 200 Thần Thú mới có thể ngăn chặn hắn!"
(Only one who masters 200 Divine Beasts can stop him!)
```

#### Scene 3.2 - Sơn Tinh's Trial
**Location**: Núi Tản Viên (Tan Vien Mountain peak)  
**Trigger**: After gathering all 5 stones  
**Voice**: `voice_sontinh_challenge.mp3`

**Cutscene**:
```
[Mountain god SƠN TINH appears]
SƠN TINH:
"Ngươi muốn sức mạnh để chiến đấu Ma Vương?"
(You seek power to fight the Demon Lord?)

"Hãy chứng minh sức mạnh của ngươi!"
(Prove your strength!)

[Boss battle begins]
```

**Boss**: **Sơn Tinh** (Mountain God)
- HP: 400
- Element: Earth/Mountain
- Special: Summons rock creatures

**Reward**: Sơn Tinh's blessing, legendary Thần Thú

#### Scene 3.3 - Hồ Tây Mystery
**Location**: Hồ Tây (West Lake)  
**Voice**: `voice_hoguoi_awakening.mp3`

**Cutscene**:
```
[Lake starts glowing with dark energy]
DIỆP LINH:
"Có gì đó không ổn ở hồ này..."
(Something's wrong with this lake...)

[QUỶ HỒ 9 ĐUÔI emerges]
QUỶ HỒ 9 ĐUÔI:
"Ma Vương gọi ta! Hãy chết đi, nhân loại!"
(Demon Lord calls me! Die, humans!)

[Boss battle]
```

**Boss**: **Quỷ Hồ 9 Đuôi** (Nine-Tailed Fox Spirit)
- HP: 500
- Element: Dark/Illusion
- Special: Creates illusions, multi-hit attacks

---

### ACT 4: FINAL BATTLE (Saving Văn Lang)

**Duration**: ~1 hour  
**Goal**: Reach Thánh Địa, defeat Ma Vương, save the kingdom

#### Scene 4.1 - March to Sacred Land
**Location**: Thánh Địa Hùng Vương (Sacred Land of Hung Kings)  
**Trigger**: After defeating all major bosses  
**Voice**: `voice_final_march.mp3`

**Cutscene**:
```
[All companions gather]
PHONG DŨNG:
"Đây là trận chiến cuối cùng!"
(This is the final battle!)

LẠC NHI:
"Ta tin ngươi sẽ thành công!"
(I believe you will succeed!)

DIỆP LINH:
"Cùng nhau chiến đấu!"
(Let's fight together!)

[Party marches toward dark fortress]
```

#### Scene 4.2 - Confronting Ma Vương
**Location**: Dark throne room  
**Voice**: `voice_mavuong_monologue.mp3`

**Cutscene**:
```
[MA VƯƠNG sits on corrupted throne]
MA VƯƠNG:
"Cuối cùng ngươi cũng đến! Nhưng đã quá muộn!"
(Finally you arrive! But it's too late!)

"Ta sẽ phá hủy Ngũ Hành và thống trị Văn Lang!"
(I will destroy the Five Elements and rule Van Lang!)

PLAYER:
"Ta sẽ không để ngươi làm thế!"
(I won't let you!)

[Final boss battle begins]
```

**Boss**: **Ma Vương** (Demon Lord)
- HP: 800 (Phase 1), 600 (Phase 2)
- Element: Dark (no weaknesses)
- Special: Multi-phase fight, summons corrupted Thần Thú

**Phase 1**: Ma Vương at full power
- Uses all 5 element attacks
- Summons corrupted minions

**Phase 2** (At 50% HP): Transforms
- Becomes more powerful
- Uses Dark element exclusively
- Final desperation attacks

#### Scene 4.3 - Victory
**Voice**: `voice_victory_speech.mp3`, `voice_ending_celebration.mp3`

**Cutscene**:
```
[Ma Vương defeated, dark energy dissipates]
MA VƯƠNG:
"Không thể nào... ta sẽ trở lại..."
(Impossible... I will return...)

[Fades away]

[Light returns to the land]
NARRATOR:
"Ma Vương bị đánh bại! Văn Lang được cứu rỗi!"
(The Demon Lord is defeated! Van Lang is saved!)

[All companions celebrate]
TỘC TRƯỞNG (appears):
"Ngươi đã làm được! Con là anh hùng của Văn Lang!"
(You did it! You are Van Lang's hero!)

[Screen shows all collected Thần Thú]
"200 Thần Thú đã được thu phục. Cân bằng Ngũ Hành được khôi phục!"
(200 Divine Beasts mastered. The Five Elements balance is restored!)
```

#### Scene 4.4 - Ending Credits
**Voice**: Background music only  
**Visuals**: Scrolling credits with artwork

**Post-Credits Scene**:
```
[Dark throne room, empty]
[Small dark energy remains]
[Screen fades to black]
[Text appears: "To Be Continued...?"]
```

---

## 🎭 Side Quests

### Quest 1: Missing Child (Đứa Trẻ Mất Tích)
**Giver**: Village Mother  
**Location**: Làng Lạc Việt  
**Objective**: Find child lost in Rừng Thần  
**Reward**: Rare Wood-type Thần Thú  
**Duration**: 10 minutes

### Quest 2: Sacred Herbs (Dược Thảo Thiêng)
**Giver**: Village Healer  
**Location**: Làng Lạc Việt  
**Objective**: Collect 5 rare herbs from different zones  
**Reward**: Healing items, EXP  
**Duration**: 20 minutes

### Quest 3: Fisherman's Pearl (Ngọc Trai Của Ngư Dân)
**Giver**: Old Fisherman  
**Location**: Sông Hồng  
**Objective**: Retrieve pearl from underwater cave  
**Reward**: Water Stone, Summon Long Nữ  
**Duration**: 15 minutes

### Quest 4: Blacksmith's Ore (Quặng Của Thợ Rèn)
**Giver**: Village Blacksmith  
**Location**: Kim Sơn  
**Objective**: Mine rare ore from deep caves  
**Reward**: Metal equipment, stronger weapons  
**Duration**: 15 minutes

### Quest 5: Ancient Texts (Văn Bản Cổ)
**Giver**: Lạc Nhi  
**Location**: Various temples  
**Objective**: Find 3 ancient scrolls about Thần Thú  
**Reward**: Lore unlocks, rare capture items  
**Duration**: 30 minutes

---

## 🎵 Voice Line Integration

### Voice Categories

**Narration** (4 files):
- `voice_intro_welcome.mp3` - Opening welcome
- `voice_intro_mission.mp3` - Mission statement  
- `voice_intro_journey.mp3` - Journey begins
- `voice_welcome_back.mp3` - Return greeting

**Tutorial** (7 files):
- `voice_tutorial_start.mp3` - Tutorial intro
- `voice_tutorial_move.mp3` - Movement guide
- `voice_tutorial_encounter.mp3` - Encounter explanation
- `voice_tutorial_select_team.mp3` - Team selection
- `voice_tutorial_battle.mp3` - Battle basics
- `voice_tutorial_elements.mp3` - Element system
- `voice_tutorial_capture.mp3` - Capture mechanics

**Battle** (12 files):
- `voice_battle_start.mp3` - Battle begins
- `voice_battle_victory.mp3` - Victory
- `voice_battle_defeat.mp3` - Defeat
- `voice_attack_kim.mp3` - Metal attack
- `voice_attack_moc.mp3` - Wood attack
- `voice_attack_thuy.mp3` - Water attack
- `voice_attack_hoa.mp3` - Fire attack
- `voice_attack_tho.mp3` - Earth attack
- `voice_super_effective.mp3` - Super effective hit
- `voice_not_effective.mp3` - Not very effective
- `voice_critical_hit.mp3` - Critical hit
- `voice_monster_fainted.mp3` - Monster fainted

**Overworld** (5 files):
- Zone warnings for each element region

**UI Feedback** (10 files):
- Menu navigation, level up, save/load, etc.

---

## 📊 Story Progression Tracking

### Save Data Structure

```typescript
interface StoryProgress {
  act: number; // 1-4
  completedScenes: string[]; // Scene IDs
  activeQuests: Quest[];
  completedQuests: string[];
  unlockedZones: string[];
  elementalStones: number; // 0-5
  companionsJoined: string[]; // 'lacnhi', 'phongdung', 'dieplinh'
  bossesDefeated: string[];
  totalPlayTime: number; // minutes
}
```

### Scene Triggers

Scenes are triggered by:
1. **Location**: Entering specific areas
2. **Progress**: Completing prerequisites
3. **Items**: Possessing key items (elemental stones)
4. **Time**: After certain duration or events
5. **Manual**: Talking to NPCs

---

## ✅ Implementation Checklist

- [ ] Create all story data JSON files (<500 lines each)
- [ ] Implement StoryManager to track progress
- [ ] Create cutscene templates for each act
- [ ] Write all character dialogs in Vietnamese
- [ ] Integrate voice lines with text display
- [ ] Add subtitle system for accessibility
- [ ] Implement quest tracking UI
- [ ] Test complete story playthrough
- [ ] Verify all voice files play correctly
- [ ] Ensure story can be completed in 6-8 hours

---

**Total Story Length**: 6-8 hours (main quest) + 2-3 hours (side quests)  
**Total Cutscenes**: 15 major + 10 minor = 25 total  
**Total Dialog Lines**: ~200 Vietnamese lines  
**Voice Files Used**: 68 out of 86 available

**This story creates an immersive Vietnamese mythology experience while teaching players about Ngũ Hành, legendary creatures, and ancient Văn Lang culture!** 🇻🇳✨
