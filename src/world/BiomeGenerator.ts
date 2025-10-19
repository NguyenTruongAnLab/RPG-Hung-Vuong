/**
 * BiomeGenerator - Procedural biome generation using Simplex noise
 * 
 * Generates realistic biome maps using multi-octave Simplex noise for:
 * - Temperature (hot → cold)
 * - Moisture (dry → wet)
 * - Elevation (low → high)
 * 
 * Biomes are determined by these three factors, similar to Minecraft.
 * 
 * @example
 * ```typescript
 * const generator = new BiomeGenerator('my-seed-123');
 * const biome = generator.getBiomeAt(100, 200);
 * // Returns: 'forest', 'plains', 'mountains', etc.
 * ```
 */
import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';

/**
 * Biome types in the game world
 */
export type BiomeType = 'forest' | 'plains' | 'mountains' | 'water' | 'desert' | 'swamp' | 'tundra';

/**
 * Resource spawn table for biomes
 */
export interface BiomeResources {
  trees: number;      // Spawn chance 0-1
  rocks: number;      // Spawn chance 0-1
  bushes: number;     // Spawn chance 0-1
  grass: number;      // Spawn chance 0-1
  special?: string[]; // Special resources (mushrooms, herbs, etc.)
}

/**
 * Biome configuration
 */
export interface BiomeConfig {
  name: BiomeType;
  color: number;         // Tileset color for minimap
  tileId: number;        // Base tile ID for rendering
  resources: BiomeResources;
  encounterRate: number; // Wild monster encounter rate
  allowedMonsters: string[]; // Monster IDs that can spawn
}

/**
 * Biome data with position
 */
export interface BiomeData {
  biome: BiomeType;
  temperature: number;   // -1 to 1
  moisture: number;      // -1 to 1
  elevation: number;     // -1 to 1
}

/**
 * BiomeGenerator class
 */
export class BiomeGenerator {
  private seed: string;
  private temperatureNoise: ReturnType<typeof createNoise2D>;
  private moistureNoise: ReturnType<typeof createNoise2D>;
  private elevationNoise: ReturnType<typeof createNoise2D>;
  private detailNoise: ReturnType<typeof createNoise2D>;
  
  // Biome configurations
  private biomeConfigs: Map<BiomeType, BiomeConfig> = new Map();
  
  // Noise parameters
  private readonly TEMPERATURE_SCALE = 0.005;
  private readonly MOISTURE_SCALE = 0.008;
  private readonly ELEVATION_SCALE = 0.003;
  private readonly DETAIL_SCALE = 0.05;

  /**
   * Creates a new BiomeGenerator
   * @param seed - World seed for deterministic generation
   */
  constructor(seed: string = 'default-seed') {
    this.seed = seed;
    
    // Create seeded random number generator
    const rng = seedrandom(seed);
    
    // Create noise generators with different seeds
    this.temperatureNoise = createNoise2D(() => rng());
    this.moistureNoise = createNoise2D(() => rng());
    this.elevationNoise = createNoise2D(() => rng());
    this.detailNoise = createNoise2D(() => rng());
    
    this.initBiomeConfigs();
  }

  /**
   * Initialize biome configurations
   */
  private initBiomeConfigs(): void {
    this.biomeConfigs.set('forest', {
      name: 'forest',
      color: 0x228B22,
      tileId: 10,
      resources: {
        trees: 0.4,
        rocks: 0.05,
        bushes: 0.3,
        grass: 0.8,
        special: ['mushroom', 'herb']
      },
      encounterRate: 0.3,
      allowedMonsters: ['char001', 'char002', 'char010', 'char011']
    });

    this.biomeConfigs.set('plains', {
      name: 'plains',
      color: 0x90EE90,
      tileId: 1,
      resources: {
        trees: 0.05,
        rocks: 0.1,
        bushes: 0.2,
        grass: 0.6,
        special: ['flower']
      },
      encounterRate: 0.25,
      allowedMonsters: ['char003', 'char004', 'char012', 'char013']
    });

    this.biomeConfigs.set('mountains', {
      name: 'mountains',
      color: 0x808080,
      tileId: 20,
      resources: {
        trees: 0.1,
        rocks: 0.6,
        bushes: 0.05,
        grass: 0.2,
        special: ['ore_iron', 'ore_gold', 'crystal']
      },
      encounterRate: 0.15,
      allowedMonsters: ['char005', 'char006', 'char014', 'char015']
    });

    this.biomeConfigs.set('water', {
      name: 'water',
      color: 0x4169E1,
      tileId: 30,
      resources: {
        trees: 0,
        rocks: 0,
        bushes: 0,
        grass: 0,
        special: ['fish', 'seaweed']
      },
      encounterRate: 0.2,
      allowedMonsters: ['char007', 'char008', 'char016', 'char017']
    });

    this.biomeConfigs.set('desert', {
      name: 'desert',
      color: 0xFFD700,
      tileId: 40,
      resources: {
        trees: 0.01,
        rocks: 0.3,
        bushes: 0.05,
        grass: 0.1,
        special: ['cactus', 'fossil']
      },
      encounterRate: 0.1,
      allowedMonsters: ['char009', 'char018', 'char019']
    });

    this.biomeConfigs.set('swamp', {
      name: 'swamp',
      color: 0x556B2F,
      tileId: 50,
      resources: {
        trees: 0.2,
        rocks: 0.05,
        bushes: 0.4,
        grass: 0.5,
        special: ['mushroom_poison', 'lily_pad']
      },
      encounterRate: 0.35,
      allowedMonsters: ['char020', 'char021', 'char022']
    });

    this.biomeConfigs.set('tundra', {
      name: 'tundra',
      color: 0xE0FFFF,
      tileId: 60,
      resources: {
        trees: 0.08,
        rocks: 0.2,
        bushes: 0.1,
        grass: 0.3,
        special: ['ice_crystal', 'frozen_herb']
      },
      encounterRate: 0.12,
      allowedMonsters: ['char023', 'char024', 'char025']
    });
  }

