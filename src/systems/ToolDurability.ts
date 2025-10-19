/**
 * ToolDurability - Durability tracking UI component
 * 
 * Displays durability bars for tools and weapons, shows warnings
 * when durability is low, and handles repair UI.
 * 
 * @example
 * ```typescript
 * const durability = new ToolDurability(app);
 * durability.showDurabilityBar(weapon, mouseX, mouseY);
 * durability.update(deltaMs);
 * ```
 */
import * as PIXI from 'pixi.js';
import { EventBus } from '../core/EventBus';
import { WeaponData } from './WeaponSystem';

/**
 * Durability bar display
 */
interface DurabilityDisplay {
  weaponId: string;
  container: PIXI.Container;
  bar: PIXI.Graphics;
  text: PIXI.Text;
  position: { x: number; y: number };
  timestamp: number;
}

/**
 * ToolDurability class
 */
export class ToolDurability {
  private app: PIXI.Application;
  private eventBus: EventBus;
  private container: PIXI.Container;
  private activeDisplays: Map<string, DurabilityDisplay> = new Map();
  private warningContainer: PIXI.Container;
  private activeWarnings: Set<string> = new Set();

  // UI constants
  private readonly BAR_WIDTH = 100;
  private readonly BAR_HEIGHT = 8;
  private readonly DISPLAY_DURATION = 2000; // ms
  private readonly WARNING_THRESHOLD = 0.2; // 20%
  private readonly CRITICAL_THRESHOLD = 0.1; // 10%

  constructor(app: PIXI.Application, eventBus: EventBus) {
    this.app = app;
    this.eventBus = eventBus;

    // Create container
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    // Create warning container (top-center)
    this.warningContainer = new PIXI.Container();
    this.warningContainer.position.set(app.screen.width / 2, 50);
    this.app.stage.addChild(this.warningContainer);

    // Listen for durability events
    this.eventBus.on('weapon:low-durability', this.handleLowDurability.bind(this));
    this.eventBus.on('weapon:broken', this.handleBroken.bind(this));
    this.eventBus.on('weapon:repaired', this.handleRepaired.bind(this));
  }

  /**
   * Show durability bar for a weapon
   */
  showDurabilityBar(weapon: WeaponData, x: number, y: number): void {
    const displayId = `${weapon.id}_${Date.now()}`;

    // Create container
    const displayContainer = new PIXI.Container();
    displayContainer.position.set(x, y);

    // Create background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT);
    bg.fill({ color: 0x000000, alpha: 0.5 });
    displayContainer.addChild(bg);

    // Create durability bar
    const bar = new PIXI.Graphics();
    this.updateBarVisual(bar, weapon);
    displayContainer.addChild(bar);

    // Create text
    const text = new PIXI.Text({
      text: `${weapon.durability}/${weapon.maxDurability}`,
      style: {
        fontSize: 10,
        fill: 0xffffff,
        align: 'center'
      }
    });
    text.anchor.set(0.5);
    text.position.set(this.BAR_WIDTH / 2, this.BAR_HEIGHT / 2);
    displayContainer.addChild(text);

    // Add to stage
    this.container.addChild(displayContainer);

    // Store display
    const display: DurabilityDisplay = {
      weaponId: weapon.id,
      container: displayContainer,
      bar,
      text,
      position: { x, y },
      timestamp: Date.now()
    };
    this.activeDisplays.set(displayId, display);
  }

  /**
   * Update durability bar visual based on percentage
   */
  private updateBarVisual(bar: PIXI.Graphics, weapon: WeaponData): void {
    const percent = weapon.durability / weapon.maxDurability;
    const width = this.BAR_WIDTH * percent;

    // Choose color based on durability
    let color = 0x00ff00; // Green
    if (percent <= this.CRITICAL_THRESHOLD) {
      color = 0xff0000; // Red
    } else if (percent <= this.WARNING_THRESHOLD) {
      color = 0xffaa00; // Orange
    } else if (percent <= 0.5) {
      color = 0xffff00; // Yellow
    }

    bar.clear();
    bar.rect(0, 0, width, this.BAR_HEIGHT);
    bar.fill({ color });
  }

  /**
   * Show durability warning
   */
  private showWarning(weaponId: string, weaponName: string, durability: number): void {
    if (this.activeWarnings.has(weaponId)) return;

    const warning = new PIXI.Container();

    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(-100, -20, 200, 40, 8);
    bg.fill({ color: 0xff4400, alpha: 0.9 });
    warning.addChild(bg);

    // Warning icon
    const icon = new PIXI.Text({
      text: '⚠',
      style: {
        fontSize: 24,
        fill: 0xffffff
      }
    });
    icon.anchor.set(0.5);
    icon.position.set(-60, 0);
    warning.addChild(icon);

    // Text
    const text = new PIXI.Text({
      text: `${weaponName}\nDurability: ${durability}`,
      style: {
        fontSize: 12,
        fill: 0xffffff,
        align: 'center'
      }
    });
    text.anchor.set(0.5);
    text.position.set(20, 0);
    warning.addChild(text);

    this.warningContainer.addChild(warning);
    this.activeWarnings.add(weaponId);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      warning.destroy();
      this.activeWarnings.delete(weaponId);
    }, 3000);
  }

  /**
   * Update durability displays
   */
  update(deltaMs: number): void {
    const now = Date.now();

    // Clean up old displays
    for (const [id, display] of this.activeDisplays.entries()) {
      if (now - display.timestamp > this.DISPLAY_DURATION) {
        display.container.destroy();
        this.activeDisplays.delete(id);
      }
    }
  }

  /**
   * Handle low durability event
   */
  private handleLowDurability(data: { weaponId: string; durability: number }): void {
    // Get weapon name (simplified - should integrate with weapon system)
    const weaponName = data.weaponId.replace(/_/g, ' ').toUpperCase();
    this.showWarning(data.weaponId, weaponName, data.durability);
  }

  /**
   * Handle weapon broken event
   */
  private handleBroken(data: { weaponId: string }): void {
    const warning = new PIXI.Container();

    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(-120, -25, 240, 50, 8);
    bg.fill({ color: 0xff0000, alpha: 0.95 });
    warning.addChild(bg);

    // Text
    const text = new PIXI.Text({
      text: `${data.weaponId.toUpperCase()}\nBROKEN!`,
      style: {
        fontSize: 16,
        fill: 0xffffff,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    text.anchor.set(0.5);
    warning.addChild(text);

    this.warningContainer.addChild(warning);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      warning.destroy();
    }, 4000);
  }

  /**
   * Handle weapon repaired event
   */
  private handleRepaired(data: { weaponId: string }): void {
    const notification = new PIXI.Container();

    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(-100, -20, 200, 40, 8);
    bg.fill({ color: 0x00ff00, alpha: 0.9 });
    notification.addChild(bg);

    // Text
    const text = new PIXI.Text({
      text: `${data.weaponId.toUpperCase()}\nRepaired!`,
      style: {
        fontSize: 14,
        fill: 0xffffff,
        align: 'center'
      }
    });
    text.anchor.set(0.5);
    notification.addChild(text);

    this.warningContainer.addChild(notification);

    // Auto-hide after 2 seconds
    setTimeout(() => {
      notification.destroy();
    }, 2000);
  }

  /**
   * Clear all displays
   */
  clear(): void {
    for (const display of this.activeDisplays.values()) {
      display.container.destroy();
    }
    this.activeDisplays.clear();
  }

  /**
   * Dispose tool durability system
   */
  dispose(): void {
    this.clear();
    this.container.destroy();
    this.warningContainer.destroy();
  }
}
