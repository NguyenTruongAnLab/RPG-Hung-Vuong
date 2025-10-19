/**
 * ChunkSystem - Infinite world generation with chunk loading/unloading
 * 
 * Manages world chunks that are loaded/unloaded dynamically as the player moves.
 * Each chunk is 32x32 tiles and contains terrain, resources, and structures.
 * 
 * Uses localStorage to cache generated chunks for persistence.
 * 
 * @example
 * ```typescript
 * const chunkSystem = new ChunkSystem(biomeGenerator, worldContainer);
 * await chunkSystem.init();
 * 
 * // In update loop
 * chunkSystem.update(player.x, player.y);
 * ```
 */
import * as PIXI from 'pixi.js';
import { BiomeGenerator, BiomeType } from './BiomeGenerator';
import { CompositeTilemap } from '@pixi/tilemap';
import LZString from 'lz-string';

/**
 * Chunk coordinate (in chunk units, not tiles)
 */
export interface ChunkCoord {
  x: number;
  y: number;
}

/**
 * Tile data in a chunk
 */
export interface TileData {
  tileId: number;
  biome: BiomeType;
  hasResource: boolean;
  resourceType?: string;
}

/**
 * Chunk data structure
 */
export interface ChunkData {
  coord: ChunkCoord;
  tiles: TileData[][];
  generated: boolean;
  timestamp: number;
}

/**
 * Active chunk with visual representation
 */
interface ActiveChunk {
  data: ChunkData;
  tilemap: CompositeTilemap;
  resourceLayer: PIXI.Container;
}

/**
 * ChunkSystem class
 */
export class ChunkSystem {
  private biomeGenerator: BiomeGenerator;
  private worldContainer: PIXI.Container;
  private activeChunks: Map<string, ActiveChunk> = new Map();
  private chunkCache: Map<string, ChunkData> = new Map();
  
  // Chunk parameters
  public readonly CHUNK_SIZE = 32; // tiles per chunk
  public readonly TILE_SIZE = 32;  // pixels per tile
  private readonly LOAD_RADIUS = 3; // chunks to load around player
  private readonly UNLOAD_RADIUS = 5; // chunks to unload if beyond
  
  // Textures
  private tilesetTexture: PIXI.Texture | null = null;
  private resourceTextures: Map<string, PIXI.Texture> = new Map();
  
  // Cache settings
  private readonly CACHE_KEY_PREFIX = 'chunk_';
  private readonly MAX_CACHE_SIZE = 100; // max chunks in memory
  
  // Current player chunk
  private currentPlayerChunk: ChunkCoord = { x: 0, y: 0 };

  /**
   * Creates a new ChunkSystem
   * @param biomeGenerator - BiomeGenerator instance
   * @param worldContainer - PIXI container for world visuals
   */
  constructor(biomeGenerator: BiomeGenerator, worldContainer: PIXI.Container) {
    this.biomeGenerator = biomeGenerator;
    this.worldContainer = worldContainer;
  }

  /**
   * Initialize chunk system
   */
  async init(): Promise<void> {
    // Load tileset texture
    try {
      this.tilesetTexture = await PIXI.Assets.load('/assets/tilesets/world-tileset.png');
      console.log('✅ ChunkSystem: Tileset loaded');
    } catch (error) {
      console.warn('⚠️ ChunkSystem: Tileset not found, using placeholder');
      // Create placeholder texture
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      // Draw grid of colored tiles for different biomes
      const tileColors = [
        '#90EE90', '#228B22', '#808080', '#4169E1',
        '#FFD700', '#556B2F', '#E0FFFF', '#8B4513'
      ];
      
      for (let i = 0; i < 64; i++) {
        const x = (i % 8) * 64;
        const y = Math.floor(i / 8) * 64;
        ctx.fillStyle = tileColors[i % tileColors.length];
        ctx.fillRect(x, y, 64, 64);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, y, 64, 64);
      }
      
      this.tilesetTexture = PIXI.Texture.from(canvas);
    }
    
