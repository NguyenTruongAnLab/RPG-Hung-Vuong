import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../../src/core/InputManager';

describe('InputManager', () => {
  let input: InputManager;

  beforeEach(() => {
    input = InputManager.getInstance();
    input.init();
  });

  afterEach(() => {
    InputManager.dispose();
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const instance1 = InputManager.getInstance();
      const instance2 = InputManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('isKeyDown', () => {
    it('should return false for unpressed key', () => {
      expect(input.isKeyDown('a')).toBe(false);
    });

    it('should return true after keydown event', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);
      expect(input.isKeyDown('a')).toBe(true);
    });

    it('should return false after keyup event', () => {
      const downEvent = new KeyboardEvent('keydown', { key: 'a' });
      const upEvent = new KeyboardEvent('keyup', { key: 'a' });
      window.dispatchEvent(downEvent);
      window.dispatchEvent(upEvent);
      expect(input.isKeyDown('a')).toBe(false);
    });

    it('should be case insensitive', () => {
      const event = new KeyboardEvent('keydown', { key: 'A' });
      window.dispatchEvent(event);
      expect(input.isKeyDown('a')).toBe(true);
      expect(input.isKeyDown('A')).toBe(true);
    });
  });

  describe('getMovementVector', () => {
    it('should return zero vector when no keys pressed', () => {
      const movement = input.getMovementVector();
      expect(movement.x).toBe(0);
      expect(movement.y).toBe(0);
    });

    it('should return right vector when D pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'd' });
      window.dispatchEvent(event);
      const movement = input.getMovementVector();
      expect(movement.x).toBe(1);
      expect(movement.y).toBe(0);
    });

    it('should return left vector when A pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);
      const movement = input.getMovementVector();
      expect(movement.x).toBe(-1);
      expect(movement.y).toBe(0);
    });

    it('should return up vector when W pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'w' });
      window.dispatchEvent(event);
      const movement = input.getMovementVector();
      expect(movement.x).toBe(0);
      expect(movement.y).toBe(-1);
    });

    it('should return down vector when S pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 's' });
      window.dispatchEvent(event);
      const movement = input.getMovementVector();
      expect(movement.x).toBe(0);
      expect(movement.y).toBe(1);
    });

    it('should normalize diagonal movement', () => {
      const eventW = new KeyboardEvent('keydown', { key: 'w' });
      const eventD = new KeyboardEvent('keydown', { key: 'd' });
      window.dispatchEvent(eventW);
      window.dispatchEvent(eventD);
      
      const movement = input.getMovementVector();
      const length = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
      expect(length).toBeCloseTo(1, 5);
    });

    it('should support arrow keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);
      const movement = input.getMovementVector();
      expect(movement.x).toBe(1);
    });

    it('should handle opposite keys canceling', () => {
      const eventA = new KeyboardEvent('keydown', { key: 'a' });
      const eventD = new KeyboardEvent('keydown', { key: 'd' });
      window.dispatchEvent(eventA);
      window.dispatchEvent(eventD);
      
      const movement = input.getMovementVector();
      expect(movement.x).toBe(0);
    });
  });

  describe('isMoving', () => {
    it('should return false when no movement keys pressed', () => {
      expect(input.isMoving()).toBe(false);
    });

    it('should return true when movement key pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'w' });
      window.dispatchEvent(event);
      expect(input.isMoving()).toBe(true);
    });
  });

  describe('isAttackPressed', () => {
    it('should return true when space pressed', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(event);
      expect(input.isAttackPressed()).toBe(true);
    });

    it('should return false when space not pressed', () => {
      expect(input.isAttackPressed()).toBe(false);
    });
  });

  describe('isInteractPressed', () => {
    it('should return true when E pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'e' });
      window.dispatchEvent(event);
      expect(input.isInteractPressed()).toBe(true);
    });

    it('should return false when E not pressed', () => {
      expect(input.isInteractPressed()).toBe(false);
    });
  });

  describe('window blur handling', () => {
    it('should clear keys on window blur', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'w' });
      window.dispatchEvent(keyEvent);
      expect(input.isKeyDown('w')).toBe(true);

      const blurEvent = new Event('blur');
      window.dispatchEvent(blurEvent);
      expect(input.isKeyDown('w')).toBe(false);
    });
  });
});
