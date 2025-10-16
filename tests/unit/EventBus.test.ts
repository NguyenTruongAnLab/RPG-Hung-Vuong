import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus, GameEvents } from '../../src/core/EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = EventBus.getInstance();
    // Clean up listeners before each test
    eventBus.removeAllListeners();
  });

  describe('on and emit', () => {
    it('should call handler when event is emitted', () => {
      let called = false;
      let receivedData = null;

      eventBus.on('test:event', (data) => {
        called = true;
        receivedData = data;
      });

      eventBus.emit('test:event', { value: 42 });

      expect(called).toBe(true);
      expect(receivedData).toEqual({ value: 42 });
    });

    it('should call multiple handlers for same event', () => {
      let count = 0;

      eventBus.on('test:event', () => count++);
      eventBus.on('test:event', () => count++);
      eventBus.on('test:event', () => count++);

      eventBus.emit('test:event');

      expect(count).toBe(3);
    });

    it('should not call handlers for different events', () => {
      let called = false;

      eventBus.on('event:one', () => {
        called = true;
      });

      eventBus.emit('event:two');

      expect(called).toBe(false);
    });
  });

  describe('once', () => {
    it('should call handler only once', () => {
      let count = 0;

      eventBus.once('test:event', () => count++);

      eventBus.emit('test:event');
      eventBus.emit('test:event');
      eventBus.emit('test:event');

      expect(count).toBe(1);
    });
  });

  describe('off', () => {
    it('should remove specific handler', () => {
      let count = 0;
      const handler = () => count++;

      eventBus.on('test:event', handler);
      eventBus.emit('test:event');
      expect(count).toBe(1);

      eventBus.off('test:event', handler);
      eventBus.emit('test:event');
      expect(count).toBe(1); // Still 1, handler was removed
    });

    it('should not affect other handlers', () => {
      let count1 = 0;
      let count2 = 0;
      const handler1 = () => count1++;
      const handler2 = () => count2++;

      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);

      eventBus.off('test:event', handler1);
      eventBus.emit('test:event');

      expect(count1).toBe(0); // Removed
      expect(count2).toBe(1); // Still active
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      let count = 0;

      eventBus.on('test:event', () => count++);
      eventBus.on('test:event', () => count++);

      eventBus.removeAllListeners('test:event');
      eventBus.emit('test:event');

      expect(count).toBe(0);
    });

    it('should remove all listeners for all events', () => {
      let count = 0;

      eventBus.on('event:one', () => count++);
      eventBus.on('event:two', () => count++);

      eventBus.removeAllListeners();
      eventBus.emit('event:one');
      eventBus.emit('event:two');

      expect(count).toBe(0);
    });
  });

  describe('listenerCount', () => {
    it('should return correct count', () => {
      expect(eventBus.listenerCount('test:event')).toBe(0);

      eventBus.on('test:event', () => {});
      expect(eventBus.listenerCount('test:event')).toBe(1);

      eventBus.on('test:event', () => {});
      expect(eventBus.listenerCount('test:event')).toBe(2);
    });
  });

  describe('hasListeners', () => {
    it('should return false when no listeners', () => {
      expect(eventBus.hasListeners('test:event')).toBe(false);
    });

    it('should return true when listeners exist', () => {
      eventBus.on('test:event', () => {});
      expect(eventBus.hasListeners('test:event')).toBe(true);
    });
  });

  describe('eventNames', () => {
    it('should return all registered event names', () => {
      eventBus.on('event:one', () => {});
      eventBus.on('event:two', () => {});
      eventBus.on('event:three', () => {});

      const names = eventBus.eventNames();
      expect(names).toHaveLength(3);
      expect(names).toContain('event:one');
      expect(names).toContain('event:two');
      expect(names).toContain('event:three');
    });
  });

  describe('error handling', () => {
    it('should catch errors in handlers and continue', () => {
      let count = 0;

      eventBus.on('test:event', () => {
        throw new Error('Test error');
      });
      eventBus.on('test:event', () => count++);

      // Should not throw
      expect(() => {
        eventBus.emit('test:event');
      }).not.toThrow();

      // Second handler should still execute
      expect(count).toBe(1);
    });
  });

  describe('GameEvents constants', () => {
    it('should have battle event constants', () => {
      expect(GameEvents.BATTLE_START).toBe('battle:start');
      expect(GameEvents.BATTLE_END).toBe('battle:end');
      expect(GameEvents.MONSTER_DEFEATED).toBe('monster:defeated');
    });

    it('should have map event constants', () => {
      expect(GameEvents.LOCATION_CHANGED).toBe('location:changed');
    });
  });
});
