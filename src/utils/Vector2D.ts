/**
 * Vector2D - 2D vector math utilities
 * 
 * Simple 2D vector operations for game math.
 * Used for movement, directions, and positions.
 */

export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Creates a new Vector2D
 * @param x - X component
 * @param y - Y component
 * @returns A new Vector2D object
 */
export function createVector(x: number = 0, y: number = 0): Vector2D {
  return { x, y };
}

/**
 * Calculates the length (magnitude) of a vector
 * @param v - The vector
 * @returns The length
 */
export function length(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Normalizes a vector to unit length
 * Returns zero vector if input is zero vector
 * @param v - The vector to normalize
 * @returns A new normalized vector
 */
export function normalize(v: Vector2D): Vector2D {
  const len = length(v);
  if (len === 0) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / len, y: v.y / len };
}

/**
 * Adds two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns A new vector (a + b)
 */
export function add(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Subtracts two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns A new vector (a - b)
 */
export function subtract(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Multiplies a vector by a scalar
 * @param v - The vector
 * @param scalar - The scalar value
 * @returns A new scaled vector
 */
export function multiply(v: Vector2D, scalar: number): Vector2D {
  return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * Calculates dot product of two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns The dot product
 */
export function dot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Calculates distance between two points
 * @param a - First point
 * @param b - Second point
 * @returns The distance
 */
export function distance(a: Vector2D, b: Vector2D): number {
  return length(subtract(b, a));
}
