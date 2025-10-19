/**
 * DialogueSystem - Dialogue and conversation management
 * 
 * Handles NPC dialogues, story conversations, and text display.
 * Supports typewriter effects, choices, Vietnamese text,
 * and dialogue state persistence.
 * 
 * @example
 * ```typescript
 * const dialogue = DialogueSystem.getInstance();
 * dialogue.init(app);
 * 
 * // Show dialogue
 * dialogue.showDialogue({
 *   npcName: 'Thôn Trưởng',
 *   text: 'Chào mừng đến Văn Lang!',
 *   choices: [
 *     { text: 'Xin chào', action: 'greet' },
 *     { text: 'Tạm biệt', action: 'goodbye' }
 *   ]
 * });
 * ```
 */
import * as PIXI from 'pixi.js';
import { EventBus } from '../core/EventBus';
import gsap from 'gsap';

/**
 * Dialogue choice interface
 */
export interface DialogueChoice {
  text: string;
  action: string;
  condition?: () => boolean;
}

/**
 * Dialogue data interface
 */
export interface DialogueData {
  id?: string;
  npcName?: string;
  text: string;
  portrait?: string;
  choices?: DialogueChoice[];
  autoClose?: boolean;
  closeDelay?: number;
}

/**
 * DialogueSystem singleton class
 */
export class DialogueSystem {
  private static instance: DialogueSystem;
  private app: PIXI.Application | null = null;
  private eventBus: EventBus;
  private dialogueContainer: PIXI.Container | null = null;
  private textContainer: PIXI.Text | null = null;
  private isActive: boolean = false;
  private currentDialogue: DialogueData | null = null;
  private typewriterTimeline: gsap.core.Timeline | null = null;
  
  // Dialogue state management
  private dialogueState: Map<string, any> = new Map();
  private visitedDialogues: Set<string> = new Set();

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.loadDialogueState();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DialogueSystem {
    if (!DialogueSystem.instance) {
      DialogueSystem.instance = new DialogueSystem();
    }
    return DialogueSystem.instance;
  }

  /**
   * Initialize dialogue system
   * @param app - PixiJS application
   */
  init(app: PIXI.Application): void {
    this.app = app;
    this.createDialogueUI();
  }

  /**
   * Create dialogue UI elements
   */
  private createDialogueUI(): void {
    if (!this.app) return;

    // Main dialogue container
    this.dialogueContainer = new PIXI.Container();
    this.dialogueContainer.visible = false;
    this.dialogueContainer.zIndex = 1000;

    // Dialogue box background
    const boxWidth = 1000;
    const boxHeight = 200;
    const boxX = (this.app.screen.width - boxWidth) / 2;
    const boxY = this.app.screen.height - boxHeight - 50;

    const dialogueBox = new PIXI.Graphics();
    dialogueBox.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    dialogueBox.fill({ color: 0x1a1a2e, alpha: 0.95 });
    dialogueBox.stroke({ width: 3, color: 0x4a4a6a });
    this.dialogueContainer.addChild(dialogueBox);

    // NPC name label
    const nameLabel = new PIXI.Text({
      text: '',
      style: {
        fontSize: 24,
        fill: 0xffd700,
        fontWeight: 'bold',
        fontFamily: 'Arial'
      }
    });
    nameLabel.x = boxX + 20;
    nameLabel.y = boxY + 15;
    this.dialogueContainer.addChild(nameLabel);

    // Dialogue text
    this.textContainer = new PIXI.Text({
      text: '',
      style: {
        fontSize: 20,
        fill: 0xffffff,
        fontFamily: 'Arial',
        wordWrap: true,
        wordWrapWidth: boxWidth - 100
      }
    });
    this.textContainer.x = boxX + 20;
    this.textContainer.y = boxY + 55;
    this.dialogueContainer.addChild(this.textContainer);

    // Add to stage (will be added when needed)
  }

