/**
 * BuildingSystem - Structure placement and management
 * 
 * Handles placing, removing, and managing structures in the game world.
 * Includes placement preview, collision checking, and snap-to-grid.
 * 
 * @example
 * ```typescript
 * const building = new BuildingSystem(physics, worldContainer);
 * await building.init();
 * 
 * // Enter placement mode
 * building.startPlacement('wall_wood');
 * 
 * // In update loop
 * building.updatePreview(mouseX, mouseY);
 * 
 * // Confirm placement
 * building.confirmPlacement();
 * ```
 */
import * as PIXI from 'pixi.js';
import { PhysicsManager } from '../core/PhysicsManager';
import { InventorySystem } from './InventorySystem';
import { StructureBlueprints, StructureBlueprint } from '../data/StructureBlueprints';
import Matter from 'matter-js';

/**
 * Placed structure instance
 */
export interface PlacedStructure {
  id: string;
  blueprintId: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  durability: number;
  sprite: PIXI.Container;
  body?: Matter.Body; // Physics body if blocks movement
}

/**
 * BuildingSystem class
 */
export class BuildingSystem {
  private physics: PhysicsManager;
  private worldContainer: PIXI.Container;
  private blueprints: StructureBlueprints;
  private inventory: InventorySystem;
  
  private structures: Map<string, PlacedStructure> = new Map();
  private nextStructureId: number = 0;
  
  // Placement state
  private isPlacing: boolean = false;
  private currentBlueprint: StructureBlueprint | null = null;
  private previewSprite: PIXI.Container | null = null;
  private previewPosition: { x: number; y: number } = { x: 0, y: 0 };
  private canPlace: boolean = false;

  constructor(physics: PhysicsManager, worldContainer: PIXI.Container) {
    this.physics = physics;
    this.worldContainer = worldContainer;
    this.blueprints = StructureBlueprints.getInstance();
    this.inventory = InventorySystem.getInstance();
  }

  /**
   * Initialize building system
   */
  async init(): Promise<void> {
    console.log('✅ BuildingSystem initialized');
  }

  /**
   * Start placement mode with a blueprint
   */
  startPlacement(blueprintId: string): boolean {
    const blueprint = this.blueprints.getBlueprint(blueprintId);
    if (!blueprint) {
      console.warn(`Blueprint not found: ${blueprintId}`);
      return false;
    }

    // Check if player has materials
    if (!this.inventory.hasItems(blueprint.materials)) {
      console.warn('Not enough materials to build');
      return false;
    }

    this.isPlacing = true;
    this.currentBlueprint = blueprint;
    this.createPreviewSprite(blueprint);
    
    return true;
  }

  /**
   * Cancel placement mode
   */
  cancelPlacement(): void {
    if (this.previewSprite) {
      this.worldContainer.removeChild(this.previewSprite);
      this.previewSprite = null;
    }
    
    this.isPlacing = false;
    this.currentBlueprint = null;
    this.canPlace = false;
  }

  /**
   * Update preview position (call with mouse position)
   */
  updatePreview(worldX: number, worldY: number): void {
    if (!this.isPlacing || !this.currentBlueprint || !this.previewSprite) return;

    // Snap to grid
    const gridSize = this.currentBlueprint.snapToGrid ? this.currentBlueprint.gridSize : 1;
    const snappedX = Math.floor(worldX / gridSize) * gridSize;
    const snappedY = Math.floor(worldY / gridSize) * gridSize;

    this.previewPosition = { x: snappedX, y: snappedY };
    this.previewSprite.x = snappedX;
    this.previewSprite.y = snappedY;

    // Check if can place here
    this.canPlace = this.checkPlacementValid(snappedX, snappedY);

    // Update preview color
    const graphics = this.previewSprite.getChildAt(0) as PIXI.Graphics;
    if (graphics) {
      this.updatePreviewColor(graphics, this.canPlace);
    }
  }

  /**
   * Confirm placement at current preview position
   */
  confirmPlacement(): boolean {
    if (!this.isPlacing || !this.currentBlueprint || !this.canPlace) {
      return false;
    }

    // Consume materials
    if (!this.inventory.removeItems(this.currentBlueprint.materials)) {
      console.warn('Failed to consume materials');
      return false;
    }

    // Place structure
    const structure = this.placeStructure(
      this.currentBlueprint,
      this.previewPosition.x,
      this.previewPosition.y
    );

    if (structure) {
      console.log(`✅ Placed ${this.currentBlueprint.name} at (${this.previewPosition.x}, ${this.previewPosition.y})`);
      
      // Keep in placement mode for multiple placements
      // User can press ESC to exit
      return true;
    }

    return false;
  }

