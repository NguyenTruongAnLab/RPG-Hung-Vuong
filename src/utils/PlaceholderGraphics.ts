/**
 * PlaceholderGraphics - Creates fallback graphics when assets are missing
 * 
 * Used in production deployments where proprietary assets cannot be distributed.
 * Generates simple colored shapes to represent monsters/characters.
 * 
 * @example
 * ```typescript
 * const placeholder = PlaceholderGraphics.createMonsterPlaceholder('Absolution', 100, 100);
 * stage.addChild(placeholder);
 * ```
 */
import * as PIXI from 'pixi.js';

export class PlaceholderGraphics {
  /**
   * Create a placeholder rectangle for missing monster assets
   * 
   * @param characterName - Name of the character (used for color)
   * @param width - Width in pixels
   * @param height - Height in pixels
   * @returns A PIXI Container with placeholder graphics
   */
  static createMonsterPlaceholder(
    characterName: string,
    width: number = 100,
    height: number = 100
  ): PIXI.Container {
    const container = new PIXI.Container();
    
    // Generate consistent color from character name hash
    const color = this.getColorFromName(characterName);
    
    // Create main body rectangle
    const body = new PIXI.Graphics();
    body.rect(0, 0, width, height);
    body.fill(color);
    body.stroke({ width: 2, color: 0xffffff });
    
    container.addChild(body);
    
    // Add character name text
    const text = new PIXI.Text({
      text: characterName.substring(0, 3).toUpperCase(),
      style: {
        fontSize: Math.min(width / 3, 12),
        fill: 0xffffff,
        fontWeight: 'bold',
        align: 'center'
      }
    });
    text.position.set(width / 2, height / 2);
    text.anchor.set(0.5, 0.5);
    container.addChild(text);
    
    return container;
  }

  /**
   * Create a placeholder for NPC characters
   */
  static createNPCPlaceholder(npcName: string): PIXI.Container {
    const container = new PIXI.Container();
    
    const color = this.getColorFromName(npcName);
    
    // Circle for NPC head
    const head = new PIXI.Graphics();
    head.circle(0, 0, 20);
    head.fill(color);
    head.stroke({ width: 1, color: 0xffffff });
    
    container.addChild(head);
    
    return container;
  }

  /**
   * Create a loading spinner placeholder
   */
  static createLoadingSpinner(): PIXI.Container {
    const container = new PIXI.Container();
    
    const circle = new PIXI.Graphics();
    circle.circle(0, 0, 15);
    circle.stroke({ width: 2, color: 0xffffff });
    
    container.addChild(circle);
    
    // Add rotation animation hint
    const text = new PIXI.Text({
      text: 'Loading...',
      style: {
        fontSize: 10,
        fill: 0xffffff
      }
    });
    text.position.y = 25;
    text.anchor.x = 0.5;
    container.addChild(text);
    
    return container;
  }

  /**
   * Generate a consistent color from a name string
   * Same name always produces same color
   */
  private static getColorFromName(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to RGB, ensuring non-zero values
    const r = Math.abs((hash >> 0) % 256) | 0x40; // Ensure min brightness
    const g = Math.abs((hash >> 8) % 256) | 0x40;
    const b = Math.abs((hash >> 16) % 256) | 0x40;
    
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Create an error indicator graphic
   */
  static createErrorGraphic(message: string = 'Asset Missing'): PIXI.Container {
    const container = new PIXI.Container();
    
    // Red X
    const graphics = new PIXI.Graphics();
    graphics.moveTo(-15, -15);
    graphics.lineTo(15, 15);
    graphics.moveTo(15, -15);
    graphics.lineTo(-15, 15);
    graphics.stroke({ width: 3, color: 0xff0000 });
    
    container.addChild(graphics);
    
    // Error text
    const text = new PIXI.Text({
      text: message,
      style: {
        fontSize: 8,
        fill: 0xff0000
      }
    });
    text.position.y = 20;
    text.anchor.x = 0.5;
    container.addChild(text);
    
    return container;
  }
}
