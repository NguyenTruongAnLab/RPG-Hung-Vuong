# Audio Integration - Quick Reference

86 audio files ready for RPG Hùng Vương. See `AUDIO_INTEGRATION_EXAMPLES.md` for details.

---

## 🚀 Quick Start

```typescript
import { AudioManager } from './core/AudioManager';
const audio = AudioManager.getInstance();

// Load & Play
await audio.load('voice_battle_start', '/assets/audio/voice_battle_start.mp3', 'voice');
audio.playVoice('voice_battle_start');

await audio.load('bgm_battle', '/assets/audio/bgm_battle.wav', 'music');
audio.playMusic('bgm_battle');

await audio.load('sfx_attack', '/assets/audio/sfx_attack.wav', 'sfx');
audio.playSFX('sfx_attack');
```

---

## 📦 Loading

```typescript
async function loadAudio(): Promise<void> {
  const audio = AudioManager.getInstance();
  await audio.load('bgm_battle', '/assets/audio/bgm_battle.wav', 'music');
  await audio.load('voice_battle_start', '/assets/audio/voice_battle_start.mp3', 'voice');
}
```

---

## 🎮 Patterns

**Sequential Voice**:
```typescript
audio.playVoice('voice_intro_welcome');
await wait(4000);
audio.playVoice('voice_intro_mission');
```

**Event Trigger**:
```typescript
onButtonClick() {
  audio.playSFX('sfx_menu_select');
  audio.playVoice('voice_menu_select');
}
```

**Combo**:
```typescript
audio.playSFX('sfx_fire');
setTimeout(() => audio.playVoice('voice_attack_fire'), 200);
```

---

## 🎼 Music

```typescript
audio.playMusic('bgm_menu', 2000);    // 2s fade
audio.playMusic('bgm_battle', 1000);  // 1s fade
audio.playMusic('bgm_victory', 500);  // 0.5s fade
```

---

## 📖 API

```typescript
AudioManager.getInstance()
async load(id, src, category)
playMusic(id, fadeIn?)
playSFX(id)
playVoice(id)
stop(id)
stopAll()
setMusicVolume(vol)
setSFXVolume(vol)
setVoiceVolume(vol)
```

---

## 🎯 Best Practices

1. Preload during scene init
2. 3-5s between story lines
3. SFX before voice (200-500ms delay)
4. Volume: Music 0.7, SFX 0.8, Voice 1.0

---

## 📝 Files

- **Voice**: 68 Vietnamese lines
- **Music**: 4 tracks
- **SFX**: 14 effects
- **Total**: 86 files

**Catalog**: `/public/assets/audio/README.md`  
**Manifest**: `/public/assets/audio/audio-manifest.json`

---

## 📘 Resources

- `AUDIO_INTEGRATION_EXAMPLES.md` - Full examples
- `/public/assets/audio/README.md` - Complete catalog
- `scripts/audio-scripts.cjs` - Vietnamese source

---

**v1.0.0**





### Opening Cinematic Scene

```typescript
export class OpeningScene extends Container {
  async init(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    // Load intro audio
    await audio.load('voice_intro_welcome', '/assets/audio/voice_intro_welcome.mp3', 'voice');
    await audio.load('voice_intro_mission', '/assets/audio/voice_intro_mission.mp3', 'voice');
    await audio.load('voice_intro_journey', '/assets/audio/voice_intro_journey.mp3', 'voice');
    await audio.load('bgm_menu', '/assets/audio/bgm_menu.wav', 'music');
    
    // Start background music
    audio.playMusic('bgm_menu', 2000); // 2 second fade in
    
    // Play narration sequence
    this.playNarrationSequence();
  }
  
  private async playNarrationSequence(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    // Welcome message
    audio.playVoice('voice_intro_welcome');
    await this.wait(4000); // Wait 4 seconds
    
    // Mission statement
    audio.playVoice('voice_intro_mission');
    await this.wait(5000); // Wait 5 seconds
    
    // Journey begins
    audio.playVoice('voice_intro_journey');
    await this.wait(4000);
    
    // Transition to next scene
    this.transitionToCharacterSelection();
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Tutorial System

```typescript
export class TutorialOverlay extends Container {
  private currentStep = 0;
  private tutorialSteps = [
    {
      voice: 'voice_tutorial_start',
      text: 'Đây là hướng dẫn cơ bản cho người mới. Hãy chú ý!',
      duration: 3000
    },
    {
      voice: 'voice_tutorial_move',
      text: 'Đây là cách di chuyển—sử dụng các phím WASD hoặc mũi tên.',
      duration: 4000
    },
    {
      voice: 'voice_tutorial_encounter',
      text: 'Gặp vùng sáng màu là nơi sinh sống của Thần Thú.',
      duration: 5000
    },
    {
      voice: 'voice_tutorial_select_team',
      text: 'Hãy chọn ba Thần Thú cho đội hình bạn.',
      duration: 4000
    },
  ];
  
