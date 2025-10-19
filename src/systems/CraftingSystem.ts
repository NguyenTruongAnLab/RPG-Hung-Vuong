/**
 * CraftingSystem - Recipe-based item crafting
 * 
 * Manages crafting recipes, material requirements, and item creation.
 * Integrates with InventorySystem for material consumption.
 * 
 * @example
 * ```typescript
 * const crafting = CraftingSystem.getInstance();
 * await crafting.init();
 * 
 * // Check if can craft
 * if (crafting.canCraft('torch')) {
 *   crafting.craft('torch');
 * }
 * ```
 */
import { InventorySystem, ItemRequirement } from './InventorySystem';

/**
 * Crafting recipe
 */
export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: CraftCategory;
  requirements: ItemRequirement[];
  output: {
    itemId: string;
    amount: number;
  };
  craftingStation?: CraftingStation;
  craftTime: number; // milliseconds
}

/**
 * Recipe categories
 */
export type CraftCategory = 
  | 'tools'
  | 'weapons'
  | 'structures'
  | 'consumables'
  | 'materials'
  | 'misc';

/**
 * Crafting stations
 */
export type CraftingStation = 'none' | 'campfire' | 'workbench' | 'furnace' | 'alchemy_table';

/**
 * CraftingSystem singleton
 */
export class CraftingSystem {
  private static instance: CraftingSystem;
  
