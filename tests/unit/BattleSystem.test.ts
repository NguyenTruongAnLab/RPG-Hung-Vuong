import { describe, it, expect, beforeEach } from 'vitest';
import { BattleSystem } from '../../src/systems/BattleSystem.js';
import { ELEMENT_ADVANTAGES } from '../../src/data/MonsterDatabase.js';

describe('BattleSystem', () => {
  let battleSystem: BattleSystem;

  beforeEach(() => {
    battleSystem = new BattleSystem();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(battleSystem.turn).toBe(0);
      expect(battleSystem.participants).toEqual([]);
    });
  });

  describe('initializeBattle', () => {
    it('should initialize battle with player and enemy monsters', () => {
      const playerMonster = {
        id: 'char001',
        name: 'Rồng Kim',
        element: 'kim',
        level: 5,
        isPlayer: true,
        currentHP: 100,
        stats: { hp: 100, attack: 20, defense: 10, speed: 15, magic: 10 }
      };

      const enemyMonster = {
        id: 'char002',
        name: 'Phượng Kim',
        element: 'kim',
        level: 5,
        isPlayer: false,
        currentHP: 100,
        stats: { hp: 100, attack: 18, defense: 12, speed: 12, magic: 8 }
      };

      battleSystem.initializeBattle([playerMonster], [enemyMonster]);

      expect(battleSystem.participants).toHaveLength(2);
      expect(battleSystem.turn).toBe(0);
    });

    it('should sort participants by speed', () => {
      const slowMonster = {
        id: 'char001',
        name: 'Slow',
        element: 'kim',
        level: 5,
        currentHP: 100,
        stats: { hp: 100, attack: 20, defense: 10, speed: 5, magic: 10 }
      };

      const fastMonster = {
        id: 'char002',
        name: 'Fast',
        element: 'kim',
        level: 5,
        currentHP: 100,
        stats: { hp: 100, attack: 18, defense: 12, speed: 20, magic: 8 }
      };

      battleSystem.initializeBattle([slowMonster], [fastMonster]);

      // Fast monster should be first
      expect(battleSystem.participants[0].name).toBe('Fast');
      expect(battleSystem.participants[1].name).toBe('Slow');
    });
  });

  describe('getElementAdvantage', () => {
    it('should return 1.5 for super effective matchups', () => {
      // Kim > Mộc
      expect(battleSystem.getElementAdvantage('kim', 'moc')).toBe(1.5);
      // Mộc > Thổ
      expect(battleSystem.getElementAdvantage('moc', 'tho')).toBe(1.5);
      // Thổ > Thủy
      expect(battleSystem.getElementAdvantage('tho', 'thuy')).toBe(1.5);
      // Thủy > Hỏa
      expect(battleSystem.getElementAdvantage('thuy', 'hoa')).toBe(1.5);
      // Hỏa > Kim
      expect(battleSystem.getElementAdvantage('hoa', 'kim')).toBe(1.5);
    });

    it('should return 0.5 for not very effective matchups', () => {
      // Mộc < Kim (reverse of Kim > Mộc)
      expect(battleSystem.getElementAdvantage('moc', 'kim')).toBe(0.5);
      // Thổ < Mộc
      expect(battleSystem.getElementAdvantage('tho', 'moc')).toBe(0.5);
    });

    it('should return 1.0 for neutral matchups', () => {
      // Same element
      expect(battleSystem.getElementAdvantage('kim', 'kim')).toBe(1.0);
      // Non-adjacent elements
      expect(battleSystem.getElementAdvantage('kim', 'thuy')).toBe(1.0);
    });
  });

  describe('calculateDamage', () => {
    it('should calculate base damage correctly', () => {
      const attacker = {
        element: 'kim',
        stats: { attack: 20, defense: 10, speed: 15, magic: 10, hp: 100 }
      };

      const defender = {
        element: 'kim', // Same element = neutral
        stats: { attack: 15, defense: 10, speed: 12, magic: 8, hp: 100 }
      };

      const result = battleSystem.calculateDamage(attacker, defender);

      // Base damage = 20, advantage = 1.0, defense = 10/2 = 5
      // Final = 20 * 1.0 - 5 = 15
      expect(result.damage).toBe(15);
      expect(result.advantage).toBe(1.0);
    });

    it('should apply element advantage', () => {
      const attacker = {
        element: 'kim',
        stats: { attack: 20, defense: 10, speed: 15, magic: 10, hp: 100 }
      };

      const defender = {
        element: 'moc', // Kim > Mộc = 1.5x
        stats: { attack: 15, defense: 10, speed: 12, magic: 8, hp: 100 }
      };

      const result = battleSystem.calculateDamage(attacker, defender);

      // Base = 20 * 1.5 = 30, defense = 5, final = 25
      expect(result.advantage).toBe(1.5);
      expect(result.damage).toBeGreaterThan(15); // More than neutral
    });

    it('should have minimum damage of 1', () => {
      const weakAttacker = {
        element: 'kim',
        stats: { attack: 5, defense: 5, speed: 10, magic: 5, hp: 50 }
      };

      const strongDefender = {
        element: 'hoa', // Hỏa > Kim = attacker disadvantaged
        stats: { attack: 20, defense: 50, speed: 15, magic: 10, hp: 200 }
      };

      const result = battleSystem.calculateDamage(weakAttacker, strongDefender);

      expect(result.damage).toBeGreaterThanOrEqual(1);
    });

    it('should add skill power to damage', () => {
      const attacker = {
        element: 'kim',
        stats: { attack: 20, defense: 10, speed: 15, magic: 10, hp: 100 }
      };

      const defender = {
        element: 'kim',
        stats: { attack: 15, defense: 10, speed: 12, magic: 8, hp: 100 }
      };

      const skill = {
        name: 'Test Skill',
        power: 30,
        element: 'kim'
      };

      const result = battleSystem.calculateDamage(attacker, defender, skill);

      // Base = 20 + 30 = 50, advantage = 1.0, defense = 5, final = 45
      expect(result.damage).toBe(45);
    });
  });

  describe('attack', () => {
    it('should reduce defender HP', () => {
      const attacker = {
        element: 'kim',
        stats: { attack: 20, defense: 10, speed: 15, magic: 10, hp: 100 }
      };

      const defender = {
        element: 'kim',
        currentHP: 100,
        stats: { attack: 15, defense: 10, speed: 12, magic: 8, hp: 100 }
      };

      const result = battleSystem.attack(attacker, defender);

      expect(defender.currentHP).toBeLessThan(100);
      expect(result.remainingHP).toBe(defender.currentHP);
    });

    it('should not reduce HP below 0', () => {
      const attacker = {
        element: 'kim',
        stats: { attack: 100, defense: 10, speed: 15, magic: 10, hp: 100 }
      };

      const defender = {
        element: 'kim',
        currentHP: 10,
        stats: { attack: 15, defense: 5, speed: 12, magic: 8, hp: 100 }
      };

      const result = battleSystem.attack(attacker, defender);

      expect(defender.currentHP).toBe(0);
      expect(result.isKO).toBe(true);
    });
  });

  describe('battle state', () => {
    it('should detect player win', () => {
      const playerMonster = {
        id: 'char001',
        isPlayer: true,
        currentHP: 50,
        stats: { hp: 100 }
      };

      const enemyMonster = {
        id: 'char002',
        isPlayer: false,
        currentHP: 0,
        stats: { hp: 100 }
      };

      battleSystem.participants = [playerMonster, enemyMonster];

      expect(battleSystem.isPlayerWin()).toBe(true);
      expect(battleSystem.isBattleOver()).toBe(true);
    });

    it('should detect enemy win', () => {
      const playerMonster = {
        id: 'char001',
        isPlayer: true,
        currentHP: 0,
        stats: { hp: 100 }
      };

      const enemyMonster = {
        id: 'char002',
        isPlayer: false,
        currentHP: 50,
        stats: { hp: 100 }
      };

      battleSystem.participants = [playerMonster, enemyMonster];

      expect(battleSystem.isEnemyWin()).toBe(true);
      expect(battleSystem.isBattleOver()).toBe(true);
    });

    it('should not be over while both sides have HP', () => {
      const playerMonster = {
        id: 'char001',
        isPlayer: true,
        currentHP: 50,
        stats: { hp: 100 }
      };

      const enemyMonster = {
        id: 'char002',
        isPlayer: false,
        currentHP: 50,
        stats: { hp: 100 }
      };

      battleSystem.participants = [playerMonster, enemyMonster];

      expect(battleSystem.isBattleOver()).toBe(false);
    });
  });

  describe('turn management', () => {
    it('should increment turn counter', () => {
      expect(battleSystem.turn).toBe(0);
      battleSystem.nextTurn();
      expect(battleSystem.turn).toBe(1);
      battleSystem.nextTurn();
      expect(battleSystem.turn).toBe(2);
    });
  });
});