  async showNextStep(): Promise<void> {
    if (this.currentStep >= this.tutorialSteps.length) {
      this.complete();
      return;
    }
    
    const step = this.tutorialSteps[this.currentStep];
    const audio = AudioManager.getInstance();
    
    // Play voice line
    audio.playVoice(step.voice);
    
    // Show text
    this.showText(step.text);
    
    // Auto-advance after duration
    await this.wait(step.duration);
    this.currentStep++;
    this.showNextStep();
  }
  
  private complete(): void {
    const audio = AudioManager.getInstance();
    audio.playVoice('voice_tutorial_complete');
    // Tutorial finished
  }
}
```

### Character Selection Scene

```typescript
export class CharacterSelectionScene extends Container {
  private selectedCount = 0;
  
  async init(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    // Load selection audio
    await audio.load('voice_select_intro', '/assets/audio/voice_select_intro.mp3', 'voice');
    await audio.load('voice_select_first', '/assets/audio/voice_select_first.mp3', 'voice');
    await audio.load('voice_select_second', '/assets/audio/voice_select_second.mp3', 'voice');
    await audio.load('voice_select_third', '/assets/audio/voice_select_third.mp3', 'voice');
    await audio.load('voice_select_complete', '/assets/audio/voice_select_complete.mp3', 'voice');
    await audio.load('sfx_menu_select', '/assets/audio/sfx_menu_select.wav', 'sfx');
    
    // Play intro
    audio.playVoice('voice_select_intro');
  }
  
  onCharacterSelected(character: Monster): void {
    const audio = AudioManager.getInstance();
    
    // Play selection sound
    audio.playSFX('sfx_menu_select');
    
    // Play appropriate voice line
    this.selectedCount++;
    switch (this.selectedCount) {
      case 1:
        audio.playVoice('voice_select_first');
        break;
      case 2:
        audio.playVoice('voice_select_second');
        break;
      case 3:
        audio.playVoice('voice_select_third');
        setTimeout(() => {
          audio.playVoice('voice_select_complete');
        }, 2000);
        break;
    }
  }
}
```

### Overworld Scene

```typescript
export class OverworldScene extends Container {
  async init(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    // Load overworld audio
    await audio.load('bgm_overworld', '/assets/audio/bgm_overworld.wav', 'music');
    await audio.load('voice_welcome_back', '/assets/audio/voice_welcome_back.mp3', 'voice');
    
    // Zone warnings
    await audio.load('voice_encounter_zone_kim', '/assets/audio/voice_encounter_zone_kim.mp3', 'voice');
    await audio.load('voice_encounter_zone_moc', '/assets/audio/voice_encounter_zone_moc.mp3', 'voice');
    await audio.load('voice_encounter_zone_thuy', '/assets/audio/voice_encounter_zone_thuy.mp3', 'voice');
    await audio.load('voice_encounter_zone_hoa', '/assets/audio/voice_encounter_zone_hoa.mp3', 'voice');
    await audio.load('voice_encounter_zone_tho', '/assets/audio/voice_encounter_zone_tho.mp3', 'voice');
    
    // Start music
    audio.playMusic('bgm_overworld');
    
    // Welcome message
    if (this.isFirstVisit) {
      audio.playVoice('voice_welcome_back');
    }
  }
  
  onEnterZone(element: string): void {
    const audio = AudioManager.getInstance();
    const voiceId = `voice_encounter_zone_${element}`;
    audio.playVoice(voiceId);
  }
}
```

### Battle Scene

```typescript
export class BattleSceneV2 extends Container {
  async init(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    // Load battle audio
    await this.loadBattleAudio();
    
    // Switch to battle music
    audio.playMusic('bgm_battle', 1000);
    
    // Battle start announcement
    setTimeout(() => {
      audio.playVoice('voice_battle_start');
    }, 500);
  }
  
