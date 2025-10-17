/**
 * PhysicsManager - Manages Matter.js physics engine
 * 
 * Singleton wrapper around Matter.js Engine and World.
 * Handles physics updates and body management.
 * 
 * @example
 * ```typescript
 * const physics = PhysicsManager.getInstance();
 * physics.init();
 * 
 * // In game loop
 * physics.update(deltaMs);
 * ```
 */
import Matter from 'matter-js';

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
      gravity: { x: 0, y: 0, scale: 0 }
    });
    
    this.world = this.engine.world;
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
