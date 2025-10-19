/**
 * SurvivalStats - Player survival mechanics
 * 
 * Manages hunger, health, sanity, and temperature.
 * Stats deplete over time and affect player state.
 * 
 * @example
 * ```typescript
 * const stats = SurvivalStats.getInstance();
 * stats.init();
 * 
 * // Update each frame
 * stats.update(deltaTime);
 * 
 * // Modify stats
 * stats.modifyHunger(-10); // Eat food
 * stats.modifyHealth(20); // Heal
 * ```
 */

/**
 * Stat change event
 */
export interface StatChangeEvent {
  stat: 'hunger' | 'health' | 'sanity' | 'temperature';
  oldValue: number;
  newValue: number;
  max: number;
}

/**
 * Stat thresholds for warnings
 */
const STAT_THRESHOLDS = {
  critical: 25,
  warning: 50,
  normal: 75
};

/**
 * Stat depletion rates (per second)
 */
const DEPLETION_RATES = {
  hunger: 0.5, // 0.5% per second (200s to starve)
  sanity: 0.2, // 0.2% per second (500s to go insane)
  temperature: 0 // Modified by weather/biome
};

/**
 * SurvivalStats singleton
 */
export class SurvivalStats {
  private static instance: SurvivalStats;
  
  // Stat values (0-100)
  private hunger: number = 100;
  private health: number = 100;
  private sanity: number = 100;
  private temperature: number = 75; // 75 = comfortable
  
  // Max values
  private maxHunger: number = 100;
  private maxHealth: number = 100;
  private maxSanity: number = 100;
  private maxTemperature: number = 100;
  
  // Callbacks
  private onStatChange: ((event: StatChangeEvent) => void)[] = [];
  private onDeath: (() => void)[] = [];
  
  // State
  private isAlive: boolean = true;
  private lastUpdateTime: number = 0;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): SurvivalStats {
    if (!SurvivalStats.instance) {
      SurvivalStats.instance = new SurvivalStats();
    }
    return SurvivalStats.instance;
  }

  /**
   * Initialize survival stats
   */
  init(): void {
    this.hunger = 100;
    this.health = 100;
    this.sanity = 100;
    this.temperature = 75;
    this.isAlive = true;
    this.lastUpdateTime = Date.now();
    
    console.log('✅ SurvivalStats initialized');
  }

  /**
   * Update stats (call each frame)
   */
  update(deltaTime: number): void {
    if (!this.isAlive) return;
    
    const deltaSeconds = deltaTime / 1000;
    
    // Deplete hunger
    this.modifyHunger(-DEPLETION_RATES.hunger * deltaSeconds);
    
    // Deplete sanity
    this.modifySanity(-DEPLETION_RATES.sanity * deltaSeconds);
    
    // Health effects from low hunger
    if (this.hunger <= 0) {
      this.modifyHealth(-2 * deltaSeconds); // Starving: -2 health per second
    }
    
    // Sanity effects
    if (this.sanity <= STAT_THRESHOLDS.critical) {
      // Low sanity: occasional health damage
      if (Math.random() < 0.01) {
        this.modifyHealth(-1);
      }
    }
    
    // Temperature effects
    if (this.temperature <= 25) {
      // Too cold: lose health
      this.modifyHealth(-0.5 * deltaSeconds);
    } else if (this.temperature >= 90) {
      // Too hot: lose health
      this.modifyHealth(-0.5 * deltaSeconds);
    }
    
    // Check death
    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * Modify hunger
   */
  modifyHunger(amount: number): void {
    const oldValue = this.hunger;
    this.hunger = Math.max(0, Math.min(this.maxHunger, this.hunger + amount));
    
    if (oldValue !== this.hunger) {
      this.emitStatChange('hunger', oldValue, this.hunger, this.maxHunger);
    }
  }

  /**
   * Modify health
   */
  modifyHealth(amount: number): void {
    const oldValue = this.health;
    this.health = Math.max(0, Math.min(this.maxHealth, this.health + amount));
    
    if (oldValue !== this.health) {
      this.emitStatChange('health', oldValue, this.health, this.maxHealth);
    }
  }

  /**
   * Modify sanity
   */
  modifySanity(amount: number): void {
    const oldValue = this.sanity;
    this.sanity = Math.max(0, Math.min(this.maxSanity, this.sanity + amount));
    
    if (oldValue !== this.sanity) {
      this.emitStatChange('sanity', oldValue, this.sanity, this.maxSanity);
    }
  }

  /**
   * Modify temperature
   */
  modifyTemperature(amount: number): void {
    const oldValue = this.temperature;
    this.temperature = Math.max(0, Math.min(this.maxTemperature, this.temperature + amount));
    
    if (oldValue !== this.temperature) {
      this.emitStatChange('temperature', oldValue, this.temperature, this.maxTemperature);
    }
  }

  /**
   * Get hunger (0-100)
   */
  getHunger(): number {
    return this.hunger;
  }

  /**
   * Get health (0-100)
   */
  getHealth(): number {
    return this.health;
  }

  /**
   * Get sanity (0-100)
   */
  getSanity(): number {
    return this.sanity;
  }

  /**
   * Get temperature (0-100)
   */
  getTemperature(): number {
    return this.temperature;
  }

  /**
   * Check if player is alive
   */
  isPlayerAlive(): boolean {
    return this.isAlive;
  }

  /**
   * Player dies
   */
  private die(): void {
    if (!this.isAlive) return;
    
    this.isAlive = false;
    this.health = 0;
    console.log('💀 Player died!');
    
    this.onDeath.forEach(callback => callback());
  }

  /**
   * Respawn player
   */
  respawn(): void {
    this.init();
    console.log('🔄 Player respawned');
  }

  /**
   * Emit stat change event
   */
  private emitStatChange(stat: StatChangeEvent['stat'], oldValue: number, newValue: number, max: number): void {
    const event: StatChangeEvent = { stat, oldValue, newValue, max };
    this.onStatChange.forEach(callback => callback(event));
  }

  /**
   * Subscribe to stat changes
   */
  onStatChanged(callback: (event: StatChangeEvent) => void): void {
    this.onStatChange.push(callback);
  }

  /**
   * Subscribe to death
   */
  onPlayerDeath(callback: () => void): void {
    this.onDeath.push(callback);
  }

  /**
   * Get stat threshold level
   */
  getThresholdLevel(value: number): 'critical' | 'warning' | 'normal' | 'healthy' {
    if (value <= STAT_THRESHOLDS.critical) return 'critical';
    if (value <= STAT_THRESHOLDS.warning) return 'warning';
    if (value <= STAT_THRESHOLDS.normal) return 'normal';
    return 'healthy';
  }

  /**
   * Save stats to storage
   */
  async save(): Promise<void> {
    const data = {
      hunger: this.hunger,
      health: this.health,
      sanity: this.sanity,
      temperature: this.temperature,
      isAlive: this.isAlive
    };
    
    localStorage.setItem('survival_stats', JSON.stringify(data));
  }

  /**
   * Load stats from storage
   */
  async load(): Promise<void> {
    const saved = localStorage.getItem('survival_stats');
    if (!saved) return;
    
    try {
      const data = JSON.parse(saved);
      this.hunger = data.hunger ?? 100;
      this.health = data.health ?? 100;
      this.sanity = data.sanity ?? 100;
      this.temperature = data.temperature ?? 75;
      this.isAlive = data.isAlive ?? true;
      
      console.log('✅ Survival stats loaded');
    } catch (error) {
      console.error('Failed to load survival stats:', error);
    }
  }
}
