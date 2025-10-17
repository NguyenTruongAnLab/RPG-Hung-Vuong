/**
 * QuestLog - Quest tracking UI
 * 
 * Displays active and completed quests with progress tracking.
 * Supports filtering, sorting, and detailed quest information.
 * 
 * @example
 * ```typescript
 * const questLog = new QuestLog(400, 500);
 * questLog.updateQuests(questSystem.getActiveQuests());
 * stage.addChild(questLog.getContainer());
 * ```
 */
import * as PIXI from 'pixi.js';
import { QuestData, QuestType } from '../systems/QuestSystem';

/**
 * QuestLog UI class
 */
export class QuestLog {
  private container: PIXI.Container;
  private background: PIXI.Graphics;
  private contentContainer: PIXI.Container;
  private questItems: Map<string, PIXI.Container> = new Map();
  
  private width: number;
  private height: number;
  private visible: boolean = false;
  private currentFilter: QuestType | 'all' = 'all';

  /**
   * Create quest log UI
   * @param width - UI width
   * @param height - UI height
   */
  constructor(width: number = 400, height: number = 500) {
    this.width = width;
    this.height = height;

    // Main container
    this.container = new PIXI.Container();
    this.container.x = 100;
    this.container.y = 100;
    this.container.visible = false;
    this.container.zIndex = 900;

    // Background
    this.background = new PIXI.Graphics();
    this.background.roundRect(0, 0, width, height, 10);
    this.background.fill({ color: 0x1a1a2e, alpha: 0.95 });
    this.background.stroke({ width: 3, color: 0x4a4a6a });
    this.container.addChild(this.background);

    // Title
    const title = new PIXI.Text({
      text: 'Nhiệm Vụ (Quest Log)',
      style: {
        fontSize: 24,
        fill: 0xffd700,
        fontWeight: 'bold',
        fontFamily: 'Arial'
      }
    });
    title.x = 15;
    title.y = 15;
    this.container.addChild(title);

    // Close button
    const closeBtn = this.createCloseButton();
    closeBtn.x = width - 40;
    closeBtn.y = 15;
    this.container.addChild(closeBtn);

    // Filter tabs
    this.createFilterTabs();

    // Content container (scrollable area)
    this.contentContainer = new PIXI.Container();
    this.contentContainer.y = 80;
    this.container.addChild(this.contentContainer);

    // Scroll mask
    const scrollMask = new PIXI.Graphics();
    scrollMask.rect(10, 80, width - 20, height - 90);
    scrollMask.fill({ color: 0xffffff });
    this.container.addChild(scrollMask);
    this.contentContainer.mask = scrollMask;
  }

  /**
   * Create close button
   */
  private createCloseButton(): PIXI.Container {
    const btn = new PIXI.Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new PIXI.Graphics();
    bg.circle(0, 0, 15);
    bg.fill({ color: 0xff4444 });
    bg.stroke({ width: 2, color: 0xffffff });
    btn.addChild(bg);

    const x = new PIXI.Text({
      text: 'X',
      style: {
        fontSize: 16,
        fill: 0xffffff,
        fontWeight: 'bold',
        fontFamily: 'Arial'
      }
    });
    x.anchor.set(0.5);
    btn.addChild(x);

    btn.on('pointerdown', () => {
      this.hide();
    });

    return btn;
  }

  /**
   * Create filter tabs
   */
  private createFilterTabs(): void {
    const filters: Array<{ label: string; type: QuestType | 'all' }> = [
      { label: 'Tất Cả', type: 'all' },
      { label: 'Chính', type: 'main' },
      { label: 'Phụ', type: 'side' },
      { label: 'Hằng Ngày', type: 'daily' }
    ];

    let x = 15;
    for (const filter of filters) {
      const tab = this.createFilterTab(filter.label, filter.type);
      tab.x = x;
      tab.y = 50;
      this.container.addChild(tab);
      x += 95;
    }
  }

  /**
   * Create filter tab
   * @param label - Tab label
   * @param type - Quest type
   */
  private createFilterTab(label: string, type: QuestType | 'all'): PIXI.Container {
    const tab = new PIXI.Container();
    tab.eventMode = 'static';
    tab.cursor = 'pointer';

    const bg = new PIXI.Graphics();
    const isActive = this.currentFilter === type;
    bg.roundRect(0, 0, 90, 25, 5);
    bg.fill({ color: isActive ? 0x3a3a5a : 0x2a2a4a });
    bg.stroke({ width: 2, color: 0x4a4a6a });
    tab.addChild(bg);

    const text = new PIXI.Text({
      text: label,
      style: {
        fontSize: 14,
        fill: isActive ? 0xffd700 : 0xffffff,
        fontFamily: 'Arial'
      }
    });
    text.x = 10;
    text.y = 5;
    tab.addChild(text);

    tab.on('pointerdown', () => {
      this.setFilter(type);
    });

    return tab;
  }

  /**
   * Set quest filter
   * @param type - Quest type filter
   */
  setFilter(type: QuestType | 'all'): void {
    this.currentFilter = type;
    this.createFilterTabs(); // Rebuild tabs with new active state
    // Trigger refresh if needed
  }

