/**
 * GatheringSystem - Manages resource harvesting mechanics
 * 
 * Handles player interaction with ResourceNodes, tool requirements,
 * harvest animations, and particle effects.
 * 
 * @example
 * ```typescript
 * const gathering = new GatheringSystem(physics, particleManager);
 * await gathering.init(worldContainer);
 * 
 * // In update loop
 * if (input.isInteractPressed()) {
 *   gathering.tryHarvest(player.getPosition(), equippedTool);
 * }
 * ```
 */
import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { ResourceNode, ResourceType, ToolType } from '../entities/ResourceNode';
import { PhysicsManager } from '../core/PhysicsManager';
import { ParticleManager } from '../managers/ParticleManager';
import { InventorySystem } from './InventorySystem';
import { BiomeGenerator } from '../world/BiomeGenerator';

/**
 * Tool damage mapping
 */
const TOOL_DAMAGE: Record<ToolType, number> = {
  'hand': 10,
  'axe': 50,
  'pickaxe': 40,
  'none': 0
};

/**
 * Tool durability cost per hit
 */
const TOOL_DURABILITY_COST: Record<ToolType, number> = {
  'hand': 0,
  'axe': 1,
  'pickaxe': 1,
  'none': 0
};

/**
 * GatheringSystem class
 */
export class GatheringSystem {
  private physics: PhysicsManager;
  private particleManager: ParticleManager;
  private worldContainer: PIXI.Container | null = null;
  
  // Resources
  private resources: Map<string, ResourceNode> = new Map();
  private nextResourceId: number = 0;
  
  // Interaction settings
  private readonly INTERACTION_RADIUS = 64; // pixels
  private readonly HARVEST_COOLDOWN = 500; // ms
  private lastHarvestTime: number = 0;
  
  // Current tool equipped
  private equippedTool: ToolType = 'hand';

  /**
   * Creates a new GatheringSystem
   */
  constructor(physics: PhysicsManager, particleManager: ParticleManager) {
    this.physics = physics;
    this.particleManager = particleManager;
  }

  /**
   * Initialize gathering system
   */
  async init(worldContainer: PIXI.Container): Promise<void> {
    this.worldContainer = worldContainer;
    console.log('✅ GatheringSystem initialized');
  }

  /**
   * Spawn resource at location
   */
  spawnResource(type: ResourceType, x: number, y: number, toolRequired: ToolType = 'hand'): ResourceNode {
    const config = this.getResourceConfig(type, x, y, toolRequired);
    const resource = new ResourceNode(config);
    
    const id = `resource_${this.nextResourceId++}`;
    this.resources.set(id, resource);
    
    if (this.worldContainer) {
      this.worldContainer.addChild(resource.sprite);
    }
    
    return resource;
  }

  /**
   * Get resource configuration based on type
   */
  private getResourceConfig(type: ResourceType, x: number, y: number, toolRequired: ToolType): any {
    switch (type) {
      case 'tree':
        return {
          type: 'tree',
          x, y,
          health: 100,
          dropTable: [
            { itemId: 'wood', min: 3, max: 5, chance: 1.0 }
          ],
          toolRequired: 'axe',
          respawnTime: 60000 // 60 seconds
        };
        
      case 'rock':
        return {
          type: 'rock',
          x, y,
          health: 150,
          dropTable: [
            { itemId: 'stone', min: 2, max: 4, chance: 1.0 }
          ],
          toolRequired: 'pickaxe',
          respawnTime: 90000 // 90 seconds
        };
        
      case 'bush':
        return {
          type: 'bush',
          x, y,
          health: 30,
          dropTable: [
            { itemId: 'berries', min: 1, max: 3, chance: 0.8 },
            { itemId: 'fiber', min: 1, max: 2, chance: 0.5 }
          ],
          toolRequired: 'hand',
          respawnTime: 45000 // 45 seconds
        };
        
      case 'grass':
        return {
          type: 'grass',
          x, y,
          health: 10,
          dropTable: [
            { itemId: 'fiber', min: 1, max: 2, chance: 1.0 }
          ],
          toolRequired: 'hand',
          respawnTime: 30000 // 30 seconds
        };
        
      default:
        return {
          type,
          x, y,
          health: 50,
          dropTable: [],
          toolRequired: 'hand',
          respawnTime: 0
        };
    }
  }

  /**
   * Try to harvest nearby resource
   */
  tryHarvest(playerPos: { x: number; y: number }, toolType: ToolType = this.equippedTool): boolean {
    // Check cooldown
    const now = Date.now();
    if (now - this.lastHarvestTime < this.HARVEST_COOLDOWN) {
      return false;
    }
    
    // Find nearest resource
    const nearestResource = this.findNearestResource(playerPos);
    
    if (!nearestResource) {
      console.log('No resource nearby');
      return false;
    }
    
    const resource = nearestResource.resource;
    
    // Check if available
    if (!resource.isAvailable()) {
      return false;
    }
    
    // Get damage amount
    const damage = TOOL_DAMAGE[toolType] || 10;
    
    // Apply damage
    const destroyed = resource.takeDamage(damage, toolType);
    
    // Play harvest animation
    this.playHarvestAnimation(resource.getPosition(), resource.getType());
    
    // Update last harvest time
    this.lastHarvestTime = now;
    
    // Damage tool durability
    if (toolType !== 'hand' && toolType !== 'none') {
      this.damageTool(toolType);
    }
    
    if (destroyed) {
      console.log(`Harvested ${resource.getType()}!`);
    }
    
    return true;
  }

