/**
 * Player - Main player entity
 * 
 * Orchestrates player components using composition pattern.
 * Combines movement, combat, and stats into a single entity.
 * 
 * @example
 * ```typescript
 * const player = new Player(100, 100, physics);
 * 
 * // In game loop
 * player.update(ticker.deltaMS, input);
 * 
 * // Get position for rendering
 * const pos = player.getPosition();
 * sprite.x = pos.x;
 * sprite.y = pos.y;
 * ```
 */
import Matter from 'matter-js';
import { PhysicsManager } from '../core/PhysicsManager';
import { InputManager } from '../core/InputManager';
import { PlayerMovement } from './components/PlayerMovement';
import { PlayerCombat } from './components/PlayerCombat';
import { PlayerStats, PlayerStatsData } from './components/PlayerStats';
import { PlayerAnimation } from './components/PlayerAnimation';
import { createCircleBody } from '../utils/MatterHelpers';
import { Vector2D } from '../utils/Vector2D';

export class Player {
  private body: Matter.Body;
  private physics: PhysicsManager;
  private characterScale: number = 1.0;
  
  // Components
  public movement: PlayerMovement;
  public combat: PlayerCombat;
  public stats: PlayerStats;
  public animation: PlayerAnimation;

  /**
   * Creates a new Player
   * 
   * @param x - Initial X position
   * @param y - Initial Y position
   * @param physics - Physics manager instance
   * @param initialStats - Optional initial stats
   * 
   * @example
   * ```typescript
   * const player = new Player(400, 300, physics);
   * ```
   */
  constructor(
    x: number,
    y: number,
    physics: PhysicsManager,
    initialStats?: Partial<PlayerStatsData>
  ) {
    this.physics = physics;

    // Create physics body with proper collision settings
    this.body = createCircleBody(x, y, 16, {
      label: 'player',
      friction: 0.01,
      frictionAir: 0.01,      // Low damping for responsive controls
      restitution: 0.0,       // No bounciness - solid collisions
      density: 0.001,         // Low density for responsive movement (not 0.01!)
      inertia: Infinity       // Prevent rotation
    });

    console.log(`[PLAYER] Created physics body at (${x}, ${y}), body id: ${this.body.id}`);

    physics.addBody(this.body);
    
    // Set collision filter: player collides with enemies and walls
    physics.setCollisionFilter(this.body, 'player');
    
    console.log(`[PLAYER] Body added to physics world with collision filter`);
    console.log(`[PLAYER] Collision category: ${this.body.collisionFilter.category}, mask: ${this.body.collisionFilter.mask}`);

    // Initialize components
    this.stats = new PlayerStats(initialStats);
    this.movement = new PlayerMovement(this.body);
    this.combat = new PlayerCombat(this.stats, physics);
    // Note: PlayerAnimation doesn't require armatureDisplay for now
    // It gracefully handles missing DragonBones display
    this.animation = new PlayerAnimation();
    
    // Calculate initial character scale based on level
    this.updateCharacterScale();
  }

  /**
   * Calculates character scale based on level and stats
   * Scale ranges from 0.3 (level 1) to 1.0+ (level 50+)
   * Formula: 0.3 + (level / 50) * 0.7
   * 
   * @returns Calculated scale value
   */
  public getCharacterScale(): number {
    return this.characterScale;
  }

  /**
   * Updates character scale based on current level
   * Call this after level up
   */
  public updateCharacterScale(): void {
    const level = this.stats.getLevel();
    // Scale ranges from 0.3 (level 1) to 1.0+ (level 50+)
    // At level 1: 0.3 + (1/50)*0.7 = 0.314
    // At level 50: 0.3 + (50/50)*0.7 = 1.0
    this.characterScale = 0.3 + (level / 50) * 0.7;
  }

