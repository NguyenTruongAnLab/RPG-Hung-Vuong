# Project Vision - Thần Thú Văn Lang

## 🎮 Game Concept

**Vietnamese Mythology Pokemon-Style RPG**

This is a Vietnamese mythology-based RPG game featuring 200 Thần Thú (Divine Beasts) with a Ngũ Hành (Five Elements) combat system. The game combines Pokemon-style overworld exploration with turn-based battles.

### Core Identity
- **Name**: Thần Thú Văn Lang (Divine Beasts of Văn Lang)
- **Genre**: Pokemon-style RPG with Vietnamese cultural elements
- **Unique Selling Point**: First Vietnamese mythology-based creature collection RPG
- **Target Audience**: Vietnamese gamers, mythology enthusiasts, Pokemon fans

## 🔄 Dual Gameplay Modes

The game features two distinct gameplay modes that alternate:

### Overworld Mode (Real-time Exploration)
**Description**: Top-down 2D exploration with real-time movement and physics

**Features**:
- **Movement**: WASD/Arrow keys for 8-directional movement
- **Physics**: Matter.js-powered collision detection
- **Combat**: Direct player attacks with spacebar (attack enemies in overworld)
- **Interaction**: E key to interact with NPCs, items, and objects
- **Encounters**: Step into designated zones to trigger wild Thần Thú battles
- **Rendering**: @pixi/tilemap for efficient large map rendering

**Technical Implementation**:
- Real-time game loop (60 FPS target)
- Matter.js physics engine
- GSAP for smooth animations
- Camera follows player with smooth interpolation
- Collision layers for walls, NPCs, items, encounter zones

### Battle Mode (Turn-based Combat)
**Description**: Strategic turn-based battles when encountering wild Thần Thú

**Features**:
- **Turn-based**: Speed-based turn order (fastest monster acts first)
- **Element System**: Ngũ Hành (Five Elements) advantages
- **Actions**: Attack, Use Skill, Use Item, Attempt Capture, Run
- **Capture Mechanic**: Weaken monsters then attempt to capture
- **Victory Rewards**: Experience points, items, captured monsters

**Technical Implementation**:
- No physics (pure logic-based)
- State machine for battle phases
- Damage calculation with element advantages
- Capture rate formulas
- Smooth transitions to/from overworld

## 🌏 Setting & Theme

### Historical Context
- **Time Period**: Văn Lang era (Hùng Vương dynasty, 2879-258 BCE)
- **Location**: Ancient Vietnam (Văn Lang kingdom)
- **Cultural Elements**: Vietnamese mythology, folklore, and legends

### Visual Style
- **Art Direction**: 2D pixel art with Vietnamese aesthetic
- **Character Design**: Mythological creatures reimagined as Thần Thú
- **Environment**: Ancient Vietnamese landscapes (forests, mountains, rivers, temples)
- **UI Design**: Traditional Vietnamese patterns and colors

### Narrative Theme
- Explore the ancient land of Văn Lang
- Discover and collect 200 unique Thần Thú
- Learn about Vietnamese mythology through gameplay
- Become a legendary Thần Thú master

## 🎯 Core Gameplay Pillars

### 1. Collect - 200 Unique Thần Thú
- **Variety**: 200 distinct creatures based on Vietnamese mythology
- **Elements**: 5 element types (Ngũ Hành: Kim, Mộc, Thủy, Hỏa, Thổ)
- **Rarity Tiers**: Common, Uncommon, Rare, Legendary (4 tiers)
- **Evolution**: Many Thần Thú can evolve into more powerful forms
- **Completion Goal**: Collect all 200 to complete the Thần Thú Codex

### 2. Explore - Văn Lang Regions
- **Multiple Maps**: Forests, mountains, rivers, temples, villages
- **Secrets**: Hidden areas, rare encounters, treasure chests
- **NPCs**: Characters with quests, information, and items to trade
- **Environmental Storytelling**: Learn lore through exploration

