/**
 * BuildingUI - User interface for structure placement
 * 
 * Displays buildable structures organized by category,
 * shows material requirements, and provides placement controls.
 * 
 * @example
 * ```typescript
 * const buildingUI = new BuildingUI(buildingSystem);
 * await buildingUI.init();
 * buildingUI.toggle();
 * ```
 */
import * as PIXI from 'pixi.js';
import { BuildingSystem } from '../systems/BuildingSystem';
import { StructureBlueprints, StructureCategory, StructureBlueprint } from '../data/StructureBlueprints';
import { InventorySystem } from '../systems/InventorySystem';

/**
 * BuildingUI configuration
 */
interface UIConfig {
  width: number;
  height: number;
  padding: number;
  backgroundColor: number;
  borderColor: number;
}

/**
 * BuildingUI class
 */
export class BuildingUI {
  private container: PIXI.Container;
  private bg: PIXI.Graphics;
  private buildingList: PIXI.Container;
  private detailsPanel: PIXI.Container;
  
  private buildingSystem: BuildingSystem;
  private blueprints: StructureBlueprints;
  private inventory: InventorySystem;
  
  private selectedBlueprint: StructureBlueprint | null = null;
  private isVisible: boolean = false;
  
  private config: UIConfig = {
    width: 700,
    height: 500,
    padding: 20,
    backgroundColor: 0x2a2a2a,
    borderColor: 0x8b7355
  };

  constructor(buildingSystem: BuildingSystem) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    
    this.bg = new PIXI.Graphics();
    this.buildingList = new PIXI.Container();
    this.detailsPanel = new PIXI.Container();
    
