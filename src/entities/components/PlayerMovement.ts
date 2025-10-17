/**
 * PlayerMovement - Player movement component
 * 
 * Handles player movement using Matter.js physics.
 * Component of Player entity.
 */
import Matter from 'matter-js';
import { Vector2D } from '../../utils/Vector2D';
import { applyForceInDirection } from '../../utils/MatterHelpers';

export class PlayerMovement {
  private body: Matter.Body;
  private moveSpeed: number;
  private maxVelocity: number;

  /**
   * Creates a new PlayerMovement component
   * 
   * @param body - The Matter.js body to control
   * @param moveSpeed - Movement force multiplier (default: 0.015)
   * @param maxVelocity - Maximum velocity (default: 5)
   */
  constructor(body: Matter.Body, moveSpeed: number = 0.015, maxVelocity: number = 5) {
    this.body = body;
    this.moveSpeed = moveSpeed;
    this.maxVelocity = maxVelocity;
  }

  /**
   * Moves the player in a direction
   * 
   * @param direction - Movement direction (should be normalized)
   * 
   * @example
   * ```typescript
   * // Move right
   * movement.move({ x: 1, y: 0 });
   * ```
   */
  public move(direction: Vector2D): void {
    if (direction.x === 0 && direction.y === 0) {
      return;
    }

    // Apply force in direction
    applyForceInDirection(this.body, direction, this.moveSpeed);

    // Clamp velocity to max
    this.clampVelocity();
  }

  /**
   * Clamps velocity to maximum speed
   * Prevents player from accelerating indefinitely
   */
  private clampVelocity(): void {
    const velocity = this.body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (speed > this.maxVelocity) {
      const scale = this.maxVelocity / speed;
      Matter.Body.setVelocity(this.body, {
        x: velocity.x * scale,
        y: velocity.y * scale
      });
    }
  }

  /**
   * Applies friction to slow down player
   * Call this when no input is detected
   * 
   * @example
   * ```typescript
   * // In update loop
   * if (!input.isMoving()) {
   *   movement.applyFriction();
   * }
   * ```
   */
  public applyFriction(): void {
    const velocity = this.body.velocity;
    const frictionCoefficient = 0.9;

    Matter.Body.setVelocity(this.body, {
      x: velocity.x * frictionCoefficient,
      y: velocity.y * frictionCoefficient
    });
  }

  /**
   * Stops player movement immediately
   * 
   * @example
   * ```typescript
   * movement.stop();
   * ```
   */
  public stop(): void {
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
  }

  /**
   * Gets current position
   * @returns Position vector
   */
  public getPosition(): Vector2D {
    return { x: this.body.position.x, y: this.body.position.y };
  }

  /**
   * Gets current velocity
   * @returns Velocity vector
   */
  public getVelocity(): Vector2D {
    return { x: this.body.velocity.x, y: this.body.velocity.y };
  }

  /**
   * Gets current speed (velocity magnitude)
   * @returns Speed value
   */
  public getSpeed(): number {
    const velocity = this.body.velocity;
    return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  }

  /**
   * Checks if player is moving
   * @returns True if velocity > 0.1
   */
  public isMoving(): boolean {
    return this.getSpeed() > 0.1;
  }

  /**
   * Sets player position
   * 
   * @param x - X position
   * @param y - Y position
   * 
   * @example
   * ```typescript
   * movement.setPosition(100, 200);
   * ```
   */
  public setPosition(x: number, y: number): void {
    Matter.Body.setPosition(this.body, { x, y });
  }

  /**
   * Gets move speed
   * @returns Move speed value
   */
  public getMoveSpeed(): number {
    return this.moveSpeed;
  }

  /**
   * Sets move speed
   * @param speed - New move speed
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }

  /**
   * Gets max velocity
   * @returns Max velocity value
   */
  public getMaxVelocity(): number {
    return this.maxVelocity;
  }

  /**
   * Sets max velocity
   * @param maxVel - New max velocity
   */
  public setMaxVelocity(maxVel: number): void {
    this.maxVelocity = maxVel;
  }
}