  private async loadBattleAudio(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    // Music
    await audio.load('bgm_battle', '/assets/audio/bgm_battle.wav', 'music');
    await audio.load('bgm_victory', '/assets/audio/bgm_victory.wav', 'music');
    
    // Battle events
    await audio.load('voice_battle_start', '/assets/audio/voice_battle_start.mp3', 'voice');
    await audio.load('voice_battle_your_turn', '/assets/audio/voice_battle_your_turn.mp3', 'voice');
    await audio.load('voice_battle_enemy_turn', '/assets/audio/voice_battle_enemy_turn.mp3', 'voice');
    await audio.load('voice_victory', '/assets/audio/voice_victory.mp3', 'voice');
    await audio.load('voice_defeat', '/assets/audio/voice_defeat.mp3', 'voice');
    
    // Element attacks
    await audio.load('voice_attack_metal', '/assets/audio/voice_attack_metal.mp3', 'voice');
    await audio.load('voice_attack_wood', '/assets/audio/voice_attack_wood.mp3', 'voice');
    await audio.load('voice_attack_water', '/assets/audio/voice_attack_water.mp3', 'voice');
    await audio.load('voice_attack_fire', '/assets/audio/voice_attack_fire.mp3', 'voice');
    await audio.load('voice_attack_earth', '/assets/audio/voice_attack_earth.mp3', 'voice');
    
    // Effectiveness
    await audio.load('voice_super_effective', '/assets/audio/voice_super_effective.mp3', 'voice');
    await audio.load('voice_not_effective', '/assets/audio/voice_not_effective.mp3', 'voice');
    await audio.load('voice_critical_hit', '/assets/audio/voice_critical_hit.mp3', 'voice');
    
    // SFX
    await audio.load('sfx_attack', '/assets/audio/sfx_attack.wav', 'sfx');
    await audio.load('sfx_critical', '/assets/audio/sfx_critical.wav', 'sfx');
    await audio.load('sfx_fire', '/assets/audio/sfx_fire.wav', 'sfx');
    await audio.load('sfx_water', '/assets/audio/sfx_water.wav', 'sfx');
    await audio.load('sfx_metal', '/assets/audio/sfx_metal.wav', 'sfx');
    await audio.load('sfx_wood', '/assets/audio/sfx_wood.wav', 'sfx');
    await audio.load('sfx_earth', '/assets/audio/sfx_earth.wav', 'sfx');
  }
  
  onPlayerTurn(): void {
    const audio = AudioManager.getInstance();
    audio.playVoice('voice_battle_your_turn');
  }
  
  onEnemyTurn(): void {
    const audio = AudioManager.getInstance();
    audio.playVoice('voice_battle_enemy_turn');
  }
  
  onAttack(element: string, effectiveness: number): void {
    const audio = AudioManager.getInstance();
    
    // Play element-specific voice
    const voiceId = `voice_attack_${element}`;
    audio.playVoice(voiceId);
    
    // Play element-specific SFX
    const sfxId = `sfx_${element}`;
    audio.playSFX(sfxId);
    
    // Play effectiveness voice
    setTimeout(() => {
      if (effectiveness > 1.0) {
        audio.playVoice('voice_super_effective');
      } else if (effectiveness < 1.0) {
        audio.playVoice('voice_not_effective');
      }
    }, 1000);
  }
  
  onCriticalHit(): void {
    const audio = AudioManager.getInstance();
    audio.playVoice('voice_critical_hit');
    audio.playSFX('sfx_critical');
  }
  
  onVictory(): void {
    const audio = AudioManager.getInstance();
    
    // Switch to victory music
    audio.playMusic('bgm_victory', 500);
    
    // Victory announcement
    audio.playVoice('voice_victory');
    
    // Play victory SFX
    audio.playSFX('sfx_victory');
    
    // EXP gained announcement (after 2 seconds)
    setTimeout(() => {
      audio.playVoice('voice_victory_exp');
    }, 2000);
  }
  
