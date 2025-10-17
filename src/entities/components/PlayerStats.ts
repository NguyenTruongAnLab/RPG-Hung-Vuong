/**
 * PlayerStats - Player statistics management
 * 
 * Manages player HP, level, and other stats.
 * Component of Player entity.
 */

export interface PlayerStatsData {
  maxHp: number;
  currentHp: number;
  level: number;
  experience: number;
}

export class PlayerStats {
  private maxHp: number;
  private currentHp: number;
  private level: number;
  private experience: number;

  constructor(initialStats?: Partial<PlayerStatsData>) {
    this.maxHp = initialStats?.maxHp ?? 100;
    this.currentHp = initialStats?.currentHp ?? this.maxHp;
    this.level = initialStats?.level ?? 1;
    this.experience = initialStats?.experience ?? 0;
  }

  /**
   * Gets current HP
   * @returns Current HP value
   */
  public getHp(): number {
    return this.currentHp;
  }

  /**
   * Gets max HP
   * @returns Max HP value
   */
  public getMaxHp(): number {
    return this.maxHp;
  }

  /**
   * Gets HP as percentage (0-1)
   * @returns HP percentage
   */
  public getHpPercentage(): number {
    return this.currentHp / this.maxHp;
  }

  /**
   * Damages the player
   * 
   * @param amount - Damage amount
   * @returns Actual damage dealt
   * 
   * @example
   * ```typescript
   * stats.takeDamage(25);
   * console.log(stats.getHp()); // HP reduced by 25
   * ```
   */
  public takeDamage(amount: number): number {
    const oldHp = this.currentHp;
    this.currentHp = Math.max(0, this.currentHp - amount);
    return oldHp - this.currentHp;
  }

  /**
   * Heals the player
   * 
   * @param amount - Heal amount
   * @returns Actual HP restored
   * 
   * @example
   * ```typescript
   * stats.heal(50);
   * ```
   */
  public heal(amount: number): number {
    const oldHp = this.currentHp;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    return this.currentHp - oldHp;
  }

  /**
   * Checks if player is alive
   * @returns True if HP > 0
   */
  public isAlive(): boolean {
    return this.currentHp > 0;
  }

  /**
   * Gets player level
   * @returns Current level
   */
  public getLevel(): number {
    return this.level;
  }

  /**
   * Gets player experience
   * @returns Current experience
   */
  public getExperience(): number {
    return this.experience;
  }

  /**
   * Adds experience and handles level up
   * 
   * @param amount - Experience to add
   * @returns True if leveled up
   * 
   * @example
   * ```typescript
   * if (stats.addExperience(100)) {
   *   console.log('Level up!');
   * }
   * ```
   */
  public addExperience(amount: number): boolean {
    this.experience += amount;
    
    // Check for level up (100 exp per level)
    const requiredExp = this.level * 100;
    if (this.experience >= requiredExp) {
      this.levelUp();
      return true;
    }
    
    return false;
  }

  /**
   * Levels up the player
   * Increases max HP and restores current HP
   */
  private levelUp(): void {
    this.level++;
    this.experience = 0;
    this.maxHp += 10; // +10 HP per level
    this.currentHp = this.maxHp; // Full heal on level up
  }

  /**
   * Gets all stats as data object
   * @returns Stats data
   */
  public getData(): PlayerStatsData {
    return {
      maxHp: this.maxHp,
      currentHp: this.currentHp,
      level: this.level,
      experience: this.experience
    };
  }
}
