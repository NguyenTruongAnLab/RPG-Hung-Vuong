import * as PIXI from 'pixi.js';
import type { DragonBonesAsset } from './DragonBonesManager';

/**
 * Extended DragonBones asset with animation metadata and settings
 */
export interface ExtendedDragonBonesAsset extends DragonBonesAsset {
  characterName: string;
  animations: string[];
  settings?: BattleSettings;
}

/**
 * Battle settings parsed from _settings.txt files
 */
export interface BattleSettings {
  availableMotions: string[];
  actionSequence: {
    wholeAction: string[];
    targetAction: string[];
  };
}

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
 * // Load by character name
 * const charAsset = await assetManager.loadDragonBonesCharacter('Absolution');
 * 
 * // Preload multiple monsters
 * await assetManager.preloadMonsters(['char001', 'char002', 'char003']);
 * ```
 */
export class AssetManager {
  private static instance: AssetManager;
  private loadedAssets = new Map<string, DragonBonesAsset>();
  private loadingPromises = new Map<string, Promise<DragonBonesAsset>>();
  private loadedCharacters = new Map<string, ExtendedDragonBonesAsset>();
  private loadingCharacters = new Map<string, Promise<ExtendedDragonBonesAsset>>();

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
   * Load DragonBones character by asset name from dragonbones_assets folder
   * Automatically detects all available animations from skeleton data
   * 
   * @param characterName - e.g., "Absolution", "Agravain"
   * @returns ExtendedDragonBonesAsset with animations and settings
   * 
   * @example
   * const asset = await AssetManager.getInstance().loadDragonBonesCharacter('Absolution');
   * console.log('Available animations:', asset.animations);
   */
  async loadDragonBonesCharacter(characterName: string): Promise<ExtendedDragonBonesAsset> {
    // Check cache
    if (this.loadedCharacters.has(characterName)) {
      return this.loadedCharacters.get(characterName)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingCharacters.has(characterName)) {
      return this.loadingCharacters.get(characterName)!;
    }

    // Start loading
    const loadingPromise = this.loadCharacterAsset(characterName);
    this.loadingCharacters.set(characterName, loadingPromise);

    try {
      const asset = await loadingPromise;
      this.loadedCharacters.set(characterName, asset);
      return asset;
    } finally {
      this.loadingCharacters.delete(characterName);
    }
  }

  /**
   * Internal method to load DragonBones character files
   * @private
   */
  private async loadCharacterAsset(characterName: string): Promise<ExtendedDragonBonesAsset> {
    const basePath = `/assets/dragonbones_assets/`;

    try {
      console.log(`🔄 Loading DragonBones asset: ${characterName}...`);
      
      // Load skeleton, texture atlas, texture, and optionally settings
      const [skeleton, textureAtlas, texture, settings] = await Promise.all([
        fetch(`${basePath}${characterName}_ske.json`).then(r => {
          if (!r.ok) {
            throw new Error(`Skeleton file not found: ${basePath}${characterName}_ske.json (${r.status})`);
          }
          return r.json();
        }),
        fetch(`${basePath}${characterName}_tex.json`).then(r => {
          if (!r.ok) {
            throw new Error(`Texture atlas not found: ${basePath}${characterName}_tex.json (${r.status})`);
          }
          return r.json();
        }),
        PIXI.Assets.load(`${basePath}${characterName}_tex.png`).catch(err => {
          throw new Error(`Texture image not found: ${basePath}${characterName}_tex.png - ${err.message}`);
        }),
        // Settings file is optional (about 54% have it)
        fetch(`${basePath}${characterName}_settings.txt`)
          .then(r => r.ok ? r.text() : null)
          .catch(() => null)
      ]);

      // Validate skeleton data
      if (!skeleton || !skeleton.armature || !skeleton.armature[0]) {
        throw new Error(`Invalid skeleton data for ${characterName}`);
      }

      // Extract animation names from skeleton data
      const animations: string[] = [];
      if (skeleton.armature[0].animation) {
        animations.push(...skeleton.armature[0].animation.map((anim: any) => anim.name));
      }

      if (animations.length === 0) {
        throw new Error(`No animations found in skeleton data for ${characterName}`);
      }

      // Parse settings if available
      const parsedSettings = settings ? this.parseSettings(settings) : undefined;

      const asset: ExtendedDragonBonesAsset = {
        id: characterName,
        skeleton,
        textureAtlas,
        texture,
        characterName,
        animations,
        settings: parsedSettings
      };

      console.log(`✅ Loaded ${characterName}:`, {
        animations: animations.length,
        hasSettings: !!parsedSettings,
        animationList: animations
      });

      return asset;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to load ${characterName}:`, errorMsg);
      throw new Error(`DragonBones asset load failed for "${characterName}": ${errorMsg}`);
    }
  }

  /**
   * Parse settings.txt file for battle animation sequences
   * @private
   */
  private parseSettings(settingsText: string): BattleSettings {
    const lines = settingsText.split('\n');
    const motions: string[] = [];
    const wholeAction: string[] = [];
    const targetAction: string[] = [];
    
    let inMotions = false;
    let inWholeAction = false;
    let inTargetAction = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect sections
      if (trimmed.includes('Available Motions:')) {
        inMotions = true;
        inWholeAction = false;
        inTargetAction = false;
        continue;
      }
      
      if (trimmed.startsWith('<whole action>')) {
        inWholeAction = true;
        inMotions = false;
        inTargetAction = false;
        continue;
      }
      
      if (trimmed.startsWith('</whole action>')) {
        inWholeAction = false;
        continue;
      }
      
      if (trimmed.startsWith('<target action>')) {
        inTargetAction = true;
        inMotions = false;
        inWholeAction = false;
        continue;
      }
      
      if (trimmed.startsWith('</target action>')) {
        inTargetAction = false;
        continue;
      }

      // Parse content
      if (inMotions && trimmed && !trimmed.startsWith('Sample')) {
        // Extract motion name (e.g., "Attack A - Left Claw Crush")
        const match = trimmed.match(/^([^-]+)/);
        if (match) {
          const motionName = match[1].trim();
          if (motionName && !motions.includes(motionName)) {
            motions.push(motionName);
          }
        }
      }
      
      if (inWholeAction && trimmed) {
        wholeAction.push(trimmed);
      }
      
      if (inTargetAction && trimmed) {
        targetAction.push(trimmed);
      }
    }

    return {
      availableMotions: motions,
      actionSequence: {
        wholeAction,
        targetAction
      }
    };
  }

  /**
   * Get animation duration from skeleton data (estimated)
   * @param characterName - The character name
   * @param animationName - The animation name
   * @returns Duration in seconds (default 1.0 if not found)
   */
  getAnimationDuration(characterName: string, animationName: string): number {
    const asset = this.loadedCharacters.get(characterName);
    if (!asset || !asset.skeleton.armature) return 1.0;

    const armature = asset.skeleton.armature[0];
    if (!armature || !armature.animation) return 1.0;

    const animation = armature.animation.find((anim: any) => anim.name === animationName);
    if (!animation || !animation.duration) return 1.0;

    // DragonBones duration is in frames at frameRate (default 24fps)
    const frameRate = asset.skeleton.frameRate || 24;
    return animation.duration / frameRate;
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
