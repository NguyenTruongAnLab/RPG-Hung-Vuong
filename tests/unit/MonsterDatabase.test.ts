/**
 * Tests for Monster Database
 * Validates the integrity of monster data
 */
import { describe, it, expect } from 'vitest';
import monsterDB from '../../src/data/monster-database.json';

const MAX_TIER = 5; // Tier 5 for legendary/special monsters

describe('Monster Database', () => {
  it('should have 207 monsters', () => {
    expect(monsterDB.monsters).toBeDefined();
    expect(monsterDB.monsters.length).toBe(207);
  });

  it('should have monsters from all elements', () => {
    const elements = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
    const monstersByElement = elements.map(element => 
      monsterDB.monsters.filter(m => m.element === element)
    );

    // Each element should have monsters
    monstersByElement.forEach((monsters) => {
      expect(monsters.length).toBeGreaterThan(0);
    });
  });

  it('should have valid stats for all monsters', () => {
    monsterDB.monsters.forEach(monster => {
      expect(monster.stats).toBeDefined();
      expect(monster.stats.hp).toBeGreaterThan(0);
      expect(monster.stats.attack).toBeGreaterThan(0);
      expect(monster.stats.defense).toBeGreaterThan(0);
      expect(monster.stats.speed).toBeGreaterThan(0);
    });
  });

  it('should have valid tier for all monsters', () => {
    monsterDB.monsters.forEach(monster => {
      expect(monster.tier).toBeGreaterThanOrEqual(1);
      expect(monster.tier).toBeLessThanOrEqual(MAX_TIER);
    });
  });

  it('should have asset names for all monsters', () => {
    monsterDB.monsters.forEach(monster => {
      expect(monster.assetName).toBeDefined();
      expect(monster.assetName.length).toBeGreaterThan(0);
    });
  });

  it('should have unique asset names', () => {
    const assetNames = monsterDB.monsters.map(m => m.assetName);
    const uniqueNames = new Set(assetNames);
    expect(uniqueNames.size).toBe(assetNames.length);
  });

  it('should have Vietnamese and English names', () => {
    monsterDB.monsters.forEach(monster => {
      expect(monster.name).toBeDefined();
      expect(monster.name.length).toBeGreaterThan(0);
      expect(monster.englishName).toBeDefined();
      expect(monster.englishName.length).toBeGreaterThan(0);
    });
  });

  it('should have descriptions', () => {
    monsterDB.monsters.forEach(monster => {
      expect(monster.description).toBeDefined();
      expect(monster.description.length).toBeGreaterThan(0);
    });
  });
});
