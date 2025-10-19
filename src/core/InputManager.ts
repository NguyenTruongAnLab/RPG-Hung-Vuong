/**
 * InputManager - Manages keyboard and touch input
 * 
 * Singleton that tracks keyboard state and provides
 * convenient methods for querying input.
 * 
 * @example
 * ```typescript
 * const input = InputManager.getInstance();
 * input.init();
 * 
 * // In update loop
 * const movement = input.getMovementVector();
 * if (input.isKeyDown('space')) {
 *   player.attack();
 * }
 * ```
 */
import { Vector2D } from '../utils/Vector2D';

export class InputManager {
  private static instance: InputManager | null = null;
  private keys: Map<string, boolean> = new Map();
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Gets the singleton instance
   * @returns The InputManager instance
   */
  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  /**
   * Initializes the input manager
   * Sets up keyboard event listeners
   * 
   * @example
   * ```typescript
   * input.init();
   * ```
   */
  public init(): void {
    if (this.isInitialized) {
      console.warn('InputManager already initialized');
      return;
    }

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Clear keys on window blur (prevent stuck keys)
    window.addEventListener('blur', this.clearKeys);

    this.isInitialized = true;
    console.log('✅ InputManager: Keyboard event listeners registered (W/A/S/D + Arrow keys)');
  }

  /**
   * Handles keydown events
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    const wasPressed = this.keys.get(key);
    this.keys.set(key, true);
    
    // Only log first press (not repeats)
    if (!wasPressed && ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      console.log(`✅ [INPUT] ${key.toUpperCase()} pressed`);
    }
  };

  /**
   * Handles keyup events
   */
  private handleKeyUp = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    this.keys.set(key, false);
  };

  /**
   * Clears all key states
   */
  private clearKeys = (): void => {
    this.keys.clear();
  };

  /**
   * Checks if a key is currently pressed
   * 
   * @param key - The key to check (lowercase)
   * @returns True if key is pressed
   * 
   * @example
   * ```typescript
   * if (input.isKeyDown('space')) {
   *   player.attack();
   * }
   * ```
   */
  public isKeyDown(key: string): boolean {
    return this.keys.get(key.toLowerCase()) === true;
  }

  /**
   * Gets movement vector from WASD and arrow keys
   * Automatically normalized for diagonal movement
   * 
   * @returns Normalized movement vector
   * 
   * @example
   * ```typescript
   * const movement = input.getMovementVector();
   * // movement.x: -1 (left), 0 (none), 1 (right)
   * // movement.y: -1 (up), 0 (none), 1 (down)
   * ```
   */
  public getMovementVector(): Vector2D {
    let x = 0;
    let y = 0;

    // Horizontal movement (WASD + Arrows)
    if (this.isKeyDown('a') || this.isKeyDown('arrowleft')) {
      x -= 1;
    }
    if (this.isKeyDown('d') || this.isKeyDown('arrowright')) {
      x += 1;
    }

    // Vertical movement (WASD + Arrows)
    if (this.isKeyDown('w') || this.isKeyDown('arrowup')) {
      y -= 1;
    }
    if (this.isKeyDown('s') || this.isKeyDown('arrowdown')) {
      y += 1;
    }

    // Normalize diagonal movement to prevent 1.4x speed
    const length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  /**
   * Checks if any movement key is pressed
   * @returns True if any movement key is down
   */
  public isMoving(): boolean {
    const movement = this.getMovementVector();
    return movement.x !== 0 || movement.y !== 0;
  }

  /**
   * Checks if attack key is pressed (Space)
   * @returns True if space is pressed
   */
  public isAttackPressed(): boolean {
    return this.isKeyDown('space') || this.isKeyDown(' ');
  }

  /**
   * Checks if interact key is pressed (E)
   * @returns True if E is pressed
   */
  public isInteractPressed(): boolean {
    return this.isKeyDown('e');
  }

  /**
   * Checks if harvest key is pressed (E) - alias for interact
   * @returns True if E is pressed
   */
  public isHarvestPressed(): boolean {
    return this.isKeyDown('e');
  }

  /**
   * Checks if inventory key is pressed (Tab or I)
   * @returns True if Tab or I is pressed
   */
  public isInventoryPressed(): boolean {
    return this.isKeyDown('tab') || this.isKeyDown('i');
  }

  /**
   * Disposes of the input manager
   * Removes event listeners
   */
  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.clearKeys);
    this.keys.clear();
    this.isInitialized = false;
  }

  /**
   * Resets the singleton instance
   * For testing purposes
   */
  public static dispose(): void {
    if (InputManager.instance) {
      InputManager.instance.dispose();
      InputManager.instance = null;
    }
  }
}
