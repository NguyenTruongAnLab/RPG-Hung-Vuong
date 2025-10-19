# DragonBones Integration Guide

**Complete guide for leveraging pixi-dragonbones-runtime in this project**

**Last Updated**: 2025-10-17  
**Runtime Version**: pixi-dragonbones-runtime 8.0.3+  
**API Reference**: https://h1ve2.github.io/pixi-dragonbones-runtime/api/8.x/

---

## 🎯 Quick Start

### 1. Load and Display a Character

```typescript
import { AssetManager } from './core/AssetManager';
import { DragonBonesManager } from './core/DragonBonesManager';
import * as PIXI from 'pixi.js';

// In your scene initialization
const app = new PIXI.Application();
const dbManager = new DragonBonesManager(app);
const assetManager = AssetManager.getInstance();

// Load character
const asset = await assetManager.loadDragonBonesCharacter('Absolution');

// Create display
const armatureDisplay = dbManager.createDisplay(asset, 'Absolution');
armatureDisplay.position.set(400, 300);
app.stage.addChild(armatureDisplay);

// Play animation
armatureDisplay.animation.play('Idle', 0); // 0 = loop infinitely
```

### 2. Using the Animation Component (Recommended)

```typescript
import { DragonBonesAnimation } from './entities/components/DragonBonesAnimation';

const animation = new DragonBonesAnimation(app);
await animation.loadCharacter('Absolution');

// Add to scene
const display = animation.getDisplay();
if (display) {
  scene.addChild(display);
}

// Play animations
animation.play('Idle'); // Loop idle
animation.play('Attack A', 1); // Attack once
```

---

## 🏗️ Architecture Integration

### Follow the 4 Commandments

**1. 1000-Line Law**: All DragonBones code follows the line limit
- `DragonBonesManager.ts`: 126 lines ✅
- `DragonBonesAnimation.ts`: 255 lines ✅
- `AssetManager.ts`: 402 lines ✅

**2. Use Popular Libraries**: We use `pixi-dragonbones-runtime` (official Pixi 8 runtime)
- Not deprecated `dragonbones.js` or community packages
- Active maintenance, full TypeScript support

**3. Extreme Modularity**: Component-based approach
- `DragonBonesManager`: Factory wrapper (core)
- `DragonBonesAnimation`: Animation controller (component)
- `AssetManager`: Asset loading (core)

**4. Documentation = Success**: All methods have JSDoc with @example

### Directory Structure Compliance

```
src/
├── core/
│   ├── DragonBonesManager.ts        # Factory wrapper (<300 lines)
│   └── AssetManager.ts               # Asset loading (<400 lines)
├── entities/components/
│   └── DragonBonesAnimation.ts      # Animation controller (<300 lines)
├── types/
│   └── dragonbones.d.ts             # Type definitions
└── data/
    └── monster-database.json         # 207 monsters with animations
```

---

## 📚 Core Classes & Usage

### 1. PixiFactory (Singleton)

**Purpose**: Creates armatures, manages global DragonBones data  
**Access**: `PixiFactory.factory` (static singleton)

```typescript
import { PixiFactory } from 'pixi-dragonbones-runtime';

const factory = PixiFactory.factory;

// Parse skeleton data
factory.parseDragonBonesData(skeletonJSON);

// Parse texture atlas
factory.parseTextureAtlasData(atlasJSON, textureImage);

// Build armature display
const display = factory.buildArmatureDisplay('characterName');

// Clear all cached data (on scene cleanup)
factory.clear();
```

**Important**: Use our `DragonBonesManager` wrapper instead of calling factory directly.

### 2. PixiArmatureDisplay

**Purpose**: Pixi container with DragonBones armature  
**Extends**: `PIXI.Container`

```typescript
import { PixiArmatureDisplay } from 'pixi-dragonbones-runtime';

// Display is a Pixi container
display.position.set(x, y);
display.scale.set(0.5);
display.rotation = Math.PI / 4;

// Access animation controller
display.animation.play('walk');

// Access armature (skeleton)
const bone = display.armature.getBone('arm');
bone.offset.rotation = Math.PI / 2;
bone.invalidUpdate();

// Cleanup
display.dispose();
```

