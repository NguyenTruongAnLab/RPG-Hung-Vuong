/**
 * CraftingUI - Visual interface for crafting system
 * 
 * Displays recipes, material requirements, and crafting actions.
 * Uses @pixi/ui for interactive elements.
 * 
 * @example
 * ```typescript
 * const craftingUI = new CraftingUI();
 * await craftingUI.init();
 * craftingUI.show();
 * ```
 */
import * as PIXI from 'pixi.js';
import { CraftingSystem, CraftingRecipe, CraftCategory } from '../systems/CraftingSystem';
import { InventorySystem } from '../systems/InventorySystem';

/**
 * CraftingUI configuration
 */
interface UIConfig {
  width: number;
  height: number;
  padding: number;
  backgroundColor: number;
  borderColor: number;
}

/**
 * CraftingUI class
 */
export class CraftingUI {
  private container: PIXI.Container;
  private bg: PIXI.Graphics;
  private recipeList: PIXI.Container;
  private detailsPanel: PIXI.Container;
  private craftButton: PIXI.Container;
  
  private selectedRecipe: CraftingRecipe | null = null;
  private isVisible: boolean = false;
  
  private config: UIConfig = {
    width: 700,
    height: 500,
    padding: 20,
    backgroundColor: 0x2a2a2a,
    borderColor: 0x8b7355
  };

  constructor() {
    this.container = new PIXI.Container();
    this.container.visible = false;
    
    this.bg = new PIXI.Graphics();
    this.recipeList = new PIXI.Container();
    this.detailsPanel = new PIXI.Container();
    this.craftButton = new PIXI.Container();
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
    this.createCategoryTabs();
    this.createRecipeList();
    this.createDetailsPanel();
    this.createCraftButton();
    
    console.log('✅ CraftingUI initialized');
  }

  /**
   * Create background panel
   */
  private createBackground(): void {
    const { width, height, backgroundColor, borderColor } = this.config;
    
    this.bg.clear();
    
    // Border
    this.bg.lineStyle(3, borderColor, 1);
    this.bg.beginFill(backgroundColor, 0.95);
    this.bg.drawRoundedRect(0, 0, width, height, 10);
    this.bg.endFill();
    
    this.container.addChild(this.bg);
  }

  /**
   * Create title
   */
  private createTitle(): void {
    const title = new PIXI.Text('CRAFTING', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    
    title.x = this.config.padding;
    title.y = this.config.padding;
    
    this.container.addChild(title);
  }

  /**
   * Create category tabs
   */
  private createCategoryTabs(): void {
    const categories: CraftCategory[] = ['tools', 'weapons', 'structures', 'consumables', 'materials', 'misc'];
    const tabWidth = 100;
    const tabHeight = 40;
    const startX = this.config.padding;
    const startY = 80;
    
    categories.forEach((category, index) => {
      const tab = this.createTab(category, startX + (index % 3) * (tabWidth + 5), startY + Math.floor(index / 3) * (tabHeight + 5), tabWidth, tabHeight);
      this.container.addChild(tab);
    });
  }

  /**
   * Create a category tab
   */
  private createTab(category: CraftCategory, x: number, y: number, width: number, height: number): PIXI.Container {
    const tab = new PIXI.Container();
    tab.x = x;
    tab.y = y;
    
    // Tab background
    const bg = new PIXI.Graphics();
    bg.lineStyle(2, 0x8b7355, 1);
    bg.beginFill(0x3a3a3a, 1);
    bg.drawRoundedRect(0, 0, width, height, 5);
    bg.endFill();
    
    // Tab text
    const text = new PIXI.Text(category.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xcccccc
    });
    text.x = (width - text.width) / 2;
    text.y = (height - text.height) / 2;
    
    tab.addChild(bg, text);
    
    // Make interactive
    tab.eventMode = 'static';
    tab.cursor = 'pointer';
    
    tab.on('pointerover', () => {
      bg.clear();
      bg.lineStyle(2, 0xffa500, 1);
      bg.beginFill(0x4a4a4a, 1);
      bg.drawRoundedRect(0, 0, width, height, 5);
      bg.endFill();
    });
    
    tab.on('pointerout', () => {
      bg.clear();
      bg.lineStyle(2, 0x8b7355, 1);
      bg.beginFill(0x3a3a3a, 1);
      bg.drawRoundedRect(0, 0, width, height, 5);
      bg.endFill();
    });
    
    tab.on('pointerdown', () => {
      this.filterByCategory(category);
    });
    
    return tab;
  }

