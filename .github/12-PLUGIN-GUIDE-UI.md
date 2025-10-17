# Plugin Guide: UI & Lighting

**Purpose**: Complete reference for UI framework and lighting system using PixiJS plugins.

**Last Updated**: 2025-10-17  
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [UI Framework (@pixi/ui)](#ui-framework)
2. [UI Layout (@pixi/layout)](#ui-layout)
3. [Lighting System (pixi-lights)](#lighting-system)
4. [Integration Patterns](#integration-patterns)
5. [Performance Tips](#performance-tips)

---

## 🎮 UI Framework

### @pixi/ui

**Installation**:
```bash
npm install @pixi/ui
```

**Documentation**: https://pixijs.io/ui/

### Button Component

```typescript
import { Button } from '@pixi/ui';

// Simple text button
const textButton = new Button({
  text: 'Start Battle',
  textStyle: {
    fill: 0xffffff,
    fontSize: 24
  }
});

textButton.onPress.connect(() => {
  console.log('Button pressed!');
});

// Button with textures
const button = new Button({
  defaultView: PIXI.Sprite.from('button-normal.png'),
  hoverView: PIXI.Sprite.from('button-hover.png'),
  pressedView: PIXI.Sprite.from('button-pressed.png'),
  disabledView: PIXI.Sprite.from('button-disabled.png'),
  text: 'Attack',
  textStyle: { fill: 0xffffff }
});

button.onPress.connect(() => {
  // Execute action
});

button.onHover.connect(() => {
  // Play hover sound
});

// Disable button
button.enabled = false;
```

### CheckBox Component

```typescript
import { CheckBox } from '@pixi/ui';

const checkbox = new CheckBox({
  checked: true,
  text: 'Enable Sound Effects',
  textStyle: { fill: 0xffffff, fontSize: 18 }
});

checkbox.onChange.connect((checked: boolean) => {
  console.log('Checkbox changed:', checked);
  // Update settings
});
```

### Slider Component

```typescript
import { Slider } from '@pixi/ui';

const slider = new Slider({
  bg: 'slider-bg.png',
  fill: 'slider-fill.png',
  slider: 'slider-handle.png',
  min: 0,
  max: 100,
  value: 50
});

slider.onChange.connect((value: number) => {
  console.log('Slider value:', value);
  // Update volume
});
```

### ScrollBox Component

```typescript
import { ScrollBox } from '@pixi/ui';

const scrollBox = new ScrollBox({
  width: 400,
  height: 500,
  items: itemList, // Array of display objects
  type: 'vertical',
  padding: 10,
  disableDynamicRendering: false
});

// Add to stage
container.addChild(scrollBox);
```

### List Component

```typescript
import { List } from '@pixi/ui';

const list = new List({
  type: 'vertical',
  elementsMargin: 10
});

// Add items
monsters.forEach(monster => {
  const item = new Button({
    text: monster.name,
    width: 300,
    height: 50
  });
  
  item.onPress.connect(() => {
    selectMonster(monster);
  });
  
  list.addChild(item);
});
```

### Input Component

```typescript
import { Input } from '@pixi/ui';

const input = new Input({
  bg: 'input-bg.png',
  placeholder: 'Enter name...',
  value: '',
  textStyle: {
    fill: 0xffffff,
    fontSize: 18
  },
  maxLength: 20
});

input.onChange.connect((value: string) => {
  console.log('Input changed:', value);
});

input.onEnter.connect((value: string) => {
  console.log('Enter pressed:', value);
  // Submit form
});
```

### ProgressBar Component

```typescript
import { ProgressBar } from '@pixi/ui';

const progressBar = new ProgressBar({
  bg: 'progress-bg.png',
  fill: 'progress-fill.png',
  progress: 0.5 // 0-1
});

// Update progress with animation
gsap.to(progressBar, {
  progress: 1,
  duration: 2,
  ease: 'power2.out'
});
```

### Complete UI Example: Inventory System

```typescript
import { ScrollBox, Button, List } from '@pixi/ui';

class InventoryUI extends PIXI.Container {
  private scrollBox: ScrollBox;
  private itemList: List;
  
  constructor(items: Item[]) {
    super();
    
    // Create item list
    this.itemList = new List({
      type: 'vertical',
      elementsMargin: 5
    });
    
    // Populate items
    items.forEach(item => {
      const itemButton = this.createItemButton(item);
      this.itemList.addChild(itemButton);
    });
    
    // Wrap in scroll box
    this.scrollBox = new ScrollBox({
      width: 400,
      height: 500,
      items: [this.itemList],
      type: 'vertical'
    });
    
    this.addChild(this.scrollBox);
  }
  
  private createItemButton(item: Item): Button {
    const button = new Button({
      text: `${item.name} x${item.quantity}`,
      textStyle: { fill: 0xffffff, fontSize: 16 },
      width: 380,
      height: 60
    });
    
    button.onPress.connect(() => {
      this.useItem(item);
    });
    
    button.onHover.connect(() => {
      this.showTooltip(item);
    });
    
    return button;
  }
  
  private useItem(item: Item): void {
    console.log('Using item:', item.name);
    // Implement item usage
  }
  
  private showTooltip(item: Item): void {
    // Show item description tooltip
  }
}
```

---

## 📐 UI Layout

### @pixi/layout

**Installation**:
```bash
npm install @pixi/layout
```

**Documentation**: https://github.com/pixijs/layout

### Basic Layout

```typescript
import { Layout } from '@pixi/layout';

// Create responsive layout
const layout = new Layout({
  content: {
    mainPanel: {
      content: {
        id: 'main',
        styles: {
          position: 'center',
          maxWidth: '80%',
          maxHeight: '90%',
          background: 0x000000,
          borderRadius: 10,
          padding: 20
        }
      }
    }
  }
});

container.addChild(layout);
```

### Grid Layout Example

```typescript
import { Layout } from '@pixi/layout';

// Create grid for inventory items
const inventoryLayout = new Layout({
  content: {
    grid: {
      content: {
        styles: {
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
          padding: 20
        }
      },
      content: items.map(item => ({
        slot: {
          content: {
            id: `item-${item.id}`,
            styles: {
              width: 64,
              height: 64,
              background: 0x333333,
              borderRadius: 5
            }
          }
        }
      }))
    }
  }
});
```

### Responsive Menu Layout

```typescript
const menuLayout = new Layout({
  content: {
    menu: {
      content: {
        styles: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          padding: 40
        }
      },
      content: [
        {
          title: {
            content: {
              text: 'Main Menu',
              styles: {
                fontSize: 48,
                color: 0xffffff
              }
            }
          }
        },
        {
          buttons: {
            content: {
              styles: {
                display: 'flex',
                flexDirection: 'column',
                gap: 15
              }
            },
            content: [
              { button: { id: 'start', text: 'Start Game' } },
              { button: { id: 'continue', text: 'Continue' } },
              { button: { id: 'settings', text: 'Settings' } },
              { button: { id: 'quit', text: 'Quit' } }
            ]
          }
        }
      ]
    }
  }
});
```

---

## 💡 Lighting System

### pixi-lights

**Installation**:
```bash
npm install pixi-lights
```

**Documentation**: https://github.com/pixijs/pixi-lights

**Note**: pixi-lights may require additional setup with @pixi/layers for best results.

### Basic Setup

```typescript
import * as PIXI from 'pixi.js';
import { AmbientLight, PointLight } from 'pixi-lights';

// Create lighting container
const lightingLayer = new PIXI.Container();

// Add ambient light (overall brightness)
const ambient = new AmbientLight(0x404040, 0.5);
lightingLayer.addChild(ambient);

// Add point light (torch, campfire)
const torch = new PointLight(0xffaa00, 1.0);
torch.position.set(playerX, playerY);
torch.falloff = [0.5, 3, 10]; // [constant, linear, quadratic]
lightingLayer.addChild(torch);

// Add to stage
stage.addChild(lightingLayer);
```

### Day/Night Cycle System

```typescript
class DayNightCycle {
  private ambientLight: AmbientLight;
  private time = 0; // 0-24 hours
  
  constructor(ambientLight: AmbientLight) {
    this.ambientLight = ambientLight;
  }
  
  update(deltaMs: number): void {
    // Advance time (1 real second = 1 game minute)
    this.time += deltaMs * 0.001 / 60;
    if (this.time >= 24) this.time = 0;
    
    // Calculate brightness based on time
    let brightness: number;
    if (this.time >= 6 && this.time <= 18) {
      // Day (6 AM - 6 PM): bright
      brightness = 1.0;
    } else if (this.time >= 19 || this.time <= 5) {
      // Night (7 PM - 5 AM): dark
      brightness = 0.2;
    } else {
      // Dawn/Dusk: transition
      const isSunrise = this.time < 7;
      const t = isSunrise 
        ? (this.time - 5) / 2 // 5-7 AM
        : (19 - this.time) / 2; // 6-7 PM
      brightness = 0.2 + (0.8 * t);
    }
    
    // Update ambient light
    this.ambientLight.brightness = brightness;
    
    // Change color temperature
    if (this.time >= 6 && this.time < 8) {
      // Sunrise: orange tint
      this.ambientLight.color = 0xffaa77;
    } else if (this.time >= 17 && this.time < 19) {
      // Sunset: red-orange
      this.ambientLight.color = 0xff7744;
    } else if (this.time >= 8 && this.time < 17) {
      // Day: white
      this.ambientLight.color = 0xffffff;
    } else {
      // Night: blue
      this.ambientLight.color = 0x4477aa;
    }
  }
  
  getTimeString(): string {
    const hours = Math.floor(this.time);
    const minutes = Math.floor((this.time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
```

### Torch Following Player

```typescript
class TorchLight {
  private light: PointLight;
  private player: Player;
  
  constructor(player: Player, container: PIXI.Container) {
    this.player = player;
    
    // Create torch light
    this.light = new PointLight(0xffaa00, 1.0);
    this.light.falloff = [0.5, 2, 8]; // Moderate falloff
    container.addChild(this.light);
  }
  
  update(): void {
    // Follow player
    this.light.position.copyFrom(this.player.position);
    
    // Flicker effect for realism
    const flicker = 0.9 + Math.random() * 0.2;
    this.light.brightness = flicker;
  }
  
  destroy(): void {
    this.light.destroy();
  }
}
```

### Campfire Light with Flicker

```typescript
class CampfireLight {
  private light: PointLight;
  private baseX: number;
  private baseY: number;
  
  constructor(x: number, y: number, container: PIXI.Container) {
    this.baseX = x;
    this.baseY = y;
    
    // Create campfire light
    this.light = new PointLight(0xff6600, 1.5);
    this.light.position.set(x, y);
    this.light.falloff = [0.3, 2, 6];
    container.addChild(this.light);
  }
  
  update(): void {
    // Dynamic flicker
    const flicker = 0.8 + Math.random() * 0.4;
    this.light.brightness = flicker;
    
    // Slight position wobble
    this.light.position.x = this.baseX + (Math.random() - 0.5) * 2;
    this.light.position.y = this.baseY + (Math.random() - 0.5) * 2;
    
    // Color variation (orange to red)
    const colorVariation = Math.floor(Math.random() * 32);
    this.light.color = 0xff6600 - (colorVariation << 8);
  }
  
  destroy(): void {
    this.light.destroy();
  }
}
```

### Lightning Flash Effect

```typescript
class LightningFlash {
  private light: PointLight;
  private duration = 0;
  private maxDuration = 0.15; // 150ms flash
  
  constructor(x: number, y: number, container: PIXI.Container) {
    this.light = new PointLight(0xffffff, 3.0);
    this.light.position.set(x, y);
    this.light.falloff = [0.1, 1, 3];
    container.addChild(this.light);
  }
  
  update(deltaMs: number): boolean {
    this.duration += deltaMs * 0.001;
    
    if (this.duration >= this.maxDuration) {
      this.light.destroy();
      return true; // Flash complete
    }
    
    // Fade out
    const t = this.duration / this.maxDuration;
    this.light.brightness = 3.0 * (1 - t);
    
    return false;
  }
}
```

### LightingManager Wrapper

```typescript
/**
 * Manages all lights in the game
 */
class LightingManager {
  private container: PIXI.Container;
  private ambientLight: AmbientLight;
  private lights: Map<string, PointLight> = new Map();
  private dayNightCycle: DayNightCycle;
  
  constructor(container: PIXI.Container) {
    this.container = container;
    
    // Setup ambient light
    this.ambientLight = new AmbientLight(0xffffff, 1.0);
    this.container.addChild(this.ambientLight);
    
    // Setup day/night cycle
    this.dayNightCycle = new DayNightCycle(this.ambientLight);
  }
  
  /**
   * Add a point light
   */
  addLight(
    id: string,
    x: number,
    y: number,
    color: number,
    brightness: number,
    falloff: [number, number, number]
  ): PointLight {
    const light = new PointLight(color, brightness);
    light.position.set(x, y);
    light.falloff = falloff;
    
    this.container.addChild(light);
    this.lights.set(id, light);
    
    return light;
  }
  
  /**
   * Remove a light
   */
  removeLight(id: string): void {
    const light = this.lights.get(id);
    if (light) {
      light.destroy();
      this.lights.delete(id);
    }
  }
  
  /**
   * Get a light by ID
   */
  getLight(id: string): PointLight | undefined {
    return this.lights.get(id);
  }
  
  /**
   * Update lighting system
   */
  update(deltaMs: number): void {
    this.dayNightCycle.update(deltaMs);
  }
  
  /**
   * Set time of day (0-24)
   */
  setTime(hours: number): void {
    this.dayNightCycle.time = hours;
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    this.lights.forEach(light => light.destroy());
    this.lights.clear();
    this.ambientLight.destroy();
  }
}
```

---

## 🎯 Integration Patterns

### Complete Scene with UI and Lighting

```typescript
class GameScene extends PIXI.Container {
  private lightingManager: LightingManager;
  private uiContainer: PIXI.Container;
  
  constructor() {
    super();
    
    // Setup lighting
    const lightLayer = new PIXI.Container();
    this.addChild(lightLayer);
    this.lightingManager = new LightingManager(lightLayer);
    
    // Add torch following player
    this.lightingManager.addLight(
      'player-torch',
      0, 0,
      0xffaa00,
      1.0,
      [0.5, 2, 8]
    );
    
    // Setup UI
    this.uiContainer = new PIXI.Container();
    this.addChild(this.uiContainer);
    
    // Create UI with @pixi/ui
    this.createUI();
  }
  
  private createUI(): void {
    // Menu button
    const menuButton = new Button({
      text: 'Menu',
      textStyle: { fill: 0xffffff, fontSize: 18 }
    });
    menuButton.position.set(20, 20);
    menuButton.onPress.connect(() => this.openMenu());
    this.uiContainer.addChild(menuButton);
    
    // HP bar
    const hpBar = new ProgressBar({
      bg: 'hp-bg.png',
      fill: 'hp-fill.png',
      progress: 1.0
    });
    hpBar.position.set(20, 60);
    this.uiContainer.addChild(hpBar);
  }
  
  update(deltaMs: number): void {
    // Update lighting
    this.lightingManager.update(deltaMs);
    
    // Update torch position to follow player
    const torch = this.lightingManager.getLight('player-torch');
    if (torch) {
      torch.position.copyFrom(this.player.position);
    }
  }
  
  private openMenu(): void {
    // Create menu with ScrollBox
    const menuItems = [
      'Inventory',
      'Stats',
      'Quests',
      'Settings',
      'Save',
      'Quit'
    ];
    
    const list = new List({ type: 'vertical', elementsMargin: 10 });
    
    menuItems.forEach(item => {
      const button = new Button({
        text: item,
        width: 200,
        height: 50
      });
      button.onPress.connect(() => this.handleMenuChoice(item));
      list.addChild(button);
    });
    
    const scrollBox = new ScrollBox({
      width: 300,
      height: 400,
      items: [list]
    });
    
    scrollBox.position.set(
      (this.width - scrollBox.width) / 2,
      (this.height - scrollBox.height) / 2
    );
    
    this.uiContainer.addChild(scrollBox);
  }
  
  private handleMenuChoice(choice: string): void {
    console.log('Menu choice:', choice);
    // Implement menu actions
  }
}
```

---

## ⚡ Performance Tips

### UI Optimization

- **Reuse components**: Don't recreate UI elements every frame
- **Lazy loading**: Load UI panels only when needed
- **Pool buttons**: Reuse button instances for lists
- **Limit interactions**: Disable input when UI not visible

```typescript
class UIPool {
  private buttons: Button[] = [];
  
  getButton(): Button {
    return this.buttons.pop() || new Button({});
  }
  
  releaseButton(button: Button): void {
    button.visible = false;
    button.enabled = false;
    this.buttons.push(button);
  }
}
```

### Lighting Optimization

- **Limit light count**: Max 8-10 lights on screen
- **Use falloff wisely**: Smaller falloff = better performance
- **Disable lights off-screen**: Check visibility before updating
- **Reduce light resolution**: Lower quality for distant lights

```typescript
// Cull lights based on distance
lights.forEach(light => {
  const distance = Vector.distance(light.position, camera.position);
  light.visible = distance < 1000;
});
```

---

## 📚 Quick Reference

**When to use each plugin**:

| Need | Plugin | Component |
|------|--------|-----------|
| Buttons | @pixi/ui | Button |
| Checkboxes | @pixi/ui | CheckBox |
| Sliders | @pixi/ui | Slider |
| Scrolling lists | @pixi/ui | ScrollBox |
| Text input | @pixi/ui | Input |
| Progress bars | @pixi/ui | ProgressBar |
| Responsive layout | @pixi/layout | Layout |
| Grid layout | @pixi/layout | Layout (grid) |
| Day/night | pixi-lights | AmbientLight |
| Torch/campfire | pixi-lights | PointLight |
| Directional light | pixi-lights | DirectionalLight |

**Remember**: Professional UI = @pixi/ui, Dynamic lighting = pixi-lights

---

**Last Updated**: 2025-10-17  
**See Also**: 12-PLUGIN-GUIDE-FX.md for particles and filters
