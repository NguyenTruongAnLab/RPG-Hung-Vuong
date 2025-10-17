/**
 * Phase 4 Systems Tests
 * 
 * Tests for the new showcase game systems
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioManager } from '../../src/core/AudioManager';
import { ProgressionSystem } from '../../src/systems/ProgressionSystem';
import { TutorialOverlay } from '../../src/ui/TutorialOverlay';

describe('Phase 4 Systems', () => {
  describe('AudioManager', () => {
    let audioManager: AudioManager;

    beforeEach(() => {
      audioManager = AudioManager.getInstance();
    });

    it('should be a singleton', () => {
      const instance1 = AudioManager.getInstance();
      const instance2 = AudioManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should track mute state', () => {
      expect(audioManager.isMutedState()).toBe(false);
      audioManager.toggleMute();
      expect(audioManager.isMutedState()).toBe(true);
      audioManager.toggleMute();
      expect(audioManager.isMutedState()).toBe(false);
    });
  });

  describe('ProgressionSystem', () => {
    let progression: ProgressionSystem;

    beforeEach(() => {
      progression = ProgressionSystem.getInstance();
      progression.reset();
    });

    it('should be a singleton', () => {
      const instance1 = ProgressionSystem.getInstance();
      const instance2 = ProgressionSystem.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should start at level 1', () => {
      expect(progression.getLevel()).toBe(1);
      expect(progression.getExp()).toBe(0);
    });

    it('should add EXP', () => {
      progression.addExp(50);
      expect(progression.getExp()).toBe(50);
    });

    it('should level up at 100 EXP', () => {
      const leveledUp = progression.addExp(100);
      expect(leveledUp).toBe(true);
      expect(progression.getLevel()).toBe(2);
      expect(progression.getExp()).toBe(0);
    });

    it('should track captured monsters', () => {
      const captured = progression.captureMonster('Absolution');
      expect(captured).toBe(true);
      expect(progression.hasCaptured('Absolution')).toBe(true);
      expect(progression.getCapturedCount()).toBe(1);
    });

    it('should not duplicate captured monsters', () => {
      progression.captureMonster('Absolution');
      const duplicate = progression.captureMonster('Absolution');
      expect(duplicate).toBe(false);
      expect(progression.getCapturedCount()).toBe(1);
    });

    it('should calculate EXP rewards', () => {
      const reward = progression.calculateExpReward(3, true);
      expect(reward).toBe(45); // 30 base + 3*5 level bonus
    });

    it('should give consolation prize for defeat', () => {
      const reward = progression.calculateExpReward(3, false);
      expect(reward).toBe(10);
    });

    it('should get progress stats', () => {
      progression.addExp(50);
      progression.captureMonster('Absolution');
      
      const stats = progression.getProgress();
      expect(stats.level).toBe(1);
      expect(stats.exp).toBe(50);
      expect(stats.expNeeded).toBe(100);
      expect(stats.captured).toBe(1);
      expect(stats.total).toBe(207);
    });

    it('should export and import data', () => {
      progression.addExp(75);
      progression.captureMonster('Absolution');
      
      const exported = progression.export();
      
      progression.reset();
      expect(progression.getExp()).toBe(0);
      
      progression.import(exported);
      expect(progression.getExp()).toBe(75);
      expect(progression.hasCaptured('Absolution')).toBe(true);
    });
  });

  describe('TutorialOverlay', () => {
    beforeEach(() => {
      TutorialOverlay.reset();
    });

    it('should track completion state', () => {
      expect(TutorialOverlay.isComplete()).toBe(false);
      
      // Simulate completion (would be done by the component)
      localStorage.setItem('tutorialComplete', 'true');
      
      expect(TutorialOverlay.isComplete()).toBe(true);
    });

    it('should reset completion', () => {
      localStorage.setItem('tutorialComplete', 'true');
      expect(TutorialOverlay.isComplete()).toBe(true);
      
      TutorialOverlay.reset();
      expect(TutorialOverlay.isComplete()).toBe(false);
    });
  });
});