### 3. Animation Controller

**Purpose**: Play, blend, and control animations

```typescript
// Play animation
display.animation.play('idle', 0); // 0 = loop infinitely
display.animation.play('attack', 1); // 1 = play once

// Fade in (smooth blend)
display.animation.fadeIn('walk', 0.3, 0); // 0.3s fade, loop

// Stop animations
display.animation.stop(); // Stop all
display.animation.stop('walk'); // Stop specific

// Get animation state
const state = display.animation.getState('jump');
if (state?.isCompleted) {
  console.log('Jump finished!');
}

// List available animations
const animations = display.animation.animationNames;
console.log('Available:', animations); // ['Idle', 'Attack A', 'Damage']
```

### 4. Armature & Bone Manipulation

**Purpose**: Direct skeleton control for effects

```typescript
// Get bone reference
const armBone = display.armature.getBone('arm');
const headBone = display.armature.getBone('head');

// Transform bone
armBone.offset.scaleX = 2.0;  // Make arm twice as long
armBone.offset.rotation = Math.PI / 4; // Rotate 45°
armBone.invalidUpdate(); // Force update next frame

// Read transformed values
armBone.updateGlobalTransform();
const worldRotation = armBone.global.rotation;
const worldPosition = { x: armBone.global.x, y: armBone.global.y };

// Example: Head tracking cursor
headBone.offset.rotation = Math.atan2(cursorY - headY, cursorX - headX);
headBone.invalidUpdate();
```

**Warning**: Bone manipulation is advanced. Use sparingly for special effects only.

---

## 🎬 Animation Patterns

### Pattern 1: Simple Loop

```typescript
// Battle idle animation
display.animation.play('Idle', 0); // Loop forever
```

### Pattern 2: Play Once with Callback

```typescript
// Attack animation with callback
const state = display.animation.play('Attack A', 1); // Play once

// Listen for completion (use EventBus pattern)
EventBus.getInstance().once('animation:complete', () => {
  // Return to idle
  display.animation.play('Idle', 0);
});
```

### Pattern 3: Animation Sequence

```typescript
async function playAttackSequence(attacker: PixiArmatureDisplay) {
  // Wind-up
  attacker.animation.play('Attack A', 1);
  await delay(500); // Wait for animation
  
  // Impact
  attacker.animation.play('Attack B', 1);
  await delay(300);
  
  // Return to idle
  attacker.animation.play('Idle', 0);
}
```

### Pattern 4: Smooth Blending

```typescript
// Transition from walk to run smoothly
display.animation.fadeIn('run', 0.3, 0); // 0.3s blend time
```

### Pattern 5: Layer Blending (Advanced)

```typescript
// Base layer: walking
display.animation.fadeIn('walk', 0.3, 0, 0, 'baseLayer');

// Attack layer: attack while walking
display.animation.fadeIn('attack', 0.2, 1, 1, 'attackLayer');
```

---

## 🎮 Project-Specific Patterns

### Monster Battle Animation

**Use Case**: Play monster attack in battle

```typescript
import { DragonBonesAnimation } from './entities/components/DragonBonesAnimation';

class BattleMonster {
  private animation: DragonBonesAnimation;
  
  async initialize(monsterName: string) {
    this.animation = new DragonBonesAnimation(app);
    await this.animation.loadCharacter(monsterName);
    
    // Set battle position
    const display = this.animation.getDisplay();
    display?.position.set(600, 300);
    display?.scale.set(0.8);
    
    // Play idle
    this.animation.play('Idle');
  }
  
  async attack(): Promise<void> {
    // Play attack animation
    this.animation.play('Attack A', 1);
    
    // Wait for animation to complete
    await this.animation.playBattleSequence('A');
    
    // Return to idle
    this.animation.play('Idle');
  }
  
  takeDamage(): void {
    this.animation.play('Damage', 1);
    
    setTimeout(() => {
      this.animation.play('Idle');
    }, 500);
  }
}
```

### Overworld Character Display

**Use Case**: Show character in overworld (non-battle)

