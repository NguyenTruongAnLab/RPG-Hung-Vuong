# Thần Thú Văn Lang - Hùng Vương RPG

Game RPG đánh theo lượt lấy bối cảnh thời Hùng Vương - đất Văn Lang (2879-258 TCN). Người chơi là Chiến Sĩ Lạc Việt thu phục 200 Thần Thú từ truyền thuyết Việt Nam để bảo vệ bộ lạc.

## 🎮 Quick Start

**Play Now**: [Live Demo on GitHub Pages](https://nguyentruonganlab.github.io/RPG-Hung-Vuong/)

**Or run locally**:
```bash
git clone https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong.git
cd RPG-Hung-Vuong
npm install
npm run dev
```

**Key Features**:
- ✅ **200+ Monsters** with DragonBones animations
- ✅ **Showcase Demo Mode** - Browse all monsters with interactive controls
- ✅ **Turn-based Combat** with Ngũ Hành (Five Elements) system
- ✅ **Full Audio System** - 86 voice lines, music, and SFX
- ✅ **Character Selection** - Pick your starting party
- ✅ **Overworld Exploration** - WASD movement, mouse wheel zoom
- 🚧 **Story Campaign** - Coming in Phase 5!

## ✨ Tính năng chính

### 🐉 200 Thần Thú (Divine Beasts)
- **200 loài thần thú độc đáo** từ `char001` đến `char200`
- Phân loại theo **Ngũ Hành** (40 thần thú mỗi hệ):
  - **Kim (Metal)**: char001-040
  - **Mộc (Wood)**: char041-080
  - **Thủy (Water)**: char081-120
  - **Hỏa (Fire)**: char121-160
  - **Thổ (Earth)**: char161-200

### ⚔️ Hệ thống Ngũ Hành (Five Elements)
Hệ thống tương khắc theo nguyên lý Ngũ Hành:
- **Kim** khắc **Mộc** (Kim chặt cây)
- **Mộc** khắc **Thổ** (Cây mọc xuyên đất)
- **Thổ** khắc **Thủy** (Đất chặn nước)
- **Thủy** khắc **Hỏa** (Nước dập lửa)
- **Hỏa** khắc **Kim** (Lửa nấu chảy kim loại)

Tương khắc cho **1.5x damage**, bị khắc nhận **0.5x damage**

### 🎮 Turn-based Battle System
- Hệ thống đánh lượt dựa trên **tốc độ**
- **Kỹ năng** đặc biệt cho mỗi thần thú
- **Tiến hóa** thần thú khi đủ level
- Tính toán **damage** dựa trên attack, defense và element advantage

### 🎯 Capture System (Thu phục)
- Thu phục thần thú sau khi chiến thắng
- Tỷ lệ thu phục phụ thuộc vào:
  - HP còn lại của thần thú
  - Level của người chơi
  - Độ hiếm của thần thú (common, uncommon, rare, legendary)
- Theo dõi progress: X/200 thần thú

### 🗺️ Map Explorer
Khám phá thế giới Văn Lang với 6 địa điểm:
1. **Làng Lạc Việt** - Điểm xuất phát
2. **Rừng Thần** - Thần thú Mộc và Kim
3. **Sông Hồng** - Thần thú Thủy
4. **Núi Tản Viên** - Nơi Sơn Tinh ngự trị
5. **Hồ Tây** - Thần thú hiếm
6. **Thánh Địa Hùng Vương** - Boss cuối cùng

### 🎭 Story Campaign (Phase 5 - Coming Soon!)
- **4 Acts Epic Narrative**: Complete story from Awakening to Final Battle
- **Vietnamese Mythology**: Learn about Văn Lang, Hùng Kings, and ancient legends
- **4 Companions**: Tộc Trưởng (Elder), Lạc Nhi (Scholar), Phong Dũng (Warrior), Diệp Linh (Scout)
- **15+ Cutscenes**: Opening cinematic, boss intros, victory celebrations
- **68 Voice Lines**: All in Vietnamese with melodic beep simulation
- **Quest System**: Main quests + side quests with Vietnamese cultural themes
- **6-8 Hours**: Complete story-driven gameplay experience

### 🎵 Audio System (Phase 4 - Complete!)
- **86 Code-Generated Audio Files**: 68 voice lines, 4 music tracks, 14 SFX
- **Vietnamese Voice Acting**: Melodic beeps simulating Vietnamese tones
- **Background Music**: Chiptune melodies with Vietnamese pentatonic scales
- **Sound Effects**: Procedural synthesis for battles, captures, UI feedback
- **Zero Dependencies**: 100% Web Audio API, no external files needed

### 🌐 Internationalization (i18n)
- Hoàn toàn tiếng Việt
- Hệ thống i18n modular, dễ mở rộng
- Tất cả text game đều được dịch

## 🛠️ Tech Stack

- **PixiJS 8** - Game engine 2D với WebGL
- **Vite** - Build tool nhanh cho modern web
- **TypeScript** - Type-safe code với gradual migration
- **DragonBones** - 2D skeletal animation runtime
- **Vitest** - Fast unit testing framework
- **Playwright** - End-to-end testing
- **GitHub Actions** - CI/CD tự động với testing
- **GitHub Pages** - Deployment miễn phí

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js 20+
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Development
```bash
npm run dev          # Chạy dev server tại http://localhost:5173
npm run test         # Chạy unit tests
npm run test:watch   # Chạy tests trong watch mode
npm run test:ui      # Mở Vitest UI
npm run type-check   # Kiểm tra TypeScript
```

### Build & Deploy
```bash
npm run build        # Build production vào dist/
npm run preview      # Preview production build
npm run test:e2e     # Chạy E2E tests (sau khi build)
```

### Deployment to GitHub Pages

The game is configured for GitHub Pages deployment:

1. **Automatic Build**: The vite config automatically uses `/RPG-Hung-Vuong/` base path in production
2. **Manual Deploy**:
   ```bash
   npm run build
   # Copy dist/ contents to gh-pages branch or use GitHub Actions
   ```

3. **Environment Detection**: 
   - Local dev: Uses `./` for relative paths
   - Production: Uses `/RPG-Hung-Vuong/` for GitHub Pages

**Live Demo**: https://nguyentruonganlab.github.io/RPG-Hung-Vuong/

## 🎮 Cách chơi

### Controls (Điều khiển)
- **WASD / Arrow Keys** - Di chuyển nhân vật
- **Space** - Tấn công
- **E** - Tương tác
- **Mouse Wheel** - Zoom in/out camera (0.5x - 2.0x)

### Game Flow
1. **Character Selection** - Chọn 3 thần thú khởi đầu từ 200 lựa chọn
   - Browse by element (Kim, Mộc, Thủy, Hỏa, Thổ)
   - View stats, tier, and preview animations
   - Or click **DEMO MODE** to view all 207 monsters!

2. **Demo/Showcase Mode** 🎨
   - **Browse all 207 monsters** with full DragonBones animations
   - **Filter by element** to see element-specific beasts
   - **Interactive controls**:
     - Play different animations (Idle, Attack, Damage, etc.)
     - Flip and scale monsters
     - Auto-play all animations
   - Perfect for exploring the complete monster database!

3. **Overworld Exploration** - Di chuyển giữa các vùng đất với zoom camera
4. **Battle** - Gặp thần thú hoang dã và chiến đấu turn-based
5. **Capture** - Thu phục thần thú sau khi đánh bại
6. **Evolution** - Nâng cấp thần thú của bạn
7. **Collection** - Hoàn thành bộ sưu tập 200 thần thú!

## 📊 Game Features Details

### Monster Stats
Mỗi thần thú có các chỉ số:
- **HP** - Máu
- **Attack** - Sát thương
- **Defense** - Phòng thủ
- **Speed** - Tốc độ (quyết định turn order)
- **Magic** - Sức mạnh phép thuật


### Evolution System
- Thần thú có thể tiến hóa từ dạng yếu hơn
- Cần đủ level để tiến hóa
- Evolution chain: Tier 1 → Tier 2 → Tier 3 → Tier 4

### Rarity System
- **Common** (Tier 1) - Dễ bắt
- **Uncommon** (Tier 2) - Trung bình
- **Rare** (Tier 3) - Khó bắt
- **Legendary** (Tier 4) - Rất khó bắt

## 🎵 Audio System

### Comprehensive Vietnamese Voice & Audio
**86 audio files** - 100% code-generated with complete Vietnamese narration:

- **68 Voice Lines** - Vietnamese voice for every game scenario
  - Opening cinematic and story narration
  - Tutorial guidance (movement, combat, elements)
  - Character selection prompts
  - Battle announcements and reactions
  - Element-specific attack calls (Kim, Mộc, Thủy, Hỏa, Thổ)
  - Monster reactions by tier (common, rare, legendary)
  - Overworld zone warnings
  - UI feedback (menu, level up, save/load)

- **4 Music Tracks** - Chiptune background music
  - Overworld exploration theme
  - Battle music
  - Victory fanfare
  - Menu/character selection music

- **14 Sound Effects** - Game audio feedback
  - Menu navigation sounds
  - Battle SFX (attack, critical, explosion)
  - Elemental effects (fire, water, metal, wood, earth)
  - UI sounds (level up, capture, victory)

### Audio Generation
```bash
# Regenerate all 86 audio files
npm run generate-audio
```

All audio is code-generated using Web Audio API with:
- Vietnamese tone simulation via melodic beeps
- Pentatonic scales for Vietnamese feel
- ADSR envelope for natural sound
- Zero external dependencies

**Documentation**:
- `docs/AUDIO_INTEGRATION_GUIDE.md` - Quick reference API
- `docs/AUDIO_INTEGRATION_EXAMPLES.md` - Scene implementation examples
- `public/assets/audio/README.md` - Complete voice line catalog

**Note**: Audio files are placeholder "melodic beeps" simulating Vietnamese tones. Replace with professional voice actors and SFX before production release.

---

## 📖 Phase 5: Narrative Integration & Visual Polish (Next Phase)

### 🎯 Overview

Phase 5 will transform the game from a technical demo into a complete story-driven Vietnamese mythology experience, building on the audio foundation from Phase 4.

**Duration**: 9 days (2 work weeks)  
**Goal**: Implement complete narrative arc with cutscenes, dialogs, and quests

### 📚 Complete Story Documentation

Three comprehensive guides created:

1. **`docs/STORY_GUIDE.md`** (17.5 KB)
   - Complete 4-act narrative (Awakening → Journey → Confrontation → Final Battle)
   - Character profiles: Tộc Trưởng, Lạc Nhi, Phong Dũng, Diệp Linh
   - 15 major scenes with full scripts in Vietnamese
   - 5 elemental zones detailed (Rừng Thần, Sông Hồng, Kim Sơn, etc.)
   - 6 boss battles with intro/defeat cutscenes
   - 5 side quests outlined
   - Total playtime: 6-8 hours (main) + 2-3 hours (side quests)

2. **`docs/DIALOG_FORMAT.md`** (13.1 KB)
   - JSON format specification for dialogs and cutscenes
   - Dialog entry structure with Vietnamese/English
   - Cutscene format with camera animations
   - Quest data format
   - Character voice profiles
   - API usage examples

3. **`docs/PHASE5_ROADMAP.md`** (17.1 KB)
   - Day-by-day implementation plan (9 days)
   - Task breakdown with estimates
   - Success criteria per day
   - File structure overview
   - 40 new unit tests planned
   - Risk management strategies

4. **`docs/AI_AGENT_PHASE5_SUMMARY.md`** (21.2 KB)
   - Complete summary for AI agents
   - Copilot instructions review
   - Detailed story overview
   - Implementation guide
   - FAQ and support

### 🎭 Story Arc Summary

**Setting**: Văn Lang, 2879-258 BCE (Hùng Vương dynasty)  
**Hero**: Young Lạc Việt warrior chosen to master 200 Thần Thú  
**Villain**: Ma Vương (Demon Lord) breaking the Ngũ Hành balance

**Act 1 - Awakening**: Choose first Thần Thú, learn basics, first battle  
**Act 2 - Journey**: Explore 5 elemental zones, defeat mini-bosses, collect stones  
**Act 3 - Confrontation**: Discover Ma Vương's plan, face Sơn Tinh and Quỷ Hồ 9 Đuôi  
**Act 4 - Final Battle**: March to Thánh Địa, defeat Ma Vương, save Văn Lang

### 🛠️ What Will Be Created

**New Files** (14 TypeScript + 4 JSON):
- Story data: `story-main.json`, `story-npcs.json`, `story-zones.json`, `story-bosses.json`
- Systems: `StoryManager.ts`, `QuestManager.ts`, `DialogSystem.ts`, `CutsceneManager.ts`
- UI: `DialogBox.ts`, `Subtitles.ts`, `QuestLog.ts`, `UIAnimations.ts`
- Scenes: `IntroScene.ts`, `EndingScene.ts`
- Core: `VoiceManager.ts`, `NPCDialog.ts`

**Enhanced Files**:
- `ParticleSystem.ts` - Add 5 element-specific particle effects
- `TransitionManager.ts` - Add wipe, flash, letterbox effects

**New Tests**: 40 unit tests (StoryManager, DialogSystem, QuestManager)

### ✨ Visual Polish Features

**Particle Effects** (5 element types):
- **Kim (Metal)**: Metallic sparks, clang effects
- **Mộc (Wood)**: Leaf swirl, vine growth
- **Thủy (Water)**: Water splash, wave ripples
- **Hỏa (Fire)**: Fire sparks, ember glow
- **Thổ (Earth)**: Rock debris, dust clouds

**Screen Effects**:
- Wipe transitions for battle entry/exit
- Flash effects for super effective hits
- Letterbox effect for cinematic cutscenes
- Slow-motion for critical moments

**UI Animations**:
- Menu slide-in/out with GSAP
- HP bar smooth depletion
- EXP bar fill animation
- Button hover effects

### 🎯 Success Criteria

- [ ] Opening cinematic plays on first launch
- [ ] Story progresses through 4 acts
- [ ] 5+ cutscenes fully implemented
- [ ] Dialog system with typewriter effect
- [ ] Branching choices functional
- [ ] Quest system tracks objectives
- [ ] Quest log accessible with Q key
- [ ] Voice lines sync with subtitles
- [ ] All 5 elements have unique particles
- [ ] 224 tests passing (184 + 40 new)
- [ ] All files <500 lines
- [ ] Story playable start-to-finish

### 📊 Progress Tracking

**Current Status**: Phase 5 documentation complete, ready for implementation

**Next Steps**:
1. Create story data JSON files
2. Implement dialog system
3. Build cutscene engine
4. Create quest system
5. Add visual polish

**Estimated Completion**: TBD + 9 days

---

## 📝 License

MIT License

All dragonbones assets are created by [Akashics](http://www.akashics.moe/category/librarium-animated/) under a custom license http://www.akashics.moe/terms-of-use/ which allows free use in non-commercial projects with attribution, but redistribution of content in base releases (Librarium Statics and/or Librarium Animated) is not allowed!