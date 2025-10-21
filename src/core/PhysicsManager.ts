/**
 * PhysicsManager - Manages Matter.js physics engine
 * 
 * Singleton wrapper around Matter.js Engine and World.
 * Handles physics updates, body management, and collision filtering.
 * 
 * Collision Categories (powers of 2):
 * - PLAYER: 0x0001 (collides with enemies and walls)
 * - ENEMY: 0x0002 (collides with player, enemies, and walls)
 * - WALL: 0x0004 (collides with player and enemies)
 * - ITEM: 0x0008 (collides with player)
 * 
 * @example
 * ```typescript
 * const physics = PhysicsManager.getInstance();
 * physics.init();
 * 
 * // Create bodies with proper collision filtering
 * const playerBody = createCircleBody(100, 100, 16);
 * physics.setCollisionFilter(playerBody, 'player');
 * 
 * // In game loop
 * physics.update(deltaMs);
 * ```
 */
import Matter from 'matter-js';

/**
 * Collision categories for filtering (powers of 2)
 */
export const COLLISION_CATEGORY = {
  PLAYER: 0x0001,
  ENEMY: 0x0002,
  WALL: 0x0004,
  ITEM: 0x0008
};

/**
 * Collision masks (what each category collides with)
 */
export const COLLISION_MASK = {
  PLAYER: COLLISION_CATEGORY.ENEMY | COLLISION_CATEGORY.WALL,
  ENEMY: COLLISION_CATEGORY.PLAYER | COLLISION_CATEGORY.ENEMY | COLLISION_CATEGORY.WALL,
  WALL: COLLISION_CATEGORY.PLAYER | COLLISION_CATEGORY.ENEMY,
  ITEM: COLLISION_CATEGORY.PLAYER
};

export class PhysicsManager {
  private static instance: PhysicsManager | null = null;
  private engine: Matter.Engine | null = null;
  private world: Matter.World | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Gets the singleton instance
   * @returns The PhysicsManager instance
   */
  public static getInstance(): PhysicsManager {
    if (!PhysicsManager.instance) {
      PhysicsManager.instance = new PhysicsManager();
    }
    return PhysicsManager.instance;
  }

  /**
   * Initializes the physics engine
   * Sets up Matter.js with top-down (no gravity) configuration
   * 
   * @example
   * ```typescript
   * physics.init();
   * ```
   */
  public init(): void {
    if (this.isInitialized) {
      console.warn('PhysicsManager already initialized');
      return;
    }

    // Create engine with no gravity (top-down view)
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
      enableSleeping: false // ⚡ CRITICAL: Disable sleeping to ensure collision detection always runs
    });
    
    this.world = this.engine.world;
    
    // 🔧 FORCE collision detection to be active
    console.log('🔧 Physics engine created with collision detection enabled');
    console.log('   enableSleeping:', this.engine.enableSleeping);
    console.log('   detector type:', this.engine.detector?.constructor?.name);
    
    this.isInitialized = true;
  }

  /**
   * Updates the physics simulation
   * Call this in your game loop
   * 
   * @param deltaMs - Time elapsed since last update in milliseconds
   * 
   * @example
   * ```typescript
   * // In game loop
   * app.ticker.add((ticker) => {
   *   physics.update(ticker.deltaMS);
   * });
   * ```
   */
  public update(deltaMs: number): void {
    if (!this.engine) {
      console.warn('PhysicsManager not initialized');
      return;
    }

    // Matter.js expects delta in milliseconds
    Matter.Engine.update(this.engine, deltaMs);
  }

  /**
   * Adds a body to the physics world
   * 
   * @param body - The Matter.js body to add
   * 
   * @example
   * ```typescript
   * const playerBody = Matter.Bodies.circle(100, 100, 16);
   * physics.addBody(playerBody);
   * ```
   */
  public addBody(body: Matter.Body): void {
    if (!this.world) {
      console.warn('PhysicsManager not initialized');
      return;
    }

    Matter.World.add(this.world, body);
  }

  /**
   * Removes a body from the physics world
   * 
   * @param body - The Matter.js body to remove
   * 
   * @example
   * ```typescript
   * physics.removeBody(playerBody);
   * ```
   */
  public removeBody(body: Matter.Body): void {
    if (!this.world) {
      console.warn('PhysicsManager not initialized');
      return;
    }

    Matter.World.remove(this.world, body);
  }

  /**
   * Adds multiple bodies to the physics world
   * 
   * @param bodies - Array of bodies to add
   * 
   * @example
   * ```typescript
   * const walls = [wall1, wall2, wall3];
   * physics.addBodies(walls);
   * ```
   */
  public addBodies(bodies: Matter.Body[]): void {
    if (!this.world) {
      console.warn('PhysicsManager not initialized');
      return;
    }

    Matter.World.add(this.world, bodies);
  }

  /**
   * Removes multiple bodies from the physics world
   * 
   * @param bodies - Array of bodies to remove
   */
  public removeBodies(bodies: Matter.Body[]): void {
    if (!this.world) {
      console.warn('PhysicsManager not initialized');
      return;
    }

    Matter.World.remove(this.world, bodies);
  }

  /**
   * Gets the Matter.js engine
   * @returns The engine or null if not initialized
   */
  public getEngine(): Matter.Engine | null {
    return this.engine;
  }

  /**
   * Gets the Matter.js world
   * @returns The world or null if not initialized
   */
  public getWorld(): Matter.World | null {
    return this.world;
  }

  /**
   * Checks if physics is initialized
   * @returns True if initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Gets all bodies in the world
   * @returns Array of bodies
   */
  public getAllBodies(): Matter.Body[] {
    if (!this.world) {
      return [];
    }
    return this.world.bodies;
  }

  /**
   * Clears all bodies from the world
   * 
   * @example
   * ```typescript
   * // When switching scenes
   * physics.clear();
   * ```
   */
  public clear(): void {
    if (!this.world) {
      return;
    }

    Matter.World.clear(this.world, false);
  }

  /**
   * Resets the physics manager
   * Clears the engine and allows re-initialization
   */
  public reset(): void {
    this.clear();
    if (this.engine) {
      Matter.Engine.clear(this.engine);
    }
    this.engine = null;
    this.world = null;
    this.isInitialized = false;
  }

  /**
   * Sets collision filter for a body
   * 
   * @param body - The body to set collision filter for
   * @param category - Collision category ('player', 'enemy', 'wall', 'item')
   * 
   * @example
   * ```typescript
   * const body = createCircleBody(100, 100, 16);
   * physics.setCollisionFilter(body, 'player');
   * ```
   */
  public setCollisionFilter(
    body: Matter.Body,
    category: 'player' | 'enemy' | 'wall' | 'item'
  ): void {
    const categoryKey = (category.toUpperCase()) as keyof typeof COLLISION_CATEGORY;
    const maskKey = (category.toUpperCase()) as keyof typeof COLLISION_MASK;
    
    body.collisionFilter = {
      category: COLLISION_CATEGORY[categoryKey],
      mask: COLLISION_MASK[maskKey]
    };
    
    // Debug logging for collision filter setup
    console.log(`[PhysicsManager] Body '${body.label}' collision filter: category=0x${COLLISION_CATEGORY[categoryKey].toString(16)}, mask=0x${COLLISION_MASK[maskKey].toString(16)}`);
  }

  /**
   * Disposes of the physics manager
   * For testing purposes
   */
  public static dispose(): void {
    if (PhysicsManager.instance) {
      PhysicsManager.instance.reset();
      PhysicsManager.instance = null;
    }
  }
}
