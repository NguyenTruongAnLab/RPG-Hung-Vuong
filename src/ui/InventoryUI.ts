/**
 * InventoryUI - Visual interface for inventory management
 * 
 * Displays inventory grid with drag-and-drop support.
 * Shows item tooltips and stack counts.
 * 
 * @example
 * ```typescript
 * const inventoryUI = new InventoryUI();
 * await inventoryUI.init();
 * inventoryUI.toggle();
 * ```
 */
import * as PIXI from 'pixi.js';
import { InventorySystem, type InventorySlot as InvSlot } from '../systems/InventorySystem';
import gsap from 'gsap';

/**
 * UI Inventory slot
 */
interface UIInventorySlot {
  index: number;
  container: PIXI.Container;
  bg: PIXI.Graphics;
  icon: PIXI.Graphics;
  countText: PIXI.Text;
  item: InvSlot | null;
}

/**
 * InventoryUI configuration
 */
interface UIConfig {
  width: number;
  height: number;
  slotSize: number;
  slotGap: number;
  cols: number;
  rows: number;
  padding: number;
}

/**
 * InventoryUI class
 */
export class InventoryUI {
  private container: PIXI.Container;
  private bg: PIXI.Graphics;
  private slots: UIInventorySlot[] = [];
  private tooltip: PIXI.Container | null = null;
  
  private isVisible: boolean = false;
  private draggedSlot: UIInventorySlot | null = null;
  private draggedItem: PIXI.Container | null = null;
  
  private config: UIConfig = {
    width: 600,
    height: 500,
    slotSize: 60,
    slotGap: 10,
    cols: 8,
    rows: 5,
    padding: 20
  };

  constructor() {
    this.container = new PIXI.Container();
    this.container.visible = false;
    this.bg = new PIXI.Graphics();
  }

  /**
   * Initialize UI
   */
  async init(): Promise<void> {
    // Position at screen center
    this.container.x = (800 - this.config.width) / 2; // TODO: Get from Game config
    this.container.y = (600 - this.config.height) / 2;
    
    this.createBackground();
    this.createTitle();
    this.createSlots();
    this.refreshInventory();
    
    console.log('✅ InventoryUI initialized');
  }

  /**
   * Create background
   */
  private createBackground(): void {
    const { width, height } = this.config;
    
    this.bg.clear();
    this.bg.lineStyle(3, 0x8b7355, 1);
    this.bg.beginFill(0x2a2a2a, 0.95);
    this.bg.drawRoundedRect(0, 0, width, height, 10);
    this.bg.endFill();
    
    this.container.addChild(this.bg);
  }