  /**
   * Check if placement is valid at position
   */
  private checkPlacementValid(x: number, y: number): boolean {
    if (!this.currentBlueprint) return false;

    const { collisionSize, placementRules } = this.currentBlueprint;
    const halfWidth = collisionSize.width / 2;
    const halfHeight = collisionSize.height / 2;

    // Check collision with existing structures
    for (const structure of this.structures.values()) {
      const dx = Math.abs(structure.x - x);
      const dy = Math.abs(structure.y - y);
      
      if (dx < halfWidth + 16 && dy < halfHeight + 16) {
        return false; // Too close to another structure
      }
    }

    // Check minimum distance from others
    if (placementRules?.minDistanceFromOthers) {
      const minDist = placementRules.minDistanceFromOthers;
      for (const structure of this.structures.values()) {
        const dist = Math.hypot(structure.x - x, structure.y - y);
        if (dist < minDist) {
          return false;
        }
      }
    }

    // Check if requires floor
    if (placementRules?.requiresFloor) {
      const hasFloor = this.checkHasFloorAt(x, y);
      if (!hasFloor) {
        return false;
      }
    }

    // TODO: Check collision with resources, terrain obstacles
    // For now, assume valid if not colliding with structures

    return true;
  }

  /**
   * Check if there's a floor at position
   */
  private checkHasFloorAt(x: number, y: number): boolean {
    // Check if any floor structure exists at this position
    for (const structure of this.structures.values()) {
      const blueprint = this.blueprints.getBlueprint(structure.blueprintId);
      if (!blueprint || blueprint.type !== 'floor') continue;

      const dx = Math.abs(structure.x - x);
      const dy = Math.abs(structure.y - y);
      
      if (dx < 16 && dy < 16) {
        return true;
      }
    }
    return false;
  }

  /**
   * Place a structure at position
   */
  private placeStructure(blueprint: StructureBlueprint, x: number, y: number): PlacedStructure | null {
    const id = `structure_${this.nextStructureId++}`;
    
    // Create visual sprite
    const sprite = this.createStructureSprite(blueprint);
    sprite.x = x;
    sprite.y = y;
    this.worldContainer.addChild(sprite);

    // Create physics body if blocks movement
    let body: Matter.Body | undefined;
    if (blueprint.placementRules?.blocksMovement) {
      body = Matter.Bodies.rectangle(
        x,
        y,
        blueprint.collisionSize.width,
        blueprint.collisionSize.height,
        {
          isStatic: true,
          label: `structure_${blueprint.id}`
        }
      );
      this.physics.addBody(body);
    }

    const structure: PlacedStructure = {
      id,
      blueprintId: blueprint.id,
      x,
      y,
      health: blueprint.stats.health,
      maxHealth: blueprint.stats.health,
      durability: blueprint.stats.durability,
      sprite,
      body
    };

    this.structures.set(id, structure);
    return structure;
  }

  /**
   * Remove a structure
   */
  removeStructure(id: string): boolean {
    const structure = this.structures.get(id);
    if (!structure) return false;

    // Remove visual
    this.worldContainer.removeChild(structure.sprite);

    // Remove physics body
    if (structure.body) {
      this.physics.removeBody(structure.body);
    }

    this.structures.delete(id);
    console.log(`Removed structure: ${id}`);
    return true;
  }

  /**
   * Damage a structure
   */
  damageStructure(id: string, damage: number): boolean {
    const structure = this.structures.get(id);
    if (!structure) return false;

    structure.health -= damage;
    
    // Update visual (health bar, damage effect)
    this.updateStructureVisual(structure);

    if (structure.health <= 0) {
      this.removeStructure(id);
      return false; // Structure destroyed
    }

    return true;
  }

  /**
   * Create preview sprite
   */
  private createPreviewSprite(blueprint: StructureBlueprint): void {
    const container = new PIXI.Container();
    
    // Create placeholder graphics
    const graphics = new PIXI.Graphics();
    this.drawStructureGraphics(graphics, blueprint, true);
    
    container.addChild(graphics);
    container.alpha = 0.7;
    
    this.previewSprite = container;
    this.worldContainer.addChild(container);
  }

