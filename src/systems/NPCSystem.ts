/**
 * NPCSystem - Non-player character management
 * 
 * Handles NPC placement, interaction, and behavior in the overworld.
 * NPCs can have dialogue, quests, and shops.
 * 
 * @example
 * ```typescript
 * const npcSystem = NPCSystem.getInstance();
 * npcSystem.init(app);
 * 
 * // Add NPC to world
 * const npc = npcSystem.createNPC({
 *   id: 'elder_village',
 *   name: 'Thôn Trưởng',
 *   x: 100,
 *   y: 200,
 *   dialogue: 'elder_greeting'
 * });
 * 
 * // Check interaction
 * const nearbyNPC = npcSystem.getNearbyNPC(playerX, playerY, 50);
 * ```
 */
import * as PIXI from 'pixi.js';
import { EventBus } from '../core/EventBus';

/**
 * NPC type
 */
export type NPCType = 'villager' | 'elder' | 'merchant' | 'trainer' | 'guide';

/**
 * NPC data interface
 */
export interface NPCData {
  id: string;
  name: string;
  type: NPCType;
  x: number;
  y: number;
  spriteAsset?: string;
  dialogue?: string;
  questId?: string;
  shopId?: string;
  repeatable?: boolean;
}

/**
 * NPC instance
 */
export interface NPC extends NPCData {
  sprite: PIXI.Sprite;
  container: PIXI.Container;
  interactionRadius: number;
  hasBeenTalkedTo: boolean;
}

/**
 * NPCSystem singleton class
 */
export class NPCSystem {
  private static instance: NPCSystem;
  private app: PIXI.Application | null = null;
  private eventBus: EventBus;
  private npcs: Map<string, NPC> = new Map();
  private worldContainer: PIXI.Container | null = null;

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NPCSystem {
    if (!NPCSystem.instance) {
      NPCSystem.instance = new NPCSystem();
    }
    return NPCSystem.instance;
  }

  /**
   * Initialize NPC system
   * @param app - PixiJS application
   */
  init(app: PIXI.Application): void {
    this.app = app;
  }

  /**
   * Set world container for NPCs
   * @param container - World container
   */
  setWorldContainer(container: PIXI.Container): void {
    this.worldContainer = container;
  }

  /**
   * Create and add NPC to world
   * @param data - NPC data
   * @returns Created NPC instance
   */
  createNPC(data: NPCData): NPC {
    if (this.npcs.has(data.id)) {
      console.warn(`NPC ${data.id} already exists`);
      return this.npcs.get(data.id)!;
    }

    // Create NPC container
    const container = new PIXI.Container();
    container.x = data.x;
    container.y = data.y;

    // Create sprite (placeholder for now)
    const sprite = this.createNPCSprite(data.type);
    container.addChild(sprite);

    // Create interaction indicator (exclamation mark)
    const indicator = this.createInteractionIndicator();
    indicator.visible = false;
    indicator.y = -40;
    container.addChild(indicator);

    // Create NPC instance
    const npc: NPC = {
      ...data,
      sprite,
      container,
      interactionRadius: 50,
      hasBeenTalkedTo: false
    };

    // Add to world
    if (this.worldContainer) {
      this.worldContainer.addChild(container);
    }

    // Store NPC
    this.npcs.set(data.id, npc);

    return npc;
  }

  /**
   * Create NPC sprite based on type
   * @param type - NPC type
   * @returns Sprite
   */
  private createNPCSprite(type: NPCType): PIXI.Sprite {
    // Create placeholder sprite with color based on type
    const colors: Record<NPCType, number> = {
      villager: 0x4444ff,
      elder: 0xffaa00,
      merchant: 0x44ff44,
      trainer: 0xff4444,
      guide: 0xff44ff
    };

    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 16);
    graphics.fill({ color: colors[type] });
    graphics.stroke({ width: 2, color: 0xffffff });

    if (!this.app) {
      return new PIXI.Sprite();
    }

