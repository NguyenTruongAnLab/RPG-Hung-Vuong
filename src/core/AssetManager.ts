import * as PIXI from 'pixi.js';
import type { DragonBonesAsset } from './DragonBonesManager';

/**
 * AssetManager - Handles lazy loading and caching of game assets
 * 
 * The AssetManager is responsible for loading and caching the 200 monster
 * DragonBones assets. It uses lazy loading to prevent memory issues.
 * 
 * @example
 * ```typescript
 * const assetManager = AssetManager.getInstance();
 * const asset = await assetManager.loadMonsterAsset('char001');
 * 
 * // Preload multiple monsters
 * await assetManager.preloadMonsters(['char001', 'char002', 'char003']);
 * ```
 */
export class AssetManager {
  private static instance: AssetManager;
  private loadedAssets = new Map<string, DragonBonesAsset>();
  private loadingPromises = new Map<string, Promise<DragonBonesAsset>>();

  private constructor() {
    // Singleton pattern
  }

  /**
   * Gets the singleton instance of AssetManager
   */
  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Loads a monster's DragonBones assets
   * 
   * Assets are loaded lazily and cached. If an asset is already loaded,
   * it returns the cached version immediately.
   * 
   * @param monsterId - The monster ID (e.g., 'char001')
   * @returns Promise resolving to the DragonBones asset data
   * @throws Error if asset loading fails
   */
  async loadMonsterAsset(monsterId: string): Promise<DragonBonesAsset> {
    // Return cached asset if available
    if (this.loadedAssets.has(monsterId)) {
      return this.loadedAssets.get(monsterId)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(monsterId)) {
      return this.loadingPromises.get(monsterId)!;
    }

    // Start loading
    const loadingPromise = this.loadAsset(monsterId);
    this.loadingPromises.set(monsterId, loadingPromise);

    try {
      const asset = await loadingPromise;
      this.loadedAssets.set(monsterId, asset);
      return asset;
    } finally {
      this.loadingPromises.delete(monsterId);
    }
  }

  /**
   * Internal method to load asset files
   * @private
   */
  private async loadAsset(monsterId: string): Promise<DragonBonesAsset> {
    const basePath = `/assets/monsters/${monsterId}/`;

    try {
      // Load all three files in parallel
      const [skeleton, textureAtlas, texture] = await Promise.all([
        fetch(`${basePath}skeleton.json`).then(r => {
          if (!r.ok) throw new Error(`Failed to load skeleton for ${monsterId}`);
          return r.json();
        }),
        fetch(`${basePath}texture.json`).then(r => {
          if (!r.ok) throw new Error(`Failed to load texture atlas for ${monsterId}`);
          return r.json();
        }),
        PIXI.Assets.load(`${basePath}texture.png`)
      ]);

      return {
        id: monsterId,
        skeleton,
        textureAtlas,
        texture
      };
    } catch (error) {
      console.error(`Failed to load assets for ${monsterId}:`, error);
      throw error;
    }
  }

  /**
   * Preloads multiple monsters in batches
   * 
   * Loads monsters in chunks to avoid overwhelming the browser.
   * This is useful for preloading common monsters or monsters
   * in the current area.
   * 
   * @param monsterIds - Array of monster IDs to preload
   * @param batchSize - Number of monsters to load at once (default: 10)
   */
  async preloadMonsters(monsterIds: string[], batchSize: number = 10): Promise<void> {
    const chunks = this.chunkArray(monsterIds, batchSize);

    for (const chunk of chunks) {
      await Promise.all(chunk.map(id => this.loadMonsterAsset(id)));
    }
  }

  /**
   * Checks if a monster asset is loaded
   * @param monsterId - The monster ID to check
   * @returns true if loaded, false otherwise
   */
  isLoaded(monsterId: string): boolean {
    return this.loadedAssets.has(monsterId);
  }

  /**
   * Checks if a monster asset is currently loading
   * @param monsterId - The monster ID to check
   * @returns true if loading, false otherwise
   */
  isLoading(monsterId: string): boolean {
    return this.loadingPromises.has(monsterId);
  }

  /**
   * Gets a loaded asset without loading it
   * @param monsterId - The monster ID
   * @returns The asset if loaded, undefined otherwise
   */
  getLoadedAsset(monsterId: string): DragonBonesAsset | undefined {
    return this.loadedAssets.get(monsterId);
  }

  /**
   * Unloads a specific monster asset to free memory
   * @param monsterId - The monster ID to unload
   */
  unloadAsset(monsterId: string): void {
    this.loadedAssets.delete(monsterId);
  }

  /**
   * Unloads all assets to free memory
   */
  unloadAll(): void {
    this.loadedAssets.clear();
    this.loadingPromises.clear();
  }

  /**
   * Gets the number of loaded assets
   * @returns Number of cached assets
   */
  getLoadedCount(): number {
    return this.loadedAssets.size;
  }

  /**
   * Splits an array into chunks
   * @private
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
