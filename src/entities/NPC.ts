/**
 * NPC - Non-Player Character
 * 
 * Simple NPC entity with position, visual representation, and interaction.
 * Can display dialogue bubbles and emote icons.
 * 
 * @example
 * ```typescript
 * const npc = new NPC(100, 100, 'Elder', 'Tộc Trưởng');
 * npc.setDialogue(['Chào mừng!', 'Đây là Văn Lang.']);
 * ```
 */
import * as PIXI from 'pixi.js';

export interface NPCData {
  id: string;
  name: string;
  x: number;
  y: number;
  dialogues: string[];
  color?: number;
}

export type EmoteType = 'happy' | 'question' | 'exclamation' | 'anger' | 'sleep';

export class NPC {
  private id: string;
  private name: string;
  private x: number;
  private y: number;
  private dialogues: string[];
  private container: PIXI.Container;
  private sprite: PIXI.Graphics;
  private dialogueBubble: PIXI.Container | null = null;
  private emoteIcon: PIXI.Graphics | null = null;

  constructor(id: string, name: string, x: number, y: number, dialogues: string[] = [], color: number = 0xffaa00) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.dialogues = dialogues;

    // Create container
    this.container = new PIXI.Container();
    this.container.position.set(x, y);

    // Create visual representation (simple circle for now)
    this.sprite = new PIXI.Graphics();
    this.sprite.circle(0, 0, 12);
    this.sprite.fill({ color });
    this.container.addChild(this.sprite);

    // Make interactive
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
  }

  /**
   * Get NPC ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get NPC name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get container for adding to scene
   */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Set dialogues
   */
  setDialogues(dialogues: string[]): void {
    this.dialogues = dialogues;
  }

  /**
   * Get dialogues
   */
  getDialogues(): string[] {
    return this.dialogues;
  }

  /**
   * Show dialogue bubble above NPC
   */
  showDialogueBubble(text: string): void {
    // Remove existing bubble
    this.hideDialogueBubble();

    // Create bubble container
    this.dialogueBubble = new PIXI.Container();
    this.dialogueBubble.position.set(0, -40);

    // Create bubble background
    const bubble = new PIXI.Graphics();
    const padding = 8;
    const bubbleWidth = Math.min(text.length * 8 + padding * 2, 200);
    const bubbleHeight = 30;

    bubble.roundRect(-bubbleWidth / 2, 0, bubbleWidth, bubbleHeight, 8);
    bubble.fill({ color: 0xffffff, alpha: 0.9 });
    bubble.stroke({ color: 0x333333, width: 2 });

    this.dialogueBubble.addChild(bubble);

    // Create text
    const bubbleText = new PIXI.Text({
      text: text.length > 25 ? text.substring(0, 22) + '...' : text,
      style: {
        fontSize: 12,
        fill: 0x333333,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: bubbleWidth - padding * 2
      }
    });
    bubbleText.anchor.set(0.5, 0);
    bubbleText.position.set(0, padding);

    this.dialogueBubble.addChild(bubbleText);

    // Add to container
    this.container.addChild(this.dialogueBubble);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.hideDialogueBubble();
    }, 3000);
  }

  /**
   * Hide dialogue bubble
   */
  hideDialogueBubble(): void {
    if (this.dialogueBubble) {
      this.container.removeChild(this.dialogueBubble);
      this.dialogueBubble.destroy();
      this.dialogueBubble = null;
    }
  }

  /**
   * Show emote icon above NPC
   */
  showEmote(emote: EmoteType): void {
    // Remove existing emote
    this.hideEmote();

    // Create emote icon
    this.emoteIcon = new PIXI.Graphics();
    this.emoteIcon.position.set(0, -30);

    switch (emote) {
      case 'happy':
        // Smiley face
        this.emoteIcon.circle(0, 0, 10);
        this.emoteIcon.fill({ color: 0xffff00 });
        this.emoteIcon.circle(-3, -2, 2);
        this.emoteIcon.fill({ color: 0x000000 });
        this.emoteIcon.circle(3, -2, 2);
        this.emoteIcon.fill({ color: 0x000000 });
        this.emoteIcon.arc(0, 2, 5, 0, Math.PI);
        this.emoteIcon.stroke({ color: 0x000000, width: 1 });
        break;

      case 'question':
        // Question mark
        this.emoteIcon.circle(0, 0, 10);
        this.emoteIcon.fill({ color: 0xaaaaff });
        // Simple ? representation
        this.emoteIcon.rect(-2, -5, 4, 6);
        this.emoteIcon.fill({ color: 0x000000 });
        this.emoteIcon.rect(-1, 3, 2, 2);
        this.emoteIcon.fill({ color: 0x000000 });
        break;

      case 'exclamation':
        // Exclamation mark
        this.emoteIcon.circle(0, 0, 10);
        this.emoteIcon.fill({ color: 0xff0000 });
        this.emoteIcon.rect(-1, -5, 2, 6);
        this.emoteIcon.fill({ color: 0xffffff });
        this.emoteIcon.rect(-1, 3, 2, 2);
        this.emoteIcon.fill({ color: 0xffffff });
        break;

      case 'anger':
        // Anger symbol
        this.emoteIcon.circle(0, 0, 10);
        this.emoteIcon.fill({ color: 0xff0000 });
        // Cross shape
        this.emoteIcon.rect(-4, -1, 8, 2);
        this.emoteIcon.fill({ color: 0xffffff });
        this.emoteIcon.rect(-1, -4, 2, 8);
        this.emoteIcon.fill({ color: 0xffffff });
        break;

      case 'sleep':
        // Zzz
        this.emoteIcon.circle(0, 0, 10);
        this.emoteIcon.fill({ color: 0xccccff });
        // Simple Z representation
        this.emoteIcon.rect(-3, -4, 6, 2);
        this.emoteIcon.fill({ color: 0x000000 });
        this.emoteIcon.rect(-3, 2, 6, 2);
        this.emoteIcon.fill({ color: 0x000000 });
        break;
    }

    this.container.addChild(this.emoteIcon);

    // Auto-hide after 2 seconds
    setTimeout(() => {
      this.hideEmote();
    }, 2000);
  }

  /**
   * Hide emote icon
   */
  hideEmote(): void {
    if (this.emoteIcon) {
      this.container.removeChild(this.emoteIcon);
      this.emoteIcon.destroy();
      this.emoteIcon = null;
    }
  }

  /**
   * Check if player is in interaction range
   */
  inInteractionRange(playerPos: { x: number; y: number }, range: number = 50): boolean {
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= range;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.hideDialogueBubble();
    this.hideEmote();
    this.container.destroy({ children: true });
  }
}
