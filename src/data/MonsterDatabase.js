/**
 * MonsterDatabase - Database of 200 Divine Beasts
 * 200 Thần Thú chia theo Ngũ Hành (40 mỗi hệ)
 */

const ELEMENTS = {
    KIM: 'kim',
    MOC: 'moc',
    THUY: 'thuy',
    HOA: 'hoa',
    THO: 'tho'
};

// Element advantages: Kim > Mộc > Thổ > Thủy > Hỏa > Kim
const ELEMENT_ADVANTAGES = {
    kim: 'moc',
    moc: 'tho',
    tho: 'thuy',
    thuy: 'hoa',
    hoa: 'kim'
};

/**
 * Generate 200 monster entries
 * Each element has 40 monsters (char001-040 for Kim, char041-080 for Mộc, etc.)
 */
function generateMonsters() {
    const monsters = {};
    const elements = Object.values(ELEMENTS);
    const monstersPerElement = 40;
    
    // Vietnamese mythological creature names
    const baseNames = [
        'Rồng', 'Phượng', 'Lân', 'Quy', 'Cá Thần', 'Trâu Thần', 'Gấu Thần', 'Hổ',
        'Báo', 'Khỉ', 'Voi', 'Nai', 'Chim Lạc', 'Rắn Thần', 'Cá Sấu', 'Cọp',
        'Sơn Tinh', 'Thủy Tinh', 'Tằm', 'Ong Vàng', 'Bướm', 'Thiên Nga', 'Phù Đổng',
        'Thánh Gióng', 'Linh Miêu', 'Hổ Mang', 'Kim Quy', 'Thần Ngưu', 'Linh Dương',
        'Thần Điểu', 'Phù Dung', 'Linh Vật', 'Sơn Thần', 'Thủy Thần', 'Hỏa Thần',
        'Thổ Thần', 'Kim Thần', 'Linh Long', 'Thanh Long', 'Bạch Hổ'
    ];
    
    for (let i = 0; i < 200; i++) {
        const elementIndex = Math.floor(i / monstersPerElement);
        const element = elements[elementIndex];
        const charId = `char${String(i + 1).padStart(3, '0')}`;
        const nameIndex = i % baseNames.length;
        const tier = Math.floor((i % monstersPerElement) / 10) + 1; // 1-4 tiers per element
        
        monsters[charId] = {
            id: charId,
            name: `${baseNames[nameIndex]} ${element.charAt(0).toUpperCase() + element.slice(1)}`,
            element: element,
            tier: tier,
            baseStats: {
                hp: 50 + (tier * 20) + (i % 10) * 5,
                attack: 10 + (tier * 5) + (i % 10) * 2,
                defense: 8 + (tier * 4) + (i % 10) * 2,
                speed: 5 + (tier * 2) + (i % 10),
                magic: 5 + (tier * 3) + (i % 10)
            },
            skills: [
                {
                    name: `Chiêu ${element.charAt(0).toUpperCase() + element.slice(1)}`,
                    power: 20 + tier * 10,
                    element: element
                }
            ],
            evolveFrom: i > 0 && (i % 10) >= 5 ? `char${String(i - 4).padStart(3, '0')}` : null,
            evolveTo: i < 195 && (i % 10) < 5 ? `char${String(i + 5).padStart(3, '0')}` : null,
            captureRate: Math.max(10, 50 - tier * 10),
            rarity: tier === 1 ? 'common' : tier === 2 ? 'uncommon' : tier === 3 ? 'rare' : 'legendary'
        };
    }
    
    return monsters;
}

const MONSTER_DATABASE = generateMonsters();

export { MONSTER_DATABASE, ELEMENTS, ELEMENT_ADVANTAGES };
