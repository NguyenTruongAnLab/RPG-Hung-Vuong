/**
 * SurvivalUI - Visual display for survival stats
 * 
 * Shows hunger, health, sanity, and temperature bars.
 * Provides visual warnings at low values.
 * 
 * @example
 * ```typescript
 * const survivalUI = new SurvivalUI();
 * await survivalUI.init();
 * ```
 */
import * as PIXI from 'pixi.js';
import { SurvivalStats, StatChangeEvent } from '../systems/SurvivalStats';
import gsap from 'gsap';

/**
 * Stat bar configuration
 */
interface StatBarConfig {
  label: string;
  color: number;
  warningColor: number;
  criticalColor: number;
  icon: string;
}

/**
 * Stat bar configs
 */
const STAT_CONFIGS: Record<string, StatBarConfig> = {
  hunger: {
    label: 'HUNGER',
    color: 0xffa500, // Orange
    warningColor: 0xff8800,
    criticalColor: 0xff0000,
    icon: '🍖'
  },
  health: {
    label: 'HEALTH',
    color: 0x00ff00, // Green
    warningColor: 0xffff00,
    criticalColor: 0xff0000,
    icon: '❤️'
  },
  sanity: {
    label: 'SANITY',
    color: 0x9370db, // Purple
    warningColor: 0xff00ff,
    criticalColor: 0x8b0000,
    icon: '🧠'
  },
  temperature: {
    label: 'TEMP',
    color: 0x00ffff, // Cyan
    warningColor: 0xffff00,
    criticalColor: 0xff0000,
    icon: '🌡️'
  }
};

/**
 * SurvivalUI class
 */
export class SurvivalUI {
  private container: PIXI.Container;
  private statBars: Map<string, PIXI.Container> = new Map();
  
  private barWidth: number = 150;
  private barHeight: number = 20;
  private barSpacing: number = 35;
  private padding: number = 15;

  constructor() {
    this.container = new PIXI.Container();
    this.container.x = this.padding;
    this.container.y = this.padding;
  }

  /**
   * Initialize UI
   */
  async init(): Promise<void> {
    // Create stat bars
    this.createStatBar('health', 0);
    this.createStatBar('hunger', 1);
    this.createStatBar('sanity', 2);
    this.createStatBar('temperature', 3);
    
    // Subscribe to stat changes
    const stats = SurvivalStats.getInstance();
    stats.onStatChanged((event) => this.handleStatChange(event));
    
    // Initial update
    this.updateAllBars();
    
    console.log('✅ SurvivalUI initialized');
  }

  /**
   * Create a stat bar
   */
  private createStatBar(stat: string, index: number): void {
    const config = STAT_CONFIGS[stat];
    if (!config) return;
    
    const barContainer = new PIXI.Container();
    barContainer.y = index * this.barSpacing;
    
    // Icon
    const icon = new PIXI.Text(config.icon, {
      fontFamily: 'Arial',
      fontSize: 20
    });
    icon.x = 0;
    icon.y = 0;
    barContainer.addChild(icon);
    
    // Label
    const label = new PIXI.Text(config.label, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    label.x = 30;
    label.y = 0;
    barContainer.addChild(label);
    
    // Bar background
    const barBg = new PIXI.Graphics();
    barBg.lineStyle(2, 0x333333, 1);
    barBg.beginFill(0x1a1a1a, 1);
    barBg.drawRoundedRect(30, 18, this.barWidth, this.barHeight, 5);
    barBg.endFill();
    barContainer.addChild(barBg);
    
    // Bar fill
    const barFill = new PIXI.Graphics();
    barFill.x = 30;
    barFill.y = 18;
    barContainer.addChild(barFill);
    
    // Value text
    const valueText = new PIXI.Text('100', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff
    });
    valueText.x = 30 + this.barWidth + 10;
    valueText.y = 18;
    barContainer.addChild(valueText);
    
    // Warning flash (hidden by default)
    const warningFlash = new PIXI.Graphics();
    warningFlash.beginFill(0xff0000, 0);
    warningFlash.drawRoundedRect(28, 16, this.barWidth + 4, this.barHeight + 4, 7);
    warningFlash.endFill();
    barContainer.addChild(warningFlash);
    
    // Store references
    barContainer.name = stat;
    (barContainer as any).barFill = barFill;
    (barContainer as any).valueText = valueText;
    (barContainer as any).warningFlash = warningFlash;
    
    this.statBars.set(stat, barContainer);
    this.container.addChild(barContainer);
  }