  private recipes: Map<string, CraftingRecipe> = new Map();
  private unlockedRecipes: Set<string> = new Set();
  private availableStations: Set<CraftingStation> = new Set(['none']);

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): CraftingSystem {
    if (!CraftingSystem.instance) {
      CraftingSystem.instance = new CraftingSystem();
    }
    return CraftingSystem.instance;
  }

  /**
   * Initialize crafting system
   */
  async init(): Promise<void> {
    this.initRecipes();
    this.unlockBasicRecipes();
    console.log(`✅ CraftingSystem initialized with ${this.recipes.size} recipes`);
  }

  /**
   * Initialize all crafting recipes
   */
  private initRecipes(): void {
    // Tools
    this.registerRecipe({
      id: 'axe_wood',
      name: 'Wooden Axe',
      description: 'Basic tool for chopping trees',
      category: 'tools',
      requirements: [
        { id: 'wood', amount: 3 },
        { id: 'fiber', amount: 2 }
      ],
      output: { itemId: 'axe_wood', amount: 1 },
      craftingStation: 'none',
      craftTime: 2000
    });

    this.registerRecipe({
      id: 'pickaxe_wood',
      name: 'Wooden Pickaxe',
      description: 'Basic tool for mining rocks',
      category: 'tools',
      requirements: [
        { id: 'wood', amount: 3 },
        { id: 'stone', amount: 2 }
      ],
      output: { itemId: 'pickaxe_wood', amount: 1 },
      craftingStation: 'none',
      craftTime: 2000
    });

    // Structures
    this.registerRecipe({
      id: 'campfire',
      name: 'Campfire',
      description: 'Provides warmth, light, and cooking',
      category: 'structures',
      requirements: [
        { id: 'wood', amount: 5 },
        { id: 'stone', amount: 3 }
      ],
      output: { itemId: 'campfire', amount: 1 },
      craftingStation: 'none',
      craftTime: 3000
    });

    this.registerRecipe({
      id: 'workbench',
      name: 'Workbench',
      description: 'Craft advanced tools and items',
      category: 'structures',
      requirements: [
        { id: 'wood', amount: 10 },
        { id: 'stone', amount: 5 }
      ],
      output: { itemId: 'workbench', amount: 1 },
      craftingStation: 'none',
      craftTime: 5000
    });

    this.registerRecipe({
      id: 'torch',
      name: 'Torch',
      description: 'Provides portable light',
      category: 'tools',
      requirements: [
        { id: 'wood', amount: 1 },
        { id: 'fiber', amount: 1 }
      ],
      output: { itemId: 'torch', amount: 1 },
      craftingStation: 'none',
      craftTime: 500
    });

    // Consumables
    this.registerRecipe({
      id: 'cooked_berries',
      name: 'Cooked Berries',
      description: 'Restores more hunger than raw berries',
      category: 'consumables',
      requirements: [
        { id: 'berries', amount: 3 }
      ],
      output: { itemId: 'cooked_berries', amount: 1 },
      craftingStation: 'campfire',
      craftTime: 5000
    });

    // Advanced tools (workbench required)
    this.registerRecipe({
      id: 'axe_stone',
      name: 'Stone Axe',
      description: 'Improved tool for chopping trees',
      category: 'tools',
      requirements: [
        { id: 'wood', amount: 2 },
        { id: 'stone', amount: 5 },
        { id: 'fiber', amount: 3 }
      ],
      output: { itemId: 'axe_stone', amount: 1 },
      craftingStation: 'workbench',
      craftTime: 4000
    });

    this.registerRecipe({
      id: 'pickaxe_stone',
      name: 'Stone Pickaxe',
      description: 'Improved tool for mining rocks',
      category: 'tools',
      requirements: [
        { id: 'wood', amount: 2 },
        { id: 'stone', amount: 5 },
        { id: 'fiber', amount: 3 }
      ],
      output: { itemId: 'pickaxe_stone', amount: 1 },
      craftingStation: 'workbench',
      craftTime: 4000
    });

    // Walls and floors
    this.registerRecipe({
      id: 'wall_wood',
      name: 'Wooden Wall',
      description: 'Basic defensive structure',
      category: 'structures',
      requirements: [
        { id: 'wood', amount: 4 }
      ],
      output: { itemId: 'wall_wood', amount: 1 },
      craftingStation: 'none',
      craftTime: 2000
    });

    this.registerRecipe({
      id: 'floor_wood',
      name: 'Wooden Floor',
      description: 'Basic flooring',
      category: 'structures',
      requirements: [
        { id: 'wood', amount: 2 }
      ],
      output: { itemId: 'floor_wood', amount: 1 },
      craftingStation: 'none',
      craftTime: 1000
    });
  }

  /**
   * Register a crafting recipe
   */
  registerRecipe(recipe: CraftingRecipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  /**
   * Unlock basic recipes (available from start)
   */
  private unlockBasicRecipes(): void {
    const basicRecipes = [
      'axe_wood',
      'pickaxe_wood',
      'torch',
      'campfire',
      'workbench',
      'wall_wood',
      'floor_wood'
    ];

    basicRecipes.forEach(id => {
      this.unlockRecipe(id);
    });
  }

  /**
   * Unlock a recipe
   */
  unlockRecipe(recipeId: string): void {
    if (this.recipes.has(recipeId)) {
      this.unlockedRecipes.add(recipeId);
      console.log(`Recipe unlocked: ${this.recipes.get(recipeId)?.name}`);
    }
  }

  /**
   * Check if recipe is unlocked
   */
  isUnlocked(recipeId: string): boolean {
    return this.unlockedRecipes.has(recipeId);
  }

  /**
   * Check if can craft recipe
   */
  canCraft(recipeId: string): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return false;

    // Check if unlocked
    if (!this.isUnlocked(recipeId)) return false;

    // Check crafting station
    if (recipe.craftingStation && recipe.craftingStation !== 'none') {
      if (!this.availableStations.has(recipe.craftingStation)) {
        return false;
      }
    }

    // Check materials
    const inventory = InventorySystem.getInstance();
    return inventory.hasItems(recipe.requirements);
  }

  /**
   * Craft an item
   */
  craft(recipeId: string): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      console.warn(`Recipe not found: ${recipeId}`);
      return false;
    }

    // Check if can craft
    if (!this.canCraft(recipeId)) {
      console.warn(`Cannot craft ${recipe.name}`);
      return false;
    }

    // Consume materials
    const inventory = InventorySystem.getInstance();
    if (!inventory.removeItems(recipe.requirements)) {
      return false;
    }

    // Add output item
    const success = inventory.addItem(recipe.output.itemId, recipe.output.amount);

    if (success) {
      console.log(`✅ Crafted: ${recipe.name} x${recipe.output.amount}`);
    } else {
      // Refund materials if inventory full
      recipe.requirements.forEach(req => {
        inventory.addItem(req.id, req.amount);
      });
      console.warn('Inventory full! Materials refunded.');
      return false;
    }

    return true;
  }

  /**
   * Get all unlocked recipes
   */
  getUnlockedRecipes(): CraftingRecipe[] {
    return Array.from(this.unlockedRecipes)
      .map(id => this.recipes.get(id))
      .filter(Boolean) as CraftingRecipe[];
  }

  /**
   * Get recipes by category
   */
  getRecipesByCategory(category: CraftCategory): CraftingRecipe[] {
    return this.getUnlockedRecipes().filter(recipe => recipe.category === category);
  }

  /**
   * Get craftable recipes (player has materials)
   */
  getCraftableRecipes(): CraftingRecipe[] {
    return this.getUnlockedRecipes().filter(recipe => this.canCraft(recipe.id));
  }

  /**
   * Add crafting station
   */
  addStation(station: CraftingStation): void {
    this.availableStations.add(station);
    console.log(`Station available: ${station}`);
  }

  /**
   * Remove crafting station
   */
  removeStation(station: CraftingStation): void {
    this.availableStations.delete(station);
  }

  /**
   * Check if station is available
   */
  hasStation(station: CraftingStation): boolean {
    return this.availableStations.has(station);
  }

  /**
   * Get recipe by ID
   */
  getRecipe(recipeId: string): CraftingRecipe | undefined {
    return this.recipes.get(recipeId);
  }
}
