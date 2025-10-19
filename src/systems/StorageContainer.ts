/**
 * StorageContainer - Persistent storage for items
 * 
 * Represents storage structures like chests, fridges, and other containers.
 * Each container has its own separate inventory independent of player inventory.
 * 
 * @example
 * ```typescript
 * const chest = new StorageContainer('chest_wood', 100, 200, 20);
 * await chest.init();
 * 
 * // Add item
 * chest.addItem('wood', 10);
 * 
 * // Check if player is nearby
 * if (chest.isInRange(player.x, player.y)) {
 *   chest.openUI();
 * }
 * ```
 */
import * as PIXI from 'pixi.js';
import { InventorySlot, ItemDefinition } from '../systems/InventorySystem';
import localforage from 'localforage';

/**
 * StorageContainer class
 */
export class StorageContainer {
  private id: string;
  private type: string; // 'chest_wood', 'chest_stone', etc.
  private x: number;
  private y: number;
  private capacity: number; // Max slots
  private accessRadius: number = 64; // Pixels
  
  private slots: InventorySlot[] = [];
  private sprite: PIXI.Container | null = null;
  
  private readonly STORAGE_PREFIX = 'storage_container_';

  constructor(type: string, x: number, y: number, capacity: number = 20) {
    this.id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.x = x;
    this.y = y;
    this.capacity = capacity;
  }

  /**
   * Initialize container
   */
  async init(): Promise<void> {
    // Initialize empty slots
    this.slots = [];
    
    // Try to load existing data
    await this.load();
    
    console.log(`✅ StorageContainer initialized: ${this.id} (${this.capacity} slots)`);
  }

  /**
   * Add item to container
   */
  addItem(itemId: string, amount: number = 1, itemDef: ItemDefinition): boolean {
    // Try to stack with existing slots
    for (const slot of this.slots) {
      if (slot.item && slot.item.id === itemId) {
        const canAdd = Math.min(amount, itemDef.maxStack - slot.amount);
        if (canAdd > 0) {
          slot.amount += canAdd;
          amount -= canAdd;
          if (amount <= 0) {
            this.save();
            return true;
          }
        }
      }
    }
    
    // Create new slots if needed
    while (amount > 0 && this.slots.length < this.capacity) {
      const stackSize = Math.min(amount, itemDef.maxStack);
      this.slots.push({
        item: itemDef,
        amount: stackSize
      });
      amount -= stackSize;
    }
    
    if (amount > 0) {
      console.warn(`Container full! Could not add ${amount} ${itemId}`);
      return false;
    }
    
    this.save();
    return true;
  }

  /**
   * Remove item from container
   */
  removeItem(itemId: string, amount: number = 1): boolean {
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
    
    if (remaining > 0) {
      return false; // Not enough items
    }
    
    this.save();
    return true;
  }

  /**
   * Get item count
   */
  getItemCount(itemId: string): number {
    return this.slots
      .filter(slot => slot.item && slot.item.id === itemId)
      .reduce((sum, slot) => sum + slot.amount, 0);
  }

  /**
   * Check if player is in range
   */
  isInRange(playerX: number, playerY: number): boolean {
    const dist = Math.hypot(this.x - playerX, this.y - playerY);
    return dist <= this.accessRadius;
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
    return this.capacity - this.slots.length;
  }

  /**
   * Check if container is full
   */
  isFull(): boolean {
    return this.slots.length >= this.capacity;
  }

  /**
   * Get capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Get position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get type
   */
  getType(): string {
    return this.type;
  }

  /**
   * Set sprite
   */
  setSprite(sprite: PIXI.Container): void {
    this.sprite = sprite;
  }

  /**
   * Get sprite
   */
  getSprite(): PIXI.Container | null {
    return this.sprite;
  }

  /**
   * Save container contents
   */
  async save(): Promise<void> {
    const data = {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      capacity: this.capacity,
      slots: this.slots
    };
    
    await localforage.setItem(`${this.STORAGE_PREFIX}${this.id}`, data);
  }

  /**
   * Load container contents
   */
  async load(): Promise<void> {
    try {
      const data = await localforage.getItem(`${this.STORAGE_PREFIX}${this.id}`) as any;
      if (data && data.slots) {
        this.slots = data.slots;
      }
    } catch (error) {
      console.error('Failed to load storage container:', error);
    }
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.slots = [];
    this.save();
  }

  /**
   * Destroy container (remove from storage)
   */
  async destroy(): Promise<void> {
    await localforage.removeItem(`${this.STORAGE_PREFIX}${this.id}`);
    console.log(`Storage container destroyed: ${this.id}`);
  }
}
