# Story Guide - Thần Thú Văn Lang: Complete Narrative Arc

## 🎭 Overview

**Thần Thú Văn Lang** tells the epic story of a young Lạc Việt warrior chosen to defend the ancient kingdom of Văn Lang during the reign of the Hùng Kings. This guide provides the complete narrative structure, character profiles, and story progression for the game.

**Time Period**: 2879-258 BCE (Văn Lang/Hùng Vương dynasty)  
**Setting**: Ancient Vietnam (Văn Lang kingdom)  
**Theme**: Vietnamese mythology meets creature collection adventure

---

## 📖 Story Synopsis

### The Beginning

In the prosperous land of Văn Lang, under the wise rule of the Hùng Kings, people live in harmony with mystical creatures called **Thần Thú** (Divine Beasts). These creatures embody the five elements of **Ngũ Hành** (Kim, Mộc, Thủy, Hỏa, Thổ) and have protected the land for generations.

However, darkness is stirring. An ancient evil known as **Ma Vương** (Demon Lord) is awakening, corrupting the Thần Thú and turning them against humanity. The balance of Ngũ Hành is breaking, threatening to plunge Văn Lang into chaos.

### The Hero's Call

You are a young warrior from the **Làng Lạc Việt** (Lac Viet Village), chosen by the **Tộc Trưởng** (Tribe Elder) to become a **Thần Thú Master**. Your mission: journey across Văn Lang, form bonds with the Divine Beasts, restore the balance of elements, and defeat the Ma Vương before all is lost.

---

## 🌟 Main Characters

### Playable Character (Customizable)

**Name**: Chosen by player (default: "Chiến Sĩ" - Warrior)  
**Age**: 16-18  
**Origin**: Làng Lạc Việt  
**Role**: Thần Thú Master in training  
**Goal**: Protect Văn Lang and master all 200 Thần Thú

### Tộc Trưởng (Tribe Elder)

**Age**: 68  
**Role**: Village elder and mentor  
**Personality**: Wise, patient, mysterious  
**Voice Tone**: Deep, slow (lower frequency beeps)  
**Key Moments**:
- Opening: Gives player their first Thần Thú
- Mid-game: Reveals secrets about Ma Vương
- Ending: Celebrates player's victory

**Dialog Sample** (Vietnamese):
> "Con ơi, bóng đêm đang bao trùm đất nước. Ngươi phải thu phục Thần Thú để bảo vệ bộ lạc!"
> 
> _"Child, darkness shrouds our land. You must master the Divine Beasts to protect our tribe!"_

### Lạc Nhi (Scholar Companion)

**Age**: 17  
**Role**: Scholar and strategist  
**Personality**: Intelligent, curious, bookish  
**Voice Tone**: Bright, quick (higher frequency)  
**Specialty**: Knows Thần Thú lore and Ngũ Hành theory  
**Key Moments**:
- Rừng Thần: Joins party, teaches element advantages
- Library quest: Discovers Ma Vương's weakness
- Boss battles: Provides tactical advice

**Dialog Sample**:
> "Ta đã nghiên cứu Ngũ Hành! Kim thắng Mộc, Mộc thắng Thổ, Thổ thắng Thủy!"
> 
> _"I've studied the Five Elements! Metal beats Wood, Wood beats Earth, Earth beats Water!"_

### Phong Dũng (Warrior Companion)

**Age**: 19  
**Role**: Strong warrior and protector  
**Personality**: Brave, loyal, straightforward  
**Voice Tone**: Mid-range, steady rhythm  
**Specialty**: Combat tactics and training  
**Key Moments**:
- Núi Tản Viên: Joins party after trial
- Teaches battle skills
- Final battle: Fights alongside player

**Dialog Sample**:
> "Chiến đấu là vinh dự! Ta sẽ đồng hành cùng ngươi đến cùng!"
> 
> _"Battle is honor! I will journey with you to the end!"_

### Diệp Linh (Nimble Scout)

**Age**: 16  
**Role**: Scout and tracker  
**Personality**: Playful, nimble, adventurous  
**Voice Tone**: Varied pitch, fast tempo  
**Specialty**: Finding hidden paths and rare Thần Thú  
**Key Moments**:
- Rừng Thần: Guides through forest
- Unlocks secret areas
- Helps capture legendary creatures

