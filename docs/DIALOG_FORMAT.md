# Dialog Format Guide

## 📋 Overview

This guide defines the JSON format for all dialog, cutscenes, and story content in Thần Thú Văn Lang. All dialog data is stored in `src/data/story/` directory.

---

## 🗂️ File Structure

```
src/data/story/
├── story-main.json       # Main quest chain (Acts 1-4)
├── story-npcs.json       # All NPC dialogs and quests
├── story-zones.json      # Zone descriptions and events
└── story-bosses.json     # Boss intros and cutscenes
```

---

## 📝 Dialog Entry Format

### Basic Dialog

```json
{
  "id": "elder_greeting_01",
  "speaker": "toc_truong",
  "text_vi": "Chào mừng trở về, Chiến Sĩ! Ta đã chờ ngươi.",
  "text_en": "Welcome back, Warrior! I've been waiting for you.",
  "voiceFile": "voice_elder_greeting.mp3",
  "duration": 3000,
  "emotion": "welcoming",
  "nextDialog": "elder_greeting_02"
}
```

**Fields**:
- `id`: Unique identifier for this dialog line
- `speaker`: Character ID (see Character IDs section)
- `text_vi`: Vietnamese text (primary)
- `text_en`: English translation (for reference/subtitles)
- `voiceFile`: Audio file name (optional)
- `duration`: Display duration in milliseconds
- `emotion`: Character emotion (affects animations)
- `nextDialog`: Next dialog ID in sequence (null for end)

---

## 🎭 Cutscene Format

### Simple Cutscene

```json
{
  "id": "intro_cutscene",
  "type": "cinematic",
  "skippable": true,
  "scenes": [
    {
      "duration": 5000,
      "background": "landscape_scroll.png",
      "animation": "pan_left",
      "dialogs": [
        {
          "speaker": "narrator",
          "text_vi": "Chào mừng bạn đến với Văn Lang...",
          "text_en": "Welcome to Van Lang...",
          "voiceFile": "voice_intro_welcome.mp3",
          "startTime": 0
        }
      ],
      "effects": [
        {
          "type": "fade_in",
          "duration": 1000,
          "startTime": 0
        }
      ]
    }
  ]
}
```

### Branching Cutscene

```json
{
  "id": "elder_first_meeting",
  "type": "interactive",
  "dialogs": [
    {
      "id": "elder_question",
      "speaker": "toc_truong",
      "text_vi": "Ngươi đã sẵn sàng cho nhiệm vụ chưa?",
      "text_en": "Are you ready for your mission?",
      "voiceFile": "voice_elder_mission.mp3",
      "choices": [
        {
          "text_vi": "Vâng, ta sẵn sàng!",
          "text_en": "Yes, I'm ready!",
          "nextDialog": "elder_response_ready"
        },
        {
          "text_vi": "Ta cần thêm thời gian...",
          "text_en": "I need more time...",
          "nextDialog": "elder_response_wait"
        }
      ]
    }
  ]
}
```

---

## 🗣️ Character IDs

### Main Characters

| Character ID | Display Name | Voice Tone |
|--------------|--------------|------------|
| `player` | Player (customizable) | N/A |
| `narrator` | Narrator | Neutral |
| `toc_truong` | Tộc Trưởng (Elder) | Deep, slow |
| `lac_nhi` | Lạc Nhi (Scholar) | Bright, quick |
| `phong_dung` | Phong Dũng (Warrior) | Mid, steady |
| `diep_linh` | Diệp Linh (Scout) | Varied, fast |

### NPCs

| Character ID | Display Name | Location |
|--------------|--------------|----------|
| `village_mother` | Mẹ Làng | Làng Lạc Việt |
| `village_healer` | Thầy Thuốc | Làng Lạc Việt |
| `fisherman` | Ngư Dân | Sông Hồng |
| `blacksmith` | Thợ Rèn | Kim Sơn |
| `merchant` | Thương Nhân | Various |

### Bosses/Enemies

| Character ID | Display Name |
|--------------|--------------|
| `ma_cay` | Ma Cây (Tree Demon) |
| `ho_sat` | Hổ Sắt (Iron Tiger) |
| `da_khong_lo` | Đá Khổng Lồ (Stone Golem) |
| `quy_ho_9_duoi` | Quỷ Hồ 9 Đuôi (Nine-Tailed Fox) |
| `ma_vuong` | Ma Vương (Demon Lord) |

---

## 🎬 Cutscene Components

### Background Types

```json
{
  "background": "landscape_scroll.png",
  "backgroundType": "image" | "color" | "animated"
}
```

### Animation Types

| Type | Description |
|------|-------------|
| `pan_left` | Camera pans left |
| `pan_right` | Camera pans right |
| `pan_up` | Camera pans up |
| `pan_down` | Camera pans down |
| `zoom_in` | Camera zooms in |
| `zoom_out` | Camera zooms out |
| `shake` | Screen shake effect |
| `fade` | Fade in/out |