  /**
   * Create title
   */
  private createTitle(): void {
    const title = new PIXI.Text('INVENTORY', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    
    title.x = this.config.padding;
    title.y = this.config.padding;
    
    this.container.addChild(title);
    
    // Weight/capacity info
    const capacityText = new PIXI.Text(`0/${this.config.cols * this.config.rows}`, {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xcccccc
    });
    
    capacityText.x = this.config.width - capacityText.width - this.config.padding;
    capacityText.y = this.config.padding + 5;
    
    this.container.addChild(capacityText);
  }

  /**
   * Create inventory slots
   */
  private createSlots(): void {
    const startX = this.config.padding;
    const startY = 80;
    const { slotSize, slotGap, cols } = this.config;
    
    const maxSlots = this.config.cols * this.config.rows;
    
    for (let i = 0; i < maxSlots; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const x = startX + col * (slotSize + slotGap);
      const y = startY + row * (slotSize + slotGap);
      
      const slot = this.createSlot(i, x, y);
      this.slots.push(slot);
      this.container.addChild(slot.container);
    }
  }

  /**
   * Create a single slot
   */
  private createSlot(index: number, x: number, y: number): UIInventorySlot {
    const slotContainer = new PIXI.Container();
    slotContainer.x = x;
    slotContainer.y = y;
    
    // Slot background
    const bg = new PIXI.Graphics();
    bg.lineStyle(2, 0x8b7355, 1);
    bg.beginFill(0x1a1a1a, 1);
    bg.drawRoundedRect(0, 0, this.config.slotSize, this.config.slotSize, 5);
    bg.endFill();
    slotContainer.addChild(bg);
    
    // Item icon placeholder
    const icon = new PIXI.Graphics();
    icon.x = 5;
    icon.y = 5;
    slotContainer.addChild(icon);
    
    // Item count text
    const countText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 3 }
    });
    countText.x = this.config.slotSize - 25;
    countText.y = this.config.slotSize - 25;
    slotContainer.addChild(countText);
    
    // Make interactive
    slotContainer.eventMode = 'static';
    slotContainer.cursor = 'pointer';
    
    const slot: UIInventorySlot = {
      index,
      container: slotContainer,
      bg,
      icon,
      countText,
      item: null
    };
    
    // Hover events
    slotContainer.on('pointerover', () => this.onSlotHover(slot));
    slotContainer.on('pointerout', () => this.onSlotOut(slot));
    
    // Drag events
    slotContainer.on('pointerdown', (e) => this.onSlotDragStart(slot, e));
    
    return slot;
  }

  /**
   * Refresh inventory display
   */
  private refreshInventory(): void {
    const inventory = InventorySystem.getInstance();
    const items = inventory.getSlots();
    
    // Clear all slots
    this.slots.forEach(slot => {
      slot.item = null;
      slot.icon.clear();
      slot.countText.text = '';
    });
    
    // Fill slots with items
    items.forEach((invSlot, index) => {
      if (index >= this.slots.length) return;
      if (!invSlot.item) return;
      
      const slot = this.slots[index];
      slot.item = invSlot;
      
      // Draw item icon (placeholder)
      this.drawItemIcon(slot.icon, invSlot.item.id);
      
      // Show count if > 1
      if (invSlot.amount > 1) {
        slot.countText.text = invSlot.amount.toString();
      }
    });
  }

  /**
   * Draw item icon placeholder
   */
  private drawItemIcon(graphics: PIXI.Graphics, itemId: string): void {
    graphics.clear();
    
    // Item-specific colors
    const colors: Record<string, number> = {
      wood: 0x8b4513,
      stone: 0x808080,
      fiber: 0x90ee90,
      berries: 0xff0000,
      axe_wood: 0xd2691e,
      pickaxe_wood: 0xb8860b,
      torch: 0xffa500,
      campfire: 0xff6600,
      workbench: 0xa0522d
    };
    
    const color = colors[itemId] ?? 0xcccccc;
    
    graphics.beginFill(color, 1);
    graphics.drawRoundedRect(0, 0, 50, 50, 5);
    graphics.endFill();
    
    // Simple item indicator
    graphics.beginFill(0xffffff, 0.5);
    graphics.drawCircle(25, 25, 10);
    graphics.endFill();
  }

  /**
   * Handle slot hover
   */
  private onSlotHover(slot: UIInventorySlot): void {
    // Highlight slot
    slot.bg.clear();
    slot.bg.lineStyle(2, 0xffa500, 1);
    slot.bg.beginFill(0x2a2a2a, 1);
    slot.bg.drawRoundedRect(0, 0, this.config.slotSize, this.config.slotSize, 5);
    slot.bg.endFill();
    
    // Show tooltip
    if (slot.item) {
      this.showTooltip(slot);
    }
  }

  /**
   * Handle slot out
   */
  private onSlotOut(slot: UIInventorySlot): void {
    // Reset slot
    slot.bg.clear();
    slot.bg.lineStyle(2, 0x8b7355, 1);
    slot.bg.beginFill(0x1a1a1a, 1);
    slot.bg.drawRoundedRect(0, 0, this.config.slotSize, this.config.slotSize, 5);
    slot.bg.endFill();
    
    // Hide tooltip
    this.hideTooltip();
  }

  /**
   * Show tooltip
   */
  private showTooltip(slot: UIInventorySlot): void {
    if (!slot.item || !slot.item.item) return;
    
    this.hideTooltip();
    
    const tooltip = new PIXI.Container();
    
    // Tooltip background
    const tooltipBg = new PIXI.Graphics();
    tooltipBg.lineStyle(2, 0x8b7355, 1);
    tooltipBg.beginFill(0x1a1a1a, 0.95);
    tooltipBg.drawRoundedRect(0, 0, 200, 80, 5);
    tooltipBg.endFill();
    tooltip.addChild(tooltipBg);
    
    // Item name
    const nameText = new PIXI.Text(slot.item.item.id.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    nameText.x = 10;
    nameText.y = 10;
    tooltip.addChild(nameText);
    
    // Item description
    const descText = new PIXI.Text(`Amount: ${slot.item.amount}`, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xcccccc
    });
    descText.x = 10;
    descText.y = 35;
    tooltip.addChild(descText);
    
    // Position tooltip
    tooltip.x = slot.container.x + this.config.slotSize + 10;
    tooltip.y = slot.container.y;
    
    this.tooltip = tooltip;
    this.container.addChild(tooltip);
  }

  /**
   * Hide tooltip
   */
  private hideTooltip(): void {
    if (this.tooltip) {
      this.container.removeChild(this.tooltip);
      this.tooltip = null;
    }
  }

  /**
   * Handle drag start
   */
  private onSlotDragStart(slot: UIInventorySlot, event: PIXI.FederatedPointerEvent): void {
    if (!slot.item || !slot.item.item) return;
    
    this.draggedSlot = slot;
    
    // Create dragged item visual
    const dragContainer = new PIXI.Container();
    dragContainer.alpha = 0.7;
    
    const icon = new PIXI.Graphics();
    this.drawItemIcon(icon, slot.item.item.id);
    dragContainer.addChild(icon);
    
    // Position at cursor
    const pos = event.global;
    dragContainer.x = pos.x - 25;
    dragContainer.y = pos.y - 25;
    
    this.draggedItem = dragContainer;
    this.stage.addChild(dragContainer);
    
    // Add pointer move listener
    this.stage.eventMode = 'static';
    this.stage.on('pointermove', this.onDragMove.bind(this));
    this.stage.on('pointerup', this.onDragEnd.bind(this));
  }

  /**
   * Handle drag move
   */
  private onDragMove(event: PIXI.FederatedPointerEvent): void {
    if (!this.draggedItem) return;
    
    const pos = event.global;
    this.draggedItem.x = pos.x - 25;
    this.draggedItem.y = pos.y - 25;
  }

  /**
   * Handle drag end
   */
  private onDragEnd(event: PIXI.FederatedPointerEvent): void {
    if (!this.draggedSlot || !this.draggedItem) return;
    
    // Find target slot
    const targetSlot = this.findSlotAtPosition(event.global.x, event.global.y);
    
    if (targetSlot && targetSlot !== this.draggedSlot) {
      // Swap items
      this.swapSlots(this.draggedSlot, targetSlot);
    }
    
    // Clean up
    this.stage.removeChild(this.draggedItem);
    this.draggedItem = null;
    this.draggedSlot = null;
    
    this.stage.off('pointermove', this.onDragMove);
    this.stage.off('pointerup', this.onDragEnd);
  }

  /**
   * Find slot at position
   */
  private findSlotAtPosition(x: number, y: number): UIInventorySlot | null {
    for (const slot of this.slots) {
      const bounds = slot.container.getBounds();
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        return slot;
      }
    }
    return null;
  }

  /**
   * Swap two slots
   */
  private swapSlots(slotA: UIInventorySlot, slotB: UIInventorySlot): void {
    const inventory = InventorySystem.getInstance();
    
    // Swap in inventory system
    inventory.swapSlots(slotA.index, slotB.index);
    
    // Refresh the display
    this.refreshInventory();
  }

  /**
   * Show UI
   */
  show(): void {
    this.container.visible = true;
    this.isVisible = true;
    this.refreshInventory();
  }

  /**
   * Hide UI
   */
  hide(): void {
    this.container.visible = false;
    this.isVisible = false;
    this.hideTooltip();
  }

  /**
   * Toggle visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Get container
   */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Get stage reference (for drag-drop)
   */
  private get stage(): PIXI.Container {
    return this.container.parent ?? this.container;
  }
}