  /**
   * Handle stat change
   */
  private handleStatChange(event: StatChangeEvent): void {
    this.updateBar(event.stat, event.newValue, event.max);
  }

  /**
   * Update a stat bar
   */
  private updateBar(stat: string, value: number, max: number): void {
    const barContainer = this.statBars.get(stat);
    if (!barContainer) return;
    
    const config = STAT_CONFIGS[stat];
    const barFill = (barContainer as any).barFill as PIXI.Graphics;
    const valueText = (barContainer as any).valueText as PIXI.Text;
    const warningFlash = (barContainer as any).warningFlash as PIXI.Graphics;
    
    // Calculate percentage
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const fillWidth = (this.barWidth - 4) * (percentage / 100);
    
    // Determine color based on value
    let color = config.color;
    if (percentage <= 25) {
      color = config.criticalColor;
    } else if (percentage <= 50) {
      color = config.warningColor;
    }
    
    // Animate bar fill
    barFill.clear();
    barFill.beginFill(color, 1);
    barFill.drawRoundedRect(2, 2, fillWidth, this.barHeight - 4, 3);
    barFill.endFill();
    
    // Update value text
    valueText.text = Math.round(value).toString();
    valueText.style.fill = color;
    
    // Warning flash at critical levels
    if (percentage <= 25) {
      this.playWarningFlash(warningFlash);
    }
  }

  /**
   * Play warning flash animation
   */
  private playWarningFlash(flash: PIXI.Graphics): void {
    gsap.to(flash, {
      alpha: 0.5,
      duration: 0.5,
      repeat: 1,
      yoyo: true,
      ease: 'power2.inOut'
    });
  }

  /**
   * Update all bars
   */
  private updateAllBars(): void {
    const stats = SurvivalStats.getInstance();
    
    this.updateBar('health', stats.getHealth(), 100);
    this.updateBar('hunger', stats.getHunger(), 100);
    this.updateBar('sanity', stats.getSanity(), 100);
    this.updateBar('temperature', stats.getTemperature(), 100);
  }

  /**
   * Show death overlay
   */
  showDeathOverlay(): void {
    const overlay = new PIXI.Container();
    
    // Dark background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, 800, 600); // TODO: Get from Game config
    bg.endFill();
    overlay.addChild(bg);
    
    // Death text
    const deathText = new PIXI.Text('YOU DIED', {
      fontFamily: 'Arial',
      fontSize: 64,
      fill: 0xff0000,
      fontWeight: 'bold'
    });
    deathText.x = (800 - deathText.width) / 2;
    deathText.y = 200;
    overlay.addChild(deathText);
    
    // Respawn button
    const respawnButton = new PIXI.Container();
    const buttonBg = new PIXI.Graphics();
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.beginFill(0x333333, 1);
    buttonBg.drawRoundedRect(0, 0, 200, 60, 10);
    buttonBg.endFill();
    
    const buttonText = new PIXI.Text('RESPAWN', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff
    });
    buttonText.x = (200 - buttonText.width) / 2;
    buttonText.y = (60 - buttonText.height) / 2;
    
    respawnButton.addChild(buttonBg, buttonText);
    respawnButton.x = (800 - 200) / 2;
    respawnButton.y = 350;
    respawnButton.eventMode = 'static';
    respawnButton.cursor = 'pointer';
    
    respawnButton.on('pointerdown', () => {
      const stats = SurvivalStats.getInstance();
      stats.respawn();
      this.container.parent?.removeChild(overlay);
    });
    
    overlay.addChild(respawnButton);
    this.container.parent?.addChild(overlay);
    
    // Fade in animation
    overlay.alpha = 0;
    gsap.to(overlay, {
      alpha: 1,
      duration: 1,
      ease: 'power2.inOut'
    });
  }

  /**
   * Get container
   */
  getContainer(): PIXI.Container {
    return this.container;
  }
}
