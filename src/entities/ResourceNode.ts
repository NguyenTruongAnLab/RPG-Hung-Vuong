/**
 * ResourceNode - Base class for harvestable resources
 * 
 * Represents resources like trees, rocks, bushes that can be harvested.
 * Each resource has health, drops items, and provides visual feedback.
 * 
 * @example
 * ```typescript
 * const tree = new ResourceNode({
 *   type: 'tree',
 *   health: 100,
 *   dropTable: [{ itemId: 'wood', min: 3, max: 5 }],
 *   toolRequired: 'axe'
 * });
 * ```
 */
import * as PIXI from 'pixi.js';
import { InventorySystem } from '../systems/InventorySystem';

/**
 * Resource type
 */
export type ResourceType = 'tree' | 'rock' | 'bush' | 'grass' | 'ore' | 'crystal';

/**
 * Tool type
 */
export type ToolType = 'axe' | 'pickaxe' | 'hand' | 'none';

/**
 * Drop entry
 */
export interface DropEntry {
  itemId: string;
  min: number;
  max: number;
  chance: number; // 0-1
}

/**
 * Resource configuration
 */
export interface ResourceNodeConfig {
  type: ResourceType;
  x: number;
  y: number;
  health: number;
  dropTable: DropEntry[];
  toolRequired: ToolType;
  respawnTime?: number; // milliseconds, 0 = no respawn
}

/**
 * ResourceNode class
 */
export class ResourceNode {
  private config: ResourceNodeConfig;
  private currentHealth: number;
  private maxHealth: number;
  private isDestroyed: boolean = false;
  private respawnTimer: number = 0;
  
  // Visual
  public sprite: PIXI.Sprite;
  private healthBar: PIXI.Container | null = null;
  
  // Interaction
  private isInteractable: boolean = true;

  /**
   * Creates a new ResourceNode
   */
  constructor(config: ResourceNodeConfig) {
    this.config = config;
    this.maxHealth = config.health;
    this.currentHealth = config.health;
    
    // Create sprite (placeholder graphics)
    this.sprite = this.createSprite();
    this.sprite.x = config.x;
    this.sprite.y = config.y;
  }

  /**
   * Create placeholder sprite for resource
   */
  private createSprite(): PIXI.Sprite {
    const graphics = new PIXI.Graphics();
    
    switch (this.config.type) {
      case 'tree':
        // Brown trunk
        graphics.rect(-8, -32, 16, 32).fill({ color: 0x8B4513 });
        // Green foliage
        graphics.circle(0, -32, 20).fill({ color: 0x228B22 });
        graphics.circle(-15, -28, 15).fill({ color: 0x006400 });
        graphics.circle(15, -28, 15).fill({ color: 0x006400 });
        break;
        
      case 'rock':
        graphics.rect(-16, -16, 32, 32).fill({ color: 0x808080 });
        graphics.rect(-12, -12, 24, 24).fill({ color: 0xA9A9A9 });
        break;
        
      case 'bush':
        graphics.circle(0, 0, 12).fill({ color: 0x90EE90 });
        graphics.circle(-8, -2, 10).fill({ color: 0x7CFC00 });
        graphics.circle(8, -2, 10).fill({ color: 0x7CFC00 });
        // Berries
        graphics.circle(-5, -5, 3).fill({ color: 0xFF0000 });
        graphics.circle(5, -5, 3).fill({ color: 0xFF0000 });
        break;
        
      case 'grass':
        graphics.rect(-6, -8, 12, 16).fill({ color: 0x7CFC00 });
        break;
        
      case 'ore':
        graphics.rect(-16, -16, 32, 32).fill({ color: 0x696969 });
        graphics.rect(-8, -8, 16, 16).fill({ color: 0xFFD700 });
        break;
        
      case 'crystal':
        graphics.moveTo(0, -20).lineTo(10, 0).lineTo(0, 20).lineTo(-10, 0).closePath().fill({ color: 0x00FFFF });
        break;
    }
    
    const texture = PIXI.RenderTexture.create({ width: 64, height: 64 });
    
    // Generate texture from graphics (simpler approach for placeholder)
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.width = 32;
    sprite.height = 32;
    sprite.anchor.set(0.5, 1); // Bottom center
    
    // Add graphics as child for visual representation
    sprite.addChild(graphics);
    graphics.y = -16;
    
    return sprite;
  }

