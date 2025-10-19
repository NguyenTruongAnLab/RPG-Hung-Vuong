/**
 * StorageUI.ts
 * 
 * Dual-panel interface for transferring items between player inventory and storage containers.
 * Features drag-and-drop, quick-transfer buttons, and auto-close on distance.
 * 
 * @example
 * ```typescript
 * const storageUI = new StorageUI(inventorySystem, storageContainer);
 * await storageUI.init();
 * storageUI.open();
 * 
 * // In update loop
 * storageUI.update(playerX, playerY); // Auto-closes if out of range
 * ```
 */

import * as PIXI from 'pixi.js';
import type { InventorySystem, ItemDefinition } from '../systems/InventorySystem';
import type { StorageContainer } from '../systems/StorageContainer';

interface DragData {
  slot: PIXI.Container;
  slotIndex: number;
  isPlayerInventory: boolean;
  originalParent: PIXI.Container;
  originalX: number;
  originalY: number;
}

export class StorageUI {
  private container: PIXI.Container;
  private inventorySystem: InventorySystem;
  private storageContainer: StorageContainer | null = null;
  private isOpen = false;

  // UI elements
  private background: PIXI.Graphics;
  private playerPanel: PIXI.Container;
  private storagePanel: PIXI.Container;
  private playerSlots: PIXI.Container[] = [];
  private storageSlots: PIXI.Container[] = [];

  // Drag-and-drop
  private dragData: DragData | null = null;
  private dragSprite: PIXI.Container | null = null;

  // Layout constants
  private readonly PANEL_WIDTH = 340;
  private readonly PANEL_HEIGHT = 400;
  private readonly SLOT_SIZE = 50;
  private readonly SLOT_PADDING = 4;
  private readonly GRID_COLS = 8;

  constructor(inventorySystem: InventorySystem) {
    this.container = new PIXI.Container();
    this.inventorySystem = inventorySystem;
    this.background = new PIXI.Graphics();
    this.playerPanel = new PIXI.Container();
    this.storagePanel = new PIXI.Container();

    this.container.visible = false;
  }

  async init(): Promise<void> {
    this.createBackground();
    this.createPanels();
    this.setupInteraction();
  }

  /**
   * Create semi-transparent background overlay
   */
  private createBackground(): void {
    this.background.rect(0, 0, this.PANEL_WIDTH * 2 + 40, this.PANEL_HEIGHT + 120);
    this.background.fill({ color: 0x000000, alpha: 0.95 });
    this.background.stroke({ color: 0x8B4513, width: 3 });
    this.container.addChild(this.background);
  }

