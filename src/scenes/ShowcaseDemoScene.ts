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
import { PixiArmatureDisplay } from 'pixi-dragonbones-runtime';
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
  
  // Prevent race conditions with rapid character loading
  private isLoadingMonster = false;
  private pendingMonsterIndex: number | null = null;
  private lastLoadCompleteTime: number = 0;
  private readonly MIN_LOAD_DURATION = 600; // Minimum 600ms between character loads
  
  // Auto-play animation cycling
  private isAutoPlaying = true; // Auto-play by default
  private availableAnimations: string[] = [];
  private currentAnimIndex = 0;
  private currentAnimationName: string = '';  // Currently selected animation name
  private animationPlayCount = 0; // How many times current anim has played
  private animationTimer: number = 0;
  private autoPlayProgressText: PIXI.Text | null = null;
  private autoPlayTimeout: any = null;  // Timeout for auto-play advancement
  
  // UI elements
  private monsterDisplay: PIXI.Container | null = null;
  private infoPanel: PIXI.Container | null = null;
  private controlPanel: PIXI.Container | null = null;
  private debugAnimationText: PIXI.Text | null = null;  // Debug text showing current animation
  
  // Responsive scaling factors (calculated from screen size)
  private scaleFactor = 1.0; // Base scale for all UI elements
  private fontSize = {
    header: 28,
    subtitle: 14,
    body: 13,
    button: 14,
    small: 12,
    large: 20
  };
  
  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super(app);
    this.sceneManager = sceneManager;
    this.filteredMonsters = [...monsterDB.monsters];
  }

  async init(): Promise<void> {
    // Ensure canvas is properly sized before creating UI
    console.log(`ShowcaseDemoScene init - screen size: ${this.app.screen.width}x${this.app.screen.height}`);
    
    // Calculate responsive scale factors
    this.calculateScaleFactors();
    
    this.createBackground();
    this.createHeader();
    this.createElementFilter();
    this.createMonsterDisplay();
    this.createInfoPanel();
    this.createControlPanel();
    this.createNavigationButtons();
    
    // Load first monster
    await this.loadMonster(this.currentMonsterIndex);
    
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }
  
  /**
   * Calculate responsive scale factors based on screen size
   * Ensures all UI elements scale proportionally
   */
  private calculateScaleFactors(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Use actual screen size as reference - no fixed base size
    // This ensures everything ALWAYS fills the screen
    this.scaleFactor = 1.0;
    
    // Calculate font sizes as percentage of screen height
    const fontBaseHeight = height;
    this.fontSize = {
      header: Math.max(32, Math.floor(fontBaseHeight * 0.04)),      // 4% of height
      subtitle: Math.max(14, Math.floor(fontBaseHeight * 0.018)),   // 1.8% of height
      body: Math.max(13, Math.floor(fontBaseHeight * 0.016)),       // 1.6% of height
      button: Math.max(14, Math.floor(fontBaseHeight * 0.018)),     // 1.8% of height
      small: Math.max(11, Math.floor(fontBaseHeight * 0.013)),      // 1.3% of height
      large: Math.max(20, Math.floor(fontBaseHeight * 0.025))       // 2.5% of height
    };
    
    console.log(`🎨 ShowcaseDemoScene responsive scaling: Screen ${width}x${height} | Fonts: header=${this.fontSize.header} body=${this.fontSize.body} button=${this.fontSize.button}`);
  }

  private handleResize(): void {
    // Recalculate scale factors for new screen size
    this.calculateScaleFactors();
    
    // Clear and rebuild UI on resize
    this.removeChildren();
    
    this.createBackground();
    this.createHeader();
    this.createElementFilter();
    this.createMonsterDisplay();
    this.createInfoPanel();
    this.createControlPanel();
    this.createNavigationButtons();
    
    // Reload current monster
    if (this.currentAnimation) {
      this.loadMonster(this.currentMonsterIndex);
    }
  }

  private createBackground(): void {
    const bg = new PIXI.Graphics();
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    bg.rect(0, 0, width, height);
    bg.fill(0x1a1a2e);
    this.addChild(bg);
  }

  private createHeader(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const margin = 20 * this.scaleFactor;
    const headerY = 15 * this.scaleFactor;
    
    const header = new PIXI.Text({
      text: '🐉 Thần Thú Showcase - 207 Characters 🐉',
      style: {
        fontSize: this.fontSize.header,
        fill: 0xFFD700,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: Math.max(2, 4 * this.scaleFactor) }
      }
    });
    header.anchor.set(0.5);
    header.position.set(width / 2, headerY + header.height / 2);
    this.addChild(header);
    
    // Explanatory subtitle
    const subtitle = new PIXI.Text({
      text: 'Xem trước toàn bộ 207 Thần Thú với tất cả animations | Auto-play đã bật',
      style: {
        fontSize: this.fontSize.subtitle,
        fill: 0xCCCCCC,
        fontStyle: 'italic',
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.position.set(width / 2, headerY + header.height + 5 * this.scaleFactor);
    this.addChild(subtitle);
    
    // Back button
    const backBtn = this.createButton('← Quay lại', margin, margin, () => {
      this.goBack();
    }, 0x555555, 100 * this.scaleFactor);
    this.addChild(backBtn);
  }

  private createElementFilter(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const elements = ['all', 'kim', 'moc', 'thuy', 'hoa', 'tho'];
    const labels = ['Tất cả', vi.elements.kim, vi.elements.moc, vi.elements.thuy, vi.elements.hoa, vi.elements.tho];
    const colors = [0x888888, 0xC0C0C0, 0x4CAF50, 0x2196F3, 0xFF5722, 0x795548];
    
    // Responsive button sizing - fill width to prevent empty space
    const headerReserved = 100;  // Space for title
    const margin = 10;
    const spacing = 8;
    const availableWidth = width - margin * 2;
    const btnHeight = Math.max(40, height * 0.06);  // 6% of screen height
    const btnWidth = (availableWidth - spacing * (elements.length - 1)) / elements.length;  // Divide equally
    const borderRadius = Math.floor(8);
    const filterY = headerReserved + 10;
    
    elements.forEach((element, index) => {
      const isSelected = element === this.currentElement;
      const btn = new PIXI.Graphics();
      
      btn.roundRect(0, 0, btnWidth, btnHeight, borderRadius);
      btn.fill(isSelected ? colors[index] : 0x333333);
      btn.position.set(margin + index * (btnWidth + spacing), filterY);
      btn.interactive = true;
      btn.cursor = 'pointer';
      btn.eventMode = 'static';
      
      btn.on('pointerdown', () => {
        this.currentElement = element;
        this.filterByElement(element);
      });
      
      const label = new PIXI.Text({
        text: labels[index],
        style: {
          fontSize: this.fontSize.button,
          fill: 0xFFFFFF,
          align: 'center',
          fontWeight: 'bold'
        }
      });
      label.anchor.set(0.5);
      label.position.set(btnWidth / 2, btnHeight / 2);
      btn.addChild(label);
      
      this.addChild(btn);
    });
  }

  private createMonsterDisplay(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Layout: 
    // Top: Header (80px) + Element filter (60px) = 140px
    // Middle: Monster display (60% of remaining space) + Info/Controls (40% of remaining space)
    // Bottom: Navigation buttons (60px)
    
    const topReserved = 140;
    const bottomReserved = 60;
    const availableHeight = height - topReserved - bottomReserved;
    
    // Left side: Monster display (60% of width)
    const displayWidth = width * 0.58;
    const displayHeight = availableHeight * 0.95;  // Leave small margin
    const displayX = 10;
    const displayY = topReserved + (availableHeight - displayHeight) / 2;
    
    // Create monster display container
    this.monsterDisplay = new PIXI.Container();
    this.monsterDisplay.position.set(displayX, displayY);
    this.addChild(this.monsterDisplay);
    
    // Display background with border
    const displayBg = new PIXI.Graphics();
    displayBg.roundRect(0, 0, displayWidth, displayHeight, 15);
    displayBg.fill({ color: 0x2d3748, alpha: 0.8 });
    displayBg.stroke({ color: 0x4a5568, width: 2 });
    this.monsterDisplay.addChild(displayBg);
    
    console.log(`✅ Monster display: ${displayWidth}x${displayHeight} at (${displayX}, ${displayY})`);
  }

  private createInfoPanel(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Right side: Info panel (40% of width)
    const topReserved = 140;
    const bottomReserved = 60;
    const availableHeight = height - topReserved - bottomReserved;
    
    const panelWidth = width * 0.4 - 10;
    const panelHeight = availableHeight * 0.5 - 5;  // Top half of right side
    const panelX = width * 0.6 + 5;
    const panelY = topReserved + 5;
    
    const margin = 12;
    const borderRadius = 10;
    
    this.infoPanel = new PIXI.Container();
    this.infoPanel.position.set(panelX, panelY);
    this.addChild(this.infoPanel);
    
    // Info panel background
    const panelBg = new PIXI.Graphics();
    panelBg.roundRect(0, 0, panelWidth, panelHeight, borderRadius);
    panelBg.fill({ color: 0x2a2a3a, alpha: 0.9 });
    panelBg.stroke({ color: 0x4a5568, width: 2 });
    this.infoPanel.addChild(panelBg);
    
    // Title: "Thông tin Thần Thú"
    const titleText = new PIXI.Text({
      text: '📋 Thông tin',
      style: {
        fontSize: this.fontSize.large,
        fill: 0xFFD700,
        fontWeight: 'bold'
      }
    });
    titleText.position.set(margin, margin);
    this.infoPanel.addChild(titleText);
    
    console.log(`✅ Info panel: ${panelWidth}x${panelHeight} at (${panelX}, ${panelY})`);
  }

  private createControlPanel(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Right side: Control panel (40% of width), below info panel
    const topReserved = 140;
    const bottomReserved = 60;
    const availableHeight = height - topReserved - bottomReserved;
    
    const panelWidth = width * 0.4 - 10;
    const panelHeight = availableHeight * 0.45 - 5;  // Bottom half of right side
    const panelX = width * 0.6 + 5;
    const panelY = topReserved + availableHeight * 0.5 + 10;
    
    const margin = 12;
    const padding = 10;
    const borderRadius = 10;
    
    this.controlPanel = new PIXI.Container();
    this.controlPanel.position.set(panelX, panelY);
    this.addChild(this.controlPanel);
    
    // Control panel background
    const panelBg = new PIXI.Graphics();
    panelBg.roundRect(0, 0, panelWidth, panelHeight, borderRadius);
    panelBg.fill({ color: 0x2a2a3a, alpha: 0.9 });
    panelBg.stroke({ color: 0x4a5568, width: 2 });
    this.controlPanel.addChild(panelBg);
    
    // Title: "Điều khiển"
    const titleText = new PIXI.Text({
      text: '⚙️ Điều khiển',
      style: {
        fontSize: this.fontSize.large,
        fill: 0xFFD700,
        fontWeight: 'bold'
      }
    });
    titleText.position.set(margin, margin);
    this.controlPanel.addChild(titleText);
    
    // Calculate button sizes for control panel
    const btnSpacing = 8;
    const availableWidth = panelWidth - margin * 2;
    
    // Row 1: Auto-play button (full width)
    const autoBtn = this.createButton(
      this.isAutoPlaying ? '⏸️ Dừng Auto' : '▶️ Auto', 
      margin, 
      margin, 
      () => this.toggleAutoPlay(),
      this.isAutoPlaying ? 0xFF9800 : 0x4CAF50,
      availableWidth
    );
    (autoBtn as any).name = 'auto-play-btn';
    this.controlPanel.addChild(autoBtn);
    
    // Animation progress text (centered, with spacing)
    this.autoPlayProgressText = new PIXI.Text({
      text: 'Anim 1/5',
      style: {
        fontSize: this.fontSize.body,
        fill: 0xFFD700,
        align: 'center'
      }
    });
    this.autoPlayProgressText.anchor.set(0.5, 0);
    this.autoPlayProgressText.position.set(availableWidth / 2 + margin, margin + 50);
    this.controlPanel.addChild(this.autoPlayProgressText);
    
    console.log(`✅ Control panel: ${panelWidth}x${panelHeight} at (${panelX}, ${panelY})`);
  }

  private createNavigationButtons(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const margin = 15;
    const btnHeight = Math.max(45, height * 0.06);  // 6% of screen height
    const navY = height - btnHeight - 5;
    
    // Calculate button width to fill width with equal spacing
    const btnWidth = (width - margin * 2) / 3;  // Left, Center, Right buttons
    const spacing = 10;
    
    // Previous button - left
    const prevBtn = this.createButton('◀ Trước', margin, navY, () => {
      this.previousMonster();
    }, 0x4CAF50, (btnWidth - spacing * 0.5) / 2);
    this.addChild(prevBtn);
    
    // Center info button - middle
    const infoBtn = this.createButton('📊 Thông tin chi tiết', margin + (btnWidth - spacing * 0.5) / 2 + spacing, navY, () => {
      console.log('Show detailed info');
    }, 0x2196F3, (btnWidth - spacing * 0.5) / 2);
    this.addChild(infoBtn);
    
    // Next button - right
    const nextBtn = this.createButton('Sau ▶', margin + btnWidth + spacing, navY, () => {
      this.nextMonster();
    }, 0x4CAF50, (btnWidth - spacing * 0.5) / 2);
    this.addChild(nextBtn);
    
    console.log(`✅ Navigation buttons at Y=${navY}, height=${btnHeight}`);
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
    
    // Responsive button height
    const btnHeight = Math.max(40, this.app.screen.height * 0.05);  // 5% of screen height
    const borderRadius = 10;
    
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, width, btnHeight, borderRadius);
    bg.fill(color);
    bg.interactive = true;
    bg.eventMode = 'static';
    btn.addChild(bg);
    
    const label = new PIXI.Text({
      text,
      style: {
        fontSize: Math.max(12, this.fontSize.button),
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        wordWrap: true,
        wordWrapWidth: width - 10
      }
    });
    label.anchor.set(0.5);
    label.position.set(width / 2, btnHeight / 2);
    btn.addChild(label);
    
    btn.interactive = true;
    btn.eventMode = 'static';
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

  private loadMonster(index: number): Promise<void> {
    if (index < 0 || index >= this.filteredMonsters.length) return Promise.resolve();
    
    // If already loading, queue this request instead
    if (this.isLoadingMonster) {
      this.pendingMonsterIndex = index;
      return Promise.resolve();
    }
    
    // Check if enough time has passed since last load
    const timeSinceLastLoad = Date.now() - this.lastLoadCompleteTime;
    if (timeSinceLastLoad < this.MIN_LOAD_DURATION) {
      // Queue request to be retried after minimum duration
      this.pendingMonsterIndex = index;
      const waitTime = this.MIN_LOAD_DURATION - timeSinceLastLoad;
      setTimeout(() => {
        if (this.pendingMonsterIndex === index) {
          this.loadMonster(index);
        }
      }, waitTime);
      return Promise.resolve();
    }
    
    // Mark as loading
    this.isLoadingMonster = true;
    this.pendingMonsterIndex = null;
    
    this.currentMonsterIndex = index;
    const monster = this.filteredMonsters[index];
    
    // Clear auto-play timeout to prevent race conditions
    if (this.autoPlayTimeout) {
      clearTimeout(this.autoPlayTimeout);
      this.autoPlayTimeout = null;
    }
    
    // Clear previous animation and its display
    if (this.currentAnimation) {
      try {
        const oldDisplay = this.currentAnimation.getDisplay();
        if (oldDisplay) {
          // Stop any playing animation first
          try {
            if (oldDisplay.animation) {
              oldDisplay.animation.stop();
            }
          } catch (e) {
            // Ignore animation stop errors
          }
          
          // Remove from scene if attached
          if (oldDisplay.parent) {
            oldDisplay.parent.removeChild(oldDisplay);
          }
          
          // Set visible false to prevent rendering
          oldDisplay.visible = false;
          oldDisplay.renderable = false;
        }
        
        // Defer disposal to next frame to let renderer finish current frame
        const animToDestroy = this.currentAnimation;
        setTimeout(() => {
          try {
            animToDestroy.destroy();
          } catch (e) {
            console.warn('Error destroying animation:', e);
          }
        }, 0);
      } catch (e) {
        console.warn('Error cleaning up old display:', e);
      }
      
      this.currentAnimation = null;
    }
    
    // Clear any stale children (safety check) - but preserve the background
    if (this.monsterDisplay && this.monsterDisplay.children.length > 1) {
      const childrenToRemove: any[] = [];
      for (let i = 1; i < this.monsterDisplay.children.length; i++) {
        const child = this.monsterDisplay.children[i];
        if (child.label !== 'loading') {
          childrenToRemove.push(child);
        }
      }
      
      childrenToRemove.forEach(child => {
        try {
          this.monsterDisplay!.removeChild(child);
          if (child.destroy) {
            child.destroy({ children: true, texture: false });
          }
        } catch (e) {
          // Ignore destroy errors
        }
      });
    }
    
    // Show loading
    const loadingText = new PIXI.Text({
      text: 'Đang tải...',
      style: {
        fontSize: this.fontSize.large,
        fill: 0xFFFFFF
      }
    });
    loadingText.anchor.set(0.5);
    loadingText.label = 'loading';
    this.monsterDisplay?.addChild(loadingText);
    
    return (async () => {
      try {
        // Load DragonBones animation
        this.currentAnimation = new DragonBonesAnimation(this.app);
        await this.currentAnimation.loadCharacter(monster.assetName);
        
        const display = this.currentAnimation.getDisplay();
        if (display && this.monsterDisplay) {
          // Ensure display is not already in scene
          if (display.parent && display.parent !== this.monsterDisplay) {
            display.parent.removeChild(display);
          }
          
          // Make sure display is visible and not disposed
          display.visible = true;
          display.alpha = 1;
          
          // Container dimensions for character
          const displayWidth = this.app.screen.width * 0.58;
          const displayHeight = (this.app.screen.height - 200) * 0.95;
          
          // Set initial position (centered + 20% lower)
          const offsetY = displayHeight * 0.2;  // 20% lower
          display.position.set(displayWidth / 2, displayHeight / 2 + offsetY);
          
          // Set safe initial scale to avoid huge character
          display.scale.set(0.3);
          
          if (this.isFlipped) {
            this.currentAnimation.setFlip(true);
          }
          
          // Play animation BEFORE adding to scene to ensure state is set
          this.currentAnimation.play('Idle');
          
          // IMPORTANT: Defer adding display to scene
          // This ensures the old display has time to be removed from renderer
          // Wait 32ms (2 frames) to be safe, then add new display
          await new Promise(resolve => setTimeout(() => {
            if (this.monsterDisplay && display.parent !== this.monsterDisplay) {
              this.monsterDisplay.addChild(display);
            }
            resolve(undefined);
          }, 32));
          
          // NOW calculate bounds after mesh is initialized
          // Use setTimeout to defer after render completes
          await new Promise(resolve => setTimeout(() => {
            try {
              const bounds = display.getLocalBounds();
              const charWidth = bounds.width;
              const charHeight = bounds.height;
              
              // Calculate scale to fit character within container with padding
              const maxWidth = displayWidth * 0.7;  // Use 70% of container width
              const maxHeight = displayHeight * 0.6; // Use 60% of container height
              
              let scale = 1;
              if (charWidth > 0) scale = Math.min(scale, maxWidth / charWidth);
              if (charHeight > 0) scale = Math.min(scale, maxHeight / charHeight);
              
              // Apply calculated scale
              if (scale > 0 && isFinite(scale)) {
                display.scale.set(scale);
              }
            } catch (e) {
              // Bounds calculation failed, keep initial scale
              console.warn('Could not calculate character bounds:', e);
            }
            resolve(undefined);
          }, 50));
          
          // Add debug animation text at bottom
          this.createDebugAnimationText();
          
          // Setup DragonBones event listener for animation completion
          this.setupAnimationEventListener(display);
        }
        
        // Update info panel
        this.updateInfoPanel(monster);
        
        // Initialize available animations for auto-play
        this.availableAnimations = this.currentAnimation.listAnimations();
        this.currentAnimIndex = 0;
        this.currentAnimationName = this.availableAnimations.length > 0 ? this.availableAnimations[0] : '';
        this.animationPlayCount = 0;
        this.animationTimer = 0;
        
        // Update animation buttons
        this.updateAnimationButtons();
        
        // Update progress display
        this.updateProgressText();
        
        // Start auto-play if enabled
        if (this.isAutoPlaying && this.availableAnimations.length > 0) {
          this.playNextAnimation();
        }
        
      } catch (error) {
        console.error(`Failed to load monster ${monster.assetName}:`, error);
        
        // Show error
        const errorText = new PIXI.Text({
          text: `❌ Lỗi: ${monster.assetName}`,
          style: {
            fontSize: Math.floor(16 * this.scaleFactor),
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
        
        // Record when load completed for rate limiting
        this.lastLoadCompleteTime = Date.now();
        
        // Mark loading as complete
        this.isLoadingMonster = false;
        
        // If there's a pending request, load it
        if (this.pendingMonsterIndex !== null) {
          const nextIndex = this.pendingMonsterIndex;
          this.pendingMonsterIndex = null;
          this.loadMonster(nextIndex);
        }
      }
    })();
  }

  /**
   * Setup DragonBones event listener for animation completion
   * This allows auto-play to cycle through animations properly
   */
  private setupAnimationEventListener(display: PixiArmatureDisplay): void {
    // Listen for animation completion using the animation state
    // When an animation completes, it automatically returns to idle
    // We'll check the animation state each frame to know when to advance
  }

  /**
   * Create debug text showing current animation name at bottom of display
   */
  private createDebugAnimationText(): void {
    // Remove old debug text if exists
    if (this.debugAnimationText && this.monsterDisplay) {
      this.monsterDisplay.removeChild(this.debugAnimationText);
      this.debugAnimationText = null;
    }
    
    const displayWidth = this.app.screen.width * 0.58;
    const displayHeight = (this.app.screen.height - 200) * 0.95;
    
    this.debugAnimationText = new PIXI.Text({
      text: `🎬 ${this.currentAnimationName || 'None'}`,
      style: {
        fontSize: Math.max(12, this.fontSize.small),
        fill: 0xFFD700,
        align: 'center',
        fontFamily: 'Arial'
      }
    });
    
    this.debugAnimationText.anchor.set(0.5, 0);
    this.debugAnimationText.position.set(displayWidth / 2, displayHeight - 30);
    this.monsterDisplay?.addChild(this.debugAnimationText);
  }

  private updateInfoPanel(monster: any): void {
    if (!this.infoPanel) return;
    
    // Clear previous info
    while (this.infoPanel.children.length > 1) {
      this.infoPanel.removeChild(this.infoPanel.children[1]);
    }
    
    const padding = 10 * this.scaleFactor;
    const panelBg = this.infoPanel.children[0] as PIXI.Graphics;
    const panelWidth = panelBg.width;
    
    const info = new PIXI.Text({
      text: `${monster.name} (${monster.englishName})\n` +
        `Ngũ Hành: ${vi.elements[monster.element]} | Tier: ${'★'.repeat(monster.tier)}\n` +
        `HP: ${monster.stats.hp} | ATK: ${monster.stats.attack} | DEF: ${monster.stats.defense} | SPD: ${monster.stats.speed}\n` +
        `${monster.description}`,
      style: {
        fontSize: this.fontSize.body,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: panelWidth - padding * 2
      }
    });
    info.position.set(padding, padding);
    this.infoPanel.addChild(info);
  }

  private updateAnimationButtons(): void {
    if (!this.currentAnimation || !this.controlPanel) return;
    
    // Remove old animation buttons
    const oldButtons = this.controlPanel.children.filter(c => (c as any).name === 'anim-btn');
    oldButtons.forEach(btn => this.controlPanel?.removeChild(btn));
    
    // Get animations and layout
    const animations = this.currentAnimation.listAnimations();
    if (animations.length === 0) return;
    
    const margin = 12;
    const panelWidth = this.app.screen.width * 0.4 - 10;
    const availableWidth = panelWidth - margin * 2;
    const btnSpacing = 8;
    const btnHeight = 35;
    const rowHeight = btnHeight + 10;
    let row2Y = margin + 80;
    
    // Show ALL animations with 4 per row
    const animsPerRow = 4;
    const numRows = Math.ceil(animations.length / animsPerRow);
    const animBtnWidth = (availableWidth - btnSpacing * (animsPerRow - 1)) / animsPerRow;
    
    animations.forEach((animName, index) => {
      const rowIndex = Math.floor(index / animsPerRow);
      const colIndex = index % animsPerRow;
      
      const isCurrentAnim = animName === this.currentAnimationName;
      const btnX = margin + colIndex * (animBtnWidth + btnSpacing);
      const btnY = row2Y + rowIndex * rowHeight;
      
      const animBtn = this.createButton(
        animName,
        btnX,
        btnY,
        () => {
          this.currentAnimationName = animName;
          if (this.currentAnimation) {
            this.currentAnimation.play(animName, 1);  // Play animation once
            this.updateProgressText();  // Update debug text
          }
          this.updateAnimationButtons();  // Refresh button highlighting
        },
        isCurrentAnim ? 0xFFD700 : 0x9C27B0,  // Gold if current, purple otherwise
        animBtnWidth
      );
      (animBtn as any).name = 'anim-btn';
      this.controlPanel?.addChild(animBtn);
    });
  }

  private toggleAutoPlay(): void {
    this.isAutoPlaying = !this.isAutoPlaying;
    
    if (this.isAutoPlaying) {
      // Reset to start of current animation
      this.animationPlayCount = 0;
      this.animationTimer = 0;
      console.log('🎬 Auto-play enabled');
    } else {
      // Pause and return to idle
      if (this.currentAnimation) {
        this.currentAnimation.play('Idle');
      }
      console.log('⏸️ Auto-play paused');
    }
    
    // Update button
    this.updateAutoPlayButton();
  }
  
  private updateAutoPlayButton(): void {
    if (!this.controlPanel) return;
    
    const btn = this.controlPanel.children.find(c => (c as any).name === 'auto-play-btn') as PIXI.Container;
    if (!btn) return;
    
    const bg = btn.children[0] as PIXI.Graphics;
    const label = btn.children[1] as PIXI.Text;
    
    const panelBg = this.controlPanel.children[0] as PIXI.Graphics;
    const panelWidth = panelBg.width;
    const btnHeight = Math.floor(35 * this.scaleFactor);
    const borderRadius = Math.floor(8 * this.scaleFactor);
    
    bg.clear();
    bg.roundRect(0, 0, panelWidth * 0.4, btnHeight, borderRadius);
    bg.fill(this.isAutoPlaying ? 0xFF9800 : 0x4CAF50);
    
    label.text = this.isAutoPlaying ? '⏸️ Dừng' : '▶️ Auto';
  }
  
  private playNextAnimation(): void {
    if (!this.currentAnimation || this.availableAnimations.length === 0) return;
    
    const animName = this.availableAnimations[this.currentAnimIndex];
    const display = this.currentAnimation.getDisplay();
    
    // Play animation once
    this.currentAnimation.play(animName, 1);
    this.animationPlayCount++;
    
    // Update progress text
    this.updateProgressText();
    
    // Schedule next animation or replay based on completion
    // Estimate animation duration (usually 500ms - 2000ms for most animations)
    // Use a reasonable default timeout for checking completion
    const animDuration = this.estimateAnimationDuration(animName);
    
    if (this.autoPlayTimeout) {
      clearTimeout(this.autoPlayTimeout);
    }
    
    this.autoPlayTimeout = window.setTimeout(() => {
      if (this.isAutoPlaying && this.availableAnimations.length > 0) {
        // If animation played 2 times, move to next animation
        if (this.animationPlayCount >= 2) {
          this.animationPlayCount = 0;
          this.currentAnimIndex++;
          
          // If all animations done, restart from beginning
          if (this.currentAnimIndex >= this.availableAnimations.length) {
            this.currentAnimIndex = 0;
          }
          
          // Play next animation
          this.playNextAnimation();
        } else {
          // Play same animation again (for the 2nd time)
          this.playNextAnimation();
        }
      }
    }, animDuration);
  }

  /**
   * Estimate animation duration based on animation name
   * Different animation types have different typical durations
   */
  private estimateAnimationDuration(animName: string): number {
    // Common animation duration estimates (in milliseconds)
    const lowerName = animName.toLowerCase();
    
    if (lowerName.includes('attack') || lowerName.includes('damage')) {
      return 1500; // Attack/damage typically 1-2 seconds
    } else if (lowerName.includes('walk') || lowerName.includes('run')) {
      return 1000; // Walk/run typically 1 second
    } else if (lowerName.includes('idle') || lowerName.includes('stand')) {
      return 2000; // Idle can be 2+ seconds
    } else if (lowerName.includes('skill') || lowerName.includes('ability')) {
      return 2000; // Skills typically 2-3 seconds
    } else {
      return 1500; // Default fallback
    }
  }
  
  private updateProgressText(): void {
    if (!this.autoPlayProgressText || this.availableAnimations.length === 0) return;
    
    const animName = this.availableAnimations[this.currentAnimIndex];
    const shortName = animName.length > 8 ? animName.substring(0, 8) + '..' : animName;
    
    // Update current animation name
    this.currentAnimationName = animName;
    
    // Compact format: "AnimName 1/5(2/2)"
    this.autoPlayProgressText.text = `${shortName} ${this.currentAnimIndex + 1}/${this.availableAnimations.length}(${this.animationPlayCount + 1}/2)`;
    
    // Update debug text below character
    if (this.debugAnimationText) {
      this.debugAnimationText.text = `🎬 ${animName}`;
    }
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
    // Auto-play animation cycling is now handled by timeouts in playNextAnimation()
    // No need for frame-based updates
  }

  destroy(): void {
    // Cleanup timeout
    if (this.autoPlayTimeout) {
      clearTimeout(this.autoPlayTimeout);
      this.autoPlayTimeout = null;
    }
    
    // Remove resize listener
    window.removeEventListener('resize', () => this.handleResize());
    
    if (this.currentAnimation) {
      this.currentAnimation.destroy();
      this.currentAnimation = null;
    }
    
    this.removeAllListeners();
    PIXI.Container.prototype.destroy.call(this);
  }
}
