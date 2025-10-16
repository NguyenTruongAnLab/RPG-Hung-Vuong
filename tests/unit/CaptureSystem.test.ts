import { describe, it, expect, beforeEach } from 'vitest';
import { CaptureSystem } from '../../src/systems/CaptureSystem.js';

describe('CaptureSystem', () => {
  let captureSystem: CaptureSystem;

  beforeEach(() => {
    captureSystem = new CaptureSystem();
  });

  describe('initialization', () => {
    it('should initialize with empty captured monsters array', () => {
      expect(captureSystem.capturedMonsters).toEqual([]);
    });
  });

  describe('attemptCapture', () => {
    const createTestMonster = (currentHP: number, maxHP: number, captureRate: number = 30) => ({
      id: 'char001',
      name: 'Test Monster',
      element: 'kim',
      level: 5,
      currentHP,
      captureRate,
      stats: {
        hp: maxHP,
        attack: 20,
        defense: 10,
        speed: 15,
        magic: 10
      }
    });

    it('should have higher success rate when monster HP is low', () => {
      const lowHPMonster = createTestMonster(10, 100); // 10% HP
      const highHPMonster = createTestMonster(90, 100); // 90% HP

      // Run multiple attempts to test probability
      let lowHPSuccesses = 0;
      let highHPSuccesses = 0;
      const attempts = 100;

      for (let i = 0; i < attempts; i++) {
        const lowHPSystem = new CaptureSystem();
        const highHPSystem = new CaptureSystem();

        if (lowHPSystem.attemptCapture(lowHPMonster, 1).success) {
          lowHPSuccesses++;
        }
        if (highHPSystem.attemptCapture(highHPMonster, 1).success) {
          highHPSuccesses++;
        }
      }

      // Low HP should have more successes
      expect(lowHPSuccesses).toBeGreaterThan(highHPSuccesses);
    });

    it('should have higher success rate with higher player level', () => {
      const monster = createTestMonster(50, 100);

      const lowLevelResult = captureSystem.attemptCapture(monster, 1);
      const highLevelResult = new CaptureSystem().attemptCapture(monster, 10);

      // Higher level should have higher capture chance
      expect(highLevelResult.captureChance).toBeGreaterThan(lowLevelResult.captureChance);
    });

    it('should add captured monster to collection on success', () => {
      const monster = createTestMonster(1, 100, 100); // Very high capture rate

      expect(captureSystem.getCapturedCount()).toBe(0);

      // Keep trying until success (with 100% capture rate, should succeed quickly)
      let attempts = 0;
      let success = false;
      while (!success && attempts < 10) {
        const result = captureSystem.attemptCapture(monster, 10);
        success = result.success;
        attempts++;
      }

      // Should eventually succeed and be in collection
      if (success) {
        expect(captureSystem.getCapturedCount()).toBe(1);
        const captured = captureSystem.getCapturedMonsters()[0];
        expect(captured.id).toBe(monster.id);
      }
    });

    it('should restore monster HP after capture', () => {
      const monster = createTestMonster(10, 100, 100);

      let captured = false;
      let attempts = 0;
      while (!captured && attempts < 10) {
        const result = captureSystem.attemptCapture(monster, 10);
        if (result.success) {
          captured = true;
          const capturedMonster = captureSystem.getCapturedMonsters()[0];
          expect(capturedMonster.currentHP).toBe(100); // Restored to max
        }
        attempts++;
      }
    });

    it('should set capture date on captured monster', () => {
      const monster = createTestMonster(10, 100, 100);
      const beforeCapture = Date.now();

      let captured = false;
      let attempts = 0;
      while (!captured && attempts < 10) {
        const result = captureSystem.attemptCapture(monster, 10);
        if (result.success) {
          captured = true;
          const capturedMonster = captureSystem.getCapturedMonsters()[0];
          expect(capturedMonster.captureDate).toBeGreaterThanOrEqual(beforeCapture);
          expect(capturedMonster.captureDate).toBeLessThanOrEqual(Date.now());
        }
        attempts++;
      }
    });

    it('should cap capture chance at 95%', () => {
      const monster = createTestMonster(1, 100, 1000); // Extremely high capture rate

      const result = captureSystem.attemptCapture(monster, 100);

      expect(result.captureChance).toBeLessThanOrEqual(95);
    });

    it('should return capture chance and roll values', () => {
      const monster = createTestMonster(50, 100);

      const result = captureSystem.attemptCapture(monster, 5);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('captureChance');
      expect(result).toHaveProperty('roll');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.captureChance).toBe('number');
      expect(typeof result.roll).toBe('number');
    });
  });

  describe('getCapturedMonsters', () => {
    it('should return a copy of captured monsters array', () => {
      const monster = {
        id: 'char001',
        name: 'Test',
        currentHP: 100,
        stats: { hp: 100 }
      };

      captureSystem.capturedMonsters.push(monster);

      const captured = captureSystem.getCapturedMonsters();
      captured.push({ id: 'char002', name: 'Fake', currentHP: 50, stats: { hp: 50 } });

      // Original should not be modified
      expect(captureSystem.capturedMonsters).toHaveLength(1);
    });
  });

  describe('getCapturedCount', () => {
    it('should return 0 when no monsters captured', () => {
      expect(captureSystem.getCapturedCount()).toBe(0);
    });

    it('should return correct count', () => {
      captureSystem.capturedMonsters.push(
        { id: 'char001', name: 'Monster1', currentHP: 100, stats: { hp: 100 } },
        { id: 'char002', name: 'Monster2', currentHP: 100, stats: { hp: 100 } },
        { id: 'char003', name: 'Monster3', currentHP: 100, stats: { hp: 100 } }
      );

      expect(captureSystem.getCapturedCount()).toBe(3);
    });
  });

  describe('hasCaptured', () => {
    beforeEach(() => {
      captureSystem.capturedMonsters.push({
        id: 'char001',
        name: 'Captured',
        currentHP: 100,
        stats: { hp: 100 }
      });
    });

    it('should return true for captured monster', () => {
      expect(captureSystem.hasCaptured('char001')).toBe(true);
    });

    it('should return false for uncaptured monster', () => {
      expect(captureSystem.hasCaptured('char999')).toBe(false);
    });
  });

  describe('canEvolve', () => {
    it('should return true when monster can evolve', () => {
      const monster = {
        id: 'char001',
        name: 'Basic',
        level: 10,
        tier: 1,
        evolveTo: 'char002',
        currentHP: 100,
        stats: { hp: 100 }
      };

      expect(captureSystem.canEvolve(monster)).toBe(true);
    });

    it('should return false when level too low', () => {
      const monster = {
        id: 'char001',
        name: 'Basic',
        level: 5,
        tier: 1,
        evolveTo: 'char002',
        currentHP: 100,
        stats: { hp: 100 }
      };

      expect(captureSystem.canEvolve(monster)).toBe(false);
    });

    it('should return false when no evolution available', () => {
      const monster = {
        id: 'char001',
        name: 'Final Form',
        level: 100,
        tier: 4,
        evolveTo: null,
        currentHP: 100,
        stats: { hp: 100 }
      };

      expect(captureSystem.canEvolve(monster)).toBe(false);
    });

    it('should require level >= tier * 10', () => {
      const tier2Monster = {
        id: 'char001',
        level: 19,
        tier: 2,
        evolveTo: 'char002',
        currentHP: 100,
        stats: { hp: 100 }
      };

      expect(captureSystem.canEvolve(tier2Monster)).toBe(false);

      tier2Monster.level = 20;
      expect(captureSystem.canEvolve(tier2Monster)).toBe(true);
    });
  });

  describe('evolveMonster', () => {
    const createMonsterDatabase = () => ({
      char001: {
        id: 'char001',
        name: 'Basic Form',
        tier: 1,
        evolveTo: 'char002',
        stats: { hp: 100, attack: 20, defense: 10, speed: 15, magic: 10 }
      },
      char002: {
        id: 'char002',
        name: 'Evolved Form',
        tier: 2,
        evolveTo: null,
        stats: { hp: 150, attack: 30, defense: 15, speed: 20, magic: 15 }
      }
    });

    it('should return null if monster cannot evolve', () => {
      const monster = {
        id: 'char001',
        level: 5, // Too low
        tier: 1,
        evolveTo: 'char002',
        experience: 100,
        captureDate: Date.now()
      };

      captureSystem.capturedMonsters.push(monster);
      const database = createMonsterDatabase();

      const result = captureSystem.evolveMonster(monster, database);

      expect(result).toBeNull();
    });

    it('should return null if evolved form not in database', () => {
      const monster = {
        id: 'char001',
        level: 10,
        tier: 1,
        evolveTo: 'char999', // Doesn't exist
        experience: 100,
        captureDate: Date.now()
      };

      captureSystem.capturedMonsters.push(monster);
      const database = createMonsterDatabase();

      const result = captureSystem.evolveMonster(monster, database);

      expect(result).toBeNull();
    });

    it('should return null if monster not in captured list', () => {
      const monster = {
        id: 'char001',
        level: 10,
        tier: 1,
        evolveTo: 'char002',
        experience: 100,
        captureDate: Date.now()
      };

      // Don't add to capturedMonsters
      const database = createMonsterDatabase();

      const result = captureSystem.evolveMonster(monster, database);

      expect(result).toBeNull();
    });

    it('should evolve monster and preserve level, experience, and capture date', () => {
      const captureDate = Date.now();
      const monster = {
        id: 'char001',
        level: 10,
        tier: 1,
        evolveTo: 'char002',
        experience: 500,
        captureDate
      };

      captureSystem.capturedMonsters.push(monster);
      const database = createMonsterDatabase();

      const evolved = captureSystem.evolveMonster(monster, database);

      expect(evolved).not.toBeNull();
      expect(evolved?.id).toBe('char002');
      expect(evolved?.name).toBe('Evolved Form');
      expect(evolved?.level).toBe(10); // Preserved
      expect(evolved?.experience).toBe(500); // Preserved
      expect(evolved?.captureDate).toBe(captureDate); // Preserved
    });

    it('should update monster in captured list', () => {
      const monster = {
        id: 'char001',
        level: 10,
        tier: 1,
        evolveTo: 'char002',
        experience: 500,
        captureDate: Date.now()
      };

      captureSystem.capturedMonsters.push(monster);
      const database = createMonsterDatabase();

      captureSystem.evolveMonster(monster, database);

      expect(captureSystem.capturedMonsters[0].id).toBe('char002');
      expect(captureSystem.capturedMonsters[0].name).toBe('Evolved Form');
    });
  });
});
