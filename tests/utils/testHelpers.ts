/**
 * Test utilities shared across unit tests
 */

/**
 * Creates a test monster with customizable properties
 */
export const createTestMonster = (overrides: any = {}) => ({
  id: 'char001',
  name: 'Test Monster',
  element: 'kim',
  level: 5,
  currentHP: 100,
  captureRate: 30,
  tier: 1,
  evolveTo: null,
  stats: {
    hp: 100,
    attack: 20,
    defense: 10,
    speed: 15,
    magic: 10
  },
  ...overrides
});

/**
 * Creates a test monster database for evolution tests
 */
export const createTestMonsterDatabase = () => ({
  char001: {
    id: 'char001',
    name: 'Basic Form',
    tier: 1,
    evolveTo: 'char002',
    stats: { hp: 100, attack: 20, defense: 10, speed: 15, magic: 10 }
  },
  char002: {
    id: 'char002',
    name: 'Evolved Form',
    tier: 2,
    evolveTo: null,
    stats: { hp: 150, attack: 30, defense: 15, speed: 20, magic: 15 }
  }
});

/**
 * Constants for tests
 */
export const TEST_CONSTANTS = {
  MAX_CAPTURE_ATTEMPTS: 10,
  HIGH_CAPTURE_RATE: 100,
  LOW_CAPTURE_RATE: 10,
  PROBABILITY_TEST_ITERATIONS: 100
};
