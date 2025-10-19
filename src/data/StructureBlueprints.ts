/**
 * StructureBlueprints - Definitions for buildable structures
 * 
 * Defines all structures that can be built in the game world,
 * including material requirements, stats, and functionality.
 * 
 * @example
 * ```typescript
 * const blueprints = StructureBlueprints.getInstance();
 * const wallBlueprint = blueprints.getBlueprint('wall_wood');
 * ```
 */
import { ItemRequirement } from '../systems/InventorySystem';

/**
 * Structure type
 */
export type StructureType = 'wall' | 'floor' | 'workbench' | 'storage' | 'campfire' | 'furnace' | 'farm';

/**
 * Structure category for UI
 */
export type StructureCategory = 'defense' | 'crafting' | 'storage' | 'survival' | 'farming';

/**
 * Structure blueprint definition
 */
export interface StructureBlueprint {
  id: string;
  name: string;
  description: string;
  type: StructureType;
  category: StructureCategory;
  materials: ItemRequirement[];
  stats: {
    health: number;
    durability: number;
  };
  functionality?: string; // What this structure does
  snapToGrid: boolean;
  gridSize: number; // Grid cell size (16 or 32 pixels)
  collisionSize: { width: number; height: number };
  placementRules?: {
    requiresFloor?: boolean;
    blocksMovement?: boolean;
    minDistanceFromOthers?: number;
  };
}

/**
 * StructureBlueprints singleton
 */
export class StructureBlueprints {
  private static instance: StructureBlueprints;
  private blueprints: Map<string, StructureBlueprint> = new Map();

  private constructor() {
    this.initBlueprints();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StructureBlueprints {
    if (!StructureBlueprints.instance) {
      StructureBlueprints.instance = new StructureBlueprints();
    }
    return StructureBlueprints.instance;
  }

  /**
   * Initialize all structure blueprints
   */
  private initBlueprints(): void {
    // Walls
    this.registerBlueprint({
      id: 'wall_wood',
      name: 'Wooden Wall',
      description: 'Basic defensive wall made of wood',
      type: 'wall',
      category: 'defense',
      materials: [
        { id: 'wood', amount: 4 }
      ],
      stats: {
        health: 100,
        durability: 100
      },
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 32, height: 32 },
      placementRules: {
        blocksMovement: true,
        minDistanceFromOthers: 0
      }
    });

    this.registerBlueprint({
      id: 'wall_stone',
      name: 'Stone Wall',
      description: 'Strong defensive wall made of stone',
      type: 'wall',
      category: 'defense',
      materials: [
        { id: 'stone', amount: 6 },
        { id: 'wood', amount: 2 }
      ],
      stats: {
        health: 250,
        durability: 200
      },
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 32, height: 32 },
      placementRules: {
        blocksMovement: true,
        minDistanceFromOthers: 0
      }
    });

    // Floors
    this.registerBlueprint({
      id: 'floor_wood',
      name: 'Wooden Floor',
      description: 'Basic wooden flooring',
      type: 'floor',
      category: 'defense',
      materials: [
        { id: 'wood', amount: 2 }
      ],
      stats: {
        health: 50,
        durability: 50
      },
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 32, height: 32 },
      placementRules: {
        blocksMovement: false
      }
    });

    this.registerBlueprint({
      id: 'floor_stone',
      name: 'Stone Floor',
      description: 'Durable stone flooring',
      type: 'floor',
      category: 'defense',
      materials: [
        { id: 'stone', amount: 4 }
      ],
      stats: {
        health: 100,
        durability: 100
      },
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 32, height: 32 },
      placementRules: {
        blocksMovement: false
      }
    });

    // Crafting stations
    this.registerBlueprint({
      id: 'workbench',
      name: 'Workbench',
      description: 'Craft advanced tools and items',
      type: 'workbench',
      category: 'crafting',
      materials: [
        { id: 'wood', amount: 10 },
        { id: 'stone', amount: 5 }
      ],
      stats: {
        health: 150,
        durability: 100
      },
      functionality: 'Unlocks advanced crafting recipes',
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 64, height: 32 },
      placementRules: {
        requiresFloor: true,
        blocksMovement: true,
        minDistanceFromOthers: 32
      }
    });

    this.registerBlueprint({
      id: 'furnace',
      name: 'Furnace',
      description: 'Smelt ores and cook food at high temperatures',
      type: 'furnace',
      category: 'crafting',
      materials: [
        { id: 'stone', amount: 20 },
        { id: 'wood', amount: 5 }
      ],
      stats: {
        health: 200,
        durability: 150
      },
      functionality: 'Smelts ores into metal bars',
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 64, height: 64 },
      placementRules: {
        requiresFloor: true,
        blocksMovement: true,
        minDistanceFromOthers: 64
      }
    });

    // Storage
    this.registerBlueprint({
      id: 'chest_wood',
      name: 'Wooden Chest',
      description: 'Store up to 20 items',
      type: 'storage',
      category: 'storage',
      materials: [
        { id: 'wood', amount: 8 }
      ],
      stats: {
        health: 80,
        durability: 80
      },
      functionality: 'Stores 20 items',
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 32, height: 32 },
      placementRules: {
        requiresFloor: true,
        blocksMovement: true,
        minDistanceFromOthers: 16
      }
    });

    this.registerBlueprint({
      id: 'chest_stone',
      name: 'Stone Chest',
      description: 'Store up to 40 items',
      type: 'storage',
      category: 'storage',
      materials: [
        { id: 'stone', amount: 12 },
        { id: 'wood', amount: 4 }
      ],
      stats: {
        health: 150,
        durability: 120
      },
      functionality: 'Stores 40 items',
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 32, height: 32 },
      placementRules: {
        requiresFloor: true,
        blocksMovement: true,
        minDistanceFromOthers: 16
      }
    });

    // Survival
    this.registerBlueprint({
      id: 'campfire',
      name: 'Campfire',
      description: 'Provides warmth, light, and cooking',
      type: 'campfire',
      category: 'survival',
      materials: [
        { id: 'wood', amount: 5 },
        { id: 'stone', amount: 3 }
      ],
      stats: {
        health: 100,
        durability: 80
      },
      functionality: 'Cook food, provides light and warmth',
      snapToGrid: true,
      gridSize: 32,
      collisionSize: { width: 32, height: 32 },
      placementRules: {
        blocksMovement: false,
        minDistanceFromOthers: 64
      }
    });

    console.log(`✅ StructureBlueprints initialized with ${this.blueprints.size} blueprints`);
  }

  /**
   * Register a blueprint
   */
  private registerBlueprint(blueprint: StructureBlueprint): void {
    this.blueprints.set(blueprint.id, blueprint);
  }

  /**
   * Get blueprint by ID
   */
  getBlueprint(id: string): StructureBlueprint | undefined {
    return this.blueprints.get(id);
  }

  /**
   * Get all blueprints
   */
  getAllBlueprints(): StructureBlueprint[] {
    return Array.from(this.blueprints.values());
  }

  /**
   * Get blueprints by category
   */
  getBlueprintsByCategory(category: StructureCategory): StructureBlueprint[] {
    return this.getAllBlueprints().filter(bp => bp.category === category);
  }

  /**
   * Get blueprints by type
   */
  getBlueprintsByType(type: StructureType): StructureBlueprint[] {
    return this.getAllBlueprints().filter(bp => bp.type === type);
  }
}
