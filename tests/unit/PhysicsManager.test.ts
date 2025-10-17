import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PhysicsManager } from '../../src/core/PhysicsManager';
import Matter from 'matter-js';

describe('PhysicsManager', () => {
  let physics: PhysicsManager;

  beforeEach(() => {
    physics = PhysicsManager.getInstance();
  });

  afterEach(() => {
    PhysicsManager.dispose();
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const instance1 = PhysicsManager.getInstance();
      const instance2 = PhysicsManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('init', () => {
    it('should initialize engine and world', () => {
      physics.init();
      expect(physics.isReady()).toBe(true);
      expect(physics.getEngine()).not.toBeNull();
      expect(physics.getWorld()).not.toBeNull();
    });

    it('should set gravity to zero for top-down', () => {
      physics.init();
      const engine = physics.getEngine();
      expect(engine?.gravity.x).toBe(0);
      expect(engine?.gravity.y).toBe(0);
      expect(engine?.gravity.scale).toBe(0);
    });

    it('should warn on double initialization', () => {
      physics.init();
      const consoleSpy = { warn: console.warn };
      let warned = false;
      console.warn = () => { warned = true; };
      physics.init();
      console.warn = consoleSpy.warn;
      expect(warned).toBe(true);
    });
  });

  describe('addBody', () => {
    it('should add body to world', () => {
      physics.init();
      const body = Matter.Bodies.circle(0, 0, 16);
      physics.addBody(body);
      
      const world = physics.getWorld();
      expect(world?.bodies).toContain(body);
    });

    it('should handle multiple bodies', () => {
      physics.init();
      const body1 = Matter.Bodies.circle(0, 0, 16);
      const body2 = Matter.Bodies.circle(50, 50, 16);
      
      physics.addBody(body1);
      physics.addBody(body2);
      
      const world = physics.getWorld();
      expect(world?.bodies).toContain(body1);
      expect(world?.bodies).toContain(body2);
    });
  });

  describe('removeBody', () => {
    it('should remove body from world', () => {
      physics.init();
      const body = Matter.Bodies.circle(0, 0, 16);
      physics.addBody(body);
      physics.removeBody(body);
      
      const world = physics.getWorld();
      expect(world?.bodies).not.toContain(body);
    });
  });

  describe('addBodies', () => {
    it('should add multiple bodies at once', () => {
      physics.init();
      const bodies = [
        Matter.Bodies.circle(0, 0, 16),
        Matter.Bodies.circle(50, 50, 16),
        Matter.Bodies.circle(100, 100, 16)
      ];
      
      physics.addBodies(bodies);
      
      const world = physics.getWorld();
      bodies.forEach(body => {
        expect(world?.bodies).toContain(body);
      });
    });
  });

  describe('removeBodies', () => {
    it('should remove multiple bodies at once', () => {
      physics.init();
      const bodies = [
        Matter.Bodies.circle(0, 0, 16),
        Matter.Bodies.circle(50, 50, 16)
      ];
      
      physics.addBodies(bodies);
      physics.removeBodies(bodies);
      
      const world = physics.getWorld();
      bodies.forEach(body => {
        expect(world?.bodies).not.toContain(body);
      });
    });
  });

  describe('update', () => {
    it('should update physics simulation', () => {
      physics.init();
      const body = Matter.Bodies.circle(0, 0, 16);
      physics.addBody(body);
      
      // Apply force to move body
      Matter.Body.applyForce(body, body.position, { x: 0.01, y: 0 });
      
      const initialX = body.position.x;
      physics.update(16); // One frame at 60fps
      
      // Body should have moved
      expect(body.position.x).not.toBe(initialX);
    });
  });

  describe('getAllBodies', () => {
    it('should return all bodies in world', () => {
      physics.init();
      const bodies = [
        Matter.Bodies.circle(0, 0, 16),
        Matter.Bodies.circle(50, 50, 16)
      ];
      
      physics.addBodies(bodies);
      const allBodies = physics.getAllBodies();
      
      expect(allBodies.length).toBeGreaterThanOrEqual(bodies.length);
      bodies.forEach(body => {
        expect(allBodies).toContain(body);
      });
    });

    it('should return empty array if not initialized', () => {
      const allBodies = physics.getAllBodies();
      expect(allBodies).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all bodies from world', () => {
      physics.init();
      const bodies = [
        Matter.Bodies.circle(0, 0, 16),
        Matter.Bodies.circle(50, 50, 16)
      ];
      
      physics.addBodies(bodies);
      physics.clear();
      
      const world = physics.getWorld();
      expect(world?.bodies.length).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset physics manager', () => {
      physics.init();
      physics.reset();
      
      expect(physics.isReady()).toBe(false);
      expect(physics.getEngine()).toBeNull();
      expect(physics.getWorld()).toBeNull();
    });
  });
});
