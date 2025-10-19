/**
 * CookingUI.ts
 * 
 * Visual interface for campfire cooking. Shows cooking slots, fuel, progress bars,
 * and burn warnings.
 * 
 * @example
 * ```typescript
 * const cookingUI = new CookingUI(cookingSystem, inventorySystem);
 * await cookingUI.init();
 * 
 * // Open for specific campfire
 * cookingUI.open(campfireId);
 * 
 * // Update in game loop
 * cookingUI.update(deltaTime);
 * ```
 */

import * as PIXI from 'pixi.js';
import type { CookingSystem, CookingRecipe, FuelDefinition } from '../systems/CookingSystem';
import type { InventorySystem } from '../systems/InventorySystem';
import { EventBus } from '../core/EventBus';
import gsap from 'gsap';

export class CookingUI {
  private container: PIXI.Container;
  private cookingSystem: CookingSystem;
  private inventorySystem: InventorySystem;
  private eventBus: EventBus;
  private isOpen = false;
  private currentCampfireId: string | null = null;

  // UI elements
  private background: PIXI.Graphics;
  private fuelBar: PIXI.Graphics;
  private fuelBarBg: PIXI.Graphics;
  private fuelText: PIXI.Text;
  private cookingSlots: PIXI.Container[] = [];
  private progressBars: PIXI.Graphics[] = [];
  private burnWarnings: PIXI.Graphics[] = [];
  
  // Recipe list
  private recipePanel: PIXI.Container;
  private recipeButtons: PIXI.Container[] = [];

  // Layout constants
  private readonly WIDTH = 600;
  private readonly HEIGHT = 450;
  private readonly SLOT_SIZE = 80;
  private readonly SLOT_PADDING = 10;

  constructor(cookingSystem: CookingSystem, inventorySystem: InventorySystem) {
    this.container = new PIXI.Container();
    this.cookingSystem = cookingSystem;
    this.inventorySystem = inventorySystem;
    this.eventBus = EventBus.getInstance();
    this.background = new PIXI.Graphics();
    this.fuelBar = new PIXI.Graphics();
    this.fuelBarBg = new PIXI.Graphics();
    this.fuelText = new PIXI.Text({ text: '' });
    this.recipePanel = new PIXI.Container();

    this.container.visible = false;
  }

  async init(): Promise<void> {
    this.createBackground();
    this.createFuelBar();
    this.createCookingSlots();
    this.createRecipePanel();
    this.setupEventListeners();
  }

  /**
   * Create main background
   */
  private createBackground(): void {
    this.background.rect(0, 0, this.WIDTH, this.HEIGHT);
    this.background.fill({ color: 0x1A1410, alpha: 0.95 });
    this.background.stroke({ color: 0xFF6600, width: 3 });
    this.container.addChild(this.background);

    // Title
    const title = new PIXI.Text({
      text: '🔥 CAMPFIRE COOKING 🔥',
      style: {
        fontFamily: 'Arial',
        fontSize: 28,
        fill: 0xFF6600,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5, 0);
    title.x = this.WIDTH / 2;
    title.y = 15;
    this.container.addChild(title);

    // Close button
    const closeBtn = this.createButton('CLOSE', this.WIDTH - 110, 10, 100, 40);
    closeBtn.on('pointerdown', () => this.close());
    this.container.addChild(closeBtn);
  }

  /**
   * Create fuel bar
   */
  private createFuelBar(): void {
    const fuelY = 60;

    const label = new PIXI.Text({
      text: 'FUEL:',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
      },
    });
    label.x = 20;
    label.y = fuelY;
    this.container.addChild(label);

    // Background bar
    this.fuelBarBg.rect(80, fuelY, 400, 25);
    this.fuelBarBg.fill({ color: 0x2C1810 });
    this.fuelBarBg.stroke({ color: 0x8B4513, width: 2 });
    this.container.addChild(this.fuelBarBg);

    // Fuel fill
    this.container.addChild(this.fuelBar);

    // Fuel text
    this.fuelText = new PIXI.Text({
      text: '0s',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
      },
    });
    this.fuelText.anchor.set(0.5);
    this.fuelText.x = 280;
    this.fuelText.y = fuelY + 12;
    this.container.addChild(this.fuelText);

    // Add fuel button
    const addFuelBtn = this.createButton('+WOOD', 490, fuelY - 5, 90, 35);
    addFuelBtn.on('pointerdown', () => this.addFuel('wood', 1));
    this.container.addChild(addFuelBtn);
  }

  /**
   * Create 4 cooking slots
   */
  private createCookingSlots(): void {
    const startY = 110;

    for (let i = 0; i < 4; i++) {
      const slotX = 20 + (i % 2) * (this.SLOT_SIZE + this.SLOT_PADDING + 210);
      const slotY = startY + Math.floor(i / 2) * (this.SLOT_SIZE + 60);

      const slot = this.createCookingSlot(i);
      slot.x = slotX;
      slot.y = slotY;
      this.container.addChild(slot);
      this.cookingSlots.push(slot);
    }
  }

