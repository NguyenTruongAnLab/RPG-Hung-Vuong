/**
 * MatterHelpers - Utility functions for Matter.js
 * 
 * Helper functions to simplify Matter.js body creation
 * and common physics operations.
 */
import Matter from 'matter-js';
import { Vector2D } from './Vector2D';

/**
 * Creates a circular Matter.js body
 * 
 * @param x - X position
 * @param y - Y position
 * @param radius - Circle radius
 * @param options - Optional Matter.js body options
 * @returns A new circular body
 * 
 * @example
 * // Create player body with proper physics
 * const player = createCircleBody(100, 100, 16, { 
 *   label: 'player',
 *   friction: 0.01,
 *   frictionAir: 0.01,
 *   restitution: 0.2
 * });
 */
export function createCircleBody(
  x: number,
  y: number,
  radius: number,
  options: Matter.IBodyDefinition = {}
): Matter.Body {
  return Matter.Bodies.circle(x, y, radius, {
    friction: 0.01,           // Surface friction
    frictionStatic: 0.01,     // Static friction (prevents sliding)
    frictionAir: 0.01,        // Air resistance (damping)
    restitution: 0.0,         // No bounciness
    density: 0.001,           // Low density for top-down movement
    ...options
  });
}

/**
 * Creates a rectangular Matter.js body
 * 
 * @param x - X position (center)
 * @param y - Y position (center)
 * @param width - Rectangle width
 * @param height - Rectangle height
 * @param options - Optional Matter.js body options
 * @returns A new rectangular body
 * 
 * @example
 * // Create wall (static)
 * const wall = createRectBody(100, 100, 50, 100, {
 *   isStatic: true,
 *   label: 'wall'
 * });
 */
export function createRectBody(
  x: number,
  y: number,
  width: number,
  height: number,
  options: Matter.IBodyDefinition = {}
): Matter.Body {
  return Matter.Bodies.rectangle(x, y, width, height, {
    friction: 0.01,
    frictionStatic: 0.01,
    restitution: 0.0,
    ...options
  });
}

/**
 * Creates a static rectangular wall
 * 
 * @param x - X position (center)
 * @param y - Y position (center)
 * @param width - Wall width
 * @param height - Wall height
 * @returns A static rectangular body
 * 
 * @example
 * // Create boundary wall
 * const boundary = createWall(400, 0, 800, 20);
 */
export function createWall(
  x: number,
  y: number,
  width: number,
  height: number
): Matter.Body {
  return createRectBody(x, y, width, height, {
    isStatic: true,
    label: 'wall'
  });
}

/**
 * Applies force to a body in a direction
 * 
 * @param body - The body to apply force to
 * @param direction - Normalized direction vector
 * @param magnitude - Force magnitude
 * 
 * @example
 * // Move player right
 * applyForceInDirection(playerBody, { x: 1, y: 0 }, 0.01);
 */
export function applyForceInDirection(
  body: Matter.Body,
  direction: Vector2D,
  magnitude: number
): void {
  const force = {
    x: direction.x * magnitude,
    y: direction.y * magnitude
  };
  Matter.Body.applyForce(body, body.position, force);
}

/**
 * Sets body velocity directly
 * 
 * @param body - The body to set velocity for
 * @param velocity - Velocity vector
 * 
 * @example
 * // Stop player movement
 * setVelocity(playerBody, { x: 0, y: 0 });
 */
export function setVelocity(body: Matter.Body, velocity: Vector2D): void {
  Matter.Body.setVelocity(body, velocity);
}

/**
 * Gets body position as Vector2D
 * 
 * @param body - The body
 * @returns Position vector
 */
export function getPosition(body: Matter.Body): Vector2D {
  return { x: body.position.x, y: body.position.y };
}

/**
 * Gets body velocity as Vector2D
 * 
 * @param body - The body
 * @returns Velocity vector
 */
export function getVelocity(body: Matter.Body): Vector2D {
  return { x: body.velocity.x, y: body.velocity.y };
}

/**
 * Checks if two bodies are colliding
 * 
 * @param bodyA - First body
 * @param bodyB - Second body
 * @returns True if bodies are colliding
 */
export function areColliding(bodyA: Matter.Body, bodyB: Matter.Body): boolean {
  const collision = Matter.Collision.collides(bodyA, bodyB);
  return collision !== null;
}
