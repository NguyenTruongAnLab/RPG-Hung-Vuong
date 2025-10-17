/**
 * CollisionSystem - Manages Matter.js collision events
 * 
 * Listens to Matter.js collision events and emits game-specific
 * events through EventBus for easy handling.
 * 
 * @example
 * ```typescript
 * const collisionSystem = new CollisionSystem(physics, eventBus);
 * collisionSystem.init();
 * 
 * // Listen for collision events
 * eventBus.on('collision:player-enemy', (data) => {
 *   console.log('Player hit enemy!');
 * });
 * ```
 */
import Matter from 'matter-js';
import { PhysicsManager } from '../core/PhysicsManager';
import { EventBus } from '../core/EventBus';

export class CollisionSystem {
  private physics: PhysicsManager;
  private eventBus: EventBus;
  private isInitialized: boolean = false;

  constructor(physics: PhysicsManager, eventBus: EventBus) {
    this.physics = physics;
    this.eventBus = eventBus;
  }

  /**
   * Initializes the collision system
   * Sets up Matter.js collision event listeners
   * 
   * @example
   * ```typescript
   * collisionSystem.init();
   * ```
   */
  public init(): void {
    if (this.isInitialized) {
      console.warn('CollisionSystem already initialized');
      return;
    }

    const engine = this.physics.getEngine();
    if (!engine) {
      console.warn('Physics engine not initialized');
      return;
    }

    // Listen to collision start events
    Matter.Events.on(engine, 'collisionStart', this.handleCollisionStart);

    // Listen to collision end events
    Matter.Events.on(engine, 'collisionEnd', this.handleCollisionEnd);

    this.isInitialized = true;
  }

  /**
   * Handles collision start events
   * Emits specific events based on body labels
   */
  private handleCollisionStart = (event: Matter.IEventCollision<Matter.Engine>): void => {
    const pairs = event.pairs;

    for (const pair of pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Emit generic collision event
      this.eventBus.emit('collision:start', {
        bodyA,
        bodyB,
        pair
      });

      // Emit specific collision events based on labels
      this.emitLabeledCollision('start', bodyA, bodyB);
    }
  };

  /**
   * Handles collision end events
   */
  private handleCollisionEnd = (event: Matter.IEventCollision<Matter.Engine>): void => {
    const pairs = event.pairs;

    for (const pair of pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Emit generic collision event
      this.eventBus.emit('collision:end', {
        bodyA,
        bodyB,
        pair
      });

      // Emit specific collision events based on labels
      this.emitLabeledCollision('end', bodyA, bodyB);
    }
  };

  /**
   * Emits labeled collision events
   * Creates events like 'collision:player-wall' based on body labels
   */
  private emitLabeledCollision(
    phase: 'start' | 'end',
    bodyA: Matter.Body,
    bodyB: Matter.Body
  ): void {
    const labelA = bodyA.label || 'unknown';
    const labelB = bodyB.label || 'unknown';

    // Emit both orderings for convenience
    this.eventBus.emit(`collision:${phase}:${labelA}-${labelB}`, {
      bodyA,
      bodyB
    });

    this.eventBus.emit(`collision:${phase}:${labelB}-${labelA}`, {
      bodyA: bodyB,
      bodyB: bodyA
    });
  }

  /**
   * Registers a collision handler for specific body labels
   * 
   * @param labelA - First body label
   * @param labelB - Second body label
   * @param handler - Callback function
   * 
   * @example
   * ```typescript
   * collisionSystem.onCollision('player', 'enemy', (data) => {
   *   console.log('Player collided with enemy');
   * });
   * ```
   */
  public onCollision(
    labelA: string,
    labelB: string,
    handler: (data: any) => void
  ): void {
    this.eventBus.on(`collision:start:${labelA}-${labelB}`, handler);
  }

  /**
   * Registers a collision end handler for specific body labels
   * 
   * @param labelA - First body label
   * @param labelB - Second body label
   * @param handler - Callback function
   */
  public onCollisionEnd(
    labelA: string,
    labelB: string,
    handler: (data: any) => void
  ): void {
    this.eventBus.on(`collision:end:${labelA}-${labelB}`, handler);
  }

  /**
   * Unregisters a collision handler
   * 
   * @param labelA - First body label
   * @param labelB - Second body label
   * @param handler - Callback function to remove
   */
  public offCollision(
    labelA: string,
    labelB: string,
    handler: (data: any) => void
  ): void {
    this.eventBus.off(`collision:start:${labelA}-${labelB}`, handler);
  }

  /**
   * Disposes of the collision system
   * Removes event listeners
   */
  public dispose(): void {
    const engine = this.physics.getEngine();
    if (engine) {
      Matter.Events.off(engine, 'collisionStart', this.handleCollisionStart);
      Matter.Events.off(engine, 'collisionEnd', this.handleCollisionEnd);
    }
    this.isInitialized = false;
  }
}
