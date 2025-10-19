/**
 * CookingSystem.ts
 * 
 * Manages campfire cooking with recipes, fuel consumption, and burn timer.
 * Integrates with InventorySystem and LightingSystem.
 * 
 * @example
 * ```typescript
 * const cooking = CookingSystem.getInstance();
 * await cooking.init();
 * 
 * // Start cooking at campfire
 * cooking.startCooking(campfireId, 'raw_meat', 1);
 * 
 * // Add fuel
 * cooking.addFuel(campfireId, 'wood', 5);
 * 
 * // Update in game loop
 * cooking.update(deltaTime);
 * ```
 */

import localforage from 'localforage';
import { EventBus } from '../core/EventBus';
import type { InventorySystem } from './InventorySystem';

/**
 * Cooking recipe definition
 */
export interface CookingRecipe {
  inputId: string;           // Raw item ID
  outputId: string;          // Cooked item ID
  cookTime: number;          // Seconds to cook
  burnTime: number;          // Seconds before it burns
  experienceGain: number;    // XP gained
}

/**
 * Fuel definition
 */
export interface FuelDefinition {
  id: string;
  name: string;
  burnTime: number;          // Seconds of burn
  heatMultiplier: number;    // Cooking speed multiplier (1.0 = normal)
}

/**
 * Active cooking slot
 */
interface CookingSlot {
  recipeId: string;
  inputItem: string;
  startTime: number;
  cookProgress: number;      // 0 to 1
  isBurning: boolean;
}

/**
 * Campfire state
 */
interface CampfireState {
  id: string;
  fuelRemaining: number;     // Seconds
  heatMultiplier: number;
  cookingSlots: (CookingSlot | null)[];  // 4 slots per campfire
  lastUpdate: number;
}

/**
 * CookingSystem singleton
 */
export class CookingSystem {
  private static instance: CookingSystem;
  
  private recipes: Map<string, CookingRecipe> = new Map();
  private fuels: Map<string, FuelDefinition> = new Map();
  private campfires: Map<string, CampfireState> = new Map();
  private inventorySystem: InventorySystem | null = null;
  private eventBus: EventBus;
  
