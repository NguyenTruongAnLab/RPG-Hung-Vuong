# Audio Integration Examples

Scene implementation examples for RPG Hùng Vương audio system.

See `AUDIO_INTEGRATION_GUIDE.md` for API reference.

---

## 🎬 Opening Scene

```typescript
export class OpeningScene extends Container {
  async init(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    // Load intro audio
    await audio.load('voice_intro_welcome', '/assets/audio/voice_intro_welcome.mp3', 'voice');
    await audio.load('voice_intro_mission', '/assets/audio/voice_intro_mission.mp3', 'voice');
    await audio.load('bgm_menu', '/assets/audio/bgm_menu.wav', 'music');
    
    audio.playMusic('bgm_menu', 2000);
    this.playNarration();
  }
  
  private async playNarration(): Promise<void> {
    const audio = AudioManager.getInstance();
    audio.playVoice('voice_intro_welcome');
    await wait(4000);
    audio.playVoice('voice_intro_mission');
  }
}
```

---

## 📖 Tutorial System

```typescript
export class TutorialOverlay extends Container {
  private steps = [
    { voice: 'voice_tutorial_start', duration: 3000 },
    { voice: 'voice_tutorial_move', duration: 4000 },
    { voice: 'voice_tutorial_encounter', duration: 5000 },
  ];
  
  async showNextStep(): Promise<void> {
    const step = this.steps[this.currentStep];
    const audio = AudioManager.getInstance();
    
    audio.playVoice(step.voice);
    await wait(step.duration);
    this.currentStep++;
  }
}
```

---

## 👥 Character Selection

```typescript
export class CharacterSelectionScene extends Container {
  onCharacterSelected(character: Monster): void {
    const audio = AudioManager.getInstance();
    
    audio.playSFX('sfx_menu_select');
    
    this.selectedCount++;
    const voiceMap = {
      1: 'voice_select_first',
      2: 'voice_select_second',
      3: 'voice_select_third',
    };
    
    setTimeout(() => {
      audio.playVoice(voiceMap[this.selectedCount]);
    }, 300);
  }
}
```

---

## 🗺️ Overworld Scene

```typescript
export class OverworldScene extends Container {
  async init(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    await audio.load('bgm_overworld', '/assets/audio/bgm_overworld.wav', 'music');
    await audio.load('voice_encounter_zone_kim', '/assets/audio/voice_encounter_zone_kim.mp3', 'voice');
    
    audio.playMusic('bgm_overworld');
  }
  
  onEnterZone(element: string): void {
    const audio = AudioManager.getInstance();
    audio.playVoice(`voice_encounter_zone_${element}`);
  }
}
```

---

## ⚔️ Battle Scene

```typescript
export class BattleSceneV2 extends Container {
  async init(): Promise<void> {
    const audio = AudioManager.getInstance();
    await this.loadBattleAudio();
    
    audio.playMusic('bgm_battle', 1000);
    setTimeout(() => audio.playVoice('voice_battle_start'), 500);
  }
  
  private async loadBattleAudio(): Promise<void> {
    const audio = AudioManager.getInstance();
    
    await audio.load('bgm_battle', '/assets/audio/bgm_battle.wav', 'music');
    await audio.load('voice_battle_start', '/assets/audio/voice_battle_start.mp3', 'voice');
    await audio.load('voice_attack_metal', '/assets/audio/voice_attack_metal.mp3', 'voice');
    await audio.load('sfx_attack', '/assets/audio/sfx_attack.wav', 'sfx');
  }
  
  onAttack(element: string, effectiveness: number): void {
    const audio = AudioManager.getInstance();
    
    audio.playVoice(`voice_attack_${element}`);
    audio.playSFX(`sfx_${element}`);
    
    setTimeout(() => {
      if (effectiveness > 1.0) {
        audio.playVoice('voice_super_effective');
      } else if (effectiveness < 1.0) {
        audio.playVoice('voice_not_effective');
      }
    }, 1000);
  }
  
  onVictory(): void {
    const audio = AudioManager.getInstance();
    audio.playMusic('bgm_victory', 500);
    audio.playVoice('voice_victory');
    audio.playSFX('sfx_victory');
    
    setTimeout(() => audio.playVoice('voice_victory_exp'), 2000);
  }
}
```

---

## 🎯 Capture System

```typescript
export class CaptureSystem {
  attemptCapture(monster: Monster): void {
    const audio = AudioManager.getInstance();
    
    audio.playVoice('voice_capture_attempt');
    audio.playSFX('sfx_capture');
    
    setTimeout(() => {
      const success = Math.random() > 0.5;
      audio.playVoice(success ? 'voice_capture_success' : 'voice_capture_failed');
    }, 2000);
  }
}
```

---

## 📋 Voice Trigger Map

| Event | Voice File | Trigger |
|-------|-----------|---------|
| Game start | `voice_intro_welcome` | Immediate |
| Tutorial start | `voice_tutorial_start` | Tutorial begins |
| Char select | `voice_select_first` | 1st character |
| Enter zone | `voice_encounter_zone_kim` | Zone entry |
| Battle start | `voice_battle_start` | Battle begins |
| Player turn | `voice_battle_your_turn` | Turn start |
| Metal attack | `voice_attack_metal` | Kim attack |
| Super effective | `voice_super_effective` | After attack |
| Victory | `voice_victory` | Battle won |
| Capture | `voice_capture_attempt` | Capture button |

---

## 🎯 Implementation Tips

### Timing
- Story: 3-5s between lines
- Battle: 1-2s between callouts
- UI: Immediate (0-0.3s)

### Volume
```typescript
audio.setMusicVolume(0.7);
audio.setSFXVolume(0.8);
audio.setVoiceVolume(1.0);
```

### Error Handling
```typescript
try {
  await audio.load('voice_battle_start', '/assets/audio/voice_battle_start.mp3', 'voice');
} catch (error) {
  console.warn('Audio load failed, continuing silently', error);
}
```

---

**v1.0.0**