  onDefeat(): void {
    const audio = AudioManager.getInstance();
    audio.stop('bgm_battle');
    audio.playVoice('voice_defeat');
  }
}
```

### Capture System

```typescript
export class CaptureSystem {
  attemptCapture(monster: Monster): void {
    const audio = AudioManager.getInstance();
    
    // Play capture attempt voice
    audio.playVoice('voice_capture_attempt');
    audio.playSFX('sfx_capture');
    
    // Simulate capture calculation
    const success = Math.random() > 0.5;
    
    setTimeout(() => {
      if (success) {
        audio.playVoice('voice_capture_success');
        audio.playSFX('sfx_victory');
      } else {
        audio.playVoice('voice_capture_failed');
      }
    }, 2000);
  }
}
```

---

## 🎵 Voice Line Triggers

### Complete Trigger Map

| Event | Voice File | When to Trigger |
|-------|-----------|-----------------|
| **Opening** |
| Game start | `voice_intro_welcome` | First screen |
| Mission intro | `voice_intro_mission` | After welcome |
| Journey begins | `voice_intro_journey` | Before char select |
| **Tutorial** |
| Tutorial start | `voice_tutorial_start` | Tutorial begins |
| Move instruction | `voice_tutorial_move` | First movement |
| Encounter explain | `voice_tutorial_encounter` | See encounter zone |
| Team selection | `voice_tutorial_select_team` | Party screen |
| **Character Selection** |
| Selection intro | `voice_select_intro` | Scene start |
| First character | `voice_select_first` | 1st selected |
| Second character | `voice_select_second` | 2nd selected |
| Third character | `voice_select_third` | 3rd selected |
| Team complete | `voice_select_complete` | All 3 selected |
| **Battle** |
| Battle start | `voice_battle_start` | Battle begins |
| Player turn | `voice_battle_your_turn` | Player's turn |
| Enemy turn | `voice_battle_enemy_turn` | Enemy's turn |
| Victory | `voice_victory` | Battle won |
| EXP gained | `voice_victory_exp` | After victory |
| Defeat | `voice_defeat` | Battle lost |
| **Capture** |
| Attempt | `voice_capture_attempt` | Capture button |
| Success | `voice_capture_success` | Capture succeeds |
| Failed | `voice_capture_failed` | Capture fails |
| **Element Attacks** |
| Metal attack | `voice_attack_metal` | Kim element attack |
| Wood attack | `voice_attack_wood` | Mộc element attack |
| Water attack | `voice_attack_water` | Thủy element attack |
| Fire attack | `voice_attack_fire` | Hỏa element attack |
| Earth attack | `voice_attack_earth` | Thổ element attack |
| Super effective | `voice_super_effective` | Effectiveness > 1.0 |
| Not effective | `voice_not_effective` | Effectiveness < 1.0 |
| Critical hit | `voice_critical_hit` | Critical damage |

---

## 🎼 Music Transitions

### Recommended Music Flow

```typescript
class GameMusicController {
  private audio = AudioManager.getInstance();
  
  // Opening → Character Selection
  transitionToCharacterSelection(): void {
    this.audio.playMusic('bgm_menu', 2000); // 2s fade
  }
  
  // Character Selection → Overworld
  transitionToOverworld(): void {
    this.audio.playMusic('bgm_overworld', 1500); // 1.5s fade
  }
  
  // Overworld → Battle
  transitionToBattle(): void {
    this.audio.playMusic('bgm_battle', 1000); // 1s fade (quick transition)
  }
  
  // Battle → Victory
  transitionToVictory(): void {
    this.audio.playMusic('bgm_victory', 500); // 0.5s fade (immediate)
  }
  
  // Battle → Overworld
  returnToOverworld(): void {
    this.audio.playMusic('bgm_overworld', 1500);
  }
}
```

---

## 📖 Complete API Reference

### AudioManager Methods

```typescript
// Singleton access
AudioManager.getInstance(): AudioManager

// Loading
async load(id: string, src: string, category: 'music' | 'sfx' | 'voice'): Promise<void>

// Playback
playMusic(id: string, fadeIn?: number): void
playSFX(id: string): void
playVoice(id: string): void

// Control
stop(id: string): void
stopAll(): void
pauseAll(): void
resumeAll(): void

// Volume (0.0 - 1.0)
setMusicVolume(volume: number): void
setSFXVolume(volume: number): void
setVoiceVolume(volume: number): void

// Mute
mute(): void
unmute(): void
```

---

## 🎯 Best Practices

### 1. Preload Audio
Always load audio during scene initialization, not during gameplay:

```typescript
// ✅ Good
async init() {
  await this.loadAllAudio();
  this.startScene();
}

// ❌ Bad
onButtonClick() {
  await audio.load('sfx_click', '...', 'sfx'); // Causes delay!
  audio.playSFX('sfx_click');
}
```

### 2. Use Appropriate Fade Times
- **Menu → Overworld**: 1500-2000ms (smooth transition)
- **Overworld → Battle**: 1000ms (quick change)
- **Battle → Victory**: 500ms (immediate)

### 3. Voice Line Delays
Add delays between voice lines to avoid overlap:

```typescript
audio.playVoice('voice_battle_start');
setTimeout(() => {
  audio.playVoice('voice_battle_your_turn');
}, 3000); // Wait 3 seconds
```

### 4. SFX with Voice
Play SFX first, then voice:

```typescript
audio.playSFX('sfx_attack'); // Immediate
setTimeout(() => {
  audio.playVoice('voice_super_effective'); // After impact
}, 500);
```

### 5. Category Organization
- **Music**: Long loops, one at a time
- **SFX**: Short impacts, can overlap
- **Voice**: Story/dialog, should not overlap

---

## 📝 File Reference

### All 86 Audio Files

See `/public/assets/audio/README.md` for complete catalog with Vietnamese text and English translations.

### Quick File Count
- **Voice**: 68 files
- **Music**: 4 files  
- **SFX**: 14 files
- **Total**: 86 files

### Manifest
See `/public/assets/audio/audio-manifest.json` for programmatic access to all file metadata.

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-17  
**Generated by**: RPG Hùng Vương Audio Automation System