    // Load resource textures (trees, rocks, bushes, etc.)
    await this.loadResourceTextures();
    
    // Load initial chunks around spawn (0, 0)
    await this.loadChunksAround({ x: 0, y: 0 });
    
    console.log('✅ ChunkSystem initialized');
  }

  /**
   * Load resource textures
   */
  private async loadResourceTextures(): Promise<void> {
    const resourceTypes = ['tree', 'rock', 'bush', 'grass'];
    
    for (const type of resourceTypes) {
      try {
        const texture = await PIXI.Assets.load(`/assets/resources/${type}.png`);
        this.resourceTextures.set(type, texture);
      } catch (error) {
        // Create placeholder texture
        const graphics = new PIXI.Graphics();
        
        switch (type) {
          case 'tree':
            graphics.circle(0, 0, 16).fill({ color: 0x228B22 });
            graphics.circle(0, -10, 12).fill({ color: 0x006400 });
            break;
          case 'rock':
            graphics.rect(-12, -12, 24, 24).fill({ color: 0x808080 });
            break;
          case 'bush':
            graphics.circle(0, 0, 10).fill({ color: 0x90EE90 });
            break;
          case 'grass':
            graphics.rect(-4, -4, 8, 8).fill({ color: 0x7CFC00 });
            break;
        }
        
        const texture = PIXI.RenderTexture.create({ width: 32, height: 32 });
        // @ts-ignore - PixiJS v8 compatibility
        const renderer = PIXI.autoDetectRenderer();
        // @ts-ignore
        renderer.render({ container: graphics, target: texture });
        
        this.resourceTextures.set(type, texture);
      }
    }
  }

  /**
   * Update chunk loading based on player position
   * Call this every frame or when player moves significantly
   */
  update(playerX: number, playerY: number): void {
    // Convert player position to chunk coordinates
    const playerChunk: ChunkCoord = {
      x: Math.floor(playerX / (this.CHUNK_SIZE * this.TILE_SIZE)),
      y: Math.floor(playerY / (this.CHUNK_SIZE * this.TILE_SIZE))
    };
    
    // Only update if player changed chunks
    if (
      playerChunk.x !== this.currentPlayerChunk.x ||
      playerChunk.y !== this.currentPlayerChunk.y
    ) {
      this.currentPlayerChunk = playerChunk;
      this.updateChunkLoading(playerChunk);
    }
  }

  /**
   * Update which chunks are loaded/unloaded
   */
  private updateChunkLoading(playerChunk: ChunkCoord): void {
    // Load chunks within load radius
    this.loadChunksAround(playerChunk);
    
    // Unload chunks beyond unload radius
    this.unloadDistantChunks(playerChunk);
  }

  /**
   * Load chunks around a position
   */
  private async loadChunksAround(center: ChunkCoord): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (let dy = -this.LOAD_RADIUS; dy <= this.LOAD_RADIUS; dy++) {
      for (let dx = -this.LOAD_RADIUS; dx <= this.LOAD_RADIUS; dx++) {
        const chunkCoord: ChunkCoord = {
          x: center.x + dx,
          y: center.y + dy
        };
        
        const key = this.getChunkKey(chunkCoord);
        if (!this.activeChunks.has(key)) {
          promises.push(this.loadChunk(chunkCoord));
        }
      }
    }
    
    await Promise.all(promises);
  }

  /**
   * Load a single chunk
   */
  private async loadChunk(coord: ChunkCoord): Promise<void> {
    const key = this.getChunkKey(coord);
    
    // Check if already loaded
    if (this.activeChunks.has(key)) return;
    
    // Try to load from cache/localStorage
    let chunkData = this.loadChunkFromCache(coord);
    
    // Generate if not cached
    if (!chunkData) {
      chunkData = this.generateChunk(coord);
      this.saveChunkToCache(chunkData);
    }
    
    // Create visual representation
    const tilemap = this.createChunkTilemap(chunkData);
    const resourceLayer = this.createChunkResourceLayer(chunkData);
    
    // Add to world container
    this.worldContainer.addChild(tilemap);
    this.worldContainer.addChild(resourceLayer);
    
    // Store active chunk
    this.activeChunks.set(key, {
      data: chunkData,
      tilemap,
      resourceLayer
    });
  }

  /**
   * Generate chunk data procedurally
   */
  private generateChunk(coord: ChunkCoord): ChunkData {
    const tiles: TileData[][] = [];
    
    for (let y = 0; y < this.CHUNK_SIZE; y++) {
      const row: TileData[] = [];
      for (let x = 0; x < this.CHUNK_SIZE; x++) {
        const worldX = coord.x * this.CHUNK_SIZE + x;
        const worldY = coord.y * this.CHUNK_SIZE + y;
        
        const biomeData = this.biomeGenerator.getBiomeAt(worldX, worldY);
        const biomeConfig = this.biomeGenerator.getBiomeConfig(biomeData.biome);
        
        // Check if resource should spawn
        const hasTree = this.biomeGenerator.shouldSpawnResource(biomeData, 'trees', worldX, worldY);
        const hasRock = this.biomeGenerator.shouldSpawnResource(biomeData, 'rocks', worldX, worldY);
        const hasBush = this.biomeGenerator.shouldSpawnResource(biomeData, 'bushes', worldX, worldY);
        
        let resourceType: string | undefined;
        let hasResource = false;
        
        if (hasTree) {
          resourceType = 'tree';
          hasResource = true;
        } else if (hasRock) {
          resourceType = 'rock';
          hasResource = true;
        } else if (hasBush) {
          resourceType = 'bush';
          hasResource = true;
        }
        
        row.push({
          tileId: biomeConfig.tileId,
          biome: biomeData.biome,
          hasResource,
          resourceType
        });
      }
      tiles.push(row);
    }
    
    return {
      coord,
      tiles,
      generated: true,
      timestamp: Date.now()
    };
  }

  /**
   * Create tilemap visual for chunk
   */
  private createChunkTilemap(chunkData: ChunkData): CompositeTilemap {
    const tilemap = new CompositeTilemap();
    const offsetX = chunkData.coord.x * this.CHUNK_SIZE * this.TILE_SIZE;
    const offsetY = chunkData.coord.y * this.CHUNK_SIZE * this.TILE_SIZE;
    
    if (!this.tilesetTexture) return tilemap;
    
    for (let y = 0; y < this.CHUNK_SIZE; y++) {
      for (let x = 0; x < this.CHUNK_SIZE; x++) {
        const tile = chunkData.tiles[y][x];
        const tileX = offsetX + x * this.TILE_SIZE;
        const tileY = offsetY + y * this.TILE_SIZE;
        
        // Calculate texture frame based on tileId
        const frameX = (tile.tileId % 8) * 64;
        const frameY = Math.floor(tile.tileId / 8) * 64;
        
        // Use texture region for tile
        const tileTexture = new PIXI.Texture({
          source: this.tilesetTexture.source,
          frame: new PIXI.Rectangle(frameX, frameY, 64, 64)
        });
        
        tilemap.tile(
          tileTexture,
          tileX,
          tileY
        );
      }
    }
    
    return tilemap;
  }

  /**
   * Create resource layer for chunk
   */
  private createChunkResourceLayer(chunkData: ChunkData): PIXI.Container {
    const container = new PIXI.Container();
    const offsetX = chunkData.coord.x * this.CHUNK_SIZE * this.TILE_SIZE;
    const offsetY = chunkData.coord.y * this.CHUNK_SIZE * this.TILE_SIZE;
    
    for (let y = 0; y < this.CHUNK_SIZE; y++) {
      for (let x = 0; x < this.CHUNK_SIZE; x++) {
        const tile = chunkData.tiles[y][x];
        
        if (tile.hasResource && tile.resourceType) {
          const texture = this.resourceTextures.get(tile.resourceType);
          if (texture) {
            const sprite = new PIXI.Sprite(texture);
            sprite.x = offsetX + x * this.TILE_SIZE + this.TILE_SIZE / 2;
            sprite.y = offsetY + y * this.TILE_SIZE + this.TILE_SIZE / 2;
            sprite.anchor.set(0.5);
            container.addChild(sprite);
          }
        }
      }
    }
    
    return container;
  }

  /**
   * Unload chunks beyond unload radius
   */
  private unloadDistantChunks(playerChunk: ChunkCoord): void {
    const toUnload: string[] = [];
    
    this.activeChunks.forEach((chunk, key) => {
      const dx = Math.abs(chunk.data.coord.x - playerChunk.x);
      const dy = Math.abs(chunk.data.coord.y - playerChunk.y);
      
      if (dx > this.UNLOAD_RADIUS || dy > this.UNLOAD_RADIUS) {
        toUnload.push(key);
      }
    });
    
    toUnload.forEach(key => this.unloadChunk(key));
  }

  /**
   * Unload a single chunk
   */
  private unloadChunk(key: string): void {
    const chunk = this.activeChunks.get(key);
    if (!chunk) return;
    
    // Remove from world
    this.worldContainer.removeChild(chunk.tilemap);
    this.worldContainer.removeChild(chunk.resourceLayer);
    
    // Destroy resources
    chunk.tilemap.destroy();
    chunk.resourceLayer.destroy({ children: true });
    
    // Remove from active chunks
    this.activeChunks.delete(key);
  }

  /**
   * Get chunk key for coordinates
   */
  private getChunkKey(coord: ChunkCoord): string {
    return `${coord.x},${coord.y}`;
  }

  /**
   * Load chunk from cache
   */
  private loadChunkFromCache(coord: ChunkCoord): ChunkData | null {
    const key = this.getChunkKey(coord);
    
    // Check memory cache first
    if (this.chunkCache.has(key)) {
      return this.chunkCache.get(key)!;
    }
    
    // Check localStorage
    const storageKey = this.CACHE_KEY_PREFIX + key;
    const compressed = localStorage.getItem(storageKey);
    
    if (compressed) {
      try {
        const json = LZString.decompressFromUTF16(compressed);
        if (json) {
          const data: ChunkData = JSON.parse(json);
          this.chunkCache.set(key, data);
          return data;
        }
      } catch (error) {
        console.warn(`Failed to load chunk ${key}:`, error);
      }
    }
    
    return null;
  }

  /**
   * Save chunk to cache
   */
  private saveChunkToCache(chunkData: ChunkData): void {
    const key = this.getChunkKey(chunkData.coord);
    
    // Save to memory cache
    this.chunkCache.set(key, chunkData);
    
    // Limit cache size
    if (this.chunkCache.size > this.MAX_CACHE_SIZE) {
      const firstKey = this.chunkCache.keys().next().value;
      this.chunkCache.delete(firstKey);
    }
    
    // Save to localStorage (compressed)
    try {
      const json = JSON.stringify(chunkData);
      const compressed = LZString.compressToUTF16(json);
      const storageKey = this.CACHE_KEY_PREFIX + key;
      localStorage.setItem(storageKey, compressed);
    } catch (error) {
      console.warn(`Failed to save chunk ${key}:`, error);
    }
  }

  /**
   * Clear all cached chunks (use for new worlds)
   */
  clearCache(): void {
    this.chunkCache.clear();
    
    // Clear localStorage chunks
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Get active chunk count
   */
  getActiveChunkCount(): number {
    return this.activeChunks.size;
  }

  /**
   * Get cached chunk count
   */
  getCachedChunkCount(): number {
    return this.chunkCache.size;
  }

  /**
   * Dispose of chunk system
   */
  dispose(): void {
    this.activeChunks.forEach(chunk => {
      chunk.tilemap.destroy();
      chunk.resourceLayer.destroy({ children: true });
    });
    
    this.activeChunks.clear();
    this.chunkCache.clear();
  }
}
