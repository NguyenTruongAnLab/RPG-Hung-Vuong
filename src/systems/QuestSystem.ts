/**
 * QuestSystem - Quest and task management
 * 
 * Handles quest tracking, completion, and rewards.
 * Supports main quests, side quests, and daily quests.
 * 
 * @example
 * ```typescript
 * const quests = QuestSystem.getInstance();
 * 
 * // Define quest
 * quests.addQuest({
 *   id: 'quest_001',
 *   title: 'Tìm Thần Thú Đầu Tiên',
 *   description: 'Bắt Thần Thú đầu tiên của bạn',
 *   objectives: [
 *     { id: 'catch_first', description: 'Bắt 1 Thần Thú', target: 1, current: 0 }
 *   ],
 *   rewards: { exp: 100, items: ['potion'] }
 * });
 * 
 * // Update progress
 * quests.updateObjective('quest_001', 'catch_first', 1);
 * ```
 */
import { EventBus } from '../core/EventBus';

/**
 * Quest status
 */
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';

/**
 * Quest type
 */
export type QuestType = 'main' | 'side' | 'daily' | 'tutorial';

/**
 * Quest objective
 */
export interface QuestObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  completed?: boolean;
}

/**
 * Quest rewards
 */
export interface QuestRewards {
  exp?: number;
  gold?: number;
  items?: string[];
  monsters?: string[];
}

/**
 * Quest data interface
 */
export interface QuestData {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  requiredLevel?: number;
  prerequisiteQuests?: string[];
  giver?: string;
  location?: string;
  timeLimit?: number;
  startTime?: number;
}

/**
 * QuestSystem singleton class
 */
