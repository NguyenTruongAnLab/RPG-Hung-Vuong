import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerAnimation } from '../../src/entities/components/PlayerAnimation';

// Mock DragonBones armature display
function createMockArmatureDisplay() {
  const mockAnimation = {
    play: vi.fn(),
    stop: vi.fn(),
    animationNames: ['idle', 'walk', 'attack']
  };

  const mockDisplay = {
    animation: mockAnimation,
    scale: { x: 1, y: 1 }
  } as any;

  return mockDisplay;
}

describe('PlayerAnimation', () => {
  let playerAnimation: PlayerAnimation;
  let mockArmatureDisplay: any;

  beforeEach(() => {
    playerAnimation = new PlayerAnimation();
    mockArmatureDisplay = createMockArmatureDisplay();
  });

  describe('initialization', () => {
    it('should create without errors', () => {
      expect(playerAnimation).toBeDefined();
    });

    it('should start with default state', () => {
      expect(playerAnimation.getCurrentAnimation()).toBe('idle');
      expect(playerAnimation.getCurrentDirection()).toBe('down');
      expect(playerAnimation.isAnimationPlaying()).toBe(false);
    });
  });

  describe('setArmatureDisplay', () => {
    it('should set the armature display', () => {
      playerAnimation.setArmatureDisplay(mockArmatureDisplay);
      expect(playerAnimation.getArmatureDisplay()).toBe(mockArmatureDisplay);
    });

    it('should start idle animation when set', () => {
      playerAnimation.setArmatureDisplay(mockArmatureDisplay);
      expect(mockArmatureDisplay.animation.play).toHaveBeenCalledWith('idle', 0);
    });
  });

  describe('play', () => {
    beforeEach(() => {
      playerAnimation.setArmatureDisplay(mockArmatureDisplay);
      mockArmatureDisplay.animation.play.mockClear();
    });

    it('should play idle animation', () => {
      // Since idle is already playing from setArmatureDisplay, 
      // we need to play a different animation first
      playerAnimation.play('walk');
      mockArmatureDisplay.animation.play.mockClear();
      
      playerAnimation.play('idle');
      expect(mockArmatureDisplay.animation.play).toHaveBeenCalledWith('idle', 0);
    });

    it('should play walk animation', () => {
      playerAnimation.play('walk');
      expect(mockArmatureDisplay.animation.play).toHaveBeenCalledWith('walk', 0);
    });

    it('should play attack animation once', () => {
      playerAnimation.play('attack');
      expect(mockArmatureDisplay.animation.play).toHaveBeenCalledWith('attack', 1);
    });

    it('should not restart the same animation', () => {
      playerAnimation.play('walk');
      mockArmatureDisplay.animation.play.mockClear();
      
      playerAnimation.play('walk');
      expect(mockArmatureDisplay.animation.play).not.toHaveBeenCalled();
    });

    it('should update current animation state', () => {
      playerAnimation.play('walk');
      expect(playerAnimation.getCurrentAnimation()).toBe('walk');
      expect(playerAnimation.isAnimationPlaying()).toBe(true);
    });

    it('should silently fail if armature display not set', () => {
      // PlayerAnimation.play() now silently returns when armatureDisplay is not set
      // This prevents console spam during development without DragonBones assets
      const consoleSpy = vi.spyOn(console, 'warn');
      const newAnimation = new PlayerAnimation();
      
      // Should not throw and should not warn
      expect(() => newAnimation.play('walk')).not.toThrow();
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    beforeEach(() => {
      playerAnimation.setArmatureDisplay(mockArmatureDisplay);
      playerAnimation.play('walk');
    });

    it('should stop the current animation', () => {
      playerAnimation.stop();
      expect(mockArmatureDisplay.animation.stop).toHaveBeenCalled();
    });

    it('should update playing state', () => {
      playerAnimation.stop();
      expect(playerAnimation.isAnimationPlaying()).toBe(false);
    });

    it('should not error if armature display not set', () => {
      const newAnimation = new PlayerAnimation();
      expect(() => newAnimation.stop()).not.toThrow();
    });
  });

  describe('setDirection', () => {
    beforeEach(() => {
      playerAnimation.setArmatureDisplay(mockArmatureDisplay);
      mockArmatureDisplay.animation.play.mockClear();
    });

    it('should set direction to left and flip sprite', () => {
      playerAnimation.setDirection('left');
      expect(playerAnimation.getCurrentDirection()).toBe('left');
      expect(mockArmatureDisplay.scale.x).toBeLessThan(0);
    });

    it('should set direction to right and unflip sprite', () => {
      playerAnimation.setDirection('left'); // First flip left
      playerAnimation.setDirection('right'); // Then flip right
      expect(playerAnimation.getCurrentDirection()).toBe('right');
      expect(mockArmatureDisplay.scale.x).toBeGreaterThan(0);
    });

    it('should set direction to up', () => {
      playerAnimation.setDirection('up');
      expect(playerAnimation.getCurrentDirection()).toBe('up');
    });

    it('should set direction to down', () => {
      playerAnimation.setDirection('down');
      expect(playerAnimation.getCurrentDirection()).toBe('down');
    });

    it('should not change if direction is the same', () => {
      playerAnimation.setDirection('right');
      const scaleBefore = mockArmatureDisplay.scale.x;
      
      playerAnimation.setDirection('right');
      expect(mockArmatureDisplay.scale.x).toBe(scaleBefore);
    });

    it('should replay animation with new direction if playing', () => {
      playerAnimation.play('walk');
      mockArmatureDisplay.animation.play.mockClear();
      
      playerAnimation.setDirection('left');
      expect(mockArmatureDisplay.animation.play).toHaveBeenCalledWith('walk', 0);
    });
  });

  describe('update', () => {
    it('should not throw errors', () => {
      playerAnimation.setArmatureDisplay(mockArmatureDisplay);
      expect(() => playerAnimation.update(16.67)).not.toThrow();
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      playerAnimation.setArmatureDisplay(mockArmatureDisplay);
      playerAnimation.play('walk');
    });

    it('should stop animation on dispose', () => {
      playerAnimation.dispose();
      expect(mockArmatureDisplay.animation.stop).toHaveBeenCalled();
    });

    it('should clear armature display', () => {
      playerAnimation.dispose();
      expect(playerAnimation.getArmatureDisplay()).toBeNull();
    });

    it('should update playing state', () => {
      playerAnimation.dispose();
      expect(playerAnimation.isAnimationPlaying()).toBe(false);
    });
  });

  describe('getters', () => {
    beforeEach(() => {
      playerAnimation.setArmatureDisplay(mockArmatureDisplay);
    });

    it('should get current animation', () => {
      playerAnimation.play('attack');
      expect(playerAnimation.getCurrentAnimation()).toBe('attack');
    });

    it('should get current direction', () => {
      playerAnimation.setDirection('up');
      expect(playerAnimation.getCurrentDirection()).toBe('up');
    });

    it('should check if animation is playing', () => {
      expect(playerAnimation.isAnimationPlaying()).toBe(true); // idle from setArmatureDisplay
      playerAnimation.stop();
      expect(playerAnimation.isAnimationPlaying()).toBe(false);
    });

    it('should get armature display', () => {
      expect(playerAnimation.getArmatureDisplay()).toBe(mockArmatureDisplay);
    });
  });
});
