/**
 * Type-safe event handler function
 */
type EventHandler<T = any> = (data: T) => void;

/**
 * EventBus - Implements a publish-subscribe pattern for decoupled communication
 * 
 * The EventBus allows different parts of the game to communicate without
 * direct dependencies. Systems can emit events and other systems can listen.
 * 
 * @example
 * ```typescript
 * const eventBus = EventBus.getInstance();
 * 
 * // Subscribe to an event
 * eventBus.on('monster:defeated', (data) => {
 *   console.log(`Monster ${data.monsterId} defeated!`);
 * });
 * 
 * // Emit an event
 * eventBus.emit('monster:defeated', { monsterId: 'char001' });
 * 
 * // Unsubscribe
 * eventBus.off('monster:defeated', handler);
 * ```
 */
export class EventBus {
  private static instance: EventBus;
  private listeners = new Map<string, Set<EventHandler>>();

  private constructor() {
    // Singleton pattern
  }

  /**
   * Gets the singleton instance of EventBus
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribes to an event
   * 
   * @param event - The event name to listen for
   * @param handler - Function to call when event is emitted
   */
  on<T = any>(event: string, handler: EventHandler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  /**
   * Subscribes to an event only once
   * The handler will be automatically removed after first execution
   * 
   * @param event - The event name to listen for
   * @param handler - Function to call when event is emitted
   */
  once<T = any>(event: string, handler: EventHandler<T>): void {
    const onceHandler: EventHandler<T> = (data: T) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /**
   * Unsubscribes from an event
   * 
   * @param event - The event name
   * @param handler - The handler function to remove
   */
  off<T = any>(event: string, handler: EventHandler<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(handler);
      
      // Clean up empty listener sets
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emits an event to all subscribers
   * 
   * @param event - The event name to emit
   * @param data - Optional data to pass to handlers
   */
  emit<T = any>(event: string, data?: T): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // Create a copy to avoid issues if handlers modify the set
      const handlers = Array.from(eventListeners);
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for '${event}':`, error);
        }
      });
    }
  }

  /**
   * Removes all listeners for a specific event
   * @param event - The event name
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Gets the number of listeners for an event
   * @param event - The event name
   * @returns Number of listeners
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Gets all registered event names
   * @returns Array of event names
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Checks if an event has any listeners
   * @param event - The event name
   * @returns true if event has listeners, false otherwise
   */
  hasListeners(event: string): boolean {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size > 0 : false;
  }
}

// Common game events (type-safe event names)
export const GameEvents = {
  // Battle events
  BATTLE_START: 'battle:start',
  BATTLE_END: 'battle:end',
  BATTLE_TURN: 'battle:turn',
  MONSTER_ATTACK: 'monster:attack',
  MONSTER_DEFEATED: 'monster:defeated',
  MONSTER_CAPTURED: 'monster:captured',
  
  // Map events
  LOCATION_CHANGED: 'location:changed',
  ENCOUNTER_START: 'encounter:start',
  
  // UI events
  BUTTON_CLICK: 'ui:button:click',
  SCENE_CHANGE: 'scene:change',
  
  // System events
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  ASSET_LOADED: 'asset:loaded',
  ASSET_ERROR: 'asset:error'
} as const;