  /**
   * Take damage from harvesting
   */
  takeDamage(amount: number, toolType: ToolType): boolean {
    if (this.isDestroyed || !this.isInteractable) return false;
    
    // Check tool requirement
    if (this.config.toolRequired !== 'none' && toolType !== this.config.toolRequired) {
      console.log(`Wrong tool! Need ${this.config.toolRequired}, used ${toolType}`);
      return false;
    }
    
    this.currentHealth -= amount;
    
    // Update health bar
    this.updateHealthBar();
    
    // Visual feedback
    this.showDamageEffect();
    
    // Check if destroyed
    if (this.currentHealth <= 0) {
      this.destroy();
      return true;
    }
    
    return false;
  }

  /**
   * Show damage effect
   */
  private showDamageEffect(): void {
    // Flash white
    const originalTint = this.sprite.tint;
    this.sprite.tint = 0xFFFFFF;
    
    setTimeout(() => {
      if (this.sprite) {
        this.sprite.tint = originalTint;
      }
    }, 100);
    
    // Shake
    const originalX = this.sprite.x;
    this.sprite.x = originalX - 3;
    setTimeout(() => {
      if (this.sprite) {
        this.sprite.x = originalX + 3;
        setTimeout(() => {
          if (this.sprite) {
            this.sprite.x = originalX;
          }
        }, 50);
      }
    }, 50);
  }

  /**
   * Update health bar visual
   */
  private updateHealthBar(): void {
    if (!this.healthBar) {
      this.createHealthBar();
    }
    
    if (this.healthBar) {
      const bar = this.healthBar.getChildAt(1) as PIXI.Graphics;
      bar.clear();
      
      const healthPercent = this.currentHealth / this.maxHealth;
      const barWidth = 32;
      const fillWidth = barWidth * healthPercent;
      
      // Color based on health
      let color = 0x00FF00;
      if (healthPercent < 0.3) color = 0xFF0000;
      else if (healthPercent < 0.6) color = 0xFFFF00;
      
      bar.rect(0, 0, fillWidth, 4).fill({ color });
    }
  }

  /**
   * Create health bar
   */
  private createHealthBar(): void {
    this.healthBar = new PIXI.Container();
    this.healthBar.y = -40;
    this.healthBar.x = -16;
    
    // Background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, 32, 4).fill({ color: 0x000000, alpha: 0.5 });
    this.healthBar.addChild(bg);
    
    // Health fill
    const fill = new PIXI.Graphics();
    this.healthBar.addChild(fill);
    
    this.sprite.addChild(this.healthBar);
    this.updateHealthBar();
  }

  /**
   * Destroy resource and drop items
   */
  private destroy(): void {
    this.isDestroyed = true;
    this.isInteractable = false;
    
    // Drop items
    this.dropItems();
    
    // Hide sprite
    this.sprite.alpha = 0.3;
    
    // Start respawn timer if configured
    if (this.config.respawnTime && this.config.respawnTime > 0) {
      this.respawnTimer = this.config.respawnTime;
    } else {
      // No respawn, mark for removal
      this.sprite.visible = false;
    }
  }

  /**
   * Drop items to inventory
   */
  private dropItems(): void {
    const inventory = InventorySystem.getInstance();
    
    this.config.dropTable.forEach(drop => {
      // Check chance
      if (Math.random() > drop.chance) return;
      
      // Random amount
      const amount = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
      
      // Add to inventory
      const success = inventory.addItem(drop.itemId, amount);
      
      if (success) {
        console.log(`+${amount} ${drop.itemId}`);
      }
    });
  }

  /**
   * Update resource (call in game loop)
   */
  update(deltaMs: number): void {
    if (this.respawnTimer > 0) {
      this.respawnTimer -= deltaMs;
      
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
    }
  }

  /**
   * Respawn resource
   */
  private respawn(): void {
    this.currentHealth = this.maxHealth;
    this.isDestroyed = false;
    this.isInteractable = true;
    this.sprite.alpha = 1;
    this.sprite.visible = true;
    
    if (this.healthBar) {
      this.healthBar.visible = false;
    }
  }

  /**
   * Check if resource is interactable
   */
  isAvailable(): boolean {
    return this.isInteractable && !this.isDestroyed;
  }

  /**
   * Get resource type
   */
  getType(): ResourceType {
    return this.config.type;
  }

  /**
   * Get required tool
   */
  getRequiredTool(): ToolType {
    return this.config.toolRequired;
  }

  /**
   * Get position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.config.x, y: this.config.y };
  }

  /**
   * Dispose of resource
   */
  dispose(): void {
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    this.sprite.destroy();
  }
}