    const texture = this.app.renderer.generateTexture(graphics);
    return new PIXI.Sprite(texture);
  }

  /**
   * Create interaction indicator
   * @returns Indicator sprite
   */
  private createInteractionIndicator(): PIXI.Sprite {
    const graphics = new PIXI.Graphics();
    
    // Exclamation mark
    graphics.rect(-3, -20, 6, 12);
    graphics.fill({ color: 0xffff00 });
    graphics.circle(0, -5, 3);
    graphics.fill({ color: 0xffff00 });

    if (!this.app) {
      return new PIXI.Sprite();
    }

    const texture = this.app.renderer.generateTexture(graphics);
    return new PIXI.Sprite(texture);
  }

  /**
   * Get NPC by ID
   * @param id - NPC ID
   * @returns NPC instance or undefined
   */
  getNPC(id: string): NPC | undefined {
    return this.npcs.get(id);
  }

  /**
   * Get all NPCs
   * @returns Array of NPCs
   */
  getAllNPCs(): NPC[] {
    return Array.from(this.npcs.values());
  }

  /**
   * Get nearby NPC within radius
   * @param x - Player X position
   * @param y - Player Y position
   * @param radius - Interaction radius
   * @returns Nearby NPC or null
   */
  getNearbyNPC(x: number, y: number, radius: number = 50): NPC | null {
    for (const npc of this.npcs.values()) {
      const dx = npc.container.x - x;
      const dy = npc.container.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        return npc;
      }
    }

    return null;
  }

  /**
   * Show interaction indicator for NPC
   * @param npcId - NPC ID
   * @param show - Show or hide indicator
   */
  showInteractionIndicator(npcId: string, show: boolean): void {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    const indicator = npc.container.children[1] as PIXI.Sprite;
    if (indicator) {
      indicator.visible = show;
    }
  }

  /**
   * Interact with NPC
   * @param npcId - NPC ID
   */
  interact(npcId: string): void {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    npc.hasBeenTalkedTo = true;

    // Emit interaction event
    this.eventBus.emit('npc:interact', {
      npcId: npc.id,
      npcName: npc.name,
      dialogue: npc.dialogue,
      questId: npc.questId,
      shopId: npc.shopId
    });
  }

  /**
   * Update NPC system (call in game loop)
   * @param playerX - Player X position
   * @param playerY - Player Y position
   */
  update(playerX: number, playerY: number): void {
    // Check proximity to NPCs and show/hide indicators
    for (const npc of this.npcs.values()) {
      const dx = npc.container.x - playerX;
      const dy = npc.container.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const isNearby = distance <= npc.interactionRadius;
      this.showInteractionIndicator(npc.id, isNearby);
    }
  }

  /**
   * Remove NPC from world
   * @param npcId - NPC ID
   */
  removeNPC(npcId: string): void {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    if (this.worldContainer) {
      this.worldContainer.removeChild(npc.container);
    }

    npc.container.destroy({ children: true });
    this.npcs.delete(npcId);
  }

  /**
   * Clear all NPCs
   */
  clearAll(): void {
    for (const npc of this.npcs.values()) {
      if (this.worldContainer) {
        this.worldContainer.removeChild(npc.container);
      }
      npc.container.destroy({ children: true });
    }

    this.npcs.clear();
  }

  /**
   * Load NPCs from data array
   * @param npcsData - Array of NPC data
   */
  loadNPCs(npcsData: NPCData[]): void {
    for (const data of npcsData) {
      this.createNPC(data);
    }
  }

  /**
   * Get NPCs by type
   * @param type - NPC type
   * @returns Array of NPCs
   */
  getNPCsByType(type: NPCType): NPC[] {
    return Array.from(this.npcs.values()).filter(npc => npc.type === type);
  }

  /**
   * Mark NPC dialogue as seen
   * @param npcId - NPC ID
   */
  markAsSeen(npcId: string): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.hasBeenTalkedTo = true;
    }
  }

  /**
   * Check if NPC has been talked to
   * @param npcId - NPC ID
   * @returns True if talked to
   */
  hasBeenTalkedTo(npcId: string): boolean {
    const npc = this.npcs.get(npcId);
    return npc?.hasBeenTalkedTo || false;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearAll();
  }
}