```typescript
class OverworldCharacter {
  private display: PixiArmatureDisplay;
  
  async spawn(characterName: string, x: number, y: number) {
    const asset = await AssetManager.getInstance()
      .loadDragonBonesCharacter(characterName);
    
    const dbManager = new DragonBonesManager(app);
    this.display = dbManager.createDisplay(asset, characterName);
    
    // Small scale for overworld
    this.display.scale.set(0.3);
    this.display.position.set(x, y);
    
    // Play walking animation
    this.display.animation.play('Idle', 0);
    
    return this.display;
  }
  
  walk(): void {
    // Check if walk animation exists
    if (this.display.animation.animationNames.includes('Walk')) {
      this.display.animation.fadeIn('Walk', 0.2, 0);
    }
  }
  
  idle(): void {
    this.display.animation.fadeIn('Idle', 0.2, 0);
  }
}
```

### Character Selection Preview

**Use Case**: Display character in selection menu

```typescript
async function showCharacterPreview(characterName: string, container: PIXI.Container) {
  const animation = new DragonBonesAnimation(app);
  await animation.loadCharacter(characterName);
  
  const display = animation.getDisplay();
  if (!display) return;
  
  // Center in preview box
  display.position.set(200, 250);
  display.scale.set(0.6);
  container.addChild(display);
  
  // Cycle through animations
  const animations = animation.listAnimations();
  let index = 0;
  
  setInterval(() => {
    const animName = animations[index % animations.length];
    animation.play(animName, 1);
    index++;
  }, 2000);
}
```

---

## 🔧 Advanced Features

### Skin Swapping (Equipment System)

```typescript
import { PixiFactory } from 'pixi-dragonbones-runtime';

const factory = PixiFactory.factory;

// Replace skin (e.g., armor upgrade)
const armatureA = display.armature;
const skinData = factory.getArmatureData('armatureWithArmor')?.defaultSkin;

if (skinData) {
  // Replace all slots except weapon
  factory.replaceSkin(armatureA, skinData, false, ['weapon_slot']);
}
```

### Slot Display Replacement (Weapon Swap)

```typescript
// Change weapon display
const weaponSlot = display.armature.getSlot('weapon');

factory.replaceSlotDisplay(
  'dragonBonesName',
  'armatureName', 
  'weapon',
  'sword_display', // New display name
  weaponSlot
);
```

### Event Listeners

```typescript
// Listen for animation events
display.addDBEventListener('COMPLETE', (event) => {
  console.log('Animation completed:', event);
  
  // Trigger game logic
  EventBus.getInstance().emit('battle:attack-complete');
}, this);

// Frame events (for timing effects)
display.addDBEventListener('FRAME_EVENT', (event) => {
  if (event.name === 'hit_frame') {
    // Apply damage on this frame
    applyDamage();
  }
}, this);

// Cleanup
display.removeDBEventListener('COMPLETE', handler, this);
```

### Performance Optimization

```typescript
// Enable frame caching (smoother animation)
display.armature.cacheFrameRate = 24;

// Use WorldClock for batch time advancement
import { PixiFactory } from 'pixi-dragonbones-runtime';

const factory = PixiFactory.factory;
display.armature.clock = factory.clock; // Auto-update

// Remove from clock on cleanup
display.armature.clock = null;
```

### Dynamic Animation Blending

```typescript
// Blend multiple animations
const walkState = display.animation.fadeIn('walk', 0.3, 0, 0, 'base');
const shootState = display.animation.fadeIn('shoot', 0.2, 1, 1, 'attack');

// Adjust blend weights
walkState.weight = 0.7; // 70% walk
shootState.weight = 0.3; // 30% shoot
```

---

## 🎨 Vietnamese UI Integration

### Load Monster with Vietnamese Name

```typescript
import monsterDB from './data/monster-database.json';
import vi from './data/vi.json';

// Find monster by English name
const monster = monsterDB.monsters.find(m => m.englishName === 'Absolution');

console.log('Vietnamese name:', monster?.name); // "Hổ Bọ Cạp Thần"
console.log('Element:', vi.elements[monster?.element || 'kim']); // "Kim (Kim Loại)"

// Load animation
const asset = await AssetManager.getInstance()
  .loadDragonBonesCharacter(monster?.assetName || 'Absolution');
```