### Effect Types

```json
{
  "type": "fade_in" | "fade_out" | "letterbox" | "flash" | "particle",
  "duration": 1000,
  "startTime": 0,
  "params": {}
}
```

---

## 📦 Complete File Examples

### story-main.json

```json
{
  "meta": {
    "version": "1.0.0",
    "lastUpdated": "2025-10-17",
    "totalActs": 4
  },
  "acts": [
    {
      "id": "act1",
      "name": "Awakening",
      "name_vi": "Thức Tỉnh",
      "scenes": [
        {
          "id": "scene_1_1",
          "name": "Opening Cinematic",
          "trigger": {
            "type": "automatic",
            "condition": "first_launch"
          },
          "cutscene": "intro_cutscene"
        },
        {
          "id": "scene_1_2",
          "name": "Meet the Elder",
          "trigger": {
            "type": "location",
            "zone": "village_center"
          },
          "dialogs": [
            "elder_greeting_01",
            "elder_greeting_02",
            "elder_mission_01"
          ]
        }
      ]
    }
  ]
}
```

### story-npcs.json

```json
{
  "npcs": [
    {
      "id": "village_mother",
      "name": "Mẹ Làng",
      "location": "village_center",
      "sprite": "npc_mother.png",
      "dialogs": {
        "greeting": {
          "text_vi": "Chào con! Có việc gì ta có thể giúp không?",
          "text_en": "Hello dear! How can I help you?",
          "voiceFile": null
        },
        "quest_available": {
          "text_vi": "Con trai ta đã mất tích trong Rừng Thần...",
          "text_en": "My son is lost in the Divine Forest...",
          "voiceFile": null
        },
        "quest_active": {
          "text_vi": "Xin hãy tìm con trai ta!",
          "text_en": "Please find my son!",
          "voiceFile": null
        },
        "quest_complete": {
          "text_vi": "Cảm ơn con rất nhiều! Đây là phần thưởng.",
          "text_en": "Thank you so much! Here's your reward.",
          "voiceFile": null
        }
      },
      "quests": ["missing_child"]
    }
  ]
}
```

### story-zones.json

```json
{
  "zones": [
    {
      "id": "rung_than",
      "name": "Rừng Thần",
      "name_en": "Divine Forest",
      "element": "moc",
      "description_vi": "Khu rừng cổ xưa với những cây cổ thụ cao vút.",
      "description_en": "Ancient forest with towering old-growth trees.",
      "entryDialog": {
        "speaker": "narrator",
        "text_vi": "Rừng Thần, nơi sinh sống của các Thần Thú Mộc hệ.",
        "text_en": "Divine Forest, home of Wood-element Divine Beasts.",
        "voiceFile": "voice_zone_forest_warning.mp3"
      },
      "encounters": {
        "common": ["niu_moc", "tinh_linh_cay"],
        "rare": ["ma_cay"],
        "legendary": ["than_cay"]
      },
      "events": [
        {
          "id": "lac_nhi_joins",
          "trigger": "first_entry",
          "cutscene": "lac_nhi_introduction"
        }
      ]
    }
  ]
}
```

### story-bosses.json

```json
{
  "bosses": [
    {
      "id": "ma_cay",
      "name": "Ma Cây",
      "name_en": "Tree Demon",
      "element": "moc",
      "hp": 150,
      "location": "rung_than",
      "preBattle": {
        "cutscene": {
          "dialogs": [
            {
              "speaker": "narrator",
              "text_vi": "Ma Cây xuất hiện, bóng tối bao trùm!",
              "text_en": "Tree Demon appears, darkness shrouds!",
              "voiceFile": "voice_boss_intro_macay.mp3"
            },
            {
              "speaker": "ma_cay",
              "text_vi": "Grrr... Hãy rời khỏi rừng của ta!",
              "text_en": "Grrr... Leave my forest!",
              "voiceFile": null
            }
          ]
        }
      },
      "postBattle": {
        "victory": {
          "dialogs": [
            {
              "speaker": "narrator",
              "text_vi": "Ma Cây bị đánh bại, trở lại dạng cây thường!",
              "text_en": "Tree Demon defeated, returns to normal tree!",
              "voiceFile": "voice_boss_defeat_macay.mp3"
            }
          ],
          "rewards": {
            "exp": 500,
            "items": ["wood_stone"],
            "monster": null
          }
        },
        "defeat": {
          "dialogs": [
            {
              "speaker": "ma_cay",
              "text_vi": "Ha ha ha! Ngươi còn yếu quá!",
              "text_en": "Ha ha ha! You're too weak!",
              "voiceFile": null
            }
          ]
        }
      }
    }
  ]
}
```

---

## 🎮 Quest Format

### Quest Structure