  private readonly MAX_COOKING_SLOTS = 4;
  private readonly STORAGE_KEY = 'cooking_system';

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): CookingSystem {
    if (!CookingSystem.instance) {
      CookingSystem.instance = new CookingSystem();
    }
    return CookingSystem.instance;
  }

  /**
   * Initialize cooking system
   */
  async init(inventorySystem: InventorySystem): Promise<void> {
    this.inventorySystem = inventorySystem;
    this.initRecipes();
    this.initFuels();
    await this.load();
    console.log(`✅ CookingSystem initialized`);
  }

  /**
   * Initialize cooking recipes
   */
  private initRecipes(): void {
    // Meat recipes
    this.registerRecipe({
      inputId: 'raw_meat',
      outputId: 'cooked_meat',
      cookTime: 30,          // 30 seconds
      burnTime: 45,          // Burns after 45 seconds
      experienceGain: 5,
    });

    // Berry recipes
    this.registerRecipe({
      inputId: 'berries',
      outputId: 'cooked_berries',
      cookTime: 15,
      burnTime: 25,
      experienceGain: 2,
    });

    // Fish recipes
    this.registerRecipe({
      inputId: 'raw_fish',
      outputId: 'cooked_fish',
      cookTime: 25,
      burnTime: 40,
      experienceGain: 4,
    });

    // Vegetables
    this.registerRecipe({
      inputId: 'carrot',
      outputId: 'roasted_carrot',
      cookTime: 20,
      burnTime: 35,
      experienceGain: 3,
    });

    console.log(`✅ Registered ${this.recipes.size} cooking recipes`);
  }

  /**
   * Initialize fuel types
   */
  private initFuels(): void {
    this.registerFuel({
      id: 'wood',
      name: 'Wood',
      burnTime: 60,          // 60 seconds
      heatMultiplier: 1.0,   // Normal speed
    });

    this.registerFuel({
      id: 'coal',
      name: 'Coal',
      burnTime: 120,         // 2 minutes
      heatMultiplier: 1.5,   // 50% faster cooking
    });

    this.registerFuel({
      id: 'charcoal',
      name: 'Charcoal',
      burnTime: 90,
      heatMultiplier: 1.25,
    });

    console.log(`✅ Registered ${this.fuels.size} fuel types`);
  }

  /**
   * Register cooking recipe
   */
  registerRecipe(recipe: CookingRecipe): void {
    this.recipes.set(recipe.inputId, recipe);
  }

  /**
   * Register fuel type
   */
  registerFuel(fuel: FuelDefinition): void {
    this.fuels.set(fuel.id, fuel);
  }

  /**
   * Get recipe for input item
   */
  getRecipe(inputId: string): CookingRecipe | undefined {
    return this.recipes.get(inputId);
  }

  /**
   * Get fuel definition
   */
  getFuel(fuelId: string): FuelDefinition | undefined {
    return this.fuels.get(fuelId);
  }

  /**
   * Register a campfire
   */
  registerCampfire(campfireId: string): void {
    if (this.campfires.has(campfireId)) return;

    this.campfires.set(campfireId, {
      id: campfireId,
      fuelRemaining: 0,
      heatMultiplier: 1.0,
      cookingSlots: Array(this.MAX_COOKING_SLOTS).fill(null),
      lastUpdate: Date.now(),
    });

    console.log(`🔥 Campfire registered: ${campfireId}`);
  }

  /**
   * Unregister campfire (when destroyed)
   */
  unregisterCampfire(campfireId: string): void {
    this.campfires.delete(campfireId);
  }

  /**
   * Add fuel to campfire
   */
  addFuel(campfireId: string, fuelId: string, amount: number = 1): boolean {
    const campfire = this.campfires.get(campfireId);
    if (!campfire) return false;

    const fuel = this.fuels.get(fuelId);
    if (!fuel) return false;

    if (!this.inventorySystem) return false;

    // Check if player has fuel
    if (!this.inventorySystem.hasItem(fuelId, amount)) {
      this.eventBus.emit('notification', {
        message: `Not enough ${fuel.name}!`,
        type: 'error',
      });
      return false;
    }

    // Consume fuel from inventory
    this.inventorySystem.removeItem(fuelId, amount);

    // Add burn time
    campfire.fuelRemaining += fuel.burnTime * amount;
    campfire.heatMultiplier = fuel.heatMultiplier;

    this.eventBus.emit('campfire:fuel_added', {
      campfireId,
      fuelId,
      amount,
      newFuelRemaining: campfire.fuelRemaining,
    });

    this.save();
    return true;
  }

  /**
   * Start cooking item in campfire slot
   */
  startCooking(campfireId: string, inputItemId: string, slotIndex: number): boolean {
    const campfire = this.campfires.get(campfireId);
    if (!campfire) return false;

    // Check slot index
    if (slotIndex < 0 || slotIndex >= this.MAX_COOKING_SLOTS) return false;

    // Check if slot occupied
    if (campfire.cookingSlots[slotIndex] !== null) {
      this.eventBus.emit('notification', {
        message: 'Cooking slot already in use!',
        type: 'error',
      });
      return false;
    }

    // Check recipe exists
    const recipe = this.recipes.get(inputItemId);
    if (!recipe) {
      this.eventBus.emit('notification', {
        message: 'Cannot cook this item!',
        type: 'error',
      });
      return false;
    }

    if (!this.inventorySystem) return false;

    // Check player has item
    if (!this.inventorySystem.hasItem(inputItemId, 1)) {
      this.eventBus.emit('notification', {
        message: 'You don\'t have that item!',
        type: 'error',
      });
      return false;
    }

    // Consume input item
    this.inventorySystem.removeItem(inputItemId, 1);

    // Start cooking
    campfire.cookingSlots[slotIndex] = {
      recipeId: recipe.inputId,
      inputItem: inputItemId,
      startTime: Date.now(),
      cookProgress: 0,
      isBurning: false,
    };

    this.eventBus.emit('campfire:cooking_started', {
      campfireId,
      slotIndex,
      recipe,
    });

    this.save();
    return true;
  }

  /**
   * Cancel cooking (remove item from slot)
   */
  cancelCooking(campfireId: string, slotIndex: number): boolean {
    const campfire = this.campfires.get(campfireId);
    if (!campfire) return false;

    const slot = campfire.cookingSlots[slotIndex];
    if (!slot) return false;

    // Cannot reclaim if burnt
    if (slot.isBurning) {
      this.eventBus.emit('notification', {
        message: 'Food is burnt! Cannot reclaim.',
        type: 'error',
      });
      campfire.cookingSlots[slotIndex] = null;
      this.save();
      return false;
    }

    // Return raw item if not cooked
    if (this.inventorySystem && slot.cookProgress < 1.0) {
      this.inventorySystem.addItem(slot.inputItem, 1);
    }

    campfire.cookingSlots[slotIndex] = null;
    this.save();
    return true;
  }

  /**
   * Collect cooked item from slot
   */
  collectCookedItem(campfireId: string, slotIndex: number): boolean {
    const campfire = this.campfires.get(campfireId);
    if (!campfire) return false;

    const slot = campfire.cookingSlots[slotIndex];
    if (!slot) return false;

    const recipe = this.recipes.get(slot.recipeId);
    if (!recipe) return false;

    if (!this.inventorySystem) return false;

    // Check if cooked
    if (slot.cookProgress < 1.0) {
      this.eventBus.emit('notification', {
        message: 'Food is not ready yet!',
        type: 'warning',
      });
      return false;
    }

    // Check if burnt
    if (slot.isBurning) {
      // Give burnt food (placeholder)
      this.inventorySystem.addItem('burnt_food', 1);
      this.eventBus.emit('notification', {
        message: 'Food is burnt!',
        type: 'error',
      });
    } else {
      // Give cooked food
      this.inventorySystem.addItem(recipe.outputId, 1);
      this.eventBus.emit('notification', {
        message: `Cooked ${recipe.outputId}!`,
        type: 'success',
      });

      // Grant experience
      this.eventBus.emit('player:gain_experience', {
        amount: recipe.experienceGain,
        skill: 'cooking',
      });
    }

    // Clear slot
    campfire.cookingSlots[slotIndex] = null;
    this.save();
    return true;
  }

  /**
   * Update cooking system (call each frame)
   */
  update(deltaTime: number): void {
    const now = Date.now();

    for (const [campfireId, campfire] of this.campfires) {
      const timeSinceUpdate = (now - campfire.lastUpdate) / 1000; // Convert to seconds
      campfire.lastUpdate = now;

      // Update fuel
      if (campfire.fuelRemaining > 0) {
        campfire.fuelRemaining -= timeSinceUpdate;
        if (campfire.fuelRemaining < 0) campfire.fuelRemaining = 0;

        // Emit light update event
        this.eventBus.emit('campfire:fuel_changed', {
          campfireId,
          fuelRemaining: campfire.fuelRemaining,
          isLit: campfire.fuelRemaining > 0,
        });
      }

      // Update cooking slots
      for (let i = 0; i < campfire.cookingSlots.length; i++) {
        const slot = campfire.cookingSlots[i];
        if (!slot) continue;

        const recipe = this.recipes.get(slot.recipeId);
        if (!recipe) continue;

        // Only cook if fuel available
        if (campfire.fuelRemaining <= 0) continue;

        // Calculate cook progress
        const elapsed = (now - slot.startTime) / 1000;
        const cookSpeed = campfire.heatMultiplier;
        slot.cookProgress = Math.min(1.0, elapsed / (recipe.cookTime / cookSpeed));

        // Check if burning
        if (elapsed > recipe.burnTime / cookSpeed && !slot.isBurning) {
          slot.isBurning = true;
          this.eventBus.emit('campfire:food_burning', {
            campfireId,
            slotIndex: i,
          });
        }

        // Check if just finished cooking
        if (slot.cookProgress >= 1.0 && !slot.isBurning && elapsed < recipe.burnTime / cookSpeed) {
          this.eventBus.emit('campfire:food_cooked', {
            campfireId,
            slotIndex: i,
            outputId: recipe.outputId,
          });
        }
      }
    }
  }

  /**
   * Get campfire state
   */
  getCampfireState(campfireId: string): CampfireState | undefined {
    return this.campfires.get(campfireId);
  }

  /**
   * Get all active campfires
   */
  getActiveCampfires(): string[] {
    return Array.from(this.campfires.keys());
  }

  /**
   * Check if campfire is lit (has fuel)
   */
  isCampfireLit(campfireId: string): boolean {
    const campfire = this.campfires.get(campfireId);
    return campfire ? campfire.fuelRemaining > 0 : false;
  }

  /**
   * Get all recipes
   */
  getAllRecipes(): CookingRecipe[] {
    return Array.from(this.recipes.values());
  }

  /**
   * Get all fuels
   */
  getAllFuels(): FuelDefinition[] {
    return Array.from(this.fuels.values());
  }

  /**
   * Save to persistence
   */
  private async save(): Promise<void> {
    const data = {
      campfires: Array.from(this.campfires.entries()),
    };
    await localforage.setItem(this.STORAGE_KEY, data);
  }

  /**
   * Load from persistence
   */
  private async load(): Promise<void> {
    try {
      const data: any = await localforage.getItem(this.STORAGE_KEY);
      if (data && data.campfires) {
        this.campfires = new Map(data.campfires);
        console.log(`✅ Loaded ${this.campfires.size} campfires`);
      }
    } catch (err) {
      console.warn('Failed to load cooking data:', err);
    }
  }

  /**
   * Clear all data (for testing)
   */
  async clear(): Promise<void> {
    this.campfires.clear();
    await localforage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.campfires.clear();
    this.recipes.clear();
    this.fuels.clear();
  }
}