  /**
   * Create player inventory panel (left) and storage panel (right)
   */
  private createPanels(): void {
    const titleStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
    });

    const buttonStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xFFFFFF,
    });

    // Player panel (left)
    this.playerPanel.x = 20;
    this.playerPanel.y = 60;
    const playerTitle = new PIXI.Text({ text: 'Player Inventory', style: titleStyle });
    playerTitle.x = 10;
    playerTitle.y = -40;
    this.playerPanel.addChild(playerTitle);

    const playerBg = new PIXI.Graphics();
    playerBg.rect(0, 0, this.PANEL_WIDTH, this.PANEL_HEIGHT);
    playerBg.fill({ color: 0x2C1810, alpha: 0.9 });
    playerBg.stroke({ color: 0x8B4513, width: 2 });
    this.playerPanel.addChild(playerBg);

    // Quick transfer buttons for player panel
    const transferAllBtn = this.createButton('Transfer All →', 10, this.PANEL_HEIGHT + 10, 150, 30, buttonStyle);
    transferAllBtn.on('pointerdown', () => this.transferAllToStorage());
    this.playerPanel.addChild(transferAllBtn);

    this.container.addChild(this.playerPanel);

    // Storage panel (right)
    this.storagePanel.x = this.PANEL_WIDTH + 40;
    this.storagePanel.y = 60;
    const storageTitle = new PIXI.Text({ text: 'Storage Container', style: titleStyle });
    storageTitle.x = 10;
    storageTitle.y = -40;
    this.storagePanel.addChild(storageTitle);

    const storageBg = new PIXI.Graphics();
    storageBg.rect(0, 0, this.PANEL_WIDTH, this.PANEL_HEIGHT);
    storageBg.fill({ color: 0x2C1810, alpha: 0.9 });
    storageBg.stroke({ color: 0x8B4513, width: 2 });
    this.storagePanel.addChild(storageBg);

    // Quick transfer buttons for storage panel
    const takeAllBtn = this.createButton('← Take All', 180, this.PANEL_HEIGHT + 10, 150, 30, buttonStyle);
    takeAllBtn.on('pointerdown', () => this.transferAllToPlayer());
    this.storagePanel.addChild(takeAllBtn);

    this.container.addChild(this.storagePanel);

    // Close button
    const closeBtn = this.createButton('CLOSE', this.PANEL_WIDTH * 2 + 40 - 110, 10, 100, 40, titleStyle);
    closeBtn.on('pointerdown', () => this.close());
    this.container.addChild(closeBtn);
  }

  /**
   * Create a button with hover effects
   */
  private createButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    style: PIXI.TextStyle
  ): PIXI.Container {
    const btn = new PIXI.Container();
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new PIXI.Graphics();
    bg.rect(0, 0, width, height);
    bg.fill({ color: 0x8B4513 });
    bg.stroke({ color: 0xFFFFFF, width: 2 });
    btn.addChild(bg);

    const label = new PIXI.Text({ text, style });
    label.anchor.set(0.5);
    label.x = width / 2;
    label.y = height / 2;
    btn.addChild(label);

    // Hover effects
    btn.on('pointerover', () => {
      bg.clear();
      bg.rect(0, 0, width, height);
      bg.fill({ color: 0xA0522D });
      bg.stroke({ color: 0xFFFFFF, width: 2 });
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.rect(0, 0, width, height);
      bg.fill({ color: 0x8B4513 });
      bg.stroke({ color: 0xFFFFFF, width: 2 });
    });

    return btn;
  }

  /**
   * Setup drag-and-drop interaction
   */
  private setupInteraction(): void {
    this.container.eventMode = 'static';
    this.container.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (this.dragSprite && this.dragData) {
        const pos = event.global;
        this.dragSprite.x = pos.x;
        this.dragSprite.y = pos.y;
      }
    });

    this.container.on('pointerup', () => {
      if (this.dragSprite && this.dragData) {
        this.endDrag();
      }
    });
  }

  /**
   * Open storage UI for specific container
   */
  open(storageContainer: StorageContainer): void {
    this.storageContainer = storageContainer;
    this.isOpen = true;
    this.container.visible = true;
    this.refresh();
    this.centerUI();
  }

  /**
   * Close storage UI
   */
  close(): void {
    this.isOpen = false;
    this.container.visible = false;
    this.storageContainer = null;
    this.clearSlots();
  }

  /**
   * Center UI on screen
   */
  private centerUI(): void {
    this.container.x = (window.innerWidth - (this.PANEL_WIDTH * 2 + 40)) / 2;
    this.container.y = (window.innerHeight - (this.PANEL_HEIGHT + 120)) / 2;
  }

  /**
   * Update UI (check if player walked away)
   */
  update(playerX: number, playerY: number): void {
    if (this.isOpen && this.storageContainer) {
      if (!this.storageContainer.isInRange(playerX, playerY)) {
        this.close();
      }
    }
  }

  /**
   * Refresh both panels
   */
  private refresh(): void {
    this.refreshPlayerInventory();
    this.refreshStorageInventory();
  }

  /**
   * Refresh player inventory slots
   */
  private refreshPlayerInventory(): void {
    // Clear existing slots
    this.playerSlots.forEach(slot => this.playerPanel.removeChild(slot));
    this.playerSlots = [];

    const slots = this.inventorySystem.getSlots();
    const rows = Math.ceil(slots.length / this.GRID_COLS);

    for (let i = 0; i < slots.length; i++) {
      const col = i % this.GRID_COLS;
      const row = Math.floor(i / this.GRID_COLS);
      const x = 10 + col * (this.SLOT_SIZE + this.SLOT_PADDING);
      const y = 10 + row * (this.SLOT_SIZE + this.SLOT_PADDING);

      const slotContainer = this.createSlot(slots[i], i, true);
      slotContainer.x = x;
      slotContainer.y = y;
      this.playerPanel.addChild(slotContainer);
      this.playerSlots.push(slotContainer);
    }
  }

  /**
   * Refresh storage container slots
   */
  private refreshStorageInventory(): void {
    if (!this.storageContainer) return;

    // Clear existing slots
    this.storageSlots.forEach(slot => this.storagePanel.removeChild(slot));
    this.storageSlots = [];

    const slots = this.storageContainer.getSlots();
    const rows = Math.ceil(slots.length / this.GRID_COLS);

    for (let i = 0; i < slots.length; i++) {
      const col = i % this.GRID_COLS;
      const row = Math.floor(i / this.GRID_COLS);
      const x = 10 + col * (this.SLOT_SIZE + this.SLOT_PADDING);
      const y = 10 + row * (this.SLOT_SIZE + this.SLOT_PADDING);

      const slotContainer = this.createSlot(slots[i], i, false);
      slotContainer.x = x;
      slotContainer.y = y;
      this.storagePanel.addChild(slotContainer);
      this.storageSlots.push(slotContainer);
    }
  }

  /**
   * Create a single inventory slot
   */
  private createSlot(
    slotData: { item: ItemDefinition | null; amount: number },
    index: number,
    isPlayerInventory: boolean
  ): PIXI.Container {
    const slot = new PIXI.Container();
    slot.eventMode = 'static';
    slot.cursor = 'pointer';

    // Slot background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.SLOT_SIZE, this.SLOT_SIZE);
    bg.fill({ color: 0x3C2A1E, alpha: 0.8 });
    bg.stroke({ color: 0x8B4513, width: 1 });
    slot.addChild(bg);

    if (slotData.item) {
      // Item icon (placeholder colored square)
      // Color based on rarity
      const rarityColors: Record<string, number> = {
        common: 0x808080,
        uncommon: 0x1EFF00,
        rare: 0x0070DD,
        epic: 0xA335EE,
        legendary: 0xFF8000,
      };
      const icon = new PIXI.Graphics();
      icon.rect(5, 5, 30, 30);
      icon.fill({ color: rarityColors[slotData.item.rarity] || 0xFFFFFF });
      slot.addChild(icon);

      // Item count
      if (slotData.amount > 1) {
        const countText = new PIXI.Text({
          text: slotData.amount.toString(),
          style: {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xFFFFFF,
            stroke: { color: 0x000000, width: 2 },
          },
        });
        countText.anchor.set(1, 1);
        countText.x = this.SLOT_SIZE - 5;
        countText.y = this.SLOT_SIZE - 5;
        slot.addChild(countText);
      }

      // Setup drag interaction
      slot.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
        this.startDrag(slot, index, isPlayerInventory, event);
      });

      // Hover tooltip
      slot.on('pointerover', () => {
        bg.clear();
        bg.rect(0, 0, this.SLOT_SIZE, this.SLOT_SIZE);
        bg.fill({ color: 0x5C4A3E, alpha: 0.9 });
        bg.stroke({ color: 0xFFD700, width: 2 });
      });

      slot.on('pointerout', () => {
        bg.clear();
        bg.rect(0, 0, this.SLOT_SIZE, this.SLOT_SIZE);
        bg.fill({ color: 0x3C2A1E, alpha: 0.8 });
        bg.stroke({ color: 0x8B4513, width: 1 });
      });
    }

    return slot;
  }

  /**
   * Start dragging a slot
   */
  private startDrag(
    slot: PIXI.Container,
    slotIndex: number,
    isPlayerInventory: boolean,
    event: PIXI.FederatedPointerEvent
  ): void {
    this.dragData = {
      slot,
      slotIndex,
      isPlayerInventory,
      originalParent: slot.parent,
      originalX: slot.x,
      originalY: slot.y,
    };

    // Create drag sprite (clone of original slot)
    this.dragSprite = new PIXI.Container();
    this.dragSprite.x = event.global.x;
    this.dragSprite.y = event.global.y;
    this.dragSprite.alpha = 0.7;

    // Copy slot appearance
    const slotData = isPlayerInventory
      ? this.inventorySystem.getSlots()[slotIndex]
      : this.storageContainer!.getSlots()[slotIndex];

    if (slotData.item) {
      // Color based on rarity
      const rarityColors: Record<string, number> = {
        common: 0x808080,
        uncommon: 0x1EFF00,
        rare: 0x0070DD,
        epic: 0xA335EE,
        legendary: 0xFF8000,
      };
      const icon = new PIXI.Graphics();
      icon.rect(-25, -25, 50, 50);
      icon.fill({ color: rarityColors[slotData.item.rarity] || 0xFFFFFF });
      icon.stroke({ color: 0xFFD700, width: 3 });
      this.dragSprite.addChild(icon);
    }

    this.container.addChild(this.dragSprite);
  }

  /**
   * End drag (attempt to swap or transfer)
   */
  private endDrag(): void {
    if (!this.dragData || !this.dragSprite) return;

    // Determine if dropped on a valid slot
    const dropTarget = this.findDropTarget(this.dragSprite.x, this.dragSprite.y);

    if (dropTarget) {
      this.handleSlotTransfer(
        this.dragData.slotIndex,
        dropTarget.slotIndex,
        this.dragData.isPlayerInventory,
        dropTarget.isPlayerInventory
      );
    }

    // Cleanup
    this.container.removeChild(this.dragSprite);
    this.dragSprite = null;
    this.dragData = null;

    this.refresh();
  }

  /**
   * Find which slot the cursor is hovering over
   */
  private findDropTarget(x: number, y: number): { slotIndex: number; isPlayerInventory: boolean } | null {
    // Check player slots
    for (let i = 0; i < this.playerSlots.length; i++) {
      const slot = this.playerSlots[i];
      const bounds = slot.getBounds();
      if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
        return { slotIndex: i, isPlayerInventory: true };
      }
    }

    // Check storage slots
    for (let i = 0; i < this.storageSlots.length; i++) {
      const slot = this.storageSlots[i];
      const bounds = slot.getBounds();
      if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
        return { slotIndex: i, isPlayerInventory: false };
      }
    }

    return null;
  }

  /**
   * Handle item transfer between slots
   */
  private handleSlotTransfer(
    fromIndex: number,
    toIndex: number,
    fromIsPlayer: boolean,
    toIsPlayer: boolean
  ): void {
    if (!this.storageContainer) return;

    // Same inventory: swap
    if (fromIsPlayer === toIsPlayer) {
      if (fromIsPlayer) {
        this.inventorySystem.swapSlots(fromIndex, toIndex);
      } else {
        this.storageContainer.swapSlots(fromIndex, toIndex);
      }
      return;
    }

    // Different inventories: transfer
    if (fromIsPlayer) {
      // Player → Storage
      const fromSlot = this.inventorySystem.getSlots()[fromIndex];
      if (fromSlot.item) {
        if (this.storageContainer.addItem(fromSlot.item.id, fromSlot.amount, fromSlot.item)) {
          this.inventorySystem.removeItem(fromSlot.item.id, fromSlot.amount);
        }
      }
    } else {
      // Storage → Player
      const fromSlot = this.storageContainer.getSlots()[fromIndex];
      if (fromSlot.item) {
        if (this.inventorySystem.addItem(fromSlot.item.id, fromSlot.amount)) {
          this.storageContainer.removeItem(fromSlot.item.id, fromSlot.amount);
        }
      }
    }
  }

  /**
   * Transfer all items from player to storage
   */
  private transferAllToStorage(): void {
    if (!this.storageContainer) return;

    const slots = this.inventorySystem.getSlots();
    for (const slot of slots) {
      if (slot.item && slot.amount > 0) {
        const transferred = this.storageContainer.addItem(slot.item.id, slot.amount, slot.item);
        if (transferred) {
          this.inventorySystem.removeItem(slot.item.id, slot.amount);
        }
      }
    }

    this.refresh();
  }

  /**
   * Transfer all items from storage to player
   */
  private transferAllToPlayer(): void {
    if (!this.storageContainer) return;

    const slots = this.storageContainer.getSlots();
    for (const slot of slots) {
      if (slot.item && slot.amount > 0) {
        const transferred = this.inventorySystem.addItem(slot.item.id, slot.amount);
        if (transferred) {
          this.storageContainer.removeItem(slot.item.id, slot.amount);
        }
      }
    }

    this.refresh();
  }

  /**
   * Clear all slot containers
   */
  private clearSlots(): void {
    this.playerSlots.forEach(slot => this.playerPanel.removeChild(slot));
    this.storageSlots.forEach(slot => this.storagePanel.removeChild(slot));
    this.playerSlots = [];
    this.storageSlots = [];
  }

  /**
   * Get main container for adding to scene
   */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Check if UI is open
   */
  isVisible(): boolean {
    return this.isOpen;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearSlots();
    this.container.destroy({ children: true });
  }
}
