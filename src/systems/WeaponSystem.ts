/**
 * WeaponSystem - Manages weapon types, attacks, and durability
 * 
 * Handles real-time combat weapons with durability tracking,
 * attack animations, and crafting recipes.
 * 
 * @example
 * ```typescript
 * const weaponSystem = new WeaponSystem(eventBus);
 * const sword = weaponSystem.createWeapon('iron_sword');
 * weaponSystem.attack(playerId, sword, targetPosition);
 * ```
 */
import { EventBus } from '../core/EventBus';
import { Vector2D } from '../utils/Vector2D';

/**
 * Weapon types
 */
export type WeaponType = 'sword' | 'spear' | 'bow' | 'staff' | 'axe' | 'pickaxe' | 'hammer';

/**
 * Weapon rarity
 */
export type WeaponRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Weapon data
 */
export interface WeaponData {
  id: string;
  name: string;
  type: WeaponType;
  rarity: WeaponRarity;
  damage: number;
  attackSpeed: number; // attacks per second
  range: number; // pixels
  durability: number;
  maxDurability: number;
  craftingRecipe?: {
    materials: { itemId: string; amount: number }[];
    requiredStation?: string;
  };
}

/**
 * Active attack data
 */
export interface AttackData {
  weaponId: string;
  attackerId: string;
  position: Vector2D;
  direction: Vector2D;
  damage: number;
  range: number;
  timestamp: number;
}

/**
 * WeaponSystem class
 */
/**
 * Weapon template (without instance-specific durability)
 */
export interface WeaponTemplate {
  id: string;
  name: string;
  type: WeaponType;
  rarity: WeaponRarity;
  damage: number;
  attackSpeed: number;
  range: number;
  maxDurability: number;
  craftingRecipe?: {
    materials: { itemId: string; amount: number }[];
    requiredStation?: string;
  };
}