### 3. Battle - Strategic Turn-based Combat
- **Elemental Strategy**: Master the Ngũ Hành cycle for advantages
- **Team Building**: Choose 6 Thần Thú for your active party
- **Skill System**: Each Thần Thú has unique abilities
- **Status Effects**: Burn, Poison, Paralyze, Sleep, Freeze

### 4. Evolve - Progression Systems
- **Monster Evolution**: Level up to evolve into stronger forms
- **Stat Growth**: HP, Attack, Defense, Speed, Magic stats
- **Skill Learning**: Unlock new abilities as monsters level up
- **Player Progression**: Unlock new areas, items, and features

## 📱 Target Platforms

### Primary Platform: Web (GitHub Pages)
- **Deployment**: Automatic via GitHub Actions
- **Accessibility**: Play directly in browser
- **Technologies**: HTML5, WebGL via PixiJS
- **Performance**: 60 FPS on modern browsers

### Secondary Platform: Desktop (Tauri)
- **OS Support**: Windows, macOS, Linux
- **Benefits**: Better performance, offline play
- **Bundle Size**: Small (~10MB)
- **Future Phase**: Phase 4+

### Tertiary Platform: Mobile (Capacitor)
- **OS Support**: iOS, Android
- **Touch Controls**: Virtual joystick and buttons
- **Responsive UI**: Adapts to different screen sizes
- **Future Phase**: Phase 4+

## 🎨 Game Features

### Core Features (Phase 1-2)
- ✅ Turn-based battle system with Ngũ Hành elements
- ✅ 200 Thần Thú database with stats and skills
- ✅ Monster capture system
- 🚧 Real-time overworld exploration
- 🚧 Player movement with physics
- 🚧 NPC interactions
- 🚧 Tilemap rendering

### Advanced Features (Phase 3-4)
- 📅 DragonBones animations for all 200 monsters
- 📅 Complete story campaign
- 📅 Sound effects and background music
- 📅 Save/Load system
- 📅 Monster breeding
- 📅 Trading system
- 📅 Achievements

### Future Features (Phase 5+)
- 🔮 Multiplayer battles (PvP)
- 🔮 Online trading
- 🔮 Leaderboards
- 🔮 Seasonal events
- 🔮 Cloud save sync

Legend:
- ✅ Implemented
- 🚧 In Progress
- 📅 Planned
- 🔮 Future

## 🎓 Educational Aspect

### Cultural Preservation
- Introduce Vietnamese mythology to younger generation
- Preserve folklore through interactive medium
- Make learning about history fun and engaging

### Game Design Goals
- **Accessible**: Easy to learn, hard to master
- **Engaging**: Balanced challenge and reward
- **Educational**: Learn about Vietnamese culture naturally
- **Replayable**: Multiple strategies and team compositions

## 🌟 Success Metrics

### Phase 1 (Foundation) - ✅ COMPLETE
- [x] Working battle system
- [x] 200 monsters in database
- [x] Capture mechanics
- [x] GitHub Pages deployment

### Phase 2 (Overworld) - 🚧 IN PROGRESS
- [ ] Real-time exploration working
- [ ] Player movement smooth
- [ ] Encounter system functional
- [ ] 100+ unit tests passing

### Phase 3 (Content) - 📅 PLANNED
- [ ] All maps designed and rendered
- [ ] NPC dialogues written
- [ ] Sound system integrated
- [ ] Visual polish complete

### Phase 4 (Release) - 🔮 FUTURE
- [ ] Desktop builds for Windows/Mac/Linux
- [ ] Mobile builds for iOS/Android
- [ ] Performance optimized (60 FPS)
- [ ] All 200 monsters have animations

---

**This vision guides all development decisions. When in doubt, refer back to these core principles!**

**Project Status**: Phase 2 (35% complete)  
**Next Milestone**: Complete Overworld Exploration  
**Last Updated**: 2025-10-17
