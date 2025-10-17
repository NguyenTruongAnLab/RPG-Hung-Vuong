import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Player } from '../../src/entities/Player';
import { PhysicsManager } from '../../src/core/PhysicsManager';
import { InputManager } from '../../src/core/InputManager';

describe('Player', () => {
  let physics: PhysicsManager;
  let input: InputManager;
  let player: Player;

  beforeEach(() => {
    physics = PhysicsManager.getInstance();
    physics.init();
    input = InputManager.getInstance();
    input.init();
    player = new Player(100, 100, physics);
  });

  afterEach(() => {
    player.destroy();
    PhysicsManager.dispose();
    InputManager.dispose();
  });

  describe('constructor', () => {
    it('should create player at position', () => {
      const pos = player.getPosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(100);
    });

    it('should initialize components', () => {
      expect(player.movement).toBeDefined();
      expect(player.combat).toBeDefined();
      expect(player.stats).toBeDefined();
    });

    it('should have default stats', () => {
      expect(player.getHp()).toBe(100);
      expect(player.getMaxHp()).toBe(100);
      expect(player.getLevel()).toBe(1);
    });

    it('should accept custom stats', () => {
      const customPlayer = new Player(0, 0, physics, {
        maxHp: 150,
        currentHp: 75,
        level: 5
      });
      
      expect(customPlayer.getHp()).toBe(75);
      expect(customPlayer.getMaxHp()).toBe(150);
      expect(customPlayer.getLevel()).toBe(5);
      
      customPlayer.destroy();
    });
  });

  describe('update', () => {
    it('should update combat cooldowns', () => {
      const attackX = player.getPosition().x + 30;
      const attackY = player.getPosition().y;
      
      player.combat.attack(attackX, attackY);
      expect(player.combat.canAttack()).toBe(false);
      
      player.update(500, input);
      expect(player.combat.canAttack()).toBe(true);
    });

    it('should respond to movement input', () => {
      const initialPos = player.getPosition();
      
      // Simulate W key press
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      
      // Update multiple frames
      for (let i = 0; i < 10; i++) {
        player.update(16, input);
        physics.update(16);
      }
      
      const newPos = player.getPosition();
      expect(newPos.y).toBeLessThan(initialPos.y);
      
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    });

    it('should apply friction when not moving', () => {
      // Give player some velocity
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
      for (let i = 0; i < 5; i++) {
        player.update(16, input);
        physics.update(16);
      }
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
      
      const speedBefore = player.movement.getSpeed();
      
      // Update without input
      for (let i = 0; i < 10; i++) {
        player.update(16, input);
        physics.update(16);
      }
      
      const speedAfter = player.movement.getSpeed();
      expect(speedAfter).toBeLessThan(speedBefore);
    });
  });

  describe('position', () => {
    it('should get position', () => {
      const pos = player.getPosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(100);
    });

    it('should set position', () => {
      player.setPosition(200, 300);
      const pos = player.getPosition();
      expect(pos.x).toBe(200);
      expect(pos.y).toBe(300);
    });
  });

  describe('damage and healing', () => {
    it('should take damage', () => {
      const damage = player.takeDamage(25);
      expect(damage).toBe(25);
      expect(player.getHp()).toBe(75);
    });

    it('should heal', () => {
      player.takeDamage(50);
      const healed = player.heal(30);
      expect(healed).toBe(30);
      expect(player.getHp()).toBe(80);
    });

    it('should not exceed max HP when healing', () => {
      player.heal(200);
      expect(player.getHp()).toBe(player.getMaxHp());
    });

    it('should not go below 0 HP', () => {
      player.takeDamage(200);
      expect(player.getHp()).toBe(0);
    });
  });

  describe('alive state', () => {
    it('should be alive with HP > 0', () => {
      expect(player.isAlive()).toBe(true);
    });

    it('should be dead with HP = 0', () => {
      player.takeDamage(100);
      expect(player.isAlive()).toBe(false);
    });
  });

  describe('getBody', () => {
    it('should return Matter.js body', () => {
      const body = player.getBody();
      expect(body).toBeDefined();
      expect(body.label).toBe('player');
    });
  });

  describe('destroy', () => {
    it('should remove body from physics world', () => {
      const body = player.getBody();
      player.destroy();
      
      const bodies = physics.getAllBodies();
      expect(bodies).not.toContain(body);
    });
  });
});