```json
{
  "id": "missing_child",
  "name": "Đứa Trẻ Mất Tích",
  "name_en": "Missing Child",
  "giver": "village_mother",
  "type": "side_quest",
  "level": 1,
  "description_vi": "Tìm đứa trẻ mất tích trong Rừng Thần.",
  "description_en": "Find the lost child in Divine Forest.",
  "objectives": [
    {
      "id": "obj_1",
      "type": "location",
      "target": "forest_clearing",
      "description_vi": "Đến khu rừng sâu",
      "description_en": "Reach the deep forest",
      "completed": false
    },
    {
      "id": "obj_2",
      "type": "interact",
      "target": "lost_child",
      "description_vi": "Nói chuyện với đứa trẻ",
      "description_en": "Talk to the child",
      "completed": false
    },
    {
      "id": "obj_3",
      "type": "return",
      "target": "village_mother",
      "description_vi": "Quay về gặp Mẹ Làng",
      "description_en": "Return to Village Mother",
      "completed": false
    }
  ],
  "rewards": {
    "exp": 200,
    "items": ["potion"],
    "monster": "niu_moc_rare"
  },
  "startDialog": "quest_missing_child_start",
  "completeDialog": "quest_missing_child_complete"
}
```

### Quest Types

| Type | Description |
|------|-------------|
| `main_quest` | Main story quest |
| `side_quest` | Optional side quest |
| `repeatable` | Can be done multiple times |
| `timed` | Must complete within time limit |
| `daily` | Resets daily |

### Objective Types

| Type | Description |
|------|-------------|
| `location` | Reach a location |
| `interact` | Talk to NPC or object |
| `collect` | Collect items |
| `defeat` | Defeat enemies/boss |
| `capture` | Capture specific Thần Thú |
| `return` | Return to quest giver |

---

## 🎨 Emotion Tags

Used for character portrait/animation selection:

| Emotion | Description |
|---------|-------------|
| `neutral` | Default expression |
| `happy` | Smiling, cheerful |
| `sad` | Disappointed, sorrowful |
| `angry` | Frustrated, aggressive |
| `surprised` | Shocked, amazed |
| `confused` | Puzzled, uncertain |
| `determined` | Focused, resolute |
| `worried` | Concerned, anxious |
| `welcoming` | Friendly, inviting |
| `threatening` | Menacing, dangerous |

---

## 🔧 Dialog System API

### Loading Dialogs

```typescript
import { DialogSystem } from '@/systems/DialogSystem';

const dialogSystem = DialogSystem.getInstance();

// Load dialog data
await dialogSystem.loadDialogData('story-main.json');
await dialogSystem.loadDialogData('story-npcs.json');

// Get specific dialog
const dialog = dialogSystem.getDialog('elder_greeting_01');
```

### Playing Dialogs

```typescript
// Play single dialog
await dialogSystem.playDialog('elder_greeting_01');

// Play dialog sequence
await dialogSystem.playDialogSequence([
  'elder_greeting_01',
  'elder_greeting_02',
  'elder_mission_01'
]);

// Play cutscene
await dialogSystem.playCutscene('intro_cutscene');
```

### Branching Choices

```typescript
// Show dialog with choices
const choice = await dialogSystem.showChoices('elder_question');

// choice.index = selected choice index (0-based)
// choice.nextDialog = next dialog ID to play

if (choice.nextDialog) {
  await dialogSystem.playDialog(choice.nextDialog);
}
```

---

## 📊 File Size Guidelines

Per Commandment 1 (500-line law):

- `story-main.json`: <500 lines (~15 KB)
- `story-npcs.json`: <500 lines (~20 KB)
- `story-zones.json`: <400 lines (~15 KB)
- `story-bosses.json`: <400 lines (~12 KB)

**Total story data**: ~62 KB (highly compressed)

---

## ✅ Validation Checklist

Before committing story data:

- [ ] All Vietnamese text uses proper diacritics (ơ, ư, ă, etc.)
- [ ] English translations are accurate
- [ ] Voice file names match existing audio files
- [ ] All dialog IDs are unique
- [ ] Character IDs match defined list
- [ ] Quest objectives have complete data
- [ ] Cutscenes have valid trigger conditions
- [ ] File sizes are under 500 lines
- [ ] JSON is valid (no syntax errors)
- [ ] All references resolve (no broken links)

---

## 🎯 Best Practices

1. **Keep dialogs concise**: 1-2 sentences per line
2. **Use emotion tags**: Helps with visual presentation
3. **Include voice files**: Even if placeholder beeps
4. **Write in Vietnamese first**: English is secondary
5. **Test dialog flow**: Play through sequences
6. **Use meaningful IDs**: `elder_greeting_01` not `dialog_001`
7. **Add comments**: Explain complex branching
8. **Version control**: Update meta.version on changes

---

**This format enables rich, localized storytelling while maintaining clean, maintainable data structure!** 🎭✨