    this.buildingSystem = buildingSystem;
    this.blueprints = StructureBlueprints.getInstance();
    this.inventory = InventorySystem.getInstance();
  }

  /**
   * Initialize UI
   */
  async init(): Promise<void> {
    // Position at screen center
    this.container.x = (800 - this.config.width) / 2;
    this.container.y = (600 - this.config.height) / 2;
    
    this.createBackground();
    this.createTitle();
    this.createCategoryTabs();
    this.createBuildingList();
    this.createDetailsPanel();
    this.createBuildButton();
    
    console.log('✅ BuildingUI initialized');
  }

  /**
   * Create background
   */
  private createBackground(): void {
    const { width, height, backgroundColor, borderColor } = this.config;
    
    this.bg.clear();
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
    const title = new PIXI.Text('BUILD MENU', {
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
    const categories: StructureCategory[] = ['defense', 'crafting', 'storage', 'survival', 'farming'];
    const tabWidth = 120;
    const tabHeight = 40;
    const startX = this.config.padding;
    const startY = 80;
    
    categories.forEach((category, index) => {
      const tab = this.createTab(
        category,
        startX + (index * (tabWidth + 5)),
        startY,
        tabWidth,
        tabHeight
      );
      this.container.addChild(tab);
    });
  }

  /**
   * Create a category tab
   */
  private createTab(category: StructureCategory, x: number, y: number, width: number, height: number): PIXI.Container {
    const tab = new PIXI.Container();
    tab.x = x;
    tab.y = y;
    
    const bg = new PIXI.Graphics();
    bg.lineStyle(2, 0x8b7355, 1);
    bg.beginFill(0x3a3a3a, 1);
    bg.drawRoundedRect(0, 0, width, height, 5);
    bg.endFill();
    
    const text = new PIXI.Text(category.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xcccccc
    });
    text.x = (width - text.width) / 2;
    text.y = (height - text.height) / 2;
    
    tab.addChild(bg, text);
    
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
   * Create building list
   */
  private createBuildingList(): void {
    const listX = this.config.padding;
    const listY = 140;
    const listWidth = 300;
    const listHeight = 300;
    
    const listBg = new PIXI.Graphics();
    listBg.lineStyle(2, 0x8b7355, 1);
    listBg.beginFill(0x1a1a1a, 1);
    listBg.drawRoundedRect(listX, listY, listWidth, listHeight, 5);
    listBg.endFill();
    
    this.container.addChild(listBg);
    
    this.buildingList.x = listX + 10;
    this.buildingList.y = listY + 10;
    this.container.addChild(this.buildingList);
    
    this.refreshBuildingList();
  }

  /**
   * Refresh building list
   */
  private refreshBuildingList(): void {
    this.buildingList.removeChildren();
    
    const blueprints = this.blueprints.getAllBlueprints();
    
    blueprints.forEach((blueprint, index) => {
      const item = this.createBuildingItem(blueprint, index);
      this.buildingList.addChild(item);
    });
  }

  /**
   * Create building list item
   */
  private createBuildingItem(blueprint: StructureBlueprint, index: number): PIXI.Container {
    const item = new PIXI.Container();
    item.y = index * 50;
    
    const canBuild = this.inventory.hasItems(blueprint.materials);
    
    const bg = new PIXI.Graphics();
    bg.lineStyle(1, canBuild ? 0x00ff00 : 0x8b7355, 1);
    bg.beginFill(0x2a2a2a, 1);
    bg.drawRoundedRect(0, 0, 280, 45, 5);
    bg.endFill();
    
    const name = new PIXI.Text(blueprint.name, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: canBuild ? 0x00ff00 : 0xcccccc
    });
    name.x = 10;
    name.y = 5;
    
    const category = new PIXI.Text(blueprint.category, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0x888888
    });
    category.x = 10;
    category.y = 25;
    
    item.addChild(bg, name, category);
    
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
      bg.lineStyle(1, canBuild ? 0x00ff00 : 0x8b7355, 1);
      bg.beginFill(0x2a2a2a, 1);
      bg.drawRoundedRect(0, 0, 280, 45, 5);
      bg.endFill();
    });
    
    item.on('pointerdown', () => {
      this.selectBlueprint(blueprint);
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
    const panelHeight = 360;
    
    const panelBg = new PIXI.Graphics();
    panelBg.lineStyle(2, 0x8b7355, 1);
    panelBg.beginFill(0x1a1a1a, 1);
    panelBg.drawRoundedRect(panelX, panelY, panelWidth, panelHeight, 5);
    panelBg.endFill();
    
    this.container.addChild(panelBg);
    
    this.detailsPanel.x = panelX + 15;
    this.detailsPanel.y = panelY + 15;
    this.container.addChild(this.detailsPanel);
  }

  /**
   * Update details panel
   */
  private updateDetailsPanel(blueprint: StructureBlueprint): void {
    this.detailsPanel.removeChildren();
    
    const name = new PIXI.Text(blueprint.name, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    name.y = 0;
    this.detailsPanel.addChild(name);
    
    const desc = new PIXI.Text(blueprint.description, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: 300
    });
    desc.y = 30;
    this.detailsPanel.addChild(desc);
    
    // Stats
    const statsTitle = new PIXI.Text('Stats:', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    statsTitle.y = 80;
    this.detailsPanel.addChild(statsTitle);
    
    const healthText = new PIXI.Text(`Health: ${blueprint.stats.health}`, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xcccccc
    });
    healthText.y = 105;
    this.detailsPanel.addChild(healthText);
    
    // Materials
    const materialsTitle = new PIXI.Text('Required Materials:', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    materialsTitle.y = 140;
    this.detailsPanel.addChild(materialsTitle);
    
    blueprint.materials.forEach((req, index) => {
      const has = this.inventory.getItemCount(req.id);
      const hasEnough = has >= req.amount;
      
      const matText = new PIXI.Text(`${req.id}: ${has}/${req.amount}`, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: hasEnough ? 0x00ff00 : 0xff0000
      });
      matText.y = 165 + (index * 25);
      this.detailsPanel.addChild(matText);
    });
    
    // Functionality
    if (blueprint.functionality) {
      const funcText = new PIXI.Text(`Function: ${blueprint.functionality}`, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffa500,
        wordWrap: true,
        wordWrapWidth: 300
      });
      funcText.y = 165 + (blueprint.materials.length * 25) + 20;
      this.detailsPanel.addChild(funcText);
    }
  }

  /**
   * Create build button
   */
  private createBuildButton(): void {
    const buttonX = 350;
    const buttonY = 450;
    const buttonWidth = 330;
    const buttonHeight = 50;
    
    const button = new PIXI.Container();
    button.x = buttonX;
    button.y = buttonY;
    
    const bg = new PIXI.Graphics();
    bg.lineStyle(2, 0x8b7355, 1);
    bg.beginFill(0x4a4a4a, 1);
    bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
    bg.endFill();
    
    const text = new PIXI.Text('BUILD', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xcccccc,
      fontWeight: 'bold'
    });
    text.x = (buttonWidth - text.width) / 2;
    text.y = (buttonHeight - text.height) / 2;
    
    button.addChild(bg, text);
    this.container.addChild(button);
    
    button.eventMode = 'static';
    button.cursor = 'pointer';
    
    button.on('pointerover', () => {
      if (this.canBuildSelected()) {
        bg.clear();
        bg.lineStyle(2, 0x00ff00, 1);
        bg.beginFill(0x5a5a5a, 1);
        bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
        bg.endFill();
        text.style.fill = 0x00ff00;
      }
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.lineStyle(2, 0x8b7355, 1);
      bg.beginFill(0x4a4a4a, 1);
      bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
      bg.endFill();
      text.style.fill = 0xcccccc;
    });
    
    button.on('pointerdown', () => {
      this.startBuilding();
    });
    
    button.visible = false;
    (this.container as any).buildButton = button;
  }

  /**
   * Select a blueprint
   */
  private selectBlueprint(blueprint: StructureBlueprint): void {
    this.selectedBlueprint = blueprint;
    this.updateDetailsPanel(blueprint);
    
    const buildButton = (this.container as any).buildButton;
    if (buildButton) {
      buildButton.visible = true;
    }
  }

  /**
   * Check if can build selected
   */
  private canBuildSelected(): boolean {
    if (!this.selectedBlueprint) return false;
    return this.inventory.hasItems(this.selectedBlueprint.materials);
  }

  /**
   * Start building mode
   */
  private startBuilding(): void {
    if (!this.selectedBlueprint || !this.canBuildSelected()) return;
    
    // Enter placement mode
    const success = this.buildingSystem.startPlacement(this.selectedBlueprint.id);
    
    if (success) {
      this.hide(); // Hide UI while placing
      console.log(`🏗️ Entered placement mode: ${this.selectedBlueprint.name}`);
    }
  }

  /**
   * Filter by category
   */
  private filterByCategory(category: StructureCategory): void {
    this.buildingList.removeChildren();
    
    const blueprints = this.blueprints.getBlueprintsByCategory(category);
    
    blueprints.forEach((blueprint, index) => {
      const item = this.createBuildingItem(blueprint, index);
      this.buildingList.addChild(item);
    });
  }

  /**
   * Show UI
   */
  show(): void {
    this.container.visible = true;
    this.isVisible = true;
    this.refreshBuildingList();
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
