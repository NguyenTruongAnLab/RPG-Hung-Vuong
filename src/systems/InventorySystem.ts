/**
 * InventorySystem - Item storage and management
 * 
 * Manages player inventory with slot-based grid system, stacking,
 * and persistence. Integrates with crafting and resource gathering.
 * 
 * @example
 * ```typescript
 * const inventory = InventorySystem.getInstance();
 * inventory.init(40); // 40 slots
 * 
 * // Add items
 * inventory.addItem('wood', 10);
 * inventory.addItem('stone', 5);
 * 
 * // Check if has materials
 * if (inventory.hasItems([{ id: 'wood', amount: 4 }])) {
 *   console.log('Can craft!');
 * }
 * ```
 */
import localforage from 'localforage';

/**
 * Item definition
 */
export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;         // Texture path
  maxStack: number;     // Max items per slot
  category: ItemCategory;
  rarity: ItemRarity;
}

/**
 * Item categories
 */
export type ItemCategory = 
  | 'resource'    // Wood, stone, ore
  | 'tool'        // Axe, pickaxe
  | 'weapon'      // Sword, bow
  | 'consumable'  // Food, potions
  | 'material'    // Crafting materials
  | 'quest'       // Quest items
  | 'misc';       // Other

/**
 * Item rarity
 */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Inventory slot
 */
export interface InventorySlot {
  item: ItemDefinition | null;
  amount: number;
}

/**
 * Item requirement (for crafting)
 */
export interface ItemRequirement {
  id: string;
  amount: number;
}

/**
 * InventorySystem singleton
 */
export class InventorySystem {
  private static instance: InventorySystem;
  
  private slots: InventorySlot[] = [];
  private maxSlots: number = 40;
  private itemDatabase: Map<string, ItemDefinition> = new Map();
  