export class QuestSystem {
  private static instance: QuestSystem;
  private eventBus: EventBus;
  private quests: Map<string, QuestData> = new Map();
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): QuestSystem {
    if (!QuestSystem.instance) {
      QuestSystem.instance = new QuestSystem();
    }
    return QuestSystem.instance;
  }

  /**
   * Add quest to system
   * @param quest - Quest data
   */
  addQuest(quest: QuestData): void {
    if (this.quests.has(quest.id)) {
      console.warn(`Quest ${quest.id} already exists`);
      return;
    }

    this.quests.set(quest.id, quest);
    this.eventBus.emit('quest:added', quest);
  }

  /**
   * Start quest
   * @param questId - Quest ID
   * @returns Success status
   */
  startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) {
      console.warn(`Quest ${questId} not found`);
      return false;
    }

    // Check if already active or completed
    if (quest.status === 'active') {
      console.warn(`Quest ${questId} already active`);
      return false;
    }

    if (quest.status === 'completed') {
      console.warn(`Quest ${questId} already completed`);
      return false;
    }

    // Check prerequisites
    if (quest.prerequisiteQuests) {
      for (const prereqId of quest.prerequisiteQuests) {
        if (!this.completedQuests.has(prereqId)) {
          console.warn(`Quest ${questId} requires ${prereqId} to be completed`);
          return false;
        }
      }
    }

    // Start quest
    quest.status = 'active';
    quest.startTime = Date.now();
    this.activeQuests.add(questId);

    this.eventBus.emit('quest:started', quest);
    return true;
  }

  /**
   * Update quest objective progress
   * @param questId - Quest ID
   * @param objectiveId - Objective ID
   * @param progress - Progress amount to add
   */
  updateObjective(questId: string, objectiveId: string, progress: number = 1): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') {
      return;
    }

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      console.warn(`Objective ${objectiveId} not found in quest ${questId}`);
      return;
    }

    // Update progress
    objective.current = Math.min(objective.current + progress, objective.target);
    
    // Check if objective completed
    if (objective.current >= objective.target) {
      objective.completed = true;
      this.eventBus.emit('quest:objective-complete', {
        questId,
        objectiveId,
        objective
      });
    }

    // Check if all objectives completed
    if (this.areAllObjectivesComplete(quest)) {
      this.completeQuest(questId);
    }

    this.eventBus.emit('quest:progress', {
      questId,
      objectiveId,
      progress: objective.current,
      target: objective.target
    });
  }

  /**
   * Check if all objectives are complete
   * @param quest - Quest to check
   * @returns True if all complete
   */
  private areAllObjectivesComplete(quest: QuestData): boolean {
    return quest.objectives.every(obj => obj.current >= obj.target);
  }

  /**
   * Complete quest
   * @param questId - Quest ID
   */
  completeQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) {
      return;
    }

    quest.status = 'completed';
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);

    this.eventBus.emit('quest:completed', {
      questId,
      quest,
      rewards: quest.rewards
    });
  }

  /**
   * Fail quest
   * @param questId - Quest ID
   */
  failQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) {
      return;
    }

    quest.status = 'failed';
    this.activeQuests.delete(questId);

    this.eventBus.emit('quest:failed', {
      questId,
      quest
    });
  }

  /**
   * Get quest by ID
   * @param questId - Quest ID
   * @returns Quest data or undefined
   */
  getQuest(questId: string): QuestData | undefined {
    return this.quests.get(questId);
  }

  /**
   * Get all active quests
   * @returns Array of active quests
   */
  getActiveQuests(): QuestData[] {
    return Array.from(this.activeQuests)
      .map(id => this.quests.get(id))
      .filter((quest): quest is QuestData => quest !== undefined);
  }

  /**
   * Get all completed quests
   * @returns Array of completed quests
   */
  getCompletedQuests(): QuestData[] {
    return Array.from(this.completedQuests)
      .map(id => this.quests.get(id))
      .filter((quest): quest is QuestData => quest !== undefined);
  }

  /**
   * Get available quests
   * @returns Array of available quests
   */
  getAvailableQuests(): QuestData[] {
    const available: QuestData[] = [];
    
    for (const quest of this.quests.values()) {
      if (quest.status === 'available') {
        // Check prerequisites
        if (quest.prerequisiteQuests) {
          const prereqsMet = quest.prerequisiteQuests.every(
            prereqId => this.completedQuests.has(prereqId)
          );
          if (!prereqsMet) continue;
        }
        
        available.push(quest);
      }
    }
    
    return available;
  }

  /**
   * Get quests by type
   * @param type - Quest type
   * @returns Array of quests
   */
  getQuestsByType(type: QuestType): QuestData[] {
    return Array.from(this.quests.values()).filter(quest => quest.type === type);
  }

  /**
   * Check if quest is completed
   * @param questId - Quest ID
   * @returns True if completed
   */
  isQuestCompleted(questId: string): boolean {
    return this.completedQuests.has(questId);
  }

  /**
   * Check if quest is active
   * @param questId - Quest ID
   * @returns True if active
   */
  isQuestActive(questId: string): boolean {
    return this.activeQuests.has(questId);
  }

  /**
   * Update time-limited quests
   */
  updateTimeLimits(): void {
    const now = Date.now();
    
    for (const questId of this.activeQuests) {
      const quest = this.quests.get(questId);
      if (!quest || !quest.timeLimit || !quest.startTime) {
        continue;
      }
      
      const elapsed = now - quest.startTime;
      if (elapsed >= quest.timeLimit) {
        this.failQuest(questId);
      }
    }
  }

  /**
   * Get quest progress percentage
   * @param questId - Quest ID
   * @returns Progress percentage (0-100)
   */
  getQuestProgress(questId: string): number {
    const quest = this.quests.get(questId);
    if (!quest) return 0;

    if (quest.objectives.length === 0) return 0;

    let totalProgress = 0;
    for (const objective of quest.objectives) {
      totalProgress += Math.min(objective.current / objective.target, 1);
    }

    return (totalProgress / quest.objectives.length) * 100;
  }

  /**
   * Reset quest (for repeatable quests)
   * @param questId - Quest ID
   */
  resetQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) return;

    quest.status = 'available';
    quest.startTime = undefined;

    // Reset all objectives
    for (const objective of quest.objectives) {
      objective.current = 0;
      objective.completed = false;
    }

    this.activeQuests.delete(questId);
    this.completedQuests.delete(questId);

    this.eventBus.emit('quest:reset', quest);
  }

  /**
   * Load quest data from save
   * @param saveData - Save data object
   */
  loadFromSave(saveData: {
    activeQuests: string[];
    completedQuests: string[];
    questStates: Record<string, QuestData>;
  }): void {
    this.activeQuests = new Set(saveData.activeQuests);
    this.completedQuests = new Set(saveData.completedQuests);
    
    for (const [id, questData] of Object.entries(saveData.questStates)) {
      this.quests.set(id, questData);
    }
  }

  /**
   * Export quest data for saving
   * @returns Save data object
   */
  exportForSave(): {
    activeQuests: string[];
    completedQuests: string[];
    questStates: Record<string, QuestData>;
  } {
    const questStates: Record<string, QuestData> = {};
    for (const [id, quest] of this.quests.entries()) {
      questStates[id] = quest;
    }

    return {
      activeQuests: Array.from(this.activeQuests),
      completedQuests: Array.from(this.completedQuests),
      questStates
    };
  }

  /**
   * Clear all quests
   */
  clearAll(): void {
    this.quests.clear();
    this.activeQuests.clear();
    this.completedQuests.clear();
  }

  /**
   * Get quest statistics
   * @returns Quest stats
   */
  getStats(): {
    total: number;
    active: number;
    completed: number;
    available: number;
  } {
    return {
      total: this.quests.size,
      active: this.activeQuests.size,
      completed: this.completedQuests.size,
      available: this.getAvailableQuests().length
    };
  }
}
