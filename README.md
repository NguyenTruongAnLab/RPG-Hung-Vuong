# Thần Thú Văn Lang - Hùng Vương RPG

Game RPG đánh theo lượt lấy bối cảnh thời Hùng Vương - đất Văn Lang (2879-258 TCN). Người chơi là Chiến Sĩ Lạc Việt thu phục 200 Thần Thú từ truyền thuyết Việt Nam để bảo vệ bộ lạc.

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

## 🎯 Cách chơi

1. **Bắt đầu game** - Nhận thần thú đầu tiên (char001)
2. **Khám phá** - Di chuyển giữa các vùng đất
3. **Chiến đấu** - Gặp thần thú hoang dã
4. **Thu phục** - Bắt thần thú sau khi đánh bại
5. **Tiến hóa** - Nâng cấp thần thú của bạn
6. **Thu thập** - Hoàn thành bộ sưu tập 200 thần thú!

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

## 📝 License

MIT License

All dragonbones assets are created by [Akashics](http://www.akashics.moe/category/librarium-animated/) under a custom license http://www.akashics.moe/terms-of-use/ which allows free use in non-commercial projects with attribution, but redistribution of content in base releases (Librarium Statics and/or Librarium Animated) is not allowed!