### Battle UI with Translations

```typescript
import vi from './data/vi.json';

function showBattleAction(animationName: string) {
  let actionText = '';
  
  switch(animationName) {
    case 'Attack A':
    case 'Attack B':
    case 'Attack C':
      actionText = vi.battle.actions.attack; // "Tấn công"
      break;
    case 'Damage':
      actionText = vi.battle.status.damaged; // "Bị thương"
      break;
  }
  
  // Display in UI
  battleUI.showMessage(`${monster.name} ${actionText}!`);
}
```

---

## 🧪 Testing Patterns

### Unit Test: Animation Controller

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { DragonBonesAnimation } from '../src/entities/components/DragonBonesAnimation';

describe('DragonBonesAnimation', () => {
  let animation: DragonBonesAnimation;
  
  beforeEach(() => {
    const app = new PIXI.Application();
    animation = new DragonBonesAnimation(app);
  });
  
  it('should load character and list animations', async () => {
    await animation.loadCharacter('TestCharacter');
    const animations = animation.listAnimations();
    
    expect(animations).toContain('Idle');
    expect(animations.length).toBeGreaterThan(0);
  });
  
  it('should play animation', async () => {
    await animation.loadCharacter('TestCharacter');
    
    expect(() => animation.play('Idle')).not.toThrow();
    expect(animation.getCurrentAnimation()).toBe('Idle');
  });
});
```

### Mock Asset Loading

```typescript
// Mock AssetManager for testing
vi.mock('./core/AssetManager', () => ({
  AssetManager: {
    getInstance: () => ({
      loadDragonBonesCharacter: async (name: string) => ({
        id: name,
        skeleton: { armature: [{ name }] },
        textureAtlas: { SubTexture: [] },
        texture: new PIXI.Texture(),
        animations: ['Idle', 'Attack A'],
        settings: null
      })
    })
  }
}));
```

---

## 🚀 Workflow Automation

### Batch Character Loading

```typescript
class CharacterPreloader {
  private cache = new Map<string, PixiArmatureDisplay>();
  
  async preloadCommonMonsters() {
    const common = ['Absolution', 'Agravain', 'Alberich'];
    
    await Promise.all(
      common.map(name => this.preload(name))
    );
    
    console.log(`✅ Preloaded ${common.length} monsters`);
  }
  
  private async preload(name: string) {
    const asset = await AssetManager.getInstance()
      .loadDragonBonesCharacter(name);
    
    const display = new DragonBonesManager(app).createDisplay(asset, name);
    this.cache.set(name, display);
  }
  
  getPreloaded(name: string): PixiArmatureDisplay | null {
    return this.cache.get(name) || null;
  }
}
```

### Dynamic State-Based Animation

```typescript
class CharacterController {
  private animation: DragonBonesAnimation;
  private state: 'idle' | 'walking' | 'attacking' | 'damaged' = 'idle';
  
  updateAnimation() {
    const animMap = {
      idle: 'Idle',
      walking: 'Walk',
      attacking: 'Attack A',
      damaged: 'Damage'
    };
    
    const animName = animMap[this.state];
    const loops = this.state === 'idle' || this.state === 'walking' ? 0 : 1;
    
    this.animation.play(animName, loops);
  }
  
  setState(newState: typeof this.state) {
    if (this.state !== newState) {
      this.state = newState;
      this.updateAnimation();
    }
  }
}
```

---

## 📊 Asset Management Best Practices

### 1. Lazy Loading

```typescript
// Load only when needed
async function loadMonster(name: string) {
  // Check cache first
  const cached = assetCache.get(name);
  if (cached) return cached;
  
  // Load if not cached
  const asset = await AssetManager.getInstance()
    .loadDragonBonesCharacter(name);
  
  assetCache.set(name, asset);
  return asset;
}
```

### 2. Dispose Unused Assets

```typescript
class BattleScene {
  private monsters: PixiArmatureDisplay[] = [];
  
