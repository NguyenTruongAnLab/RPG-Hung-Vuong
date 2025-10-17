/**
 * Tilemap - Tilemap rendering with @pixi/tilemap
 * 
 * Efficiently renders tile-based maps using @pixi/tilemap.
 * Supports Tiled JSON format maps.
 * 
 * @example
 * ```typescript
 * const tilemap = new Tilemap();
 * await tilemap.load(mapData, tileset);
 * stage.addChild(tilemap.getContainer());
 * ```
 */
import * as PIXI from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';

export interface TilemapData {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  layers: TilemapLayer[];
}

export interface TilemapLayer {
  name: string;
  data: number[];
  width: number;
  height: number;
  visible?: boolean;
  properties?: Record<string, any>;
}

export class Tilemap {
  private container: PIXI.Container;
  private compositeTilemap: CompositeTilemap;
  private mapData: TilemapData | null = null;
  private tileset: PIXI.Texture | null = null;
  private tileWidth: number = 32;
  private tileHeight: number = 32;

  constructor() {
    this.container = new PIXI.Container();
    this.compositeTilemap = new CompositeTilemap();
    
    // Ensure the composite tilemap is properly initialized
    // by adding it to the container immediately
    this.container.addChild(this.compositeTilemap);
    
    // Force the tilemap to be renderable
    this.compositeTilemap.interactiveChildren = false;
  }

  /**
   * Loads and renders a tilemap
   * 
   * @param mapData - Tilemap data in Tiled JSON format
   * @param tileset - Tileset texture
   * 
   * @example
   * ```typescript
   * const texture = await PIXI.Assets.load('tileset.png');
   * tilemap.load(mapData, texture);
   * ```
   */
  public load(mapData: TilemapData, tileset: PIXI.Texture): void {
    this.mapData = mapData;
    this.tileset = tileset;
    this.tileWidth = mapData.tileWidth;
    this.tileHeight = mapData.tileHeight;

    this.render();
  }

  /**
   * Renders the tilemap
   */
  private render(): void {
    if (!this.mapData || !this.tileset) {
      console.warn('Tilemap data or tileset not loaded');
      return;
    }

    // Clear existing tiles
    this.compositeTilemap.clear();

    // Render each layer
    for (const layer of this.mapData.layers) {
      if (layer.visible === false) {
        continue;
      }

      this.renderLayer(layer);
    }
  }

  /**
   * Renders a single layer
   */
  private renderLayer(layer: TilemapLayer): void {
    if (!this.tileset) return;

    for (let i = 0; i < layer.data.length; i++) {
      const gid = layer.data[i];
      
      // Skip empty tiles (gid 0)
      if (gid === 0) {
        continue;
      }

      // Calculate tile position
      const x = (i % layer.width) * this.tileWidth;
      const y = Math.floor(i / layer.width) * this.tileHeight;

      // Calculate tile index (gid - 1 for 0-based indexing)
      const tileIndex = gid - 1;

      // Add tile to composite tilemap
      this.compositeTilemap.tile(
        this.tileset,
        x,
        y,
        {
          tileWidth: this.tileWidth,
          tileHeight: this.tileHeight,
          u: (tileIndex * this.tileWidth) % this.tileset.width,
          v: Math.floor((tileIndex * this.tileWidth) / this.tileset.width) * this.tileHeight
        }
      );
    }
  }

  /**
   * Gets the tilemap container
   * @returns PIXI container with rendered tilemap
   */
  public getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Gets tile at position
   * 
   * @param x - X coordinate in pixels
   * @param y - Y coordinate in pixels
   * @param layerName - Layer name (optional, defaults to first layer)
   * @returns Tile GID or 0 if empty
   */
  public getTileAt(x: number, y: number, layerName?: string): number {
    if (!this.mapData) return 0;

    const tileX = Math.floor(x / this.tileWidth);
    const tileY = Math.floor(y / this.tileHeight);

    // Find layer
    const layer = layerName
      ? this.mapData.layers.find(l => l.name === layerName)
      : this.mapData.layers[0];

    if (!layer) return 0;

    // Check bounds
    if (tileX < 0 || tileX >= layer.width || tileY < 0 || tileY >= layer.height) {
      return 0;
    }

    const index = tileY * layer.width + tileX;
    return layer.data[index];
  }

  /**
   * Gets layer by name
   * 
   * @param name - Layer name
   * @returns Layer data or undefined
   */
  public getLayer(name: string): TilemapLayer | undefined {
    return this.mapData?.layers.find(l => l.name === name);
  }

  /**
   * Gets all layers
   * @returns Array of layers
   */
  public getLayers(): TilemapLayer[] {
    return this.mapData?.layers ?? [];
  }

  /**
   * Gets map width in pixels
   * @returns Width in pixels
   */
  public getWidth(): number {
    return (this.mapData?.width ?? 0) * this.tileWidth;
  }

  /**
   * Gets map height in pixels
   * @returns Height in pixels
   */
  public getHeight(): number {
    return (this.mapData?.height ?? 0) * this.tileHeight;
  }

  /**
   * Gets tile width
   * @returns Tile width in pixels
   */
  public getTileWidth(): number {
    return this.tileWidth;
  }

  /**
   * Gets tile height
   * @returns Tile height in pixels
   */
  public getTileHeight(): number {
    return this.tileHeight;
  }

  /**
   * Converts world position to tile coordinates
   * 
   * @param x - World X position
   * @param y - World Y position
   * @returns Tile coordinates
   */
  public worldToTile(x: number, y: number): { tileX: number; tileY: number } {
    return {
      tileX: Math.floor(x / this.tileWidth),
      tileY: Math.floor(y / this.tileHeight)
    };
  }

  /**
   * Converts tile coordinates to world position
   * 
   * @param tileX - Tile X coordinate
   * @param tileY - Tile Y coordinate
   * @returns World position (top-left of tile)
   */
  public tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * this.tileWidth,
      y: tileY * this.tileHeight
    };
  }

  /**
   * Destroys the tilemap
   */
  public destroy(): void {
    this.compositeTilemap.destroy();
    this.container.destroy();
  }
}
