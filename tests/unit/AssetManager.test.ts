import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetManager } from '../../src/core/AssetManager';

// Mock PIXI.Assets at the top level
vi.mock('pixi.js', () => ({
  Assets: {
    load: vi.fn()
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('AssetManager - DragonBones Integration', () => {
  let assetManager: AssetManager;

  beforeEach(() => {
    assetManager = AssetManager.getInstance();
    vi.clearAllMocks();
  });

  describe('loadDragonBonesCharacter', () => {
    it('should load character with all required files', async () => {
      const mockSkeleton = {
        armature: [{
          name: 'TestCharacter', // Add armature name
          animation: [
            { name: 'Idle' },
            { name: 'Attack A' },
            { name: 'Damage' }
          ]
        }],
        frameRate: 24
      };

      const mockTextureAtlas = { frames: [] };
      const mockTexture = { width: 1024, height: 1024 };
      const mockSettings = 'Available Motions:\nAttack A - Test\nIdle\nDamage';

      // Mock fetch responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSkeleton
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTextureAtlas
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockSettings
        });

      // Mock PIXI.Assets.load
      const PIXI = await import('pixi.js');
      vi.mocked(PIXI.Assets.load).mockResolvedValue(mockTexture as any);

      const asset = await assetManager.loadDragonBonesCharacter('TestCharacter');

      expect(asset).toBeDefined();
      expect(asset.characterName).toBe('TestCharacter');
      expect(asset.animations).toEqual(['Idle', 'Attack A', 'Damage']);
      expect(asset.settings).toBeDefined();
      expect(asset.settings?.availableMotions).toContain('Attack A');
    });

    it('should handle character without settings file', async () => {
      const mockSkeleton = {
        armature: [{
          name: 'SimpleCharacter', // Add armature name
          animation: [
            { name: 'Idle' },
            { name: 'Attack' }
          ]
        }],
        frameRate: 24
      };

      const mockTextureAtlas = { frames: [] };
      const mockTexture = { width: 512, height: 512 };

      // Mock fetch responses - settings fails
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSkeleton
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTextureAtlas
        })
        .mockResolvedValueOnce({
          ok: false
        });

      const PIXI = await import('pixi.js');
      vi.mocked(PIXI.Assets.load).mockResolvedValue(mockTexture as any);

      const asset = await assetManager.loadDragonBonesCharacter('SimpleCharacter');

      expect(asset).toBeDefined();
      expect(asset.characterName).toBe('SimpleCharacter');
      expect(asset.animations).toEqual(['Idle', 'Attack']);
      expect(asset.settings).toBeUndefined();
    });

    it('should cache loaded characters', async () => {
      const mockSkeleton = {
        armature: [{
          name: 'CachedChar', // Add armature name
          animation: [{ name: 'Idle' }]
        }],
        frameRate: 24
      };

      const mockTextureAtlas = { frames: [] };
      const mockTexture = { width: 256, height: 256 };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSkeleton
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTextureAtlas
        })
        .mockResolvedValueOnce({
          ok: false
        });

      const PIXI = await import('pixi.js');
      vi.mocked(PIXI.Assets.load).mockResolvedValue(mockTexture as any);

      // Load twice
      const asset1 = await assetManager.loadDragonBonesCharacter('CachedChar');
      const asset2 = await assetManager.loadDragonBonesCharacter('CachedChar');

      expect(asset1).toBe(asset2);
      expect(global.fetch).toHaveBeenCalledTimes(3); // Only called once
    });
  });

  describe('parseSettings', () => {
    it('should extract available motions from settings text', async () => {
      const settingsText = `
Available Motions:
Attack A - Left Claw Crush
Attack B - Double Claw Crush
Damage
Idle

Sample Action Sequence:
...
      `;

      const mockSkeleton = {
        armature: [{ 
          name: 'TestChar', // Add armature name
          animation: [{ name: 'Idle' }] 
        }],
        frameRate: 24
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSkeleton
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => settingsText
        });

      const PIXI = await import('pixi.js');
      vi.mocked(PIXI.Assets.load).mockResolvedValue({} as any);

      const asset = await assetManager.loadDragonBonesCharacter('TestChar');

      expect(asset.settings).toBeDefined();
      expect(asset.settings?.availableMotions).toContain('Attack A');
      expect(asset.settings?.availableMotions).toContain('Attack B');
      expect(asset.settings?.availableMotions).toContain('Damage');
      expect(asset.settings?.availableMotions).toContain('Idle');
    });
  });

  describe('getAnimationDuration', () => {
    it('should calculate animation duration from skeleton data', async () => {
      const mockSkeleton = {
        armature: [{
          name: 'TimedChar', // Add armature name
          animation: [
            { name: 'Idle', duration: 24 },
            { name: 'Attack A', duration: 48 }
          ]
        }],
        frameRate: 24
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSkeleton
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        })
        .mockResolvedValueOnce({
          ok: false
        });

      const PIXI = await import('pixi.js');
      vi.mocked(PIXI.Assets.load).mockResolvedValue({} as any);

      await assetManager.loadDragonBonesCharacter('TimedChar');

      const idleDuration = assetManager.getAnimationDuration('TimedChar', 'Idle');
      const attackDuration = assetManager.getAnimationDuration('TimedChar', 'Attack A');

      expect(idleDuration).toBe(1.0); // 24 frames / 24 fps = 1 second
      expect(attackDuration).toBe(2.0); // 48 frames / 24 fps = 2 seconds
    });

    it('should return default duration for unknown character', () => {
      const duration = assetManager.getAnimationDuration('UnknownChar', 'Idle');
      expect(duration).toBe(1.0);
    });
  });
});