  /**
   * Create structure sprite
   */
  private createStructureSprite(blueprint: StructureBlueprint): PIXI.Container {
    const container = new PIXI.Container();
    
    const graphics = new PIXI.Graphics();
    this.drawStructureGraphics(graphics, blueprint, false);
    
    container.addChild(graphics);
    return container;
  }

  /**
   * Draw structure graphics (placeholder)
   */
  private drawStructureGraphics(graphics: PIXI.Graphics, blueprint: StructureBlueprint, isPreview: boolean): void {
    const { collisionSize, type } = blueprint;
    
    // Color based on type
    const colors: Record<string, number> = {
      wall: 0x8b4513,
      floor: 0xa0522d,
      workbench: 0xd2691e,
      storage: 0xdaa520,
      campfire: 0xff6600,
      furnace: 0x808080,
      farm: 0x90ee90
    };
    
    const color = colors[type] ?? 0xcccccc;
    
    graphics.clear();
    graphics.beginFill(color, isPreview ? 0.5 : 1);
    graphics.drawRect(
      -collisionSize.width / 2,
      -collisionSize.height / 2,
      collisionSize.width,
      collisionSize.height
    );
    graphics.endFill();
    
    // Border
    graphics.lineStyle(2, 0x000000, isPreview ? 0.3 : 0.5);
    graphics.drawRect(
      -collisionSize.width / 2,
      -collisionSize.height / 2,
      collisionSize.width,
      collisionSize.height
    );
  }

  /**
   * Update preview color based on validity
   */
  private updatePreviewColor(graphics: PIXI.Graphics, canPlace: boolean): void {
    if (!this.currentBlueprint) return;

    const color = canPlace ? 0x00ff00 : 0xff0000;
    const { collisionSize } = this.currentBlueprint;
    
    graphics.clear();
    graphics.beginFill(color, 0.3);
    graphics.drawRect(
      -collisionSize.width / 2,
      -collisionSize.height / 2,
      collisionSize.width,
      collisionSize.height
    );
    graphics.endFill();
    
    graphics.lineStyle(2, color, 0.8);
    graphics.drawRect(
      -collisionSize.width / 2,
      -collisionSize.height / 2,
      collisionSize.width,
      collisionSize.height
    );
  }

  /**
   * Update structure visual after damage
   */
  private updateStructureVisual(structure: PlacedStructure): void {
    // TODO: Add health bar, damage cracks, etc.
    const healthPercent = structure.health / structure.maxHealth;
    structure.sprite.alpha = 0.5 + (healthPercent * 0.5);
  }

  /**
   * Get structure at position
   */
  getStructureAt(x: number, y: number, radius: number = 32): PlacedStructure | null {
    for (const structure of this.structures.values()) {
      const dist = Math.hypot(structure.x - x, structure.y - y);
      if (dist < radius) {
        return structure;
      }
    }
    return null;
  }

  /**
   * Get all structures
   */
  getAllStructures(): PlacedStructure[] {
    return Array.from(this.structures.values());
  }

  /**
   * Check if currently in placement mode
   */
  isInPlacementMode(): boolean {
    return this.isPlacing;
  }

  /**
   * Save structures
   */
  async save(): Promise<void> {
    const data = Array.from(this.structures.values()).map(s => ({
      id: s.id,
      blueprintId: s.blueprintId,
      x: s.x,
      y: s.y,
      health: s.health,
      durability: s.durability
    }));
    
    localStorage.setItem('placed_structures', JSON.stringify(data));
  }

  /**
   * Load structures
   */
  async load(): Promise<void> {
    const saved = localStorage.getItem('placed_structures');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      
      for (const structureData of data) {
        const blueprint = this.blueprints.getBlueprint(structureData.blueprintId);
        if (!blueprint) continue;

        const structure = this.placeStructure(blueprint, structureData.x, structureData.y);
        if (structure) {
          structure.health = structureData.health;
          structure.durability = structureData.durability;
        }
      }
      
      console.log(`✅ Loaded ${data.length} structures`);
    } catch (error) {
      console.error('Failed to load structures:', error);
    }
  }
}
