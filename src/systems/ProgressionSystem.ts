/**
 * ProgressionSystem - Track player level, EXP, and captured monsters
 * 
 * Singleton system for managing player progression and
 * save/load persistence.
 * 
 * @example
 * ```typescript
 * const progression = ProgressionSystem.getInstance();
 * progression.addExp(50);
 * progression.captureMonster('Absolution');
 * const stats = progression.getProgress();
 * ```
 */
export class ProgressionSystem {
  private static instance: ProgressionSystem;
  private playerLevel = 1;
  private playerExp = 0;
  private capturedMonsters: string[] = [];
  private totalMonsters = 207;
  
  private constructor() {
    this.load();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): ProgressionSystem {
    if (!this.instance) {
      this.instance = new ProgressionSystem();
    }
    return this.instance;
  }
  
  /**
   * Add experience points
   * 
   * @param amount - Amount of EXP to add
   * @returns true if leveled up
   * 
   * @example
   * ```typescript
   * const leveledUp = progression.addExp(50);
   * if (leveledUp) {
   *   console.log('Level up!');
   * }
   * ```
   */
  addExp(amount: number): boolean {
    this.playerExp += amount;
    
    // Level up at 100 * level
    const expNeeded = this.getExpNeeded();
    if (this.playerExp >= expNeeded) {
      this.levelUp();
      this.save();
      return true;
    }
    
    this.save();
    return false;
  }
  
  /**
   * Capture a monster
   * 
   * @param assetName - Monster asset name
   * @returns true if newly captured
   */
  captureMonster(assetName: string): boolean {
    if (!this.capturedMonsters.includes(assetName)) {
      this.capturedMonsters.push(assetName);
      this.save();
      return true;
    }
    return false;
  }
  
  /**
   * Check if monster is captured
   */
  hasCaptured(assetName: string): boolean {
    return this.capturedMonsters.includes(assetName);
  }
  
  /**
   * Get progression stats
   */
  getProgress(): { 
    level: number; 
    exp: number; 
    expNeeded: number;
    captured: number; 
    total: number;
    captureRate: number;
  } {
    return {
      level: this.playerLevel,
      exp: this.playerExp,
      expNeeded: this.getExpNeeded(),
      captured: this.capturedMonsters.length,
      total: this.totalMonsters,
      captureRate: Math.round((this.capturedMonsters.length / this.totalMonsters) * 100)
    };
  }
  
  /**
   * Get current level
   */
  getLevel(): number {
    return this.playerLevel;
  }
  
  /**
   * Get current EXP
   */
  getExp(): number {
    return this.playerExp;
  }
  
  /**
   * Get EXP needed for next level
   */
  getExpNeeded(): number {
    return this.playerLevel * 100;
  }
  
  /**
   * Get EXP progress as percentage (0-1)
   */
  getExpProgress(): number {
    return this.playerExp / this.getExpNeeded();
  }
  
  /**
   * Get captured count
   */
  getCapturedCount(): number {
    return this.capturedMonsters.length;
  }
  
  /**
   * Get captured monsters list
   */
  getCapturedMonsters(): string[] {
    return [...this.capturedMonsters];
  }
  
  /**
   * Calculate EXP reward for battle
   */
  calculateExpReward(enemyLevel: number, victory: boolean): number {
    if (!victory) return 10; // Small consolation prize
    
    const baseExp = 30;
    const levelBonus = enemyLevel * 5;
    return baseExp + levelBonus;
  }
  
  private levelUp(): void {
    this.playerLevel++;
    this.playerExp = 0;
    console.log(`🎉 Level Up! Now level ${this.playerLevel}`);
    
    // Emit level up event (if event bus is available)
    if (typeof window !== 'undefined' && (window as any).eventBus) {
      (window as any).eventBus.emit('player-level-up', { level: this.playerLevel });
    }
  }
  
  private save(): void {
    const data = {
      level: this.playerLevel,
      exp: this.playerExp,
      captured: this.capturedMonsters
    };
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('progression', JSON.stringify(data));
    }
  }
  
  private load(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    const data = localStorage.getItem('progression');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.playerLevel = parsed.level || 1;
        this.playerExp = parsed.exp || 0;
        this.capturedMonsters = parsed.captured || [];
        console.log(`📊 Loaded progression: Level ${this.playerLevel}, ${this.capturedMonsters.length} captured`);
      } catch (error) {
        console.error('Failed to load progression:', error);
      }
    }
  }
  
  /**
   * Reset all progression (for debugging)
   */
  reset(): void {
    this.playerLevel = 1;
    this.playerExp = 0;
    this.capturedMonsters = [];
    this.save();
    console.log('🔄 Progression reset');
  }
  
  /**
   * Export progression data
   */
  export(): string {
    return JSON.stringify({
      level: this.playerLevel,
      exp: this.playerExp,
      captured: this.capturedMonsters
    });
  }
  
  /**
   * Import progression data
   */
  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      this.playerLevel = parsed.level || 1;
      this.playerExp = parsed.exp || 0;
      this.capturedMonsters = parsed.captured || [];
      this.save();
      return true;
    } catch (error) {
      console.error('Failed to import progression:', error);
      return false;
    }
  }
}
