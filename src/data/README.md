# Game Data

Static game data and configuration files.

## Files

### Existing Files
- `MonsterDatabase.js` (80 lines) - Database of 200 Thần Thú (Divine Beasts)
  - ✅ **GOOD SIZE**: Clean data structure
  - Format: JSON-like objects with monster definitions
  
- `vi.json` - Vietnamese translations for i18n system
  - Location: Should be in `src/data/locales/vi.json` (to organize)

## Monster Data Structure

Each monster (char001 to char200) has:

```javascript
{
  id: 'char001',              // Unique identifier
  name: 'Rồng Kim',           // Vietnamese name
  element: 'kim',             // Element type (kim/moc/thuy/hoa/tho)
  tier: 1,                    // Rarity tier (1-4)
  baseStats: {
    hp: 100,                  // Base HP
    attack: 50,               // Base attack power
    defense: 40,              // Base defense
    speed: 60,                // Turn order priority
    magic: 45                 // Magic power
  },
  skills: [                   // Available skills
    {
      name: 'Kim Khí Chém',
      power: 40,
      element: 'kim'
    }
  ],
  evolveFrom: 'char000',      // Previous evolution (or null)
  evolveTo: 'char005',        // Next evolution (or null)
  captureRate: 45,            // Base capture rate (10-50)
  rarity: 'common'            // Rarity category
}
```

## Ngũ Hành (Five Elements)

Elements in the system:
- `kim` - Metal (Kim Hành)
- `moc` - Wood (Mộc Hành)
- `thuy` - Water (Thủy Hành)
- `hoa` - Fire (Hỏa Hành)
- `tho` - Earth (Thổ Hành)

Element advantages (1.5x damage):
```
Kim > Mộc > Thổ > Thủy > Hỏa > Kim
```

## Rarity Tiers

- **Tier 1**: Common monsters (high capture rate)
- **Tier 2**: Uncommon monsters
- **Tier 3**: Rare monsters
- **Tier 4**: Legendary monsters (low capture rate)

## Evolution Chains

Example evolution chain:
```
char001 (Rồng Kim Nhỏ)
  ↓ level 16
char005 (Rồng Kim)
  ↓ level 36
char010 (Rồng Kim Vương)
```

## File Organization Recommendations

### Current Structure
```
src/data/
├── MonsterDatabase.js
└── vi.json (translations)
```

### Recommended Structure (Phase 2+)
```
src/data/
├── monsters/
│   ├── README.md
│   ├── kim-element.json      # Metal element monsters
│   ├── moc-element.json      # Wood element monsters
│   ├── thuy-element.json     # Water element monsters
│   ├── hoa-element.json      # Fire element monsters
│   └── tho-element.json      # Earth element monsters
├── locales/
│   ├── vi.json               # Vietnamese
│   └── en.json               # English (future)
├── skills/
│   └── skills.json           # Skill definitions
├── locations/
│   └── locations.json        # Map location data
└── constants.ts              # Game constants
```

## Data Validation

All monster data should validate:
- ✅ Unique IDs (char001-char200)
- ✅ Valid element types
- ✅ Stats within reasonable ranges
- ✅ Valid evolution chains
- ✅ Capture rates 10-50
- ✅ Rarity matches tier

## Planned Files (Phase 2)

### skills.json
```json
{
  "skill001": {
    "name": "Kim Khí Chém",
    "nameEn": "Metal Slash",
    "element": "kim",
    "power": 40,
    "accuracy": 95,
    "pp": 25,
    "type": "physical"
  }
}
```

### locations.json
```json
{
  "loc001": {
    "id": "loc001",
    "name": "Rừng Cổ Loa",
    "nameEn": "Ancient Forest",
    "connections": ["loc002", "loc003"],
    "encounterZones": [
      {
        "elements": ["moc", "thuy"],
        "levels": [5, 10],
        "rate": 0.15
      }
    ]
  }
}
```

### constants.ts
```typescript
export const GAME_CONSTANTS = {
  MAX_TEAM_SIZE: 6,
  MAX_ITEM_STACK: 99,
  BASE_CAPTURE_RATE: 0.3,
  ELEMENT_ADVANTAGE_MULTIPLIER: 1.5,
  SPEED_PRIORITY_THRESHOLD: 10
};
```

## File Size Policy

- **Data files**: Can exceed 500 lines if pure JSON
- **Code files**: Must stay <500 lines
- **Action if large**: Split by category (element, location, etc.)

## Testing Data

Test data should be in `tests/fixtures/`:
```
tests/fixtures/
├── testMonsters.json     # Small set for testing
├── testSkills.json       # Test skills
└── testLocations.json    # Test maps
```

## Vietnamese Localization

All in-game text must have Vietnamese translations:
- Monster names
- Skill names
- Location names
- UI text
- Battle messages
- Error messages

## Data Loading Strategy

### Current (Synchronous)
```javascript
import { MONSTERS } from './MonsterDatabase.js';
```

### Future (Lazy Loading)
```typescript
// Load only needed monsters
const monster = await AssetManager.loadMonster('char001');

// Load by element
const kimMonsters = await AssetManager.loadMonstersByElement('kim');

// Load by tier
const legendaryMonsters = await AssetManager.loadMonstersByTier(4);
```

---

**Rule**: Data files can be large, but keep code that processes them modular.
