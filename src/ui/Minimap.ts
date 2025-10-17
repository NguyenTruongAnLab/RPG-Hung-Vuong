/**
 * Minimap - Real-time minimap display
 * 
 * Shows a small map of the current area with player position,
 * NPCs, and points of interest. Supports fog of war for explored areas.
 * 
 * @example
 * ```typescript
 * const minimap = new Minimap(200, 200);
 * minimap.setMapSize(1000, 1000);
 * minimap.updatePlayerPosition(playerX, playerY);
 * stage.addChild(minimap.getContainer());
 * ```
 */
import * as PIXI from 'pixi.js';

/**
 * Point of interest on minimap
 */
export interface MapPOI {
  x: number;
  y: number;
  type: 'npc' | 'quest' | 'shop' | 'landmark';
  color: number;
}

/**
 * Minimap class
 */
export class Minimap {
  private container: PIXI.Container;
  private mapContainer: PIXI.Container;
  private background: PIXI.Graphics;
  private border: PIXI.Graphics;
  private playerMarker: PIXI.Graphics;
  private poiMarkers: Map<string, PIXI.Graphics> = new Map();
  private fogOfWar: PIXI.Graphics;
  
  private width: number;
  private height: number;
  private mapWidth: number = 1000;
  private mapHeight: number = 1000;
  private scale: number = 0.1;
  private visible: boolean = true;
  private exploredAreas: Set<string> = new Set();

  /**
   * Create minimap
   * @param width - Minimap width in pixels
   * @param height - Minimap height in pixels
   */
  constructor(width: number = 200, height: number = 200) {
    this.width = width;
    this.height = height;

    // Main container
    this.container = new PIXI.Container();
    this.container.x = 20;
    this.container.y = 20;
    this.container.zIndex = 999;

    // Map container (for scaling)
    this.mapContainer = new PIXI.Container();
    this.container.addChild(this.mapContainer);

    // Background
    this.background = new PIXI.Graphics();
    this.background.rect(0, 0, width, height);
    this.background.fill({ color: 0x1a1a2e, alpha: 0.8 });
    this.mapContainer.addChild(this.background);

    // Fog of war (unexplored areas)
    this.fogOfWar = new PIXI.Graphics();
    this.mapContainer.addChild(this.fogOfWar);

    // Player marker
    this.playerMarker = new PIXI.Graphics();
    this.playerMarker.circle(0, 0, 4);
    this.playerMarker.fill({ color: 0x00ff00 });
    this.playerMarker.stroke({ width: 1, color: 0xffffff });
    this.mapContainer.addChild(this.playerMarker);

    // Border
    this.border = new PIXI.Graphics();
    this.border.rect(0, 0, width, height);
    this.border.stroke({ width: 2, color: 0x4a4a6a });
    this.container.addChild(this.border);

    // Title label
    const title = new PIXI.Text({
      text: 'Minimap',
      style: {
        fontSize: 14,
        fill: 0xffffff,
        fontFamily: 'Arial'
      }
    });
    title.x = 5;
    title.y = -20;
    this.container.addChild(title);
  }

  /**
   * Set world map size
   * @param mapWidth - Map width
   * @param mapHeight - Map height
   */
  setMapSize(mapWidth: number, mapHeight: number): void {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.updateScale();
  }

  /**
   * Update scale to fit map
   */
  private updateScale(): void {
    const scaleX = this.width / this.mapWidth;
    const scaleY = this.height / this.mapHeight;
    this.scale = Math.min(scaleX, scaleY);
  }