  /**
   * Get biome at specific world coordinates
   * @param x - World X coordinate (in tiles)
   * @param y - World Y coordinate (in tiles)
   * @returns BiomeData with type and environmental values
   */
  getBiomeAt(x: number, y: number): BiomeData {
    // Sample noise values with multiple octaves for detail
    const temperature = this.sampleNoise(this.temperatureNoise, x, y, this.TEMPERATURE_SCALE, 3);
    const moisture = this.sampleNoise(this.moistureNoise, x, y, this.MOISTURE_SCALE, 3);
    const elevation = this.sampleNoise(this.elevationNoise, x, y, this.ELEVATION_SCALE, 3);
    
    // Determine biome based on environmental factors
    const biome = this.determineBiome(temperature, moisture, elevation);
    
    return {
      biome,
      temperature,
      moisture,
      elevation
    };
  }

  /**
   * Sample noise with multiple octaves for more detail
   */
  private sampleNoise(
    noise: ReturnType<typeof createNoise2D>,
    x: number,
    y: number,
    scale: number,
    octaves: number
  ): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += noise(x * scale * frequency, y * scale * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    // Normalize to -1 to 1
    return value / maxValue;
  }

  /**
   * Determine biome from environmental factors
   */
  private determineBiome(temperature: number, moisture: number, elevation: number): BiomeType {
    // Water below sea level
    if (elevation < -0.3) {
      return 'water';
    }

    // Mountains at high elevation
    if (elevation > 0.5) {
      return 'mountains';
    }

    // Tundra (cold)
    if (temperature < -0.5) {
      return 'tundra';
    }

    // Desert (hot and dry)
    if (temperature > 0.4 && moisture < -0.2) {
      return 'desert';
    }

    // Swamp (wet and warm)
    if (moisture > 0.5 && temperature > 0 && elevation < 0.1) {
      return 'swamp';
    }

    // Forest (moderate moisture, not too hot/cold)
    if (moisture > 0 && temperature > -0.2 && temperature < 0.4) {
      return 'forest';
    }

    // Plains (default)
    return 'plains';
  }

  /**
   * Get biome configuration
   */
  getBiomeConfig(biome: BiomeType): BiomeConfig {
    return this.biomeConfigs.get(biome)!;
  }

  /**
   * Get all biome configs
   */
  getAllBiomeConfigs(): Map<BiomeType, BiomeConfig> {
    return this.biomeConfigs;
  }

  /**
   * Check if a resource should spawn at this location
   * @param biomeData - Biome data for the location
   * @param resourceType - Type of resource (trees, rocks, etc.)
   * @param detailX - Fine-detail X coordinate for variation
   * @param detailY - Fine-detail Y coordinate for variation
   * @returns true if resource should spawn
   */
  shouldSpawnResource(
    biomeData: BiomeData,
    resourceType: keyof BiomeResources,
    detailX: number,
    detailY: number
  ): boolean {
    const config = this.getBiomeConfig(biomeData.biome);
    const spawnChance = config.resources[resourceType];
    
    if (typeof spawnChance !== 'number') return false;
    
    // Use detail noise for variation
    const detailValue = this.detailNoise(detailX * this.DETAIL_SCALE, detailY * this.DETAIL_SCALE);
    const normalizedDetail = (detailValue + 1) / 2; // 0 to 1
    
    return normalizedDetail < spawnChance;
  }

  /**
   * Get seed used for generation
   */
  getSeed(): string {
    return this.seed;
  }

  /**
   * Generate a preview minimap (for debugging/UI)
   * @param width - Map width in chunks
   * @param height - Map height in chunks
   * @param chunkSize - Size of each chunk in tiles
   * @returns 2D array of biome types
   */
  generateMinimapPreview(width: number, height: number, chunkSize: number = 32): BiomeType[][] {
    const map: BiomeType[][] = [];
    
    for (let y = 0; y < height; y++) {
      const row: BiomeType[] = [];
      for (let x = 0; x < width; x++) {
        const worldX = x * chunkSize + chunkSize / 2;
        const worldY = y * chunkSize + chunkSize / 2;
        const biomeData = this.getBiomeAt(worldX, worldY);
        row.push(biomeData.biome);
      }
      map.push(row);
    }
    
    return map;
  }
}