  cleanup() {
    // Dispose all armature displays
    this.monsters.forEach(display => {
      display.dispose();
    });
    this.monsters = [];
    
    // Optional: Clear DragonBones factory cache
    // (only if you won't reuse these assets soon)
    // PixiFactory.factory.clear();
  }
}
```

### 3. Asset Manifest Loading

```typescript
// Use Pixi Assets for manifest-based loading
import { Assets } from 'pixi.js';

async function loadCharacterBundle(bundleName: string) {
  await Assets.init({ basePath: './assets/dragonbones_assets/' });
  
  Assets.addBundle(bundleName, {
    'char_ske': `${bundleName}/${bundleName}_ske.json`,
    'char_tex': `${bundleName}/${bundleName}_tex.json`,
    'char_img': `${bundleName}/${bundleName}_tex.png`
  });
  
  await Assets.loadBundle(bundleName);
  
  const factory = PixiFactory.factory;
  factory.parseDragonBonesData(Assets.get('char_ske'));
  factory.parseTextureAtlasData(Assets.get('char_tex'), Assets.get('char_img'));
}
```

---

## ⚡ Performance Tips

### 1. Cache Frame Rate

**When**: Complex animations, many characters on screen

```typescript
display.armature.cacheFrameRate = 24; // Smoother at 24fps cached
```

**Tradeoff**: Uses more memory but smoother playback

### 2. WorldClock Batching

**When**: Multiple armatures need time updates

```typescript
import { PixiFactory } from 'pixi-dragonbones-runtime';

// Add all armatures to global clock
displays.forEach(d => {
  d.armature.clock = PixiFactory.factory.clock;
});

// Clock updates all automatically
// No need to manually advance each armature
```

### 3. Reduce Draw Calls

**When**: Many static animations

```typescript
// Use texture packer to combine atlases
// Load combined atlas instead of individual ones

factory.parseTextureAtlasData(combinedAtlas, combinedTexture);
```

### 4. Conditional Animation Updates

**When**: Off-screen characters

```typescript
class BattleMonster {
  update(delta: number, isVisible: boolean) {
    if (!isVisible) {
      // Skip animation updates when off-screen
      return;
    }
    
    // Update animations only when visible
    this.animation.update(delta);
  }
}
```

---

## 🔗 API Reference Quick Links

**Essential Classes**:
- [PixiFactory](https://h1ve2.github.io/pixi-dragonbones-runtime/api/8.x/classes/PixiFactory) - Armature creation
- [PixiArmatureDisplay](https://h1ve2.github.io/pixi-dragonbones-runtime/api/8.x/classes/PixiArmatureDisplay) - Display container
- [Animation](https://h1ve2.github.io/pixi-dragonbones-runtime/api/8.x/classes/Animation) - Animation control
- [Armature](https://h1ve2.github.io/pixi-dragonbones-runtime/api/8.x/classes/Armature) - Skeleton structure
- [Bone](https://h1ve2.github.io/pixi-dragonbones-runtime/api/8.x/classes/Bone) - Bone manipulation

**Interfaces**:
- [IAnimatable](https://h1ve2.github.io/pixi-dragonbones-runtime/api/8.x/interfaces/IAnimatable) - Time advancement

**Full API**: https://h1ve2.github.io/pixi-dragonbones-runtime/api/8.x/

## 📝 Summary

**Key Takeaways**:

1. **Use Existing Abstractions**: `DragonBonesManager` and `DragonBonesAnimation` wrap the runtime
2. **Follow Architecture Rules**: All code modular, <1000 lines per file
3. **Leverage Project Assets**: 207 monsters ready in `monster-database.json`
4. **Vietnamese First**: All UI uses `vi.json` translations
5. **Test Everything**: Unit tests for all DragonBones features
6. **Optimize Early**: Use caching, batching, and lazy loading

**Common Mistakes to Avoid**:
- ❌ Don't call `PixiFactory.factory` directly (use `DragonBonesManager`)
- ❌ Don't forget to dispose armature displays on cleanup
- ❌ Don't manipulate bones without `invalidUpdate()`
- ❌ Don't load all 207 characters at once (lazy load!)