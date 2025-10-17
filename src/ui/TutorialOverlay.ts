/**
 * TutorialOverlay - Multi-step tutorial system
 * 
 * Guides new players through game mechanics with
 * step-by-step instructions.
 * 
 * @example
 * ```typescript
 * const tutorial = new TutorialOverlay();
 * scene.addChild(tutorial);
 * tutorial.on('tutorial-complete', () => {
 *   // Tutorial finished
 * });
 * ```
 */
import * as PIXI from 'pixi.js';

interface TutorialStep {
  text: string;
  position: { x: number; y: number };
}

export class TutorialOverlay extends PIXI.Container {
  private steps: TutorialStep[] = [
    {
      text: 'Chào mừng đến Thần Thú Văn Lang!\n\nSử dụng WASD hoặc phím mũi tên để di chuyển.',
      position: { x: 480, y: 500 }
    },
    {
      text: 'Đi vào vùng có màu sắc khác nhau\nđể gặp Thần Thú hoang dã của các hệ khác nhau!',
      position: { x: 480, y: 500 }
    },
    {
      text: 'Trong trận chiến, chọn hành động\nđể tấn công hoặc thu phục Thần Thú!',
      position: { x: 480, y: 100 }
    },
    {
      text: 'Thu thập tất cả 207 Thần Thú\nvà trở thành bậc thầy Văn Lang!',
      position: { x: 480, y: 320 }
    }
  ];
  
  private currentStep = 0;
  private messageBox!: PIXI.Graphics;
  private messageText!: PIXI.Text;
  private nextButton!: PIXI.Text;
  private overlay!: PIXI.Graphics;
  
  constructor() {
    super();
    this.createUI();
    this.showStep(0);
  }
  
  private createUI(): void {
    // Semi-transparent overlay
    this.overlay = new PIXI.Graphics();
    this.overlay.beginFill(0x000000, 0.6);
    this.overlay.drawRect(0, 0, 960, 640);
    this.overlay.endFill();
    this.addChild(this.overlay);
    
    // Message box
    this.messageBox = new PIXI.Graphics();
    this.messageBox.beginFill(0x222222, 0.95);
    this.messageBox.lineStyle(3, 0xFFD700);
    this.messageBox.drawRoundedRect(0, 0, 600, 180, 20);
    this.messageBox.endFill();
    this.addChild(this.messageBox);
    
    // Text
    this.messageText = new PIXI.Text('', {
      fontSize: 18,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 560,
      align: 'center',
      lineHeight: 28
    });
    this.messageText.anchor.set(0.5);
    this.messageText.position.set(300, 70);
    this.messageBox.addChild(this.messageText);
    
    // Next button
    this.nextButton = new PIXI.Text('Tiếp theo →', {
      fontSize: 16,
      fill: 0x4CAF50,
      fontWeight: 'bold'
    });
    this.nextButton.position.set(470, 140);
    this.nextButton.interactive = true;
    this.nextButton.cursor = 'pointer';
    this.nextButton.on('pointerdown', () => this.next());
    this.messageBox.addChild(this.nextButton);
    
    // Skip button
    const skipButton = new PIXI.Text('Bỏ qua', {
      fontSize: 14,
      fill: 0x888888
    });
    skipButton.position.set(40, 145);
    skipButton.interactive = true;
    skipButton.cursor = 'pointer';
    skipButton.on('pointerdown', () => this.skip());
    this.messageBox.addChild(skipButton);
    
    // Step indicator
    const stepIndicator = new PIXI.Text('', {
      fontSize: 12,
      fill: 0xAAAAAA
    });
    stepIndicator.position.set(270, 145);
    stepIndicator.anchor.set(0.5, 0);
    (stepIndicator as any).name = 'step-indicator';
    this.messageBox.addChild(stepIndicator);
  }
  
  private showStep(index: number): void {
    if (index >= this.steps.length) {
      this.complete();
      return;
    }
    
    const step = this.steps[index];
    this.messageText.text = step.text;
    this.messageBox.position.set(step.position.x - 300, step.position.y - 90);
    
    // Update step indicator
    const indicator = this.messageBox.children.find(
      c => (c as any).name === 'step-indicator'
    ) as PIXI.Text;
    if (indicator) {
      indicator.text = `${index + 1} / ${this.steps.length}`;
    }
    
    // Update next button text
    if (index === this.steps.length - 1) {
      this.nextButton.text = 'Hoàn thành ✓';
    }
  }
  
  private next(): void {
    this.currentStep++;
    this.showStep(this.currentStep);
  }
  
  private skip(): void {
    this.complete();
  }
  
  private complete(): void {
    localStorage.setItem('tutorialComplete', 'true');
    this.emit('tutorial-complete');
    this.destroy();
  }
  
  /**
   * Check if tutorial has been completed
   */
  static isComplete(): boolean {
    return localStorage.getItem('tutorialComplete') === 'true';
  }
  
  /**
   * Reset tutorial completion
   */
  static reset(): void {
    localStorage.removeItem('tutorialComplete');
  }
  
  destroy(): void {
    this.removeAllListeners();
    super.destroy();
  }
}
