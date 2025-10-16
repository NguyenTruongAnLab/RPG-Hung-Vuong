# Core Game Systems

Core managers and systems that form the foundation of the game.

## Files

### Existing Files
- `Game.js` (496 lines) - Main game class, PixiJS initialization, game loop
  - ⚠️ **CLOSE TO LIMIT**: Consider splitting in Phase 2
  - Potential splits: `GameLoop.js`, `GameRenderer.js`, `GameInitializer.js`
  
- `I18n.js` (36 lines) - Internationalization system (Vietnamese localization)
  - ✅ **GOOD SIZE**: Small and focused
  
- `EventBus.ts` (176 lines) - Global event system for inter-system communication
  - ✅ **GOOD SIZE**: Well-structured
  
- `SceneManager.ts` (146 lines) - Scene lifecycle management
  - ✅ **GOOD SIZE**: Focused responsibility
  
- `AssetManager.ts` (185 lines) - Asset loading and caching
  - ✅ **GOOD SIZE**: Single responsibility
  
- `DragonBonesManager.ts` (125 lines) - DragonBones animation runtime integration
  - ✅ **GOOD SIZE**: Wrapper around external library

## Planned Files (Phase 2)

- `PhysicsManager.ts` (<300 lines) - Matter.js physics engine wrapper
- `InputManager.ts` (<200 lines) - Keyboard/mouse/touch input handling
- `AudioManager.ts` (<200 lines) - Sound effects and music management
- `SaveManager.ts` (<250 lines) - Save/load game state

## Architecture Principles

### Single Responsibility
Each manager handles one core system:
- Game.js: Application lifecycle
- SceneManager: Scene transitions
- AssetManager: Resource loading
- EventBus: Inter-system communication

### Composition Over Inheritance
Managers are independent. They communicate via EventBus, not direct references.

### AI-Friendly APIs
All public methods have comprehensive JSDoc with @example tags.

## Usage Example

```typescript
// Game initialization
import { Game } from './core/Game.js';
import { SceneManager } from './core/SceneManager.ts';
import { EventBus } from './core/EventBus.ts';

const game = new Game();
const sceneManager = new SceneManager(game.app);
const eventBus = EventBus.getInstance();

// Listen to events
eventBus.on('scene:change', (data) => {
  console.log('Scene changed to:', data.scene);
});

// Change scene
sceneManager.changeScene('overworld');
```

## File Size Policy

- **Target**: <400 lines per file
- **Limit**: 500 lines maximum
- **Action when exceeded**: Split into components or helpers
- **Check**: `wc -l *.ts *.js`

## Dependencies

Core managers should minimize dependencies:
- ✅ PixiJS - Required for rendering
- ✅ DragonBones - Required for animations
- 🔴 Matter.js - To add in Phase 2 (physics)
- 🔴 GSAP - To add in Phase 2 (animations)

## Testing

Each manager must have:
- Unit tests in `tests/unit/`
- Mock external dependencies
- Test public API only
- Coverage target: ≥75%

---

**Rule**: Keep core systems independent and well-documented.
