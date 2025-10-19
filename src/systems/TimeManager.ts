/**
 * TimeManager - Day/Night cycle system
 * 
 * Manages game time with configurable day/night cycles.
 * Emits time-based events for lighting and gameplay.
 * 
 * @example
 * ```typescript
 * const timeManager = TimeManager.getInstance();
 * timeManager.init(24); // 24 minute day cycle
 * 
 * timeManager.update(deltaTime);
 * const hour = timeManager.getHour(); // 0-23
 * ```
 */

/**
 * Time of day
 */
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

/**
 * Time change event
 */
export interface TimeChangeEvent {
  hour: number;
  minute: number;
  timeOfDay: TimeOfDay;
  dayNumber: number;
}

/**
 * TimeManager singleton
 */
export class TimeManager {
  private static instance: TimeManager;
  
  private currentTime: number = 360; // Minutes since midnight (6:00 AM start)
  private dayNumber: number = 1;
  private cycleDuration: number = 24 * 60 * 1000; // 24 minutes in ms
  private isPaused: boolean = false;
  
  // Time periods (in game hours)
  private readonly DAWN_START = 5;
  private readonly DAY_START = 7;
  private readonly DUSK_START = 18;
  private readonly NIGHT_START = 20;
  
  // Callbacks
  private onTimeChange: ((event: TimeChangeEvent) => void)[] = [];
  private onDayChange: ((day: number) => void)[] = [];
  
  private lastMinute: number = 0;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): TimeManager {
    if (!TimeManager.instance) {
      TimeManager.instance = new TimeManager();
    }
    return TimeManager.instance;
  }

  /**
   * Initialize time manager
   * @param cycleDurationMinutes Real-time minutes for full day cycle
   */
  init(cycleDurationMinutes: number = 24): void {
    this.cycleDuration = cycleDurationMinutes * 60 * 1000;
    this.currentTime = 360; // Start at 6:00 AM
    this.dayNumber = 1;
    this.isPaused = false;
    this.lastMinute = this.getMinute();
    
    console.log(`✅ TimeManager initialized (${cycleDurationMinutes} min cycle)`);
  }

  /**
   * Update time (call each frame)
   */
  update(deltaTime: number): void {
    if (this.isPaused) return;
    
    // Calculate time progression
    const minutesPerMs = (24 * 60) / this.cycleDuration;
    const deltaMinutes = deltaTime * minutesPerMs;
    
    this.currentTime += deltaMinutes;
    
    // Handle day rollover
    if (this.currentTime >= 24 * 60) {
      this.currentTime -= 24 * 60;
      this.dayNumber++;
      this.onDayChange.forEach(callback => callback(this.dayNumber));
    }
    
    // Emit minute changes
    const currentMinute = this.getMinute();
    if (currentMinute !== this.lastMinute) {
      this.emitTimeChange();
      this.lastMinute = currentMinute;
    }
  }

  /**
   * Get current hour (0-23)
   */
  getHour(): number {
    return Math.floor(this.currentTime / 60);
  }

  /**
   * Get current minute (0-59)
   */
  getMinute(): number {
    return Math.floor(this.currentTime % 60);
  }

  /**
   * Get time of day
   */
  getTimeOfDay(): TimeOfDay {
    const hour = this.getHour();
    
    if (hour >= this.DAWN_START && hour < this.DAY_START) return 'dawn';
    if (hour >= this.DAY_START && hour < this.DUSK_START) return 'day';
    if (hour >= this.DUSK_START && hour < this.NIGHT_START) return 'dusk';
    return 'night';
  }

  /**
   * Get day number
   */
  getDayNumber(): number {
    return this.dayNumber;
  }

  /**
   * Get time as string (HH:MM)
   */
  getTimeString(): string {
    const hour = this.getHour().toString().padStart(2, '0');
    const minute = this.getMinute().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  /**
   * Check if it's daytime
   */
  isDaytime(): boolean {
    const timeOfDay = this.getTimeOfDay();
    return timeOfDay === 'dawn' || timeOfDay === 'day';
  }

  /**
   * Check if it's nighttime
   */
  isNighttime(): boolean {
    const timeOfDay = this.getTimeOfDay();
    return timeOfDay === 'dusk' || timeOfDay === 'night';
  }

  /**
   * Get ambient light intensity (0-1)
   */
  getAmbientLightIntensity(): number {
    const hour = this.getHour();
    const minute = this.getMinute();
    const totalMinutes = hour * 60 + minute;
    
    // Dawn (5:00-7:00): 0.3 to 1.0
    if (hour >= this.DAWN_START && hour < this.DAY_START) {
      const dawnProgress = (totalMinutes - this.DAWN_START * 60) / (2 * 60);
      return 0.3 + (dawnProgress * 0.7);
    }
    
    // Day (7:00-18:00): 1.0
    if (hour >= this.DAY_START && hour < this.DUSK_START) {
      return 1.0;
    }
    
    // Dusk (18:00-20:00): 1.0 to 0.3
    if (hour >= this.DUSK_START && hour < this.NIGHT_START) {
      const duskProgress = (totalMinutes - this.DUSK_START * 60) / (2 * 60);
      return 1.0 - (duskProgress * 0.7);
    }
    
    // Night (20:00-5:00): 0.3
    return 0.3;
  }

  /**
   * Set time directly
   */
  setTime(hour: number, minute: number = 0): void {
    this.currentTime = (hour * 60) + minute;
    this.emitTimeChange();
  }

  /**
   * Pause time
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume time
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Toggle pause
   */
  togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  /**
   * Check if paused
   */
  isPausedTime(): boolean {
    return this.isPaused;
  }

  /**
   * Emit time change event
   */
  private emitTimeChange(): void {
    const event: TimeChangeEvent = {
      hour: this.getHour(),
      minute: this.getMinute(),
      timeOfDay: this.getTimeOfDay(),
      dayNumber: this.dayNumber
    };
    
    this.onTimeChange.forEach(callback => callback(event));
  }

  /**
   * Subscribe to time changes
   */
  onTimeChanged(callback: (event: TimeChangeEvent) => void): void {
    this.onTimeChange.push(callback);
  }

  /**
   * Subscribe to day changes
   */
  onDayChanged(callback: (day: number) => void): void {
    this.onDayChange.push(callback);
  }

  /**
   * Save time state
   */
  async save(): Promise<void> {
    const data = {
      currentTime: this.currentTime,
      dayNumber: this.dayNumber
    };
    
    localStorage.setItem('time_manager', JSON.stringify(data));
  }

  /**
   * Load time state
   */
  async load(): Promise<void> {
    const saved = localStorage.getItem('time_manager');
    if (!saved) return;
    
    try {
      const data = JSON.parse(saved);
      this.currentTime = data.currentTime ?? 360;
      this.dayNumber = data.dayNumber ?? 1;
      this.lastMinute = this.getMinute();
      
      console.log('✅ TimeManager state loaded');
    } catch (error) {
      console.error('Failed to load time state:', error);
    }
  }
}
