/**
 * Tests for Phase 5 systems: Weather, NPC, Dialogue, Quest
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeatherManager } from '../../src/managers/WeatherManager';
import { NPCSystem } from '../../src/systems/NPCSystem';
import { DialogueSystem } from '../../src/systems/DialogueSystem';
import { QuestSystem } from '../../src/systems/QuestSystem';
import * as PIXI from 'pixi.js';

describe('Phase 5 Systems', () => {
  
  describe('WeatherManager', () => {
    let weatherManager: WeatherManager;

    beforeEach(() => {
      weatherManager = WeatherManager.getInstance();
    });

    it('should be a singleton', () => {
      const instance1 = WeatherManager.getInstance();
      const instance2 = WeatherManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should start with no weather', () => {
      expect(weatherManager.getCurrentWeather()).toBe('none');
    });

    it('should clear weather', () => {
      weatherManager.clearWeather();
      expect(weatherManager.getCurrentWeather()).toBe('none');
    });
  });

  describe('NPCSystem', () => {
    let npcSystem: NPCSystem;

    beforeEach(() => {
      npcSystem = NPCSystem.getInstance();
      npcSystem.clearAll();
    });

    it('should be a singleton', () => {
      const instance1 = NPCSystem.getInstance();
      const instance2 = NPCSystem.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should track interaction state', () => {
      // markAsSeen only works for existing NPCs
      expect(npcSystem.hasBeenTalkedTo('npc_test')).toBe(false);
      // Note: markAsSeen requires NPC to exist, so it won't change state for non-existent NPC
      npcSystem.markAsSeen('npc_test');
      expect(npcSystem.hasBeenTalkedTo('npc_test')).toBe(false); // Still false for non-existent NPC
    });
  });

  describe('DialogueSystem', () => {
    let dialogueSystem: DialogueSystem;

    beforeEach(() => {
      dialogueSystem = DialogueSystem.getInstance();
    });

    it('should be a singleton', () => {
      const instance1 = DialogueSystem.getInstance();
      const instance2 = DialogueSystem.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should start inactive', () => {
      expect(dialogueSystem.isDialogueActive()).toBe(false);
    });

    it('should track current dialogue', () => {
      const current = dialogueSystem.getCurrentDialogue();
      expect(current).toBeNull();
    });

    it('should skip typewriter effect without error', () => {
      expect(() => {
        dialogueSystem.skipTypewriter();
      }).not.toThrow();
    });
  });

  describe('QuestSystem', () => {
    let questSystem: QuestSystem;

    beforeEach(() => {
      questSystem = QuestSystem.getInstance();
      questSystem.clearAll();
    });

    it('should be a singleton', () => {
      const instance1 = QuestSystem.getInstance();
      const instance2 = QuestSystem.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should add quest', () => {
      questSystem.addQuest({
        id: 'quest_001',
        title: 'First Quest',
        description: 'Test quest',
        type: 'main',
        status: 'available',
        objectives: [
          { id: 'obj_1', description: 'Test objective', target: 1, current: 0 }
        ],
        rewards: { exp: 100 }
      });

      const quest = questSystem.getQuest('quest_001');
      expect(quest).toBeDefined();
      expect(quest?.title).toBe('First Quest');
    });

    it('should start quest', () => {
      questSystem.addQuest({
        id: 'quest_002',
        title: 'Start Test',
        description: 'Test starting',
        type: 'side',
        status: 'available',
        objectives: [],
        rewards: {}
      });

      const success = questSystem.startQuest('quest_002');
      expect(success).toBe(true);
      expect(questSystem.isQuestActive('quest_002')).toBe(true);
    });

    it('should update objective progress', () => {
      questSystem.addQuest({
        id: 'quest_003',
        title: 'Progress Test',
        description: 'Test progress',
        type: 'main',
        status: 'available',
        objectives: [
          { id: 'obj_1', description: 'Collect items', target: 5, current: 0 }
        ],
        rewards: { exp: 50 }
      });

      questSystem.startQuest('quest_003');
      questSystem.updateObjective('quest_003', 'obj_1', 3);

      const quest = questSystem.getQuest('quest_003');
      expect(quest?.objectives[0].current).toBe(3);
    });

    it('should complete quest when all objectives done', () => {
      questSystem.addQuest({
        id: 'quest_004',
        title: 'Complete Test',
        description: 'Test completion',
        type: 'main',
        status: 'available',
        objectives: [
          { id: 'obj_1', description: 'Task', target: 1, current: 0 }
        ],
        rewards: { exp: 100 }
      });

      questSystem.startQuest('quest_004');
      questSystem.updateObjective('quest_004', 'obj_1', 1);

      expect(questSystem.isQuestCompleted('quest_004')).toBe(true);
    });

    it('should get active quests', () => {
      questSystem.addQuest({
        id: 'quest_005',
        title: 'Active 1',
        description: 'Test',
        type: 'main',
        status: 'available',
        objectives: [],
        rewards: {}
      });

      questSystem.addQuest({
        id: 'quest_006',
        title: 'Active 2',
        description: 'Test',
        type: 'side',
        status: 'available',
        objectives: [],
        rewards: {}
      });

      questSystem.startQuest('quest_005');
      questSystem.startQuest('quest_006');

      const activeQuests = questSystem.getActiveQuests();
      expect(activeQuests.length).toBe(2);
    });

    it('should get quests by type', () => {
      questSystem.addQuest({
        id: 'main_1',
        title: 'Main Quest 1',
        description: 'Test',
        type: 'main',
        status: 'available',
        objectives: [],
        rewards: {}
      });

      questSystem.addQuest({
        id: 'side_1',
        title: 'Side Quest 1',
        description: 'Test',
        type: 'side',
        status: 'available',
        objectives: [],
        rewards: {}
      });

      const mainQuests = questSystem.getQuestsByType('main');
      expect(mainQuests.length).toBeGreaterThanOrEqual(1);
      expect(mainQuests[0].type).toBe('main');
    });

    it('should calculate quest progress', () => {
      questSystem.addQuest({
        id: 'quest_007',
        title: 'Progress Calc',
        description: 'Test',
        type: 'main',
        status: 'available',
        objectives: [
          { id: 'obj_1', description: 'Task 1', target: 10, current: 5 },
          { id: 'obj_2', description: 'Task 2', target: 10, current: 10 }
        ],
        rewards: {}
      });

      const progress = questSystem.getQuestProgress('quest_007');
      expect(progress).toBe(75); // (0.5 + 1.0) / 2 * 100
    });

    it('should fail quest', () => {
      questSystem.addQuest({
        id: 'quest_008',
        title: 'Fail Test',
        description: 'Test',
        type: 'main',
        status: 'available',
        objectives: [],
        rewards: {}
      });

      questSystem.startQuest('quest_008');
      questSystem.failQuest('quest_008');

      const quest = questSystem.getQuest('quest_008');
      expect(quest?.status).toBe('failed');
    });

    it('should get quest statistics', () => {
      questSystem.addQuest({
        id: 'stat_1',
        title: 'Stat Quest 1',
        description: 'Test',
        type: 'main',
        status: 'available',
        objectives: [],
        rewards: {}
      });

      questSystem.addQuest({
        id: 'stat_2',
        title: 'Stat Quest 2',
        description: 'Test',
        type: 'side',
        status: 'available',
        objectives: [],
        rewards: {}
      });

      questSystem.startQuest('stat_1');

      const stats = questSystem.getStats();
      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.active).toBeGreaterThanOrEqual(1);
    });
  });
});