  /**
   * Find nearest resource within interaction radius
   */
  private findNearestResource(playerPos: { x: number; y: number }): { resource: ResourceNode; distance: number } | null {
    let nearest: { resource: ResourceNode; distance: number } | null = null;
    
    this.resources.forEach((resource) => {
      if (!resource.isAvailable()) return;
      
      const resPos = resource.getPosition();
      const dx = resPos.x - playerPos.x;
      const dy = resPos.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= this.INTERACTION_RADIUS) {
        if (!nearest || distance < nearest.distance) {
          nearest = { resource, distance };
        }
      }
    });
    
    return nearest;
  }

  /**
   * Play harvest animation
   */
  private playHarvestAnimation(pos: { x: number; y: number }, type: ResourceType): void {
    // Particle effect based on resource type
    let particleColor = 0xFFFFFF;
    
    switch (type) {
      case 'tree':
        particleColor = 0x8B4513; // Brown
        break;
      case 'rock':
        particleColor = 0x808080; // Gray
        break;
      case 'bush':
        particleColor = 0x90EE90; // Light green
        break;
      case 'grass':
        particleColor = 0x7CFC00; // Lawn green
        break;
    }
    
    // Create simple particle burst
    this.createParticleBurst(pos.x, pos.y, particleColor);
  }

  /**
   * Create particle burst effect
   */
  private createParticleBurst(x: number, y: number, color: number): void {
    if (!this.worldContainer) return;
    
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 50 + Math.random() * 50;
      
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 3 + Math.random() * 2).fill({ color });
      particle.x = x;
      particle.y = y;
      
      this.worldContainer.addChild(particle);
      
      // Animate particle
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const startTime = Date.now();
      const duration = 500 + Math.random() * 300;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
          particle.destroy();
          return;
        }
        
        particle.x += vx * 0.016;
        particle.y += vy * 0.016 + (progress * 30); // Gravity
        particle.alpha = 1 - progress;
        
        requestAnimationFrame(animate);
      };
      
      animate();
    }
  }

  /**
   * Damage equipped tool
   */
  private damageTool(toolType: ToolType): void {
    // For now, just log. Tool durability system will be enhanced later
    const durabilityLoss = TOOL_DURABILITY_COST[toolType] || 1;
    console.log(`Tool ${toolType} durability: -${durabilityLoss}`);
    
    // TODO: Implement tool durability tracking in InventorySystem
  }

  /**
   * Set equipped tool
   */
  setEquippedTool(toolType: ToolType): void {
    this.equippedTool = toolType;
    console.log(`Equipped: ${toolType}`);
  }

  /**
   * Get equipped tool
   */
  getEquippedTool(): ToolType {
    return this.equippedTool;
  }

  /**
   * Update all resources
   */
  update(deltaMs: number): void {
    this.resources.forEach((resource) => {
      resource.update(deltaMs);
    });
  }

  /**
   * Get all resources
   */
  getResources(): ResourceNode[] {
    return Array.from(this.resources.values());
  }

  /**
   * Remove resource
   */
  removeResource(id: string): void {
    const resource = this.resources.get(id);
    if (resource) {
      resource.dispose();
      this.resources.delete(id);
    }
  }

  /**
   * Clear all resources
   */
  clear(): void {
    this.resources.forEach((resource) => {
      resource.dispose();
    });
    this.resources.clear();
  }

  /**
   * Populate resources in chunk area (called by ChunkSystem)
   */
  populateChunkResources(
    chunkX: number,
    chunkY: number,
    chunkSize: number,
    tileSize: number,
    biomeGenerator: BiomeGenerator
  ): void {
    const startX = chunkX * chunkSize * tileSize;
    const startY = chunkY * chunkSize * tileSize;
    
    // Spawn resources based on biome
    for (let ty = 0; ty < chunkSize; ty++) {
      for (let tx = 0; tx < chunkSize; tx++) {
        const worldX = startX + tx * tileSize;
        const worldY = startY + ty * tileSize;
        
        const tileX = chunkX * chunkSize + tx;
        const tileY = chunkY * chunkSize + ty;
        
        const biomeData = biomeGenerator.getBiomeAt(tileX, tileY);
        
        // Check if should spawn tree
        if (biomeGenerator.shouldSpawnResource(biomeData, 'trees', tileX, tileY)) {
          this.spawnResource('tree', worldX, worldY, 'axe');
        }
        
        // Check if should spawn rock
        if (biomeGenerator.shouldSpawnResource(biomeData, 'rocks', tileX, tileY)) {
          this.spawnResource('rock', worldX, worldY, 'pickaxe');
        }
        
        // Check if should spawn bush
        if (biomeGenerator.shouldSpawnResource(biomeData, 'bushes', tileX, tileY)) {
          this.spawnResource('bush', worldX, worldY, 'hand');
        }
      }
    }
  }

  /**
   * Dispose of gathering system
   */
  dispose(): void {
    this.clear();
  }
}
