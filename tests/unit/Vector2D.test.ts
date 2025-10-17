import { describe, it, expect } from 'vitest';
import {
  createVector,
  length,
  normalize,
  add,
  subtract,
  multiply,
  dot,
  distance
} from '../../src/utils/Vector2D';

describe('Vector2D', () => {
  describe('createVector', () => {
    it('should create a vector with given values', () => {
      const v = createVector(3, 4);
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it('should default to zero vector', () => {
      const v = createVector();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });
  });

  describe('length', () => {
    it('should calculate vector length', () => {
      const v = { x: 3, y: 4 };
      expect(length(v)).toBe(5);
    });

    it('should return 0 for zero vector', () => {
      const v = { x: 0, y: 0 };
      expect(length(v)).toBe(0);
    });

    it('should calculate length for negative values', () => {
      const v = { x: -3, y: -4 };
      expect(length(v)).toBe(5);
    });
  });

  describe('normalize', () => {
    it('should normalize a vector to unit length', () => {
      const v = { x: 3, y: 4 };
      const normalized = normalize(v);
      expect(length(normalized)).toBeCloseTo(1, 5);
      expect(normalized.x).toBeCloseTo(0.6, 5);
      expect(normalized.y).toBeCloseTo(0.8, 5);
    });

    it('should return zero vector for zero input', () => {
      const v = { x: 0, y: 0 };
      const normalized = normalize(v);
      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
    });

    it('should preserve direction', () => {
      const v = { x: 5, y: 0 };
      const normalized = normalize(v);
      expect(normalized.x).toBe(1);
      expect(normalized.y).toBe(0);
    });
  });

  describe('add', () => {
    it('should add two vectors', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };
      const result = add(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('should handle negative values', () => {
      const a = { x: 5, y: 3 };
      const b = { x: -2, y: -1 };
      const result = add(a, b);
      expect(result.x).toBe(3);
      expect(result.y).toBe(2);
    });
  });

  describe('subtract', () => {
    it('should subtract two vectors', () => {
      const a = { x: 5, y: 7 };
      const b = { x: 2, y: 3 };
      const result = subtract(a, b);
      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });
  });

  describe('multiply', () => {
    it('should multiply vector by scalar', () => {
      const v = { x: 2, y: 3 };
      const result = multiply(v, 3);
      expect(result.x).toBe(6);
      expect(result.y).toBe(9);
    });

    it('should handle zero scalar', () => {
      const v = { x: 5, y: 7 };
      const result = multiply(v, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should handle negative scalar', () => {
      const v = { x: 2, y: 3 };
      const result = multiply(v, -2);
      expect(result.x).toBe(-4);
      expect(result.y).toBe(-6);
    });
  });

  describe('dot', () => {
    it('should calculate dot product', () => {
      const a = { x: 2, y: 3 };
      const b = { x: 4, y: 5 };
      const result = dot(a, b);
      expect(result).toBe(23); // 2*4 + 3*5 = 23
    });

    it('should return 0 for perpendicular vectors', () => {
      const a = { x: 1, y: 0 };
      const b = { x: 0, y: 1 };
      const result = dot(a, b);
      expect(result).toBe(0);
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      expect(distance(a, b)).toBe(5);
    });

    it('should return 0 for same point', () => {
      const a = { x: 5, y: 7 };
      const b = { x: 5, y: 7 };
      expect(distance(a, b)).toBe(0);
    });
  });
});
