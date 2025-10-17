/**
 * ShowcaseDemoScene - Interactive demo to preview all 207 monsters
 * 
 * Allows users to:
 * - Browse all monsters by element
 * - View stats, tier, and animations
 * - Play different animations
 * - Flip and scale monsters
 * - See real DragonBones previews
 * 
 * @example
 * ```typescript
 * const scene = new ShowcaseDemoScene(app, sceneManager);
 * await scene.init();
 * ```
 */
import * as PIXI from 'pixi.js';
import { Scene, SceneManager } from '../core/SceneManager';
import { DragonBonesAnimation } from '../entities/components/DragonBonesAnimation';
import monsterDB from '../data/monster-database.json';
import vi from '../data/vi.json';

export class ShowcaseDemoScene extends Scene {
  private sceneManager: SceneManager;
  private currentMonsterIndex = 0;
  private currentAnimation: DragonBonesAnimation | null = null;
  private currentElement: string = 'all';
  private filteredMonsters: any[] = [];
  private isFlipped = false;
  private currentScale = 0.5;
  
  // UI elements
  private monsterDisplay: PIXI.Container | null = null;
  private infoPanel: PIXI.Container | null = null;
  private controlPanel: PIXI.Container | null = null;
  
  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super(app);
    this.sceneManager = sceneManager;
    this.filteredMonsters = [...monsterDB.monsters];
  }

  async init(): Promise<void> {
    this.createBackground();
    this.createHeader();
    this.createElementFilter();
    this.createMonsterDisplay();
    this.createInfoPanel();
    this.createControlPanel();
    this.createNavigationButtons();
    
    // Load first monster
    await this.loadMonster(this.currentMonsterIndex);
  }

  private createBackground(): void {
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, 960, 640);
    bg.fill(0x1a1a2e);
    this.addChild(bg);
  }

  private createHeader(): void {
    const header = new PIXI.Text({
      text: '🐉 Thần Thú Showcase - 207 Characters 🐉',
      style: {
        fontSize: 28,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 }
      }
    });
    header.anchor.set(0.5);
    header.position.set(480, 30);
    this.addChild(header);
    
    // Back button
    const backBtn = this.createButton('← Quay lại', 30, 20, () => {
      this.goBack();
    }, 0x555555);
    this.addChild(backBtn);
  }

  private createElementFilter(): void {
    const elements = ['all', 'kim', 'moc', 'thuy', 'hoa', 'tho'];
    const labels = ['Tất cả', vi.elements.kim, vi.elements.moc, vi.elements.thuy, vi.elements.hoa, vi.elements.tho];
    const colors = [0x888888, 0xC0C0C0, 0x4CAF50, 0x2196F3, 0xFF5722, 0x795548];
    
    elements.forEach((element, index) => {
      const isSelected = element === this.currentElement;
      const btn = new PIXI.Graphics();
      
      btn.roundRect(0, 0, 100, 40, 8);
      btn.fill(isSelected ? colors[index] : 0x333333);
      btn.position.set(140 + index * 110, 70);
      btn.interactive = true;
      btn.cursor = 'pointer';
      
      btn.on('pointerdown', () => {
        this.currentElement = element;
        this.filterByElement(element);
      });
      
      const label = new PIXI.Text({
        text: labels[index],
        style: {
          fontSize: 14,
          fill: 0xFFFFFF,
          align: 'center'
        }
      });
      label.anchor.set(0.5);
      label.position.set(50, 20);
      btn.addChild(label);
      
      this.addChild(btn);
    });
  }

  private createMonsterDisplay(): void {
    this.monsterDisplay = new PIXI.Container();
    this.monsterDisplay.position.set(480, 350);
    this.addChild(this.monsterDisplay);
    
    // Display area background
    const displayBg = new PIXI.Graphics();
    displayBg.roundRect(-250, -150, 500, 300, 10);
    displayBg.fill({ color: 0x2d3748, alpha: 0.5 });
    this.monsterDisplay.addChild(displayBg);
  }

  private createInfoPanel(): void {
    this.infoPanel = new PIXI.Container();
    this.infoPanel.position.set(20, 480);
    this.addChild(this.infoPanel);
    
    const panelBg = new PIXI.Graphics();
    panelBg.roundRect(0, 0, 600, 140);
    panelBg.fill({ color: 0x333333, alpha: 0.9 });
    this.infoPanel.addChild(panelBg);
  }

  private createControlPanel(): void {
    this.controlPanel = new PIXI.Container();
    this.controlPanel.position.set(640, 480);
    this.addChild(this.controlPanel);
    
    const panelBg = new PIXI.Graphics();
    panelBg.roundRect(0, 0, 300, 140);
    panelBg.fill({ color: 0x333333, alpha: 0.9 });
    this.controlPanel.addChild(panelBg);
    
    // Animation controls
    const title = new PIXI.Text({
      text: '🎮 Điều khiển',
      style: {
        fontSize: 16,
        fill: 0xFFFFFF,
        fontWeight: 'bold'
      }
    });
    title.position.set(10, 10);
    this.controlPanel.addChild(title);
    
    // Flip button
    const flipBtn = this.createButton('↔️ Lật', 10, 40, () => {
      this.flipMonster();
    }, 0x4CAF50, 90);
    this.controlPanel.addChild(flipBtn);
    
    // Scale buttons
    const smallBtn = this.createButton('🔍 Nhỏ', 110, 40, () => {
      this.scaleMonster(0.3);
    }, 0x2196F3, 90);
    this.controlPanel.addChild(smallBtn);
    
    const medBtn = this.createButton('🔎 Vừa', 10, 85, () => {
      this.scaleMonster(0.5);
    }, 0x2196F3, 90);
    this.controlPanel.addChild(medBtn);
    
    const largeBtn = this.createButton('🔍 Lớn', 110, 85, () => {
      this.scaleMonster(0.7);
    }, 0x2196F3, 90);
    this.controlPanel.addChild(largeBtn);
    
    // Auto-play button
    const autoBtn = this.createButton('▶️ Tự động', 210, 40, () => {
      this.autoPlayAnimations();
    }, 0xFF9800, 80);
    this.controlPanel.addChild(autoBtn);
  }

  private createNavigationButtons(): void {
    // Previous button
    const prevBtn = this.createButton('◀ Trước', 20, 350, () => {
      this.previousMonster();
    }, 0x4CAF50, 120);
    this.addChild(prevBtn);
    
    // Next button
    const nextBtn = this.createButton('Sau ▶', 820, 350, () => {
      this.nextMonster();
    }, 0x4CAF50, 120);
    this.addChild(nextBtn);
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    onClick: () => void,
    color: number = 0x4CAF50,
    width: number = 100
  ): PIXI.Container {
    const btn = new PIXI.Container();
    btn.position.set(x, y);
    
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, width, 35, 8);
    bg.fill(color);
    btn.addChild(bg);
    
    const label = new PIXI.Text({
      text,
      style: {
        fontSize: 14,
        fill: 0xFFFFFF,
        fontWeight: 'bold'
      }
    });
    label.anchor.set(0.5);
    label.position.set(width / 2, 18);
    btn.addChild(label);
    
    btn.interactive = true;
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);
    
    // Hover effect
    btn.on('pointerover', () => {
      bg.tint = 0xCCCCCC;
    });
    btn.on('pointerout', () => {
      bg.tint = 0xFFFFFF;
    });
    
    return btn;
  }

  private async loadMonster(index: number): Promise<void> {
    if (index < 0 || index >= this.filteredMonsters.length) return;
    
    this.currentMonsterIndex = index;
    const monster = this.filteredMonsters[index];
    
    // Clear previous animation
    if (this.currentAnimation) {
      const oldDisplay = this.currentAnimation.getDisplay();
      if (oldDisplay && this.monsterDisplay) {
        this.monsterDisplay.removeChild(oldDisplay);
      }
      this.currentAnimation.destroy();
      this.currentAnimation = null;
    }
    
    // Show loading
    const loadingText = new PIXI.Text({
      text: 'Đang tải...',
      style: {
        fontSize: 20,
        fill: 0xFFFFFF
      }
    });
    loadingText.anchor.set(0.5);
    loadingText.label = 'loading';
    this.monsterDisplay?.addChild(loadingText);
    
    try {
      // Load DragonBones animation
      this.currentAnimation = new DragonBonesAnimation(this.app);
      await this.currentAnimation.loadCharacter(monster.assetName);
      
      const display = this.currentAnimation.getDisplay();
      if (display && this.monsterDisplay) {
        display.scale.set(this.currentScale);
        if (this.isFlipped) {
          this.currentAnimation.setFlip(true);
        }
        this.currentAnimation.play('Idle');
        this.monsterDisplay.addChild(display);
      }
      
      // Update info panel
      this.updateInfoPanel(monster);
      
      // Update animation buttons
      this.updateAnimationButtons();
      
    } catch (error) {
      console.error(`Failed to load monster ${monster.assetName}:`, error);
      
      // Show error
      const errorText = new PIXI.Text({
        text: `❌ Lỗi: ${monster.assetName}`,
        style: {
          fontSize: 16,
          fill: 0xFF5555
        }
      });
      errorText.anchor.set(0.5);
      this.monsterDisplay?.addChild(errorText);
    } finally {
      // Remove loading text
      const loading = this.monsterDisplay?.children.find(c => c.label === 'loading');
      if (loading && this.monsterDisplay) {
        this.monsterDisplay.removeChild(loading);
      }
    }
  }

  private updateInfoPanel(monster: any): void {
    if (!this.infoPanel) return;
    
    // Clear previous info
    while (this.infoPanel.children.length > 1) {
      this.infoPanel.removeChild(this.infoPanel.children[1]);
    }
    
    const info = new PIXI.Text({
      text: `${monster.name} (${monster.englishName})\n` +
        `Ngũ Hành: ${vi.elements[monster.element]} | Tier: ${'★'.repeat(monster.tier)}\n` +
        `HP: ${monster.stats.hp} | ATK: ${monster.stats.attack} | DEF: ${monster.stats.defense} | SPD: ${monster.stats.speed}\n` +
        `${monster.description}`,
      style: {
        fontSize: 13,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: 580
      }
    });
    info.position.set(10, 10);
    this.infoPanel.addChild(info);
  }

  private updateAnimationButtons(): void {
    if (!this.currentAnimation || !this.controlPanel) return;
    
    // Remove old animation buttons
    const oldButtons = this.controlPanel.children.filter(c => (c as any).name === 'anim-btn');
    oldButtons.forEach(btn => this.controlPanel?.removeChild(btn));
    
    // Add new animation buttons
    const animations = this.currentAnimation.listAnimations();
    animations.slice(0, 4).forEach((anim, index) => {
      const btn = this.createButton(
        anim.length > 8 ? anim.substring(0, 8) : anim,
        210,
        85 + index * -15,
        () => this.playAnimation(anim),
        0x8B5CF6,
        80
      );
      (btn as any).name = 'anim-btn';
      this.controlPanel?.addChild(btn);
    });
  }

  private playAnimation(animName: string): void {
    if (this.currentAnimation) {
      this.currentAnimation.play(animName, 1);
      
      // Return to idle after animation
      setTimeout(() => {
        if (this.currentAnimation) {
          this.currentAnimation.play('Idle');
        }
      }, 2000);
    }
  }

  private async autoPlayAnimations(): Promise<void> {
    if (!this.currentAnimation) return;
    
    const animations = this.currentAnimation.listAnimations();
    for (const anim of animations) {
      this.currentAnimation.play(anim, 1);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    this.currentAnimation.play('Idle');
  }

  private flipMonster(): void {
    this.isFlipped = !this.isFlipped;
    if (this.currentAnimation) {
      this.currentAnimation.setFlip(this.isFlipped);
    }
  }

  private scaleMonster(scale: number): void {
    this.currentScale = scale;
    if (this.currentAnimation) {
      this.currentAnimation.setScale(scale);
    }
  }

  private filterByElement(element: string): void {
    if (element === 'all') {
      this.filteredMonsters = [...monsterDB.monsters];
    } else {
      this.filteredMonsters = monsterDB.monsters.filter(m => m.element === element);
    }
    
    this.currentMonsterIndex = 0;
    this.loadMonster(0);
    
    // Recreate element filter to show selection
    this.children
      .filter(c => (c as any).name === 'element-filter')
      .forEach(c => this.removeChild(c));
    this.createElementFilter();
  }

  private previousMonster(): void {
    const newIndex = this.currentMonsterIndex - 1;
    if (newIndex >= 0) {
      this.loadMonster(newIndex);
    } else {
      this.loadMonster(this.filteredMonsters.length - 1);
    }
  }

  private nextMonster(): void {
    const newIndex = this.currentMonsterIndex + 1;
    if (newIndex < this.filteredMonsters.length) {
      this.loadMonster(newIndex);
    } else {
      this.loadMonster(0);
    }
  }

  private async goBack(): Promise<void> {
    const { CharacterSelectionScene } = await import('./CharacterSelectionScene');
    const selectionScene = new CharacterSelectionScene(this.app, this.sceneManager);
    await this.sceneManager.switchTo(selectionScene);
  }

  update(delta: number): void {
    // No updates needed
  }

  destroy(): void {
    if (this.currentAnimation) {
      this.currentAnimation.destroy();
      this.currentAnimation = null;
    }
    
    this.removeAllListeners();
    PIXI.Container.prototype.destroy.call(this);
  }
}
