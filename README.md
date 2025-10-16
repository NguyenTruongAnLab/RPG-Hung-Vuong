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
- **JavaScript ES6+** - Code modular, hiện đại
- **GitHub Actions** - CI/CD tự động
- **GitHub Pages** - Deployment miễn phí

## 📦 Cấu trúc Project

```
RPG-Hung-Vuong/
├── src/
│   ├── core/           # Core game systems
│   │   ├── Game.js     # Main game controller
│   │   └── I18n.js     # Internationalization
│   ├── data/           # Game data
│   │   ├── MonsterDatabase.js  # 200 monsters metadata
│   │   └── vi.json             # Vietnamese translations
│   ├── systems/        # Game systems
│   │   ├── BattleSystem.js     # Turn-based combat
│   │   ├── CaptureSystem.js    # Monster capture
│   │   └── MapExplorer.js      # World exploration
│   └── main.js         # Entry point
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages deployment
├── index.html          # Main HTML
├── package.json
└── vite.config.js
```

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```
Game sẽ chạy tại `http://localhost:3000`

### Build production
```bash
npm run build
```
Output trong thư mục `dist/`

### Preview production build
```bash
npm run preview
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

## 🔮 Tương lai

Các tính năng có thể mở rộng:
- [ ] DragonBones animation cho 200 thần thú
- [ ] Multiplayer battles
- [ ] Trading system
- [ ] More locations và story quests
- [ ] Sound effects & music
- [ ] Save/Load system với localStorage
- [ ] Achievements system
- [ ] Leaderboards

## 📝 License

MIT License

## 🙏 Credits

Dựa trên văn hóa và truyền thuyết Việt Nam thời Hùng Vương.
