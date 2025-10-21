import * as PIXI from 'pixi.js';

/**
 * ParallaxBackground
 * Multi-layer scrolling background with parallax effect
 * 
 * Features:
 * - 3 layers (far, middle, near) with different scroll speeds
 * - Vietnamese cultural motifs (mountains, temples, forests)
 * - Auto-generated procedural backgrounds
 * - Camera-following parallax scrolling
 * 
 * @example
 * const bg = new ParallaxBackground(app, 'temple'); // or 'forest', 'arena', 'landscape'
 * container.addChildAt(bg.container, 0); // Add to back
 * bg.update(camera.x, camera.y); // Call every frame
 */
export class ParallaxBackground {
  private container: PIXI.Container;
  private layers: PIXI.TilingSprite[] = [];
  private layerSpeeds = [0.2, 0.5, 0.8]; // Parallax scroll speeds (far → near)
  private theme: 'temple' | 'forest' | 'arena' | 'landscape';

  /**
   * @param app - PixiJS application
   * @param theme - Background theme
   */
  constructor(app: PIXI.Application, theme: 'temple' | 'forest' | 'arena' | 'landscape' = 'forest') {
    this.container = new PIXI.Container();
    this.theme = theme;
    this.createLayers(app);
  }

  /**
   * Create parallax layers
   */
  private createLayers(app: PIXI.Application): void {
    const width = app.screen.width;
    const height = app.screen.height;

    // Layer 1: Far background (sky gradient)
    const farLayer = this.createSkyLayer(width, height);
    this.container.addChild(farLayer);
    this.layers.push(farLayer);

    // Layer 2: Middle background (mountains/buildings)
    const middleLayer = this.createMiddleLayer(width, height);
    this.container.addChild(middleLayer);
    this.layers.push(middleLayer);

    // Layer 3: Near background (trees/foreground)
    const nearLayer = this.createNearLayer(width, height);
    this.container.addChild(nearLayer);
    this.layers.push(nearLayer);
  }

  /**
   * Create sky layer (gradient)
   */
  private createSkyLayer(width: number, height: number): PIXI.TilingSprite {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Theme-specific gradient colors
    const gradients: Record<string, { top: string; bottom: string }> = {
      temple: { top: '#87CEEB', bottom: '#FFE5B4' }, // Sky blue → peach
      forest: { top: '#4A7C59', bottom: '#8FBC8F' }, // Dark green → sage
      arena: { top: '#4B0082', bottom: '#8B008B' }, // Indigo → dark magenta
      landscape: { top: '#87CEEB', bottom: '#F0E68C' } // Sky blue → khaki
    };

    const colors = gradients[this.theme];
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.top);
    gradient.addColorStop(1, colors.bottom);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const texture = PIXI.Texture.from(canvas);
    const sprite = new PIXI.TilingSprite({
      texture,
      width: width * 2,
      height
    });

    return sprite;
  }

  /**
   * Create middle layer (mountains/buildings)
   */
  private createMiddleLayer(width: number, height: number): PIXI.TilingSprite {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height / 2;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = this.getMiddleLayerColor();
    
    // Draw stylized mountains or buildings
    if (this.theme === 'temple' || this.theme === 'arena') {
      this.drawTemplesSilhouette(ctx, width, height / 2);
    } else {
      this.drawMountainsSilhouette(ctx, width, height / 2);
    }

    const texture = PIXI.Texture.from(canvas);
    const sprite = new PIXI.TilingSprite({
      texture,
      width: width * 2,
      height: height / 2
    });
    sprite.y = height / 2;

    return sprite;
  }

  /**
   * Create near layer (trees/foreground)
   */
  private createNearLayer(width: number, height: number): PIXI.TilingSprite {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height / 3;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = this.getNearLayerColor();
    
    // Draw trees or grass silhouettes
    if (this.theme === 'forest' || this.theme === 'landscape') {
      this.drawTreesSilhouette(ctx, width, height / 3);
    } else {
      this.drawGrassSilhouette(ctx, width, height / 3);
    }

    const texture = PIXI.Texture.from(canvas);
    const sprite = new PIXI.TilingSprite({
      texture,
      width: width * 2,
      height: height / 3
    });
    sprite.y = height - height / 3;

    return sprite;
  }

  /**
   * Get middle layer color based on theme
   */
  private getMiddleLayerColor(): string {
    const colors: Record<string, string> = {
      temple: '#8B4513', // Saddle brown (temple roofs)
      forest: '#2F4F2F', // Dark slate gray (distant trees)
      arena: '#4B0082', // Indigo (dark structures)
      landscape: '#696969' // Dim gray (mountains)
    };
    return colors[this.theme];
  }

  /**
   * Get near layer color based on theme
   */
  private getNearLayerColor(): string {
    const colors: Record<string, string> = {
      temple: '#006400', // Dark green (garden trees)
      forest: '#1C3A1C', // Very dark green (foreground trees)
      arena: '#2F2F2F', // Dark gray (foreground structures)
      landscape: '#3C5A3C' // Forest green (grass)
    };
    return colors[this.theme];
  }

  /**
   * Draw mountains silhouette
   */
  private drawMountainsSilhouette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    // Create 3-4 mountain peaks
    for (let i = 0; i < 4; i++) {
      const peakX = (width / 4) * i + width / 8;
      const peakY = height * (0.2 + Math.random() * 0.3);
      ctx.lineTo(peakX, peakY);
    }
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draw temples silhouette
   */
  private drawTemplesSilhouette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Draw simple pagoda/temple shapes
    for (let i = 0; i < 3; i++) {
      const x = (width / 3) * i + width / 6;
      const y = height * 0.4;
      const w = 60;
      const h = 80;
      
      // Pagoda tiers
      ctx.fillRect(x - w / 2, y, w, h);
      ctx.fillRect(x - w / 3, y - 20, w * 0.66, 20);
      ctx.fillRect(x - w / 4, y - 35, w * 0.5, 15);
    }
  }

  /**
   * Draw trees silhouette
   */
  private drawTreesSilhouette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Draw simple tree shapes
    for (let i = 0; i < 10; i++) {
      const x = (width / 10) * i + Math.random() * 30;
      const treeHeight = height * (0.6 + Math.random() * 0.4);
      
      // Tree trunk
      ctx.fillRect(x - 5, height - treeHeight, 10, treeHeight);
      
      // Tree crown (triangle)
      ctx.beginPath();
      ctx.moveTo(x, height - treeHeight - 30);
      ctx.lineTo(x - 20, height - treeHeight);
      ctx.lineTo(x + 20, height - treeHeight);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Draw grass silhouette
   */
  private drawGrassSilhouette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Draw grass blades
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const grassHeight = height * (0.3 + Math.random() * 0.4);
      ctx.fillRect(x, height - grassHeight, 2, grassHeight);
    }
  }

  /**
   * Update parallax scroll based on camera position
   * @param cameraX - Camera X position
   * @param cameraY - Camera Y position
   */
  update(cameraX: number, cameraY: number): void {
    this.layers.forEach((layer, index) => {
      layer.tilePosition.x = -cameraX * this.layerSpeeds[index];
      layer.tilePosition.y = -cameraY * this.layerSpeeds[index] * 0.5; // Less vertical parallax
    });
  }

  /**
   * Get the container
   */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.layers.forEach(layer => layer.destroy({ texture: true, textureSource: true }));
    this.container.destroy();
  }
}
