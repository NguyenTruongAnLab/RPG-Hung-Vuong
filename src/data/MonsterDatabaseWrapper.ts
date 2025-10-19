/**
 * MonsterDatabase - Singleton wrapper for the monster database
 * Provides singleton access to the monster database with useful methods
 */
import { MONSTER_DATABASE } from './MonsterDatabase.js';

export interface MonsterData {
  id: string;
  name: string;
  element: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  type: string;
  tier: number;
  skills: Array<{
    name: string;
    power: number;
    element: string;
  }>;
  evolveFrom: string | null;
  evolveTo: string | null;
  captureRate: number;
  rarity: string;
}

export class MonsterDatabase {
  private static instance: MonsterDatabase;
  private database: Record<string, any>;

  private constructor() {
    this.database = MONSTER_DATABASE;
  }

  /**
   * Gets singleton instance
   */
  public static getInstance(): MonsterDatabase {
    if (!MonsterDatabase.instance) {
      MonsterDatabase.instance = new MonsterDatabase();
    }
    return MonsterDatabase.instance;
  }

  /**
   * Gets a monster by ID
   */
  public getMonsterById(id: string): MonsterData | null {
    const monster = this.database[id];
    return monster || null;
  }

  /**
   * Gets all monsters
   */
  public getAllMonsters(): MonsterData[] {
    return Object.values(this.database);
  }

  /**
   * Gets monsters by element
   */
  public getMonstersByElement(element: string): MonsterData[] {
    return this.getAllMonsters().filter(m => m.element === element);
  }

  /**
   * Gets monsters by rarity
   */
  public getMonstersByRarity(rarity: string): MonsterData[] {
    return this.getAllMonsters().filter(m => m.rarity === rarity);
  }

  /**
   * Gets random monster
   */
  public getRandomMonster(): MonsterData {
    const monsters = this.getAllMonsters();
    return monsters[Math.floor(Math.random() * monsters.length)];
  }

  /**
   * Gets random monster by element
   */
  public getRandomMonsterByElement(element: string): MonsterData | null {
    const monsters = this.getMonstersByElement(element);
    if (!monsters.length) return null;
    return monsters[Math.floor(Math.random() * monsters.length)];
  }

  /**
   * Gets total monster count
   */
  public getMonsterCount(): number {
    return this.getAllMonsters().length;
  }
}