  /**
   * Show dialogue
   * @param data - Dialogue data
   */
  showDialogue(data: DialogueData): void {
    if (!this.app || !this.dialogueContainer || !this.textContainer) {
      console.warn('DialogueSystem not initialized');
      return;
    }

    this.currentDialogue = data;
    this.isActive = true;

    // Update name label
    const nameLabel = this.dialogueContainer.children[1] as PIXI.Text;
    if (data.npcName) {
      nameLabel.text = data.npcName;
      nameLabel.visible = true;
    } else {
      nameLabel.visible = false;
    }

    // Clear previous text
    this.textContainer.text = '';

    // Show container
    this.dialogueContainer.visible = true;
    if (!this.dialogueContainer.parent) {
      this.app.stage.addChild(this.dialogueContainer);
    }

    // Animate box entrance
    this.dialogueContainer.alpha = 0;
    gsap.to(this.dialogueContainer, {
      alpha: 1,
      duration: 0.3,
      ease: 'power2.out'
    });

    // Start typewriter effect
    this.typewriterEffect(data.text);

    // Handle choices
    if (data.choices && data.choices.length > 0) {
      this.createChoices(data.choices);
    }

    // Auto-close if specified
    if (data.autoClose) {
      const delay = data.closeDelay || 3000;
      setTimeout(() => {
        this.hideDialogue();
      }, delay);
    }

    // Emit event
    this.eventBus.emit('dialogue:show', data);
  }

  /**
   * Typewriter effect for text
   * @param fullText - Complete text to display
   */
  private typewriterEffect(fullText: string): void {
    if (!this.textContainer) return;

    // Kill previous timeline
    if (this.typewriterTimeline) {
      this.typewriterTimeline.kill();
    }

    const textObj = { value: '' };
    this.typewriterTimeline = gsap.timeline();

    this.typewriterTimeline.to(textObj, {
      duration: fullText.length * 0.03, // 30ms per character
      ease: 'none',
      onUpdate: () => {
        const currentLength = Math.floor(
          (textObj.value.length / fullText.length) * fullText.length
        );
        this.textContainer!.text = fullText.substring(0, currentLength);
      },
      onComplete: () => {
        this.textContainer!.text = fullText;
        this.eventBus.emit('dialogue:complete');
      }
    });
  }

  /**
   * Create choice buttons
   * @param choices - Array of choices
   */
  private createChoices(choices: DialogueChoice[]): void {
    if (!this.app || !this.dialogueContainer) return;

    // Remove previous choices
    while (this.dialogueContainer.children.length > 3) {
      const child = this.dialogueContainer.children[this.dialogueContainer.children.length - 1];
      this.dialogueContainer.removeChild(child);
      child.destroy();
    }

    const boxWidth = 1000;
    const boxHeight = 200;
    const boxX = (this.app.screen.width - boxWidth) / 2;
    const boxY = this.app.screen.height - boxHeight - 50;

    let choiceY = boxY + 130;

    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];

      // Check condition
      if (choice.condition && !choice.condition()) {
        continue;
      }

      const choiceButton = this.createChoiceButton(
        choice.text,
        boxX + 20 + (i % 2) * 490,
        choiceY + Math.floor(i / 2) * 40
      );

      choiceButton.on('pointerdown', () => {
        this.handleChoiceSelection(choice);
      });

