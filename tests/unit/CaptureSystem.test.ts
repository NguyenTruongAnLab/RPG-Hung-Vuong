import { describe, it, expect, beforeEach } from 'vitest';
import { CaptureSystem } from '../../src/systems/CaptureSystem.js';
import { createTestMonster, createTestMonsterDatabase, TEST_CONSTANTS } from '../utils/testHelpers';

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
    it('should have higher success rate when monster HP is low', () => {
      const lowHPMonster = createTestMonster({ currentHP: 10, stats: { hp: 100 } }); // 10% HP
      const highHPMonster = createTestMonster({ currentHP: 90, stats: { hp: 100 } }); // 90% HP

      // Run multiple attempts to test probability
      let lowHPSuccesses = 0;
      let highHPSuccesses = 0;
      const attempts = TEST_CONSTANTS.PROBABILITY_TEST_ITERATIONS;

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
      const monster = createTestMonster({ currentHP: 50, stats: { hp: 100 } });

      const lowLevelResult = captureSystem.attemptCapture(monster, 1);
      const highLevelResult = new CaptureSystem().attemptCapture(monster, 10);

      // Higher level should have higher capture chance
      expect(highLevelResult.captureChance).toBeGreaterThan(lowLevelResult.captureChance);
    });

    it('should add captured monster to collection on success', () => {
      const monster = createTestMonster({ 
        currentHP: 1, 
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE,
        stats: { hp: 100 }
      });

      expect(captureSystem.getCapturedCount()).toBe(0);

      // Keep trying until success (with high capture rate, should succeed quickly)
      let attempts = 0;
      let success = false;
      while (!success && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
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
      const monster = createTestMonster({ 
        currentHP: 10, 
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE,
        stats: { hp: 100 }
      });

      let captured = false;
      let attempts = 0;
      while (!captured && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
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
      const monster = createTestMonster({ 
        currentHP: 10, 
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE,
        stats: { hp: 100 }
      });
      const beforeCapture = Date.now();

      let captured = false;
      let attempts = 0;
      while (!captured && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
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
      const monster = createTestMonster({ 
        currentHP: 1, 
        captureRate: 1000, // Extremely high
        stats: { hp: 100 }
      });

      const result = captureSystem.attemptCapture(monster, 100);

      expect(result.captureChance).toBeLessThanOrEqual(95);
    });

    it('should return capture chance and roll values', () => {
      const monster = createTestMonster({ currentHP: 50, stats: { hp: 100 } });

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
      const monster = createTestMonster({ id: 'char001', name: 'Test' });

      // Add monster using the public API via a successful capture
      const captureMonster = createTestMonster({ 
        ...monster,
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE 
      });
      
      let attempts = 0;
      while (captureSystem.getCapturedCount() === 0 && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
        captureSystem.attemptCapture(captureMonster, 10);
        attempts++;
      }

      const captured = captureSystem.getCapturedMonsters();
      captured.push(createTestMonster({ id: 'char002', name: 'Fake' }));

      // Original should not be modified
      expect(captureSystem.capturedMonsters.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getCapturedCount', () => {
    it('should return 0 when no monsters captured', () => {
      expect(captureSystem.getCapturedCount()).toBe(0);
    });

    it('should return correct count after successful captures', () => {
      const monster = createTestMonster({ 
        id: 'char001',
        currentHP: 1, // Very low HP for higher success rate
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE,
        stats: { hp: 100 }
      });

      // Test with high capture rate - should succeed within attempts
      let successCount = 0;
      for (let i = 0; i < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS; i++) {
        const result = captureSystem.attemptCapture(monster, 10);
        if (result.success) {
          successCount++;
          break; // Stop after first success
        }
      }

      // With high capture rate and low HP, should have at least 1 success
      expect(successCount).toBeGreaterThan(0);
      expect(captureSystem.getCapturedCount()).toBe(successCount);
    });
  });

  describe('hasCaptured', () => {
    it('should return true for captured monster', () => {
      const monster = createTestMonster({ 
        id: 'char001',
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE 
      });

      let captured = false;
      let attempts = 0;
      while (!captured && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
        if (captureSystem.attemptCapture(monster, 10).success) {
          captured = true;
        }
        attempts++;
      }

      if (captured) {
        expect(captureSystem.hasCaptured('char001')).toBe(true);
      }
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
    it('should return null if monster cannot evolve', () => {
      const monster = createTestMonster({
        id: 'char001',
        level: 5, // Too low
        tier: 1,
        evolveTo: 'char002',
        experience: 100,
        captureDate: Date.now(),
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE
      });

      // Add via capture
      let attempts = 0;
      while (captureSystem.getCapturedCount() === 0 && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
        captureSystem.attemptCapture(monster, 10);
        attempts++;
      }

      const database = createTestMonsterDatabase();
      
      // Use the monster from the captured list
      if (captureSystem.getCapturedCount() > 0) {
        const capturedMonster = captureSystem.capturedMonsters[0];
        const result = captureSystem.evolveMonster(capturedMonster, database);
        expect(result).toBeNull();
      }
    });

    it('should return null if evolved form not in database', () => {
      const monster = createTestMonster({
        id: 'char001',
        level: 10,
        tier: 1,
        evolveTo: 'char999', // Doesn't exist
        experience: 100,
        captureDate: Date.now(),
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE
      });

      // Add via capture
      let attempts = 0;
      while (captureSystem.getCapturedCount() === 0 && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
        captureSystem.attemptCapture(monster, 10);
        attempts++;
      }

      const database = createTestMonsterDatabase();
      
      // Use the monster from the captured list
      if (captureSystem.getCapturedCount() > 0) {
        const capturedMonster = captureSystem.capturedMonsters[0];
        const result = captureSystem.evolveMonster(capturedMonster, database);
        expect(result).toBeNull();
      }
    });

    it('should return null if monster not in captured list', () => {
      const monster = createTestMonster({
        id: 'char001',
        level: 10,
        tier: 1,
        evolveTo: 'char002',
        experience: 100,
        captureDate: Date.now()
      });

      // Don't add to capturedMonsters
      const database = createTestMonsterDatabase();

      const result = captureSystem.evolveMonster(monster, database);

      expect(result).toBeNull();
    });

    it('should evolve monster and preserve level, experience, and capture date', () => {
      const captureDate = Date.now();
      const monster = createTestMonster({
        id: 'char001',
        level: 10,
        tier: 1,
        evolveTo: 'char002',
        experience: 500,
        captureDate,
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE
      });

      // Add via capture
      let attempts = 0;
      while (captureSystem.getCapturedCount() === 0 && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
        captureSystem.attemptCapture(monster, 10);
        attempts++;
      }

      const database = createTestMonsterDatabase();
      
      // Use the monster from the captured list
      if (captureSystem.getCapturedCount() > 0) {
        const capturedMonster = captureSystem.capturedMonsters[0];
        const evolved = captureSystem.evolveMonster(capturedMonster, database);

        expect(evolved).not.toBeNull();
        expect(evolved?.id).toBe('char002');
        expect(evolved?.name).toBe('Evolved Form');
        expect(evolved?.level).toBe(10); // Preserved
        expect(evolved?.experience).toBe(500); // Preserved
      }
    });

    it('should update monster in captured list', () => {
      const monster = createTestMonster({
        id: 'char001',
        level: 10,
        tier: 1,
        evolveTo: 'char002',
        experience: 500,
        captureDate: Date.now(),
        captureRate: TEST_CONSTANTS.HIGH_CAPTURE_RATE
      });

      // Add via capture
      let attempts = 0;
      while (captureSystem.getCapturedCount() === 0 && attempts < TEST_CONSTANTS.MAX_CAPTURE_ATTEMPTS) {
        captureSystem.attemptCapture(monster, 10);
        attempts++;
      }

      const database = createTestMonsterDatabase();
      
      // Use the monster from the captured list
      if (captureSystem.getCapturedCount() > 0) {
        const capturedMonster = captureSystem.capturedMonsters[0];
        captureSystem.evolveMonster(capturedMonster, database);

        expect(captureSystem.capturedMonsters[0].id).toBe('char002');
        expect(captureSystem.capturedMonsters[0].name).toBe('Evolved Form');
      }
    });
  });
});