  /**
   * Update quests display
   * @param quests - Array of quests to display
   */
  updateQuests(quests: QuestData[]): void {
    // Clear existing items
    this.clearQuestItems();

    // Filter quests
    let filteredQuests = quests;
    if (this.currentFilter !== 'all') {
      filteredQuests = quests.filter(q => q.type === this.currentFilter);
    }

    // Sort quests (active first, then by type)
    filteredQuests.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return 0;
    });

    // Create quest items
    let y = 10;
    for (const quest of filteredQuests) {
      const item = this.createQuestItem(quest);
      item.y = y;
      this.contentContainer.addChild(item);
      this.questItems.set(quest.id, item);
      y += item.height + 10;
    }
  }

  /**
   * Create quest item UI
   * @param quest - Quest data
   */
  private createQuestItem(quest: QuestData): PIXI.Container {
    const item = new PIXI.Container();
    const itemWidth = this.width - 40;

    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(10, 0, itemWidth, 100, 8);
    bg.fill({ color: 0x2a2a4a, alpha: 0.8 });
    bg.stroke({ width: 1, color: 0x4a4a6a });
    item.addChild(bg);

    // Quest title
    const title = new PIXI.Text({
      text: quest.title,
      style: {
        fontSize: 16,
        fill: quest.status === 'active' ? 0xffd700 : 0xaaaaaa,
        fontWeight: 'bold',
        fontFamily: 'Arial',
        wordWrap: true,
        wordWrapWidth: itemWidth - 80
      }
    });
    title.x = 20;
    title.y = 10;
    item.addChild(title);

    // Quest type badge
    const typeBadge = this.createTypeBadge(quest.type);
    typeBadge.x = itemWidth - 60;
    typeBadge.y = 10;
    item.addChild(typeBadge);

    // Progress text
    const progressText = this.getProgressText(quest);
    const progress = new PIXI.Text({
      text: progressText,
      style: {
        fontSize: 14,
        fill: 0xcccccc,
        fontFamily: 'Arial'
      }
    });
    progress.x = 20;
    progress.y = 35;
    item.addChild(progress);

    // Progress bar
    if (quest.status === 'active') {
      const progressBar = this.createProgressBar(quest);
      progressBar.x = 20;
      progressBar.y = 60;
      item.addChild(progressBar);
    }

    // Status indicator
    const statusColor = this.getStatusColor(quest.status);
    const statusDot = new PIXI.Graphics();
    statusDot.circle(15, 15, 5);
    statusDot.fill({ color: statusColor });
    item.addChild(statusDot);

    return item;
  }

  /**
   * Create type badge
   * @param type - Quest type
   */
  private createTypeBadge(type: QuestType): PIXI.Container {
    const badge = new PIXI.Container();

    const colors: Record<QuestType, number> = {
      main: 0xff4444,
      side: 0x4444ff,
      daily: 0x44ff44,
      tutorial: 0xffaa00
    };

    const labels: Record<QuestType, string> = {
      main: 'Chính',
      side: 'Phụ',
      daily: 'Ngày',
      tutorial: 'HD'
    };

    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 50, 20, 5);
    bg.fill({ color: colors[type] });
    badge.addChild(bg);

    const text = new PIXI.Text({
      text: labels[type],
      style: {
        fontSize: 12,
        fill: 0xffffff,
        fontFamily: 'Arial'
      }
    });
    text.x = 5;
    text.y = 3;
    badge.addChild(text);

    return badge;
  }

  /**
   * Get progress text
   * @param quest - Quest data
   */
  private getProgressText(quest: QuestData): string {
    if (quest.objectives.length === 0) return 'Không có mục tiêu';

    const completed = quest.objectives.filter(obj => obj.completed).length;
    return `${completed}/${quest.objectives.length} mục tiêu hoàn thành`;
  }

  /**
   * Create progress bar
   * @param quest - Quest data
   */
  private createProgressBar(quest: QuestData): PIXI.Container {
    const container = new PIXI.Container();
    const barWidth = this.width - 60;
    const barHeight = 10;

    // Background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, barWidth, barHeight);
    bg.fill({ color: 0x333333 });
    container.addChild(bg);

    // Progress
    let totalProgress = 0;
    for (const obj of quest.objectives) {
      totalProgress += Math.min(obj.current / obj.target, 1);
    }
    const percentage = (totalProgress / quest.objectives.length) * 100;

    const progress = new PIXI.Graphics();
    progress.rect(0, 0, (barWidth * percentage) / 100, barHeight);
    progress.fill({ color: 0x44ff44 });
    container.addChild(progress);

    return container;
  }

  /**
   * Get status color
   * @param status - Quest status
   */
  private getStatusColor(status: string): number {
    const colors: Record<string, number> = {
      available: 0xffaa00,
      active: 0x00ff00,
      completed: 0x4444ff,
      failed: 0xff4444
    };
    return colors[status] || 0xffffff;
  }

  /**
   * Clear quest items
   */
  private clearQuestItems(): void {
    for (const item of this.questItems.values()) {
      this.contentContainer.removeChild(item);
      item.destroy({ children: true });
    }
    this.questItems.clear();
  }

  /**
   * Show quest log
   */
  show(): void {
    this.visible = true;
    this.container.visible = true;
  }

  /**
   * Hide quest log
   */
  hide(): void {
    this.visible = false;
    this.container.visible = false;
  }

  /**
   * Toggle visibility
   */
  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Get container
   */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Set position
   * @param x - X position
   * @param y - Y position
   */
  setPosition(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearQuestItems();
    this.container.destroy({ children: true });
  }
}