**Dialog Sample**:
> "Hehe! Ta biết con đường tắt. Theo ta nào!"
> 
> _"Hehe! I know a shortcut. Follow me!"_

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
"Chào mừng trở về, Chiến Sĩ! Ta đã chờ ngươi."
(Welcome back, Warrior! I've been waiting for you.)

[Player nods]

"Bóng đêm đang bao trùm. Ngươi phải thu phục Thần Thú để bảo vệ bộ lạc!"
(Darkness shrouds us. You must master Divine Beasts to protect our tribe!)

[Screen transitions to selection]
"Hãy chọn Thần Thú đầu tiên của ngươi. Chọn khôn ngoan!"
(Choose your first Divine Beast. Choose wisely!)
```

**Outcome**: Player selects from 3 starter Thần Thú (Fire, Water, or Wood type)

#### Scene 1.3 - Tutorial Battle
**Location**: Village outskirts  
**Trigger**: Walk to edge of village  
**Voice**: `voice_tutorial_encounter.mp3`, `voice_tutorial_battle.mp3`

**Dialog**:
```
TỘC TRƯỞNG:
"Cẩn thận! Thần Thú hoang dã xuất hiện!"
(Careful! A wild Divine Beast appears!)

[Battle begins - easy enemy, 20 HP]

"Trong chiến đấu, sử dụng các kỹ năng để tấn công!"
(In battle, use skills to attack!)

[After victory]
"Tốt lắm! Ngươi đã sẵn sàng cho hành trình."
(Excellent! You are ready for the journey.)
```

**Outcome**: Victory gives first EXP, unlocks capture mechanic

---

### ACT 2: JOURNEY (Exploring Văn Lang)

**Duration**: ~3 hours  
**Goal**: Explore 5 elemental zones, collect Thần Thú, defeat mini-bosses

#### Zone 1: Rừng Thần (Divine Forest - Wood Element)

**Description**: Ancient forest with towering trees, moss-covered stones, and mystical glowing flora.

**Thần Thú Found**: Wood-type creatures (Níu Mộc, Ma Cây, Tinh Linh Cây)

**Scene 2.1 - Enter Forest**
**Trigger**: Walk to forest entrance from village  
**Voice**: `voice_zone_forest_warning.mp3`

**Cutscene**:
```
[Camera pans through dark trees]
NARRATOR:
"Rừng Thần, nơi sinh sống của các Thần Thú Mộc hệ."
(Divine Forest, home of Wood-element Divine Beasts.)

[Lạc Nhi appears]
LẠC NHI:
"Rừng này nguy hiểm. Ta sẽ đồng hành!"
(This forest is dangerous. I will accompany you!)

[Lạc Nhi joins party]
```

**Mini-Boss**: **Ma Cây** (Tree Demon)
- HP: 150
- Element: Wood
- Weak to: Fire

**Scene 2.2 - Defeat Ma Cây**
**Voice**: `voice_boss_defeat_generic.mp3`

**Dialog**:
```
[Ma Cây defeated, turns back to normal tree]
LẠC NHI:
"Ngươi đã thanh tẩy Ma Cây! Rừng được bình yên trở lại."
(You've purified the Tree Demon! The forest is peaceful again.)

[Reward: 500 EXP, Wood Stone (1/5)]
```

#### Zone 2: Sông Hồng (Red River - Water Element)

**Description**: Mighty river with rushing waters, fishing villages, and water temples.

**Thần Thú Found**: Water-type creatures (Rồng Nước, Cá Chép, Long Nữ)

**Scene 2.3 - River Crossing**
**Trigger**: Walk to river  
**Voice**: `voice_zone_water_warning.mp3`

**Cutscene**:
```
[Camera shows flowing river]
NARRATOR:
"Sông Hồng, nguồn sống của Văn Lang."
(Red River, lifeblood of Van Lang.)

[Long Nữ (Dragon Princess) appears from water]
LONG NỮ:
"Con người, hãy chứng minh ngươi xứng đáng!"
(Human, prove your worth!)

[Quest trigger: Find Sacred Pearl]
```

**Quest**: **Ngọc Trai Thiêng** (Sacred Pearl)
- Objective: Find pearl hidden in underwater cave
- Reward: Long Nữ joins as summonable Thần Thú

#### Zone 3: Kim Sơn (Metal Mountain - Metal Element)

**Description**: Rocky peaks with ore veins, ancient mines, and metal creatures.

**Thần Thú Found**: Metal-type creatures (Hổ Sắt, Kim Điêu, Cương Thạch)

**Scene 2.4 - Mountain Ascent**
**Voice**: `voice_zone_metal_warning.mp3`

**Cutscene**:
```
[Camera pans up mountain]
PHONG DŨNG (appears):
"Núi này là thử thách cho những người mạnh mẽ!"
(This mountain tests the strong!)

[Phong Dũng joins party]
```

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