  /**
   * Create single cooking slot
   */
  private createCookingSlot(index: number): PIXI.Container {
    const slot = new PIXI.Container();

    // Slot background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.SLOT_SIZE, this.SLOT_SIZE);
    bg.fill({ color: 0x3C2A1E });
    bg.stroke({ color: 0x8B4513, width: 3 });
    slot.addChild(bg);

    // Slot label
    const label = new PIXI.Text({
      text: `SLOT ${index + 1}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xAAAAAA,
      },
    });
    label.anchor.set(0.5);
    label.x = this.SLOT_SIZE / 2;
    label.y = -15;
    slot.addChild(label);

    // Progress bar background
    const progressBg = new PIXI.Graphics();
    progressBg.rect(this.SLOT_SIZE + 10, 10, 200, 20);
    progressBg.fill({ color: 0x2C1810 });
    progressBg.stroke({ color: 0x8B4513, width: 2 });
    slot.addChild(progressBg);

    // Progress bar fill
    const progressBar = new PIXI.Graphics();
    slot.addChild(progressBar);
    this.progressBars.push(progressBar);

    // Status text
    const statusText = new PIXI.Text({
      text: 'EMPTY',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFFFF,
      },
    });
    statusText.x = this.SLOT_SIZE + 15;
    statusText.y = 35;
    slot.addChild(statusText);

    // Burn warning (initially hidden)
    const burnWarning = new PIXI.Graphics();
    burnWarning.circle(this.SLOT_SIZE - 10, 10, 8);
    burnWarning.fill({ color: 0xFF0000 });
    burnWarning.visible = false;
    slot.addChild(burnWarning);
    this.burnWarnings.push(burnWarning);

    // Collect button
    const collectBtn = this.createButton('COLLECT', this.SLOT_SIZE + 10, 55, 90, 20);
    collectBtn.visible = false;
    collectBtn.on('pointerdown', () => this.collectItem(index));
    slot.addChild(collectBtn);

    // Cancel button
    const cancelBtn = this.createButton('CANCEL', this.SLOT_SIZE + 110, 55, 90, 20);
    cancelBtn.visible = false;
    cancelBtn.on('pointerdown', () => this.cancelCooking(index));
    slot.addChild(cancelBtn);

    return slot;
  }

  /**
   * Create recipe panel (list of cookable items)
   */
  private createRecipePanel(): void {
    this.recipePanel.x = 20;
    this.recipePanel.y = 320;

    const title = new PIXI.Text({
      text: 'RECIPES:',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
      },
    });
    this.recipePanel.addChild(title);

    const recipes = this.cookingSystem.getAllRecipes();
    for (let i = 0; i < Math.min(recipes.length, 4); i++) {
      const recipe = recipes[i];
      const btn = this.createRecipeButton(recipe, i);
      btn.x = i * 145;
      btn.y = 30;
      this.recipePanel.addChild(btn);
      this.recipeButtons.push(btn);
    }

    this.container.addChild(this.recipePanel);
  }

  /**
   * Create recipe button
   */
  private createRecipeButton(recipe: CookingRecipe, index: number): PIXI.Container {
    const btn = new PIXI.Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    // Background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, 135, 80);
    bg.fill({ color: 0x3C2A1E });
    bg.stroke({ color: 0x8B4513, width: 2 });
    btn.addChild(bg);

    // Recipe name
    const name = new PIXI.Text({
      text: recipe.outputId.replace(/_/g, ' ').toUpperCase(),
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: 125,
      },
    });
    name.x = 7;
    name.y = 7;
    btn.addChild(name);

    // Cook time
    const time = new PIXI.Text({
      text: `⏱ ${recipe.cookTime}s`,
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xAAAAAAa,
      },
    });
    time.x = 7;
    time.y = 50;
    btn.addChild(time);

    // Hover effect
    btn.on('pointerover', () => {
      bg.clear();
      bg.rect(0, 0, 135, 80);
      bg.fill({ color: 0x5C4A3E });
      bg.stroke({ color: 0xFF6600, width: 2 });
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.rect(0, 0, 135, 80);
      bg.fill({ color: 0x3C2A1E });
      bg.stroke({ color: 0x8B4513, width: 2 });
    });

    // Click to start cooking (find empty slot)
    btn.on('pointerdown', () => {
      const emptySlot = this.findEmptySlot();
      if (emptySlot !== -1) {
        this.cookingSystem.startCooking(this.currentCampfireId!, recipe.inputId, emptySlot);
      }
    });

    return btn;
  }

  /**
   * Create generic button
   */
  private createButton(text: string, x: number, y: number, width: number, height: number): PIXI.Container {
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

    const label = new PIXI.Text({
      text,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
      },
    });
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
   * Setup event listeners for cooking system
   */
  private setupEventListeners(): void {
    this.eventBus.on('campfire:food_cooked', (data: any) => {
      if (data.campfireId === this.currentCampfireId) {
        // Flash slot green
        const slot = this.cookingSlots[data.slotIndex];
        gsap.to(slot, { alpha: 0.5, duration: 0.2, yoyo: true, repeat: 3 });
      }
    });

    this.eventBus.on('campfire:food_burning', (data: any) => {
      if (data.campfireId === this.currentCampfireId) {
        // Show burn warning
        this.burnWarnings[data.slotIndex].visible = true;
        gsap.to(this.burnWarnings[data.slotIndex], {
          alpha: 0.3,
          duration: 0.5,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  /**
   * Open cooking UI for specific campfire
   */
  open(campfireId: string): void {
    this.currentCampfireId = campfireId;
    this.isOpen = true;
    this.container.visible = true;
    this.centerUI();
    this.refresh();
  }

  /**
   * Close cooking UI
   */
  close(): void {
    this.isOpen = false;
    this.container.visible = false;
    this.currentCampfireId = null;
  }

  /**
   * Center UI on screen
   */
  private centerUI(): void {
    this.container.x = (window.innerWidth - this.WIDTH) / 2;
    this.container.y = (window.innerHeight - this.HEIGHT) / 2;
  }

  /**
   * Update UI (call each frame)
   */
  update(deltaTime: number): void {
    if (!this.isOpen || !this.currentCampfireId) return;

    const state = this.cookingSystem.getCampfireState(this.currentCampfireId);
    if (!state) return;

    // Update fuel bar
    const maxFuel = 120; // Max display seconds
    const fuelPercent = Math.min(1.0, state.fuelRemaining / maxFuel);
    this.fuelBar.clear();
    this.fuelBar.rect(80, 60, 400 * fuelPercent, 25);
    this.fuelBar.fill({ color: 0xFF6600 });
    this.fuelText.text = `${Math.floor(state.fuelRemaining)}s`;

    // Update cooking slots
    for (let i = 0; i < state.cookingSlots.length; i++) {
      const cookingSlot = state.cookingSlots[i];
      const uiSlot = this.cookingSlots[i];
      const progressBar = this.progressBars[i];
      const burnWarning = this.burnWarnings[i];
      
      // Find UI elements
      const statusText = uiSlot.children.find(c => c instanceof PIXI.Text && c.y === 35) as PIXI.Text;
      const collectBtn = uiSlot.children.find(c => c.x === this.SLOT_SIZE + 10 && c.y === 55) as PIXI.Container;
      const cancelBtn = uiSlot.children.find(c => c.x === this.SLOT_SIZE + 110 && c.y === 55) as PIXI.Container;

      if (cookingSlot) {
        // Update progress bar
        progressBar.clear();
        progressBar.rect(this.SLOT_SIZE + 10, 10, 200 * cookingSlot.cookProgress, 20);
        progressBar.fill({ color: cookingSlot.isBurning ? 0xFF0000 : 0x00FF00 });

        // Update status text
        if (cookingSlot.isBurning) {
          statusText.text = 'BURNT!';
          statusText.style.fill = 0xFF0000;
        } else if (cookingSlot.cookProgress >= 1.0) {
          statusText.text = 'READY!';
          statusText.style.fill = 0x00FF00;
        } else {
          statusText.text = `Cooking... ${Math.floor(cookingSlot.cookProgress * 100)}%`;
          statusText.style.fill = 0xFFFFFF;
        }

        // Show/hide buttons
        collectBtn.visible = cookingSlot.cookProgress >= 1.0;
        cancelBtn.visible = cookingSlot.cookProgress < 1.0;

        // Show burn warning
        burnWarning.visible = cookingSlot.isBurning;
      } else {
        // Empty slot
        progressBar.clear();
        statusText.text = 'EMPTY';
        statusText.style.fill = 0xAAAAAA;
        collectBtn.visible = false;
        cancelBtn.visible = false;
        burnWarning.visible = false;
      }
    }
  }

  /**
   * Refresh all UI elements
   */
  private refresh(): void {
    // Will be updated by update() loop
  }

  /**
   * Add fuel to campfire
   */
  private addFuel(fuelId: string, amount: number): void {
    if (!this.currentCampfireId) return;
    this.cookingSystem.addFuel(this.currentCampfireId, fuelId, amount);
  }

  /**
   * Collect cooked item from slot
   */
  private collectItem(slotIndex: number): void {
    if (!this.currentCampfireId) return;
    this.cookingSystem.collectCookedItem(this.currentCampfireId, slotIndex);
  }

  /**
   * Cancel cooking in slot
   */
  private cancelCooking(slotIndex: number): void {
    if (!this.currentCampfireId) return;
    this.cookingSystem.cancelCooking(this.currentCampfireId, slotIndex);
  }

  /**
   * Find first empty cooking slot
   */
  private findEmptySlot(): number {
    if (!this.currentCampfireId) return -1;
    const state = this.cookingSystem.getCampfireState(this.currentCampfireId);
    if (!state) return -1;

    for (let i = 0; i < state.cookingSlots.length; i++) {
      if (state.cookingSlots[i] === null) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Get main container
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
   * Cleanup
   */
  destroy(): void {
    gsap.killTweensOf(this.cookingSlots);
    gsap.killTweensOf(this.burnWarnings);
    this.container.destroy({ children: true });
  }
}