  // Storage key
  private readonly STORAGE_KEY = 'player_inventory';

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): InventorySystem {
    if (!InventorySystem.instance) {
      InventorySystem.instance = new InventorySystem();
    }
    return InventorySystem.instance;
  }

  /**
   * Initialize inventory system
   * @param slotCount - Number of inventory slots
   */
  async init(slotCount: number = 40): Promise<void> {
    this.maxSlots = slotCount;
    this.initItemDatabase();
    await this.load();
    console.log(`✅ InventorySystem initialized with ${this.maxSlots} slots`);
  }

  /**
   * Initialize item database
   */
  private initItemDatabase(): void {
    // Resources
    this.registerItem({
      id: 'wood',
      name: 'Wood',
      description: 'Basic building material from trees',
      icon: '/assets/items/wood.png',
      maxStack: 99,
      category: 'resource',
      rarity: 'common'
    });

    this.registerItem({
      id: 'stone',
      name: 'Stone',
      description: 'Hard material from rocks',
      icon: '/assets/items/stone.png',
      maxStack: 99,
      category: 'resource',
      rarity: 'common'
    });

    this.registerItem({
      id: 'fiber',
      name: 'Fiber',
      description: 'Plant fibers for crafting',
      icon: '/assets/items/fiber.png',
      maxStack: 99,
      category: 'resource',
      rarity: 'common'
    });

    this.registerItem({
      id: 'berries',
      name: 'Berries',
      description: 'Restores hunger',
      icon: '/assets/items/berries.png',
      maxStack: 20,
      category: 'consumable',
      rarity: 'common'
    });

    // Tools
    this.registerItem({
      id: 'axe_wood',
      name: 'Wooden Axe',
      description: 'Basic tool for chopping trees',
      icon: '/assets/items/axe_wood.png',
      maxStack: 1,
      category: 'tool',
      rarity: 'common'
    });

    this.registerItem({
      id: 'pickaxe_wood',
      name: 'Wooden Pickaxe',
      description: 'Basic tool for mining rocks',
      icon: '/assets/items/pickaxe_wood.png',
      maxStack: 1,
      category: 'tool',
      rarity: 'common'
    });

    // More items will be added here
    console.log(`✅ Registered ${this.itemDatabase.size} items`);
  }

  /**
   * Register item definition
   */
  registerItem(item: ItemDefinition): void {
    this.itemDatabase.set(item.id, item);
  }

  /**
   * Get item definition
   */
  getItemDefinition(itemId: string): ItemDefinition | undefined {
    return this.itemDatabase.get(itemId);
  }

  /**
   * Add item to inventory
   * @param itemId - Item ID to add
   * @param amount - Amount to add
   * @returns true if successfully added
   */
  addItem(itemId: string, amount: number = 1): boolean {
    const itemDef = this.itemDatabase.get(itemId);
    if (!itemDef) {
      console.warn(`Unknown item: ${itemId}`);
      return false;
    }

    let remaining = amount;

    // Try to stack with existing slots
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot.item && slot.item.id === itemId) {
        const canAdd = Math.min(remaining, itemDef.maxStack - slot.amount);
        if (canAdd > 0) {
          slot.amount += canAdd;
          remaining -= canAdd;
          if (remaining <= 0) break;
        }
      }
    }

    // Create new slots for remaining items
    while (remaining > 0 && this.slots.length < this.maxSlots) {
      const stackSize = Math.min(remaining, itemDef.maxStack);
      this.slots.push({
        item: itemDef,
        amount: stackSize
      });
      remaining -= stackSize;
    }

    if (remaining > 0) {
      console.warn(`Inventory full! Could not add ${remaining} ${itemId}`);
      return false;
    }

    this.save();
    return true;
  }

  /**
   * Remove item from inventory
   * @param itemId - Item ID to remove
   * @param amount - Amount to remove
   * @returns true if successfully removed
   */
  removeItem(itemId: string, amount: number = 1): boolean {
    if (!this.hasItem(itemId, amount)) {
      return false;
    }

    let remaining = amount;

    for (let i = this.slots.length - 1; i >= 0; i--) {
      const slot = this.slots[i];
      if (slot.item && slot.item.id === itemId) {
        const toRemove = Math.min(remaining, slot.amount);
        slot.amount -= toRemove;
        remaining -= toRemove;

        if (slot.amount <= 0) {
          this.slots.splice(i, 1);
        }

        if (remaining <= 0) break;
      }
    }

    this.save();
    return true;
  }

  /**
   * Check if inventory has item
   * @param itemId - Item ID to check
   * @param amount - Amount required
   * @returns true if has enough
   */
  hasItem(itemId: string, amount: number = 1): boolean {
    return this.getItemCount(itemId) >= amount;
  }

  /**
   * Get total count of an item
   */
  getItemCount(itemId: string): number {
    return this.slots
      .filter(slot => slot.item && slot.item.id === itemId)
      .reduce((sum, slot) => sum + slot.amount, 0);
  }

  /**
   * Check if has multiple items (for crafting)
   */
  hasItems(requirements: ItemRequirement[]): boolean {
    return requirements.every(req => this.hasItem(req.id, req.amount));
  }

  /**
   * Remove multiple items (for crafting)
   */
  removeItems(requirements: ItemRequirement[]): boolean {
    // Check first
    if (!this.hasItems(requirements)) {
      return false;
    }

    // Remove all
    requirements.forEach(req => {
      this.removeItem(req.id, req.amount);
    });

    return true;
  }

  /**
   * Get all slots
   */
  getSlots(): InventorySlot[] {
    return this.slots;
  }

  /**
   * Get slot at index
   */
  getSlot(index: number): InventorySlot | null {
    return this.slots[index] || null;
  }

  /**
   * Swap two slots
   */
  swapSlots(index1: number, index2: number): void {
    if (index1 < 0 || index1 >= this.slots.length) return;
    if (index2 < 0 || index2 >= this.slots.length) return;

    const temp = this.slots[index1];
    this.slots[index1] = this.slots[index2];
    this.slots[index2] = temp;

    this.save();
  }

  /**
   * Get empty slot count
   */
  getEmptySlotCount(): number {
    return this.maxSlots - this.slots.length;
  }

  /**
   * Check if inventory is full
   */
  isFull(): boolean {
    return this.slots.length >= this.maxSlots;
  }

  /**
   * Clear inventory
   */
  clear(): void {
    this.slots = [];
    this.save();
  }

  /**
   * Save to localStorage
   */
  async save(): Promise<void> {
    try {
      const data = {
        slots: this.slots.map(slot => ({
          itemId: slot.item?.id || null,
          amount: slot.amount
        })),
        maxSlots: this.maxSlots
      };

      await localforage.setItem(this.STORAGE_KEY, data);
    } catch (error) {
      console.error('Failed to save inventory:', error);
    }
  }

  /**
   * Load from localStorage
   */
  async load(): Promise<void> {
    try {
      const data: any = await localforage.getItem(this.STORAGE_KEY);
      
      if (data) {
        this.maxSlots = data.maxSlots || 40;
        this.slots = data.slots
          .map((slotData: any) => {
            const item = slotData.itemId ? this.itemDatabase.get(slotData.itemId) : null;
            if (item) {
              return {
                item,
                amount: slotData.amount
              };
            }
            return null;
          })
          .filter(Boolean);
        
        console.log(`✅ Loaded ${this.slots.length} items from save`);
      } else {
        // Initialize empty inventory
        this.slots = [];
        console.log('✅ Initialized empty inventory');
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
      this.slots = [];
    }
  }

  /**
   * Get inventory stats for UI
   */
  getStats(): {
    usedSlots: number;
    totalSlots: number;
    itemCount: number;
    weight: number;
  } {
    return {
      usedSlots: this.slots.length,
      totalSlots: this.maxSlots,
      itemCount: this.slots.reduce((sum, slot) => sum + slot.amount, 0),
      weight: this.slots.length // Simplified weight
    };
  }
}
