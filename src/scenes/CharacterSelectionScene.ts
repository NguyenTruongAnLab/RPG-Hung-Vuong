/**
 * CharacterSelectionScene - Choose starting party from 207 monsters
 * 
 * Allows players to browse all monsters by element and select
 * up to 3 for their starting party.
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
  private maxPartySize = 3;
  private currentElement = 'kim';
  private currentPage = 0;
  private monstersPerPage = 12;
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
    bg.beginFill(0x1a1a2e);
    bg.drawRect(0, 0, 960, 640);
    bg.endFill();
    this.addChild(bg);
  }
  
  private createTitle(): void {
    const title = new PIXI.Text('Chọn Đội Thần Thú', {
      fontSize: 36,
      fill: 0xFFD700,
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 4 }
    });
    title.anchor.set(0.5);
    title.position.set(480, 40);
    this.addChild(title);
  }
  
  private createElementTabs(): void {
    const elements = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
    const colors = [0xC0C0C0, 0x4CAF50, 0x2196F3, 0xFF5722, 0x795548];
    
    elements.forEach((element, index) => {
      const tab = new PIXI.Graphics();
      const isSelected = element === this.currentElement;
      
      tab.beginFill(isSelected ? colors[index] : 0x333333);
      tab.drawRoundedRect(0, 0, 100, 50, 10);
      tab.endFill();
      tab.position.set(80 + index * 120, 80);
      tab.interactive = true;
      tab.cursor = 'pointer';
      
      tab.on('pointerdown', () => {
        this.currentElement = element;
        this.currentPage = 0;
        this.refreshDisplay();
      });
      
      const label = new PIXI.Text(vi.elements[element], {
        fontSize: 16,
        fill: 0xFFFFFF,
        align: 'center'
      });
      label.anchor.set(0.5);
      label.position.set(50, 25);
      tab.addChild(label);
      
      this.addChild(tab);
    });
  }
  
  private createMonsterGrid(element: string): void {
    // Clear existing grid
    this.children
      .filter(c => (c as any).name === 'monster-card')
      .forEach(c => this.removeChild(c));
    
    const monsters = monsterDB.monsters.filter(m => m.element === element);
    const start = this.currentPage * this.monstersPerPage;
    const pageMonsters = monsters.slice(start, start + this.monstersPerPage);
    
    // Display monsters in grid
    pageMonsters.forEach((monster, index) => {
      const card = this.createMonsterCard(monster, index);
      this.addChild(card);
    });
    
    // Page navigation
    this.createPageNavigation(monsters.length);
  }
  
  private createMonsterCard(monster: any, index: number): PIXI.Container {
    const card = new PIXI.Container();
    (card as any).name = 'monster-card';
    
    const col = index % 4;
    const row = Math.floor(index / 4);
    card.position.set(80 + col * 140, 160 + row * 140);
    
    // Card background
    const isSelected = this.selectedMonsters.includes(monster.assetName);
    const bg = new PIXI.Graphics();
    bg.beginFill(isSelected ? 0x4CAF50 : 0x333333);
    bg.drawRoundedRect(0, 0, 130, 130, 10);
    bg.endFill();
    
    // Border highlight
    if (isSelected) {
      bg.lineStyle(3, 0xFFD700);
      bg.drawRoundedRect(0, 0, 130, 130, 10);
    }
    
    card.addChild(bg);
    
    // Load DragonBones animation (async)
    this.loadMonsterPreview(monster.assetName, card);
    
    // Name
    const name = new PIXI.Text(monster.name, {
      fontSize: 11,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 120,
      align: 'center'
    });
    name.anchor.set(0.5, 0);
    name.position.set(65, 80);
    card.addChild(name);
    
    // Tier stars
    const tier = new PIXI.Text('★'.repeat(monster.tier), {
      fontSize: 14,
      fill: 0xFFD700
    });
    tier.anchor.set(0.5);
    tier.position.set(65, 110);
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
  private async loadMonsterPreview(assetName: string, card: PIXI.Container): Promise<void> {
    try {
      // Show loading indicator
      const loadingText = new PIXI.Text('...', {
        fontSize: 16,
        fill: 0xFFFFFF
      });
      loadingText.anchor.set(0.5);
      loadingText.position.set(65, 45);
      (loadingText as any).name = 'loading';
      card.addChild(loadingText);
      
      // Create DragonBones animation
      const dbAnim = new DragonBonesAnimation(this.app);
      await dbAnim.loadCharacter(assetName);
      
      const display = dbAnim.getDisplay();
      if (display) {
        display.position.set(65, 45);
        display.scale.set(0.12);
        dbAnim.play('Idle');
        (display as any).name = 'db-preview';
        card.addChild(display);
        
        // Store for cleanup
        this.loadedAnimations.set(assetName, dbAnim);
      }
      
      // Remove loading text
      const loading = card.children.find(c => (c as any).name === 'loading');
      if (loading) card.removeChild(loading);
      
    } catch (error) {
      console.error(`Failed to load preview for ${assetName}:`, error);
      
      // Remove loading text
      const loading = card.children.find(c => (c as any).name === 'loading');
      if (loading) card.removeChild(loading);
      
      // Fallback to colored circle
      const preview = new PIXI.Graphics();
      const monster = monsterDB.monsters.find(m => m.assetName === assetName);
      preview.beginFill(this.getElementColor(monster?.element || 'kim'));
      preview.drawCircle(65, 45, 30);
      preview.endFill();
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
    const panel = new PIXI.Graphics();
    panel.beginFill(0x222222, 0.9);
    panel.drawRoundedRect(640, 160, 280, 380, 10);
    panel.endFill();
    (panel as any).name = 'party-panel';
    this.addChild(panel);
    
    const title = new PIXI.Text('Đội Hình', {
      fontSize: 20,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    title.position.set(700, 180);
    (title as any).name = 'party-panel';
    this.addChild(title);
  }
  
  private updatePartyPanel(): void {
    // Remove old party display
    this.children
      .filter(c => (c as any).name === 'party-member')
      .forEach(c => this.removeChild(c));
    
    // Display selected monsters
    this.selectedMonsters.forEach((assetName, index) => {
      const monster = monsterDB.monsters.find(m => m.assetName === assetName);
      if (!monster) return;
      
      const member = new PIXI.Graphics();
      (member as any).name = 'party-member';
      member.beginFill(0x444444);
      member.drawRoundedRect(0, 0, 240, 70, 10);
      member.endFill();
      member.position.set(660, 220 + index * 85);
      
      const nameText = new PIXI.Text(monster.name, {
        fontSize: 14,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: 220
      });
      nameText.position.set(10, 10);
      member.addChild(nameText);
      
      const elementText = new PIXI.Text(vi.elements[monster.element], {
        fontSize: 11,
        fill: this.getElementColor(monster.element)
      });
      elementText.position.set(10, 40);
      member.addChild(elementText);
      
      // Remove button
      const removeBtn = new PIXI.Text('✕', {
        fontSize: 20,
        fill: 0xFF5555
      });
      removeBtn.position.set(210, 25);
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
      .filter(c => (c as any).name === 'page-nav')
      .forEach(c => this.removeChild(c));
    
    const totalPages = Math.ceil(totalMonsters / this.monstersPerPage);
    if (totalPages <= 1) return;
    
    // Previous button
    if (this.currentPage > 0) {
      const prevBtn = new PIXI.Text('◀', {
        fontSize: 24,
        fill: 0xFFFFFF
      });
      prevBtn.position.set(50, 580);
      prevBtn.interactive = true;
      prevBtn.cursor = 'pointer';
      prevBtn.on('pointerdown', () => {
        this.currentPage--;
        this.refreshDisplay();
      });
      (prevBtn as any).name = 'page-nav';
      this.addChild(prevBtn);
    }
    
    // Page indicator
    const pageText = new PIXI.Text(`${this.currentPage + 1} / ${totalPages}`, {
      fontSize: 16,
      fill: 0xFFFFFF
    });
    pageText.anchor.set(0.5);
    pageText.position.set(320, 590);
    (pageText as any).name = 'page-nav';
    this.addChild(pageText);
    
    // Next button
    if (this.currentPage < totalPages - 1) {
      const nextBtn = new PIXI.Text('▶', {
        fontSize: 24,
        fill: 0xFFFFFF
      });
      nextBtn.position.set(580, 580);
      nextBtn.interactive = true;
      nextBtn.cursor = 'pointer';
      nextBtn.on('pointerdown', () => {
        this.currentPage++;
        this.refreshDisplay();
      });
      (nextBtn as any).name = 'page-nav';
      this.addChild(nextBtn);
    }
  }
  
  private createStartButton(): void {
    const button = new PIXI.Graphics();
    button.beginFill(0x4CAF50);
    button.drawRoundedRect(0, 0, 240, 50, 10);
    button.endFill();
    button.position.set(670, 560);
    button.interactive = true;
    button.cursor = 'pointer';
    (button as any).name = 'start-button';
    
    button.on('pointerdown', () => this.startGame());
    
    const label = new PIXI.Text('BẮT ĐẦU', {
      fontSize: 22,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    label.anchor.set(0.5);
    label.position.set(120, 25);
    button.addChild(label);
    
    this.addChild(button);
  }
  
  private createDemoButton(): void {
    const button = new PIXI.Graphics();
    button.beginFill(0x9C27B0); // Purple color
    button.drawRoundedRect(0, 0, 240, 50, 10);
    button.endFill();
    button.position.set(420, 560);
    button.interactive = true;
    button.cursor = 'pointer';
    (button as any).name = 'demo-button';
    
    button.on('pointerdown', () => this.openDemoMode());
    
    const label = new PIXI.Text('💡 DEMO MODE', {
      fontSize: 20,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    label.anchor.set(0.5);
    label.position.set(120, 25);
    button.addChild(label);
    
    this.addChild(button);
  }
  
  private async openDemoMode(): Promise<void> {
    const { ShowcaseDemoScene } = await import('./ShowcaseDemoScene');
    const demoScene = new ShowcaseDemoScene(this.app, this.sceneManager);
    await this.sceneManager.switchTo(demoScene);
  }
  
  private refreshDisplay(): void {
    // Recreate element tabs (to show selection)
    this.children
      .filter(c => (c as any).name !== 'monster-card' && 
                   (c as any).name !== 'party-panel' && 
                   (c as any).name !== 'party-member' &&
                   (c as any).name !== 'start-button' &&
                   (c as any).name !== 'page-nav')
      .forEach(c => {
        if (c !== this.children[0] && c !== this.children[1]) { // Keep bg and title
          this.removeChild(c);
        }
      });
    
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
  
  private startGame(): void {
    if (this.selectedMonsters.length === 0) {
      // Show error message
      const errorText = new PIXI.Text('Chọn ít nhất 1 Thần Thú!', {
        fontSize: 18,
        fill: 0xFF5555,
        fontWeight: 'bold'
      });
      errorText.anchor.set(0.5);
      errorText.position.set(790, 520);
      (errorText as any).name = 'error-msg';
      this.addChild(errorText);
      
      setTimeout(() => {
        const error = this.children.find(c => (c as any).name === 'error-msg');
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