  /**
   * Convert world coordinates to minimap coordinates
   * @param worldX - World X
   * @param worldY - World Y
   * @returns Minimap coordinates
   */
  private worldToMinimap(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.scale,
      y: worldY * this.scale
    };
  }

  /**
   * Update player position
   * @param x - World X position
   * @param y - World Y position
   */
  updatePlayerPosition(x: number, y: number): void {
    const pos = this.worldToMinimap(x, y);
    this.playerMarker.x = pos.x;
    this.playerMarker.y = pos.y;

    // Mark area as explored
    const gridX = Math.floor(x / 100);
    const gridY = Math.floor(y / 100);
    const key = `${gridX},${gridY}`;
    
    if (!this.exploredAreas.has(key)) {
      this.exploredAreas.add(key);
      this.updateFogOfWar();
    }
  }

  /**
   * Update fog of war
   */
  private updateFogOfWar(): void {
    this.fogOfWar.clear();
    
    // Draw fog over entire map
    this.fogOfWar.rect(0, 0, this.width, this.height);
    this.fogOfWar.fill({ color: 0x000000, alpha: 0.7 });

    // Clear explored areas
    for (const areaKey of this.exploredAreas) {
      const [gridX, gridY] = areaKey.split(',').map(Number);
      const pos = this.worldToMinimap(gridX * 100, gridY * 100);
      const size = 100 * this.scale;

      this.fogOfWar.rect(pos.x, pos.y, size, size);
      this.fogOfWar.cut();
    }
  }

  /**
   * Add point of interest
   * @param id - POI ID
   * @param poi - POI data
   */
  addPOI(id: string, poi: MapPOI): void {
    if (this.poiMarkers.has(id)) {
      this.removePOI(id);
    }

    const pos = this.worldToMinimap(poi.x, poi.y);
    const marker = new PIXI.Graphics();
    
    // Different shapes for different types
    switch (poi.type) {
      case 'npc':
        marker.circle(pos.x, pos.y, 3);
        break;
      case 'quest':
        // Triangle
        marker.moveTo(pos.x, pos.y - 4);
        marker.lineTo(pos.x - 3, pos.y + 2);
        marker.lineTo(pos.x + 3, pos.y + 2);
        marker.lineTo(pos.x, pos.y - 4);
        break;
      case 'shop':
        marker.rect(pos.x - 3, pos.y - 3, 6, 6);
        break;
      case 'landmark':
        // Star
        const points = 5;
        const outerRadius = 4;
        const innerRadius = 2;
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / points;
          const x = pos.x + Math.cos(angle) * radius;
          const y = pos.y + Math.sin(angle) * radius;
          if (i === 0) {
            marker.moveTo(x, y);
          } else {
            marker.lineTo(x, y);
          }
        }
        marker.closePath();
        break;
    }

    marker.fill({ color: poi.color });
    marker.stroke({ width: 1, color: 0xffffff });

    this.mapContainer.addChild(marker);
    this.poiMarkers.set(id, marker);
  }

  /**
   * Remove point of interest
   * @param id - POI ID
   */
  removePOI(id: string): void {
    const marker = this.poiMarkers.get(id);
    if (marker) {
      this.mapContainer.removeChild(marker);
      marker.destroy();
      this.poiMarkers.delete(id);
    }
  }

  /**
   * Clear all POIs
   */
  clearPOIs(): void {
    for (const [id, marker] of this.poiMarkers.entries()) {
      this.mapContainer.removeChild(marker);
      marker.destroy();
    }
    this.poiMarkers.clear();
  }

  /**
   * Toggle minimap visibility
   */
  toggle(): void {
    this.visible = !this.visible;
    this.container.visible = this.visible;
  }

  /**
   * Show minimap
   */
  show(): void {
    this.visible = true;
    this.container.visible = true;
  }

  /**
   * Hide minimap
   */
  hide(): void {
    this.visible = false;
    this.container.visible = false;
  }

  /**
   * Get container
   * @returns Container
   */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Set position
   * @param x - X position
   * @param y - Y position
   */
  setPosition(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
  }

  /**
   * Reset explored areas
   */
  resetFogOfWar(): void {
    this.exploredAreas.clear();
    this.updateFogOfWar();
  }

  /**
   * Export explored areas
   * @returns Explored areas as array
   */
  exportExploredAreas(): string[] {
    return Array.from(this.exploredAreas);
  }

  /**
   * Import explored areas
   * @param areas - Explored areas
   */
  importExploredAreas(areas: string[]): void {
    this.exploredAreas = new Set(areas);
    this.updateFogOfWar();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearPOIs();
    this.container.destroy({ children: true });
  }
}