  /**
   * Create recipe list
   */
  private createRecipeList(): void {
    const listX = this.config.padding;
    const listY = 180;
    const listWidth = 300;
    const listHeight = 250;
    
    // List background
    const listBg = new PIXI.Graphics();
    listBg.lineStyle(2, 0x8b7355, 1);
    listBg.beginFill(0x1a1a1a, 1);
    listBg.drawRoundedRect(listX, listY, listWidth, listHeight, 5);
    listBg.endFill();
    
    this.container.addChild(listBg);
    
    // Recipe container
    this.recipeList.x = listX + 10;
    this.recipeList.y = listY + 10;
    this.container.addChild(this.recipeList);
    
    this.refreshRecipeList();
  }

  /**
   * Refresh recipe list
   */
  private refreshRecipeList(): void {
    this.recipeList.removeChildren();
    
    const crafting = CraftingSystem.getInstance();
    const recipes = crafting.getUnlockedRecipes();
    
    recipes.forEach((recipe, index) => {
      const item = this.createRecipeItem(recipe, index);
      this.recipeList.addChild(item);
    });
  }

  /**
   * Create recipe list item
   */
  private createRecipeItem(recipe: CraftingRecipe, index: number): PIXI.Container {
    const item = new PIXI.Container();
    item.y = index * 50;
    
    const crafting = CraftingSystem.getInstance();
    const canCraft = crafting.canCraft(recipe.id);
    
    // Item background
    const bg = new PIXI.Graphics();
    bg.lineStyle(1, canCraft ? 0x00ff00 : 0x8b7355, 1);
    bg.beginFill(0x2a2a2a, 1);
    bg.drawRoundedRect(0, 0, 280, 45, 5);
    bg.endFill();
    
    // Item name
    const name = new PIXI.Text(recipe.name, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: canCraft ? 0x00ff00 : 0xcccccc
    });
    name.x = 10;
    name.y = 5;
    
