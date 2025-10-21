import * as PIXI from 'pixi.js';
import { AudioManager } from '../core/AudioManager';

/**
 * UISound
 * Utility for attaching sound effects to UI elements (buttons, hovers, selections)
 * 
 * Features:
 * - Automatic click sound on button press
 * - Automatic hover sound on button hover
 * - Selection sounds for choices
 * - Level up fanfare
 * 
 * @example
 * // Attach sounds to a button
 * UISound.attachButtonSounds(myButton);
 * 
 * // Play custom UI sounds
 * UISound.playClick();
 * UISound.playHover();
 * UISound.playSelect();
 * UISound.playLevelUp();
 */
export class UISound {
  private static audioManager: AudioManager | null = null;
  private static isInitialized = false;

  /**
   * Initialize UI sound system
   * Must be called before using any sound functions
   * @param audioManager - AudioManager instance
   */
  static init(audioManager: AudioManager): void {
    UISound.audioManager = audioManager;
    UISound.isInitialized = true;
  }

  /**
   * Check if UI sounds are ready
   */
  private static isReady(): boolean {
    if (!UISound.isInitialized || !UISound.audioManager) {
      console.warn('UISound not initialized. Call UISound.init(audioManager) first.');
      return false;
    }
    return true;
  }

  /**
   * Play click sound (button press)
   */
  static playClick(): void {
    if (!UISound.isReady()) return;
    UISound.audioManager!.playSFX('sfx_click');
  }

  /**
   * Play hover sound (mouse over UI element)
   */
  static playHover(): void {
    if (!UISound.isReady()) return;
    UISound.audioManager!.playSFX('sfx_hover');
  }

  /**
   * Play select sound (item/option selected)
   */
  static playSelect(): void {
    if (!UISound.isReady()) return;
    UISound.audioManager!.playSFX('sfx_select');
  }

  /**
   * Play level up sound (fanfare)
   */
  static playLevelUp(): void {
    if (!UISound.isReady()) return;
    UISound.audioManager!.playSFX('sfx_levelup');
  }

  /**
   * Attach click and hover sounds to a button container
   * @param button - PIXI.Container acting as a button
   * @param options - Sound options
   */
  static attachButtonSounds(
    button: PIXI.Container,
    options: {
      enableClick?: boolean;
      enableHover?: boolean;
    } = {}
  ): void {
    if (!UISound.isReady()) return;

    const {
      enableClick = true,
      enableHover = true
    } = options;

    // Make button interactive
    button.eventMode = 'static';
    button.cursor = 'pointer';

    // Track hover state to prevent spam
    let isHovering = false;

    // Click sound
    if (enableClick) {
      button.on('pointerdown', () => {
        UISound.audioManager!.playSFX('sfx_click');
      });
    }

    // Hover sound
    if (enableHover) {
      button.on('pointerenter', () => {
        if (!isHovering) {
          isHovering = true;
          UISound.audioManager!.playSFX('sfx_hover');
        }
      });

      button.on('pointerleave', () => {
        isHovering = false;
      });
    }
  }

  /**
   * Attach selection sound to a container
   * Plays sound when clicked/selected
   * @param container - PIXI.Container to attach to
   */
  static attachSelectionSound(container: PIXI.Container): void {
    if (!UISound.isReady()) return;

    container.eventMode = 'static';
    container.cursor = 'pointer';

    container.on('pointerdown', () => {
      UISound.audioManager!.playSFX('sfx_select');
    });
  }

  /**
   * Batch attach sounds to multiple buttons
   * @param buttons - Array of button containers
   * @param options - Sound options
   */
  static attachSoundsToButtons(
    buttons: PIXI.Container[],
    options: {
      enableClick?: boolean;
      enableHover?: boolean;
    } = {}
  ): void {
    buttons.forEach(button => UISound.attachButtonSounds(button, options));
  }

  /**
   * Enhanced button attachment with visual feedback + sound
   * @param button - PIXI.Container acting as a button
   * @param options - Combined visual and sound options
   */
  static attachEnhancedButton(
    button: PIXI.Container,
    options: {
      enableClick?: boolean;
      enableHover?: boolean;
      hoverAlpha?: number;
      clickScale?: number;
    } = {}
  ): void {
    if (!UISound.isReady()) return;

    const {
      enableClick = true,
      enableHover = true,
      hoverAlpha = 1.0,
      clickScale = 0.95
    } = options;

    const originalAlpha = button.alpha;
    const originalScale = { x: button.scale.x, y: button.scale.y };

    button.eventMode = 'static';
    button.cursor = 'pointer';

    let isHovering = false;

    // Hover effects
    if (enableHover) {
      button.on('pointerenter', () => {
        if (!isHovering) {
          isHovering = true;
          button.alpha = hoverAlpha;
          UISound.audioManager!.playSFX('sfx_hover');
        }
      });

      button.on('pointerleave', () => {
        isHovering = false;
        button.alpha = originalAlpha;
        button.scale.set(originalScale.x, originalScale.y);
      });
    }

    // Click effects
    if (enableClick) {
      button.on('pointerdown', () => {
        button.scale.set(originalScale.x * clickScale, originalScale.y * clickScale);
        UISound.audioManager!.playSFX('sfx_click');
      });

      button.on('pointerup', () => {
        button.scale.set(originalScale.x, originalScale.y);
      });
    }
  }
}