  /**
   * Updates the player
   * 
   * @param deltaMs - Time since last update in milliseconds
   * @param input - Input manager instance
   * 
   * @example
   * ```typescript
   * app.ticker.add((ticker) => {
   *   player.update(ticker.deltaMS, input);
   * });
   * ```
   */
  public update(deltaMs: number, input: InputManager): void {
    // Update combat cooldowns
    this.combat.update(deltaMs);

    // Handle movement
    const movementVector = input.getMovementVector();
    
    // DEBUG: Log movement on first keystroke
    if ((movementVector.x !== 0 || movementVector.y !== 0) && !('_debugLogged' in this)) {
      (this as any)._debugLogged = true;
      console.log('🎮 Movement detected:', movementVector);
      console.log('Movement vector:', { x: movementVector.x, y: movementVector.y });
      console.log('Player velocity before move:', this.movement.getVelocity());
    }
    
    if (movementVector.x !== 0 || movementVector.y !== 0) {
      this.movement.move(movementVector);
      this.updateAnimation(movementVector);
    } else {
      this.movement.applyFriction();
      this.updateAnimation(movementVector);
    }

    // Handle attack input
    if (input.isAttackPressed()) {
      this.tryAttack();
    }

    // Update animation component
    this.animation.update(deltaMs);
  }

  /**
   * Updates player animation based on movement
   * 
   * @param movementVector - Current movement vector
   */
  private updateAnimation(movementVector: Vector2D): void {
    // Update animation state
    if (movementVector.x !== 0 || movementVector.y !== 0) {
      // Try common animation names: Walk, Run, Move (PlayerAnimation will fallback if not found)
      this.animation.play('Walk');
      
      // Update direction based on dominant movement axis
      if (Math.abs(movementVector.x) > Math.abs(movementVector.y)) {
        // Horizontal movement
        this.animation.setDirection(movementVector.x > 0 ? 'right' : 'left');
      } else if (movementVector.y !== 0) {
        // Vertical movement
        this.animation.setDirection(movementVector.y > 0 ? 'down' : 'up');
      }
    } else {
      // Try common animation names: Idle, Stand, Rest (PlayerAnimation will fallback)
      this.animation.play('Idle');
    }
  }

  /**
   * Attempts to attack in front of player
   */
  private tryAttack(): void {
    const pos = this.getPosition();
    const velocity = this.movement.getVelocity();
    
    // Calculate attack position based on movement direction
    let attackX = pos.x;
    let attackY = pos.y;
    
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      // Moving horizontally
      attackX += velocity.x > 0 ? 30 : -30;
    } else if (velocity.y !== 0) {
      // Moving vertically
      attackY += velocity.y > 0 ? 30 : -30;
    } else {
      // Standing still, attack forward (right)
      attackX += 30;
    }

    this.combat.attack(attackX, attackY);
  }

  /**
   * Gets player position
   * @returns Position vector
   */
  public getPosition(): Vector2D {
    return this.movement.getPosition();
  }

  /**
   * Sets player position
   * 
   * @param x - X position
   * @param y - Y position
   */
  public setPosition(x: number, y: number): void {
    this.movement.setPosition(x, y);
  }

  /**
   * Gets the Matter.js body
   * @returns The physics body
   */
  public getBody(): Matter.Body {
    return this.body;
  }

  /**
   * Damages the player
   * 
   * @param amount - Damage amount
   * @returns Actual damage dealt
   */
  public takeDamage(amount: number): number {
    return this.stats.takeDamage(amount);
  }

  /**
   * Heals the player
   * 
   * @param amount - Heal amount
   * @returns Actual HP restored
   */
  public heal(amount: number): number {
    return this.stats.heal(amount);
  }

  /**
   * Checks if player is alive
   * @returns True if HP > 0
   */
  public isAlive(): boolean {
    return this.stats.isAlive();
  }

  /**
   * Gets player HP
   * @returns Current HP
   */
  public getHp(): number {
    return this.stats.getHp();
  }

  /**
   * Gets player max HP
   * @returns Max HP
   */
  public getMaxHp(): number {
    return this.stats.getMaxHp();
  }

  /**
   * Gets player level
   * @returns Current level
   */
  public getLevel(): number {
    return this.stats.getLevel();
  }

  /**
   * Destroys the player
   * Removes physics body and cleans up
   */
  public destroy(): void {
    this.physics.removeBody(this.body);
    this.animation.dispose();
  }
}