    // Craft time
    const time = new PIXI.Text(`${recipe.craftTime / 1000}s`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0x888888
    });
    time.x = 10;
    time.y = 25;
    
    item.addChild(bg, name, time);
    
    // Make interactive
    item.eventMode = 'static';
    item.cursor = 'pointer';
    
    item.on('pointerover', () => {
      bg.clear();
      bg.lineStyle(2, 0xffa500, 1);
      bg.beginFill(0x3a3a3a, 1);
      bg.drawRoundedRect(0, 0, 280, 45, 5);
      bg.endFill();
    });
    
    item.on('pointerout', () => {
      bg.clear();
      bg.lineStyle(1, canCraft ? 0x00ff00 : 0x8b7355, 1);
      bg.beginFill(0x2a2a2a, 1);
      bg.drawRoundedRect(0, 0, 280, 45, 5);
      bg.endFill();
    });
    
    item.on('pointerdown', () => {
      this.selectRecipe(recipe);
    });
    
    return item;
  }

  /**
   * Create details panel
   */
  private createDetailsPanel(): void {
    const panelX = 350;
    const panelY = 80;
    const panelWidth = 330;
    const panelHeight = 350;
    
    // Panel background
    const panelBg = new PIXI.Graphics();
    panelBg.lineStyle(2, 0x8b7355, 1);
    panelBg.beginFill(0x1a1a1a, 1);
    panelBg.drawRoundedRect(panelX, panelY, panelWidth, panelHeight, 5);
    panelBg.endFill();
    
    this.container.addChild(panelBg);
    
    // Details container
    this.detailsPanel.x = panelX + 15;
    this.detailsPanel.y = panelY + 15;
    this.container.addChild(this.detailsPanel);
  }

  /**
   * Update details panel
   */
  private updateDetailsPanel(recipe: CraftingRecipe): void {
    this.detailsPanel.removeChildren();
    
    // Recipe name
    const name = new PIXI.Text(recipe.name, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    name.y = 0;
    this.detailsPanel.addChild(name);
    
    // Description
    const desc = new PIXI.Text(recipe.description, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: 300
    });
    desc.y = 30;
    this.detailsPanel.addChild(desc);
    
    // Requirements title
    const reqTitle = new PIXI.Text('Requirements:', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    reqTitle.y = 80;
    this.detailsPanel.addChild(reqTitle);
    
    // Requirements list
    const inventory = InventorySystem.getInstance();
    recipe.requirements.forEach((req, index) => {
      const has = inventory.getItemCount(req.id);
      const hasEnough = has >= req.amount;
      
      const reqText = new PIXI.Text(`${req.id}: ${has}/${req.amount}`, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: hasEnough ? 0x00ff00 : 0xff0000
      });
      reqText.y = 110 + (index * 25);
      this.detailsPanel.addChild(reqText);
    });
    
    // Crafting station
    if (recipe.craftingStation && recipe.craftingStation !== 'none') {
      const station = new PIXI.Text(`Station: ${recipe.craftingStation}`, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffa500
      });
      station.y = 110 + (recipe.requirements.length * 25) + 20;
      this.detailsPanel.addChild(station);
    }
  }

  /**
   * Create craft button
   */
  private createCraftButton(): void {
    const buttonX = 350;
    const buttonY = 450;
    const buttonWidth = 330;
    const buttonHeight = 50;
    
    this.craftButton.x = buttonX;
    this.craftButton.y = buttonY;
    
    // Button background
    const bg = new PIXI.Graphics();
    bg.lineStyle(2, 0x8b7355, 1);
    bg.beginFill(0x4a4a4a, 1);
    bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
    bg.endFill();
    
    // Button text
    const text = new PIXI.Text('CRAFT', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xcccccc,
      fontWeight: 'bold'
    });
    text.x = (buttonWidth - text.width) / 2;
    text.y = (buttonHeight - text.height) / 2;
    
    this.craftButton.addChild(bg, text);
    this.container.addChild(this.craftButton);
    
    // Make interactive
    this.craftButton.eventMode = 'static';
    this.craftButton.cursor = 'pointer';
    
    this.craftButton.on('pointerover', () => {
      if (this.canCraftSelected()) {
        bg.clear();
        bg.lineStyle(2, 0x00ff00, 1);
        bg.beginFill(0x5a5a5a, 1);
        bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        bg.endFill();
        text.style.fill = 0x00ff00;
      }
    });
    
    this.craftButton.on('pointerout', () => {
      bg.clear();
      bg.lineStyle(2, 0x8b7355, 1);
      bg.beginFill(0x4a4a4a, 1);
      bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
      bg.endFill();
      text.style.fill = 0xcccccc;
    });
    
    this.craftButton.on('pointerdown', () => {
      this.craftSelected();
    });
    
    this.craftButton.visible = false;
  }

  /**
   * Select a recipe
   */
  private selectRecipe(recipe: CraftingRecipe): void {
    this.selectedRecipe = recipe;
    this.updateDetailsPanel(recipe);
    this.craftButton.visible = true;
  }

  /**
   * Check if can craft selected recipe
   */
  private canCraftSelected(): boolean {
    if (!this.selectedRecipe) return false;
    return CraftingSystem.getInstance().canCraft(this.selectedRecipe.id);
  }

  /**
   * Craft selected recipe
   */
  private craftSelected(): void {
    if (!this.selectedRecipe) return;
    
    const crafting = CraftingSystem.getInstance();
    const success = crafting.craft(this.selectedRecipe.id);
    
    if (success) {
      // Refresh UI
      this.refreshRecipeList();
      this.updateDetailsPanel(this.selectedRecipe);
      
      // Play craft animation (placeholder)
      console.log(`✨ Crafted: ${this.selectedRecipe.name}`);
    }
  }

  /**
   * Filter recipes by category
   */
  private filterByCategory(category: CraftCategory): void {
    this.recipeList.removeChildren();
    
    const crafting = CraftingSystem.getInstance();
    const recipes = crafting.getRecipesByCategory(category);
    
    recipes.forEach((recipe, index) => {
      const item = this.createRecipeItem(recipe, index);
      this.recipeList.addChild(item);
    });
  }

  /**
   * Show UI
   */
  show(): void {
    this.container.visible = true;
    this.isVisible = true;
    this.refreshRecipeList();
  }

  /**
   * Hide UI
   */
  hide(): void {
    this.container.visible = false;
    this.isVisible = false;
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
}
