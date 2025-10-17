import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TransitionManager } from '../../src/core/TransitionManager';
import { Scene } from '../../src/core/SceneManager';
import * as PIXI from 'pixi.js';

// Mock Scene for testing
class MockScene extends Scene {
  async init(): Promise<void> {
    // Mock implementation
  }

  update(dt: number): void {
    // Mock implementation
  }

  destroy(): void {
    // Mock implementation
  }
}

// Create a mock PIXI app without renderer
function createMockApp(): PIXI.Application {
  const app = {
    screen: { width: 800, height: 600 },
    stage: new PIXI.Container(),
    renderer: {
      generateTexture: vi.fn()
    }
  } as any;
  return app;
}

describe('TransitionManager', () => {
  let transitionManager: TransitionManager;
  let app: PIXI.Application;
  let mockScene: MockScene;

  beforeEach(() => {
    // Create a mock app without renderer
    app = createMockApp();
    
    transitionManager = TransitionManager.getInstance();
    transitionManager.init(app);
    
    mockScene = new MockScene(app);
  });

  afterEach(() => {
    transitionManager.dispose();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = TransitionManager.getInstance();
      const instance2 = TransitionManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialization', () => {
    it('should initialize with app instance', () => {
      const newManager = TransitionManager.getInstance();
      expect(() => newManager.init(app)).not.toThrow();
    });

    it('should create overlay on init', () => {
      expect(transitionManager.getOverlayAlpha()).toBe(0);
    });
  });

  describe('fadeOut', () => {
    it('should fade out scene to black', async () => {
      const initialAlpha = transitionManager.getOverlayAlpha();
      expect(initialAlpha).toBe(0);

      // Start fade out (use very short duration for testing)
      const fadePromise = transitionManager.fadeOut(mockScene, 0.01);
      
      // Wait for animation to complete
      await fadePromise;
      
      const finalAlpha = transitionManager.getOverlayAlpha();
      expect(finalAlpha).toBe(1);
    });

    it('should use default duration if not specified', async () => {
      await transitionManager.fadeOut(mockScene);
      expect(transitionManager.getOverlayAlpha()).toBe(1);
    });

    it('should support custom color options', async () => {
      await transitionManager.fadeOut(mockScene, 0.01, { color: 0xffffff });
      expect(transitionManager.getOverlayAlpha()).toBe(1);
    });
  });

  describe('fadeIn', () => {
    it('should fade in scene from black', async () => {
      // First fade out
      await transitionManager.fadeOut(mockScene, 0.01);
      expect(transitionManager.getOverlayAlpha()).toBe(1);

      // Then fade in
      await transitionManager.fadeIn(mockScene, 0.01);
      expect(transitionManager.getOverlayAlpha()).toBe(0);
    });

    it('should use default duration if not specified', async () => {
      await transitionManager.fadeOut(mockScene, 0.01);
      await transitionManager.fadeIn(mockScene);
      expect(transitionManager.getOverlayAlpha()).toBe(0);
    });
  });

  describe('crossFade', () => {
    it('should perform crossfade between two scenes', async () => {
      const scene1 = new MockScene(app);
      const scene2 = new MockScene(app);

      await transitionManager.crossFade(scene1, scene2, 0.02);
      
      // After crossfade, overlay should be transparent
      expect(transitionManager.getOverlayAlpha()).toBe(0);
    });
  });

  describe('showOverlay and hideOverlay', () => {
    it('should show overlay immediately', () => {
      transitionManager.showOverlay();
      expect(transitionManager.getOverlayAlpha()).toBe(1);
    });

    it('should hide overlay immediately', () => {
      transitionManager.showOverlay();
      transitionManager.hideOverlay();
      expect(transitionManager.getOverlayAlpha()).toBe(0);
    });
  });

  describe('isTransitioning', () => {
    it('should return false when not transitioning', () => {
      expect(transitionManager.isTransitioning()).toBe(false);
    });

    it('should return false after transition completes', async () => {
      await transitionManager.fadeOut(mockScene, 0.01);
      expect(transitionManager.isTransitioning()).toBe(false);
    });
  });

  describe('getOverlayAlpha', () => {
    it('should return current overlay alpha', () => {
      expect(transitionManager.getOverlayAlpha()).toBe(0);
      transitionManager.showOverlay();
      expect(transitionManager.getOverlayAlpha()).toBe(1);
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      transitionManager.dispose();
      expect(() => transitionManager.dispose()).not.toThrow();
    });
  });
});
