/**
 * CharacterSelectionScene - Choose starting Divine Beast companion
 * 
 * Allows players to select 1 starting Divine Beast companion from 207 available creatures.
 * This companion will journey with them throughout Văn Lang.
 * 
 * @example
 * ```typescript
 * const scene = new CharacterSelectionScene(app, sceneManager);
 * await scene.init();
 * ```
 */
import * as PIXI from 'pixi.js';
import { Scene, SceneManager } from '../core/SceneManager';
import monsterDB from '../data/monster-database.json';
import vi from '../data/vi.json';
import { DragonBonesAnimation } from '../entities/components/DragonBonesAnimation';

export class CharacterSelectionScene extends Scene {
  private selectedMonsters: string[] = [];
  private maxPartySize = 1; // Only select 1 starting companion
  private currentElement = 'kim';
  private currentPage = 0;
  private monstersPerPage = 18; // 6 columns x 3 rows
  private gridColumns = 6; // Increased to 6 columns
  private gridRows = 3;
  private sceneManager: SceneManager;
  private loadedAnimations: Map<string, DragonBonesAnimation> = new Map();
  
  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super(app);
    this.sceneManager = sceneManager;
  }

  async init(): Promise<void> {
    this.createBackground();
    this.createTitle();
    this.createElementTabs();
    this.createMonsterGrid(this.currentElement);
    this.createPartyPanel();
    this.createStartButton();
    this.createDemoButton(); // Add demo button
  }

  private createBackground(): void {
    const bg = new PIXI.Graphics();
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    bg.rect(0, 0, width, height);
    bg.fill(0x1a1a2e);
    this.addChild(bg);
  }
  
  private createTitle(): void {
    const width = this.app.screen.width;
    
    const title = new PIXI.Text({
      text: 'Chọn Thần Thú Bạn Đầu Tiên',
      style: {
        fontSize: 36,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 }
      }
    });
    title.anchor.set(0.5);
    title.position.set(width / 2, 40);
    this.addChild(title);
  }
  
  private createElementTabs(): void {
    const width = this.app.screen.width;
    const elements = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
    const colors = [0xC0C0C0, 0x4CAF50, 0x2196F3, 0xFF5722, 0x795548];
    
    // Center tabs horizontally
    const tabWidth = 100;
    const tabSpacing = 120;
    const totalWidth = elements.length * tabSpacing;
    const startX = (width - totalWidth) / 2;
    
    elements.forEach((element, index) => {
      const tab = new PIXI.Graphics();
      const isSelected = element === this.currentElement;
      
      tab.roundRect(0, 0, tabWidth, 50, 10);
      tab.fill(isSelected ? colors[index] : 0x333333);
      tab.position.set(startX + index * tabSpacing, 80);
      tab.interactive = true;
      tab.cursor = 'pointer';
      tab.label = 'element-tab'; // Add label for cleanup
      
      tab.on('pointerdown', () => {
        this.currentElement = element;
        this.currentPage = 0;
        this.refreshDisplay();
      });
      
      const label = new PIXI.Text({
        text: vi.elements[element],
        style: {
          fontSize: 16,
          fill: 0xFFFFFF,
          align: 'center'
        }
      });
      label.anchor.set(0.5);
      label.position.set(tabWidth / 2, 25);
      tab.addChild(label);
      
      this.addChild(tab);
    });
  }
  
  private createMonsterGrid(element: string): void {
    // Clear existing grid
    this.children
      .filter(c => c.label === 'monster-card')
      .forEach(c => this.removeChild(c));
    
    const monsters = monsterDB.monsters.filter(m => m.element === element);
    const start = this.currentPage * this.monstersPerPage;
    const pageMonsters = monsters.slice(start, start + this.monstersPerPage);
    
    // FILL THE SCREEN - Calculate maximum card size
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    
    // Use 70% of screen width for grid (party panel uses remaining 30%)
    const gridAreaWidth = screenWidth * 0.7;
    const cardSpacing = 15;
    
    // Calculate card size to FILL available width
    const maxCardWidth = (gridAreaWidth - (this.gridColumns + 1) * cardSpacing) / this.gridColumns;
    
    // Available height: from tabs (140) to navigation buttons (leave 120px for nav+buttons)
    const gridStartY = 140;
    const bottomReserved = 120; // Minimal space for nav + buttons
    const availableHeight = screenHeight - gridStartY - bottomReserved;
    const maxCardHeight = (availableHeight - (this.gridRows + 1) * cardSpacing) / this.gridRows;
    
    // Use MAXIMUM size to fill screen
    const cardSize = Math.floor(Math.max(maxCardWidth, maxCardHeight));
    
    // Display monsters in 6-column grid
    pageMonsters.forEach((monster, index) => {
      const col = index % this.gridColumns;
      const row = Math.floor(index / this.gridColumns);
      const x = 20 + col * (cardSize + cardSpacing);
      const y = gridStartY + row * (cardSize + cardSpacing);
      
      const card = this.createMonsterCard(monster, x, y, cardSize);
      this.addChild(card);
    });
    
    // Page navigation
    this.createPageNavigation(monsters.length);
  }
  
  private createMonsterCard(monster: any, x: number, y: number, cardSize: number): PIXI.Container {
    const card = new PIXI.Container();
    card.label = 'monster-card';
    card.position.set(x, y);
    
    // Card background
    const isSelected = this.selectedMonsters.includes(monster.assetName);
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, cardSize, cardSize, 10);
    bg.fill(isSelected ? 0x4CAF50 : 0x333333);
    
    // Border highlight
    if (isSelected) {
      bg.roundRect(0, 0, cardSize, cardSize, 10);
      bg.stroke({ width: 3, color: 0xFFD700 });
    }
    
    card.addChild(bg);
    
    // Preview area (70% of card height) - reduced gap
    const previewHeight = cardSize * 0.7;
    this.loadMonsterPreview(monster.assetName, card, cardSize, previewHeight);
    
    // Info area (30% of card height) - closer to character feet
    const infoY = previewHeight;
    const infoHeight = cardSize - previewHeight;
    
    // Name - positioned right below preview
    const name = new PIXI.Text({
      text: monster.name,
      style: {
        fontSize: Math.min(12, cardSize / 12),
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: cardSize - 10,
        align: 'center'
      }
    });
    name.anchor.set(0.5, 0);
    name.position.set(cardSize / 2, infoY + 5); // Small gap
    card.addChild(name);
    
    // Tier stars
    const tier = new PIXI.Text({
      text: '★'.repeat(monster.tier),
      style: {
        fontSize: Math.min(14, cardSize / 10),
        fill: 0xFFD700
      }
    });
    tier.anchor.set(0.5);
    tier.position.set(cardSize / 2, infoY + name.height + 15);
    card.addChild(tier);
    
    // Make interactive
    card.interactive = true;
    card.cursor = 'pointer';
    card.on('pointerdown', () => this.selectMonster(monster.assetName));
    
    return card;
  }
  
  /**
   * Load DragonBones preview for a monster card
   */
  private async loadMonsterPreview(assetName: string, card: PIXI.Container, cardWidth: number, previewHeight: number): Promise<void> {
    try {
      // Show loading indicator
      const loadingText = new PIXI.Text({
        text: '...',
        style: {
          fontSize: 16,
          fill: 0xFFFFFF
        }
      });
      loadingText.anchor.set(0.5);
      loadingText.position.set(cardWidth / 2, previewHeight / 2);
      loadingText.label = 'loading';
      card.addChild(loadingText);
      
      // Create DragonBones animation
      const dbAnim = new DragonBonesAnimation(this.app);
      await dbAnim.loadCharacter(assetName);
      
      const display = dbAnim.getDisplay();
      if (!display) {
        throw new Error(`DragonBones display not created for ${assetName}`);
      }
      
      // Set initial safe scale to avoid mesh buffer errors
      display.scale.set(0.2);
      
      // Position in center of preview area, 20% lower
      const offsetY = previewHeight * 0.2;  // 20% lower offset
      display.position.set(cardWidth / 2, previewHeight / 2 + offsetY);
      
      // Validate before playing
      if (!display.animation) {
        throw new Error(`Animation controller missing for ${assetName}`);
      }
      
      dbAnim.play('Idle');
      (display as any).name = 'db-preview';
      card.addChild(display);
      
      // NOW calculate bounds after display is added and rendered
      setTimeout(() => {
        try {
          const bounds = display.getLocalBounds();
          const charWidth = bounds.width;
          const charHeight = bounds.height;
          
          // Calculate scale to fit character within preview area with padding
          const maxWidth = cardWidth * 0.6;   // Use 60% of card width
          const maxHeight = previewHeight * 0.8; // Use 80% of preview height
          
          let scale = 1;
          if (charWidth > 0) scale = Math.min(scale, maxWidth / charWidth);
          if (charHeight > 0) scale = Math.min(scale, maxHeight / charHeight);
          
          // Apply calculated scale
          if (scale > 0 && isFinite(scale)) {
            display.scale.set(scale);
          }
        } catch (e) {
          // Bounds calculation failed, keep initial scale
          console.warn(`Could not calculate bounds for ${assetName}:`, e);
        }
      }, 50);
      
      // Store for cleanup
      this.loadedAnimations.set(assetName, dbAnim);
      
      // Remove loading text
      const loading = card.children.find(c => c.label === 'loading');
      if (loading) card.removeChild(loading);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to load preview for ${assetName}:`, errorMsg);
      
      // Show user-friendly error on card
      this.showErrorToast(`Failed to load ${assetName}: Using fallback`);
      
      // Remove loading text
      const loading = card.children.find(c => c.label === 'loading');
      if (loading) card.removeChild(loading);
      
      // Fallback to colored circle
      const preview = new PIXI.Graphics();
      const monster = monsterDB.monsters.find(m => m.assetName === assetName);
      preview.circle(cardWidth / 2, previewHeight / 2, Math.min(cardWidth, previewHeight) * 0.3);
      preview.fill(this.getElementColor(monster?.element || 'kim'));
      (preview as any).name = 'fallback-preview';
      card.addChild(preview);
    }
  }
  
  private selectMonster(assetName: string): void {
    const index = this.selectedMonsters.indexOf(assetName);
    
    if (index !== -1) {
      // Deselect
      this.selectedMonsters.splice(index, 1);
    } else if (this.selectedMonsters.length < this.maxPartySize) {
      // Select
      this.selectedMonsters.push(assetName);
    }
    
    this.refreshDisplay();
  }
  
  private createPartyPanel(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Position panel on right side, responsive
    const panelWidth = Math.min(320, width * 0.25);
    const panelHeight = Math.min(400, height * 0.6);
    const panelX = width - panelWidth - 20;
    const panelY = 140;
    
    const panel = new PIXI.Graphics();
    panel.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
    panel.fill({ color: 0x222222, alpha: 0.9 });
    panel.label = 'party-panel';
    this.addChild(panel);
    
    const title = new PIXI.Text({
      text: 'Bạn Đồng Hành',
      style: {
        fontSize: 20,
        fill: 0xFFFFFF,
        fontWeight: 'bold'
      }
    });
    title.position.set(panelX + 20, panelY + 20);
    title.label = 'party-panel';
    this.addChild(title);
  }
  
  private updatePartyPanel(): void {
    const width = this.app.screen.width;
    
    // Remove old party display
    this.children
      .filter(c => c.label === 'party-member')
      .forEach(c => this.removeChild(c));
    
    // Calculate panel position (same as createPartyPanel)
    const panelWidth = Math.min(320, width * 0.25);
    const panelX = width - panelWidth - 20;
    const memberWidth = panelWidth - 40;
    
    // Display selected monsters
    this.selectedMonsters.forEach((assetName, index) => {
      const monster = monsterDB.monsters.find(m => m.assetName === assetName);
      if (!monster) return;
      
      const member = new PIXI.Graphics();
      member.label = 'party-member';
      member.roundRect(0, 0, memberWidth, 70, 10);
      member.fill(0x444444);
      member.position.set(panelX + 20, 200 + index * 85);
      
      const nameText = new PIXI.Text({
        text: monster.name,
        style: {
          fontSize: 14,
          fill: 0xFFFFFF,
          wordWrap: true,
          wordWrapWidth: memberWidth - 50
        }
      });
      nameText.position.set(10, 10);
      member.addChild(nameText);
      
      const elementText = new PIXI.Text({
        text: vi.elements[monster.element],
        style: {
          fontSize: 11,
          fill: this.getElementColor(monster.element)
        }
      });
      elementText.position.set(10, 40);
      member.addChild(elementText);
      
      // Remove button
      const removeBtn = new PIXI.Text({
        text: '✕',
        style: {
          fontSize: 20,
          fill: 0xFF5555
        }
      });
      removeBtn.position.set(memberWidth - 30, 25);
      removeBtn.interactive = true;
      removeBtn.cursor = 'pointer';
      removeBtn.on('pointerdown', () => {
        this.selectedMonsters.splice(index, 1);
        this.refreshDisplay();
      });
      member.addChild(removeBtn);
      
      this.addChild(member);
    });
  }
  
  private createPageNavigation(totalMonsters: number): void {
    // Remove old navigation
    this.children
      .filter(c => c.label === 'page-nav')
      .forEach(c => this.removeChild(c));
    
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const totalPages = Math.ceil(totalMonsters / this.monstersPerPage);
    if (totalPages <= 1) return;
    
    // Position nav at bottom, just above buttons (height - 80)
    const navY = height - 80;
    
    // Previous button
    if (this.currentPage > 0) {
      const prevBtn = new PIXI.Text({
        text: '◀',
        style: {
          fontSize: 24,
          fill: 0xFFFFFF
        }
      });
      prevBtn.position.set(width / 2 - 100, navY);
      prevBtn.interactive = true;
      prevBtn.cursor = 'pointer';
      prevBtn.on('pointerdown', () => {
        this.currentPage--;
        this.refreshDisplay();
      });
      prevBtn.label = 'page-nav';
      this.addChild(prevBtn);
    }
    
    // Page indicator
    const pageText = new PIXI.Text({
      text: `${this.currentPage + 1} / ${totalPages}`,
      style: {
        fontSize: 16,
        fill: 0xFFFFFF
      }
    });
    pageText.anchor.set(0.5);
    pageText.position.set(width / 2, navY);
    pageText.label = 'page-nav';
    this.addChild(pageText);
    
    // Next button
    if (this.currentPage < totalPages - 1) {
      const nextBtn = new PIXI.Text({
        text: '▶',
        style: {
          fontSize: 24,
          fill: 0xFFFFFF
        }
      });
      nextBtn.position.set(width / 2 + 100, navY);
      nextBtn.interactive = true;
      nextBtn.cursor = 'pointer';
      nextBtn.on('pointerdown', () => {
        this.currentPage++;
        this.refreshDisplay();
      });
      nextBtn.label = 'page-nav';
      this.addChild(nextBtn);
    }
  }
  
  private createStartButton(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Position at ABSOLUTE BOTTOM, right of center
    const buttonY = height - 50; // 50px from bottom
    const centerX = width / 2;
    const buttonWidth = 200;
    const spacing = 10;
    
    const container = new PIXI.Container();
    container.position.set(centerX + spacing, buttonY);
    container.label = 'start-button-container';
    
    const button = new PIXI.Graphics();
    button.roundRect(0, 0, buttonWidth, 50, 10);
    button.fill(0x4CAF50);
    button.interactive = true;
    button.cursor = 'pointer';
    button.eventMode = 'static';
    
    button.on('pointerdown', () => this.startGame());
    
    const label = new PIXI.Text({
      text: 'BẮT ĐẦU',
      style: {
        fontSize: 22,
        fill: 0xFFFFFF,
        fontWeight: 'bold'
      }
    });
    label.anchor.set(0.5);
    label.position.set(buttonWidth / 2, 25);
    button.addChild(label);
    
    // Add explanatory subtitle
    const subtitle = new PIXI.Text({
      text: 'Chơi Pokemon + Don\'t Starve',
      style: {
        fontSize: 11,
        fill: 0xAAAAAA,
        align: 'center',
        fontStyle: 'italic'
      }
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.position.set(buttonWidth / 2, 55);
    
    container.addChild(button);
    container.addChild(subtitle);
    this.addChild(container);
  }
  
  private createDemoButton(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Position at ABSOLUTE BOTTOM, left of center
    const buttonY = height - 50; // 50px from bottom
    const centerX = width / 2;
    const buttonWidth = 220;
    const spacing = 10;
    
    const container = new PIXI.Container();
    container.position.set(centerX - buttonWidth - spacing, buttonY);
    container.label = 'demo-button-container';
    
    const button = new PIXI.Graphics();
    button.roundRect(0, 0, buttonWidth, 50, 10);
    button.fill(0x9C27B0); // Purple color
    button.interactive = true;
    button.cursor = 'pointer';
    button.eventMode = 'static';
    
    button.on('pointerdown', () => this.openDemoMode());
    
    const label = new PIXI.Text({
      text: '💡 DEMO MODE',
      style: {
        fontSize: 20,
        fill: 0xFFFFFF,
        fontWeight: 'bold'
      }
    });
    label.anchor.set(0.5);
    label.position.set(buttonWidth / 2, 25);
    button.addChild(label);
    
    // Add explanatory subtitle
    const subtitle = new PIXI.Text({
      text: 'Xem trước 207 Thần Thú & animations',
      style: {
        fontSize: 11,
        fill: 0xDDDDDD,
        align: 'center',
        fontStyle: 'italic',
        wordWrap: true,
        wordWrapWidth: 200
      }
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.position.set(buttonWidth / 2, 55);
    
    container.addChild(button);
    container.addChild(subtitle);
    this.addChild(container);
  }
  
  private async openDemoMode(): Promise<void> {
    const { ShowcaseDemoScene } = await import('./ShowcaseDemoScene');
    const demoScene = new ShowcaseDemoScene(this.app, this.sceneManager);
    await this.sceneManager.switchTo(demoScene);
  }
  
  private refreshDisplay(): void {
    // Remove only what needs to be refreshed, keep buttons, party panel, and nav
    this.children
      .filter(c => c.label === 'monster-card' || c.label === 'element-tab')
      .forEach(c => {
        this.removeChild(c);
      });
    
    // Recreate element tabs and grid, but keep buttons and party panel intact
    this.createElementTabs();
    this.createMonsterGrid(this.currentElement);
    this.updatePartyPanel();
  }
  
  private getElementColor(element: string): number {
    const colors: Record<string, number> = {
      kim: 0xC0C0C0,
      moc: 0x4CAF50,
      thuy: 0x2196F3,
      hoa: 0xFF5722,
      tho: 0x795548
    };
    return colors[element] || 0xFFFFFF;
  }
  
  /**
   * Show error toast notification to user
   */
  private showErrorToast(message: string): void {
    const toast = new PIXI.Container();
    toast.label = 'error-toast';
    
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 400, 60, 10);
    bg.fill({ color: 0xFF5555, alpha: 0.9 });
    toast.addChild(bg);
    
    const text = new PIXI.Text({
      text: message,
      style: {
        fontSize: 14,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: 380,
        align: 'center'
      }
    });
    text.anchor.set(0.5);
    text.position.set(200, 30);
    toast.addChild(text);
    
    toast.position.set(280, 20);
    this.addChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (this.children.includes(toast)) {
        this.removeChild(toast);
      }
    }, 3000);
  }
  
  private startGame(): void {
    if (this.selectedMonsters.length === 0) {
      // Show error message
      const errorText = new PIXI.Text({
        text: 'Chọn ít nhất 1 Thần Thú!',
        style: {
          fontSize: 18,
          fill: 0xFF5555,
          fontWeight: 'bold'
        }
      });
      errorText.anchor.set(0.5);
      errorText.position.set(790, 520);
      errorText.label = 'error-msg';
      this.addChild(errorText);
      
      setTimeout(() => {
        const error = this.children.find(c => c.label === 'error-msg');
        if (error) this.removeChild(error);
      }, 2000);
      return;
    }
    
    // Store party in localStorage
    localStorage.setItem('playerParty', JSON.stringify(this.selectedMonsters));
    
    // Emit event to transition to overworld
    this.emit('start-game');
  }
  
  update(delta: number): void {
    // No updates needed for static scene
  }
  
  destroy(): void {
    // Cleanup loaded animations
    for (const [_, anim] of this.loadedAnimations) {
      anim.destroy();
    }
    this.loadedAnimations.clear();
    
    this.removeAllListeners();
    // Don't call super.destroy() since it's abstract in Scene
    PIXI.Container.prototype.destroy.call(this);
  }
}