export class WeaponSystem {
  private eventBus: EventBus;
  private weapons: Map<string, WeaponData> = new Map();
  private activeAttacks: Map<string, AttackData> = new Map();
  private weaponDatabase: Map<string, WeaponTemplate> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeWeaponDatabase();
  }

  /**
   * Initialize weapon database with all weapon types
   */
  private initializeWeaponDatabase(): void {
    // Swords - Fast, balanced
    this.weaponDatabase.set('wooden_sword', {
      id: 'wooden_sword',
      name: 'Wooden Sword',
      type: 'sword',
      rarity: 'common',
      damage: 10,
      attackSpeed: 2.0,
      range: 40,
      maxDurability: 50,
      craftingRecipe: {
        materials: [
          { itemId: 'wood', amount: 10 },
          { itemId: 'fiber', amount: 5 }
        ]
      }
    });

    this.weaponDatabase.set('iron_sword', {
      id: 'iron_sword',
      name: 'Iron Sword',
      type: 'sword',
      rarity: 'uncommon',
      damage: 25,
      attackSpeed: 2.0,
      range: 45,
      maxDurability: 150,
      craftingRecipe: {
        materials: [
          { itemId: 'iron_bar', amount: 8 },
          { itemId: 'wood', amount: 5 }
        ],
        requiredStation: 'workbench'
      }
    });

    // Spears - Long range, slow
    this.weaponDatabase.set('wooden_spear', {
      id: 'wooden_spear',
      name: 'Wooden Spear',
      type: 'spear',
      rarity: 'common',
      damage: 12,
      attackSpeed: 1.2,
      range: 60,
      maxDurability: 40,
      craftingRecipe: {
        materials: [
          { itemId: 'wood', amount: 8 },
          { itemId: 'stone', amount: 3 }
        ]
      }
    });

    // Bows - Ranged, consumes ammo
    this.weaponDatabase.set('wooden_bow', {
      id: 'wooden_bow',
      name: 'Wooden Bow',
      type: 'bow',
      rarity: 'common',
      damage: 15,
      attackSpeed: 1.5,
      range: 200,
      maxDurability: 60,
      craftingRecipe: {
        materials: [
          { itemId: 'wood', amount: 12 },
          { itemId: 'fiber', amount: 10 }
        ]
      }
    });

    // Staffs - Magic, area damage
    this.weaponDatabase.set('wooden_staff', {
      id: 'wooden_staff',
      name: 'Wooden Staff',
      type: 'staff',
      rarity: 'common',
      damage: 8,
      attackSpeed: 1.0,
      range: 80,
      maxDurability: 70,
      craftingRecipe: {
        materials: [
          { itemId: 'wood', amount: 15 },
          { itemId: 'crystal', amount: 3 }
        ]
      }
    });

    // Tools - For gathering
    this.weaponDatabase.set('stone_axe', {
      id: 'stone_axe',
      name: 'Stone Axe',
      type: 'axe',
      rarity: 'common',
      damage: 5,
      attackSpeed: 1.5,
      range: 35,
      maxDurability: 100,
      craftingRecipe: {
        materials: [
          { itemId: 'stone', amount: 8 },
          { itemId: 'wood', amount: 6 }
        ]
      }
    });

    this.weaponDatabase.set('stone_pickaxe', {
      id: 'stone_pickaxe',
      name: 'Stone Pickaxe',
      type: 'pickaxe',
      rarity: 'common',
      damage: 5,
      attackSpeed: 1.5,
      range: 35,
      maxDurability: 100,
      craftingRecipe: {
        materials: [
          { itemId: 'stone', amount: 10 },
          { itemId: 'wood', amount: 6 }
        ]
      }
    });

    this.weaponDatabase.set('iron_hammer', {
      id: 'iron_hammer',
      name: 'Iron Hammer',
      type: 'hammer',
      rarity: 'uncommon',
      damage: 30,
      attackSpeed: 0.8,
      range: 40,
      maxDurability: 200,
      craftingRecipe: {
        materials: [
          { itemId: 'iron_bar', amount: 12 },
          { itemId: 'wood', amount: 8 }
        ],
        requiredStation: 'workbench'
      }
    });
  }

  /**
   * Create a weapon instance
   */
  createWeapon(weaponId: string): WeaponData | null {
    const template = this.weaponDatabase.get(weaponId);
    if (!template) {
      console.error(`Weapon template not found: ${weaponId}`);
      return null;
    }

    const weapon: WeaponData = {
      ...template,
      durability: template.maxDurability,
      maxDurability: template.maxDurability
    };

    return weapon;
  }

  /**
   * Execute weapon attack
   */
  attack(attackerId: string, weapon: WeaponData, direction: Vector2D, position: Vector2D): boolean {
    if (weapon.durability <= 0) {
      this.eventBus.emit('weapon:broken', { weaponId: weapon.id, attackerId });
      return false;
    }

    const attackId = `${attackerId}_${Date.now()}`;
    const attackData: AttackData = {
      weaponId: weapon.id,
      attackerId,
      position: { ...position },
      direction: { ...direction },
      damage: weapon.damage,
      range: weapon.range,
      timestamp: Date.now()
    };

    this.activeAttacks.set(attackId, attackData);

    // Emit attack event
    this.eventBus.emit('weapon:attack', { attackId, ...attackData });

    // Reduce durability
    weapon.durability = Math.max(0, weapon.durability - 1);

    // Check for low durability warning
    const durabilityPercent = weapon.durability / weapon.maxDurability;
    if (durabilityPercent <= 0.2 && durabilityPercent > 0) {
      this.eventBus.emit('weapon:low-durability', { weaponId: weapon.id, durability: weapon.durability });
    }

    // Clean up attack after duration
    setTimeout(() => {
      this.activeAttacks.delete(attackId);
    }, 500);

    return true;
  }

  /**
   * Get active attacks
   */
  getActiveAttacks(): AttackData[] {
    return Array.from(this.activeAttacks.values());
  }

  /**
   * Repair weapon
   */
  repairWeapon(weapon: WeaponData, materialsAvailable: Map<string, number>): boolean {
    if (!weapon.craftingRecipe) return false;

    // Calculate repair cost (50% of crafting cost)
    const repairCost = weapon.craftingRecipe.materials.map(mat => ({
      itemId: mat.itemId,
      amount: Math.ceil(mat.amount * 0.5)
    }));

    // Check if player has materials
    for (const cost of repairCost) {
      const available = materialsAvailable.get(cost.itemId) || 0;
      if (available < cost.amount) {
        this.eventBus.emit('weapon:repair-failed', { weaponId: weapon.id, reason: 'insufficient_materials' });
        return false;
      }
    }

    // Consume materials (handled by inventory system via event)
    this.eventBus.emit('weapon:repair-consume', { weaponId: weapon.id, materials: repairCost });

    // Restore durability
    weapon.durability = weapon.maxDurability;

    this.eventBus.emit('weapon:repaired', { weaponId: weapon.id });
    return true;
  }

  /**
   * Get weapon template
   */
  getWeaponTemplate(weaponId: string): WeaponTemplate | null {
    return this.weaponDatabase.get(weaponId) || null;
  }

  /**
   * Get all weapon templates
   */
  getAllWeaponTemplates(): WeaponTemplate[] {
    return Array.from(this.weaponDatabase.values());
  }
}