      this.dialogueContainer.addChild(choiceButton);
    }
  }

  /**
   * Create choice button
   * @param text - Button text
   * @param x - X position
   * @param y - Y position
   * @returns Button container
   */
  private createChoiceButton(text: string, x: number, y: number): PIXI.Container {
    const button = new PIXI.Container();
    button.x = x;
    button.y = y;
    button.eventMode = 'static';
    button.cursor = 'pointer';

    // Button background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 460, 35, 5);
    bg.fill({ color: 0x2a2a4a });
    bg.stroke({ width: 2, color: 0x4a4a6a });
    button.addChild(bg);

    // Button text
    const buttonText = new PIXI.Text({
      text,
      style: {
        fontSize: 18,
        fill: 0xffffff,
        fontFamily: 'Arial'
      }
    });
    buttonText.x = 10;
    buttonText.y = 8;
    button.addChild(buttonText);

    // Hover effect
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, 460, 35, 5);
      bg.fill({ color: 0x3a3a5a });
      bg.stroke({ width: 2, color: 0x5a5a7a });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, 460, 35, 5);
      bg.fill({ color: 0x2a2a4a });
      bg.stroke({ width: 2, color: 0x4a4a6a });
    });

    return button;
  }

  /**
   * Handle choice selection
   * @param choice - Selected choice
   */
  private handleChoiceSelection(choice: DialogueChoice): void {
    this.eventBus.emit('dialogue:choice', {
      action: choice.action,
      text: choice.text,
      dialogueId: this.currentDialogue?.id
    });

    this.hideDialogue();
  }

  /**
   * Hide dialogue
   */
  hideDialogue(): void {
    if (!this.dialogueContainer) return;

    // Kill typewriter timeline
    if (this.typewriterTimeline) {
      this.typewriterTimeline.kill();
      this.typewriterTimeline = null;
    }

    // Animate exit
    gsap.to(this.dialogueContainer, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        if (this.dialogueContainer) {
          this.dialogueContainer.visible = false;
        }
        this.isActive = false;
        this.currentDialogue = null;
        this.eventBus.emit('dialogue:hide');
      }
    });
  }

  /**
   * Check if dialogue is active
   */
  isDialogueActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current dialogue
   */
  getCurrentDialogue(): DialogueData | null {
    return this.currentDialogue;
  }

  /**
   * Skip typewriter effect (show full text immediately)
   */
  skipTypewriter(): void {
    if (this.typewriterTimeline) {
      this.typewriterTimeline.progress(1);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.typewriterTimeline) {
      this.typewriterTimeline.kill();
    }

    if (this.dialogueContainer) {
      this.dialogueContainer.destroy({ children: true });
      this.dialogueContainer = null;
    }

    this.textContainer = null;
    this.isActive = false;
    this.currentDialogue = null;
    
    // Save dialogue state before cleanup
    this.saveDialogueState();
  }

  /**
   * Run dialogue sequence (simple implementation without external dependencies)
   * @param dialogues - Array of dialogue messages
   * @param npcName - Name of the NPC
   * @returns Promise that resolves when dialogue is complete
   */
  async runDialogueSequence(dialogues: string[], npcName: string = 'NPC'): Promise<void> {
    for (const text of dialogues) {
      await this.showDialogueAsync(text, npcName);
    }
  }

  /**
   * Show dialogue and wait for completion
   * @param text - Dialogue text
   * @param npcName - NPC name
   * @returns Promise that resolves when dialogue ends
   */
  private showDialogueAsync(text: string, npcName?: string): Promise<void> {
    return new Promise((resolve) => {
      const dialogueData: DialogueData = {
        text,
        npcName,
        autoClose: false
      };

      this.showDialogue(dialogueData);

      // Wait for player to continue (space/click or auto-close)
      const continueHandler = () => {
        this.eventBus.off('dialogue:hide', continueHandler);
        resolve();
      };

      this.eventBus.on('dialogue:hide', continueHandler);
    });
  }

  /**
   * Load dialogue state from localStorage
   */
  private loadDialogueState(): void {
    try {
      const saved = localStorage.getItem('dialogue_state');
      if (saved) {
        const data = JSON.parse(saved);
        this.dialogueState = new Map(Object.entries(data.variables || {}));
        this.visitedDialogues = new Set(data.visitedDialogues || []);
      }
    } catch (error) {
      console.error('Failed to load dialogue state:', error);
    }
  }

  /**
   * Save dialogue state to localStorage
   */
  private saveDialogueState(): void {
    try {
      const data = {
        variables: Object.fromEntries(this.dialogueState),
        visitedDialogues: Array.from(this.visitedDialogues)
      };
      localStorage.setItem('dialogue_state', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save dialogue state:', error);
    }
  }

  /**
   * Check if dialogue has been visited
   */
  hasVisitedDialogue(dialogueId: string): boolean {
    return this.visitedDialogues.has(dialogueId);
  }

  /**
   * Get dialogue variable
   */
  getVariable(name: string): any {
    return this.dialogueState.get(name);
  }

  /**
   * Set dialogue variable
   */
  setVariable(name: string, value: any): void {
    this.dialogueState.set(name, value);
    this.saveDialogueState();
  }
}
