/**
 * OverworldUI - UI overlay for overworld scene
 * 
 * Displays HP bar, controls hint, and other UI elements.
 * 
 * @example
 * ```typescript
 * const ui = new OverworldUI(app);
 * ui.updateHP(75, 100);
 * stage.addChild(ui.getContainer());
 * ```
 */
import * as PIXI from 'pixi.js';

export class OverworldUI {
  private container: PIXI.Container;
  private hpBar: PIXI.Graphics;
  private hpBarBg: PIXI.Graphics;
  private hpText: PIXI.Text;
  private controlsText: PIXI.Text;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.container = new PIXI.Container();
    
    this.createHPBar();
    this.createControlsHint();
  }

  /**
   * Creates HP bar display
   */
  private createHPBar(): void {
    // HP bar background
    this.hpBarBg = new PIXI.Graphics();
    this.hpBarBg.rect(10, 10, 204, 24);
    this.hpBarBg.fill(0x333333);
    this.hpBarBg.stroke({ width: 2, color: 0x000000 });
    this.container.addChild(this.hpBarBg);

    // HP bar fill
    this.hpBar = new PIXI.Graphics();
    this.container.addChild(this.hpBar);

    // HP text
    this.hpText = new PIXI.Text({
      text: 'HP: 100/100',
      style: {
        fontSize: 16,
        fill: 0xffffff,
        fontFamily: 'Arial'
      }
    });
    this.hpText.x = 15;
    this.hpText.y = 13;
    this.container.addChild(this.hpText);
  }

  /**
   * Creates controls hint text
   */
  private createControlsHint(): void {
    this.controlsText = new PIXI.Text({
      text: 'WASD/Arrows: Move | Space: Attack | E: Interact | Mouse Wheel: Zoom',
      style: {
        fontSize: 14,
        fill: 0xcccccc,
        fontFamily: 'Arial'
      }
    });
    this.controlsText.x = 10;
    this.controlsText.y = this.height - 30;
    this.container.addChild(this.controlsText);
  }

  /**
   * Updates HP bar display
   * 
   * @param currentHP - Current HP value
   * @param maxHP - Maximum HP value
   * 
   * @example
   * ```typescript
   * ui.updateHP(75, 100);
   * ```
   */
  public updateHP(currentHP: number, maxHP: number): void {
    const hpPercent = currentHP / maxHP;
    const barWidth = 200 * hpPercent;

    // Update HP bar
    this.hpBar.clear();
    this.hpBar.rect(12, 12, barWidth, 20);
    
    // Color based on HP percentage
    let color = 0x00ff00; // Green
    if (hpPercent < 0.5) {
      color = 0xffff00; // Yellow
    }
    if (hpPercent < 0.25) {
      color = 0xff0000; // Red
    }
    
    this.hpBar.fill(color);

    // Update HP text
    this.hpText.text = `HP: ${currentHP}/${maxHP}`;
  }

  /**
   * Shows encounter message
   * 
   * @param message - Message to display
   * @param duration - Display duration in ms
   */
  public showEncounterMessage(message: string, duration: number = 2000): void {
    const messageText = new PIXI.Text({
      text: message,
      style: {
        fontSize: 24,
        fill: 0xff0000,
        fontWeight: 'bold',
        fontFamily: 'Arial',
        stroke: { color: 0x000000, width: 4 }
      }
    });
    
    messageText.anchor.set(0.5);
    messageText.x = this.width / 2;
    messageText.y = this.height / 2;
    
    this.container.addChild(messageText);

    // Fade out and remove
    setTimeout(() => {
      let alpha = 1;
      const fadeInterval = setInterval(() => {
        alpha -= 0.05;
        messageText.alpha = alpha;
        
        if (alpha <= 0) {
          clearInterval(fadeInterval);
          this.container.removeChild(messageText);
        }
      }, 50);
    }, duration);
  }

  /**
   * Gets the UI container
   * @returns PIXI container
   */
  public getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Destroys the UI
   */
  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
