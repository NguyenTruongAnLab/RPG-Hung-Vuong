/**
 * PlayerCombat - Player combat component
 * 
 * Handles player attack mechanics in overworld.
 * Component of Player entity.
 */
import Matter from 'matter-js';
import { PhysicsManager } from '../../core/PhysicsManager';
import { PlayerStats } from './PlayerStats';

export class PlayerCombat {
  private stats: PlayerStats;
  private physics: PhysicsManager;
  private attackCooldown: number = 0;
  private attackCooldownMax: number = 500; // milliseconds
  private attackRange: number = 40;
  private attackDamage: number = 10;

  /**
   * Creates a new PlayerCombat component
   * 
   * @param stats - Player stats component
   * @param physics - Physics manager instance
   */
  constructor(stats: PlayerStats, physics: PhysicsManager) {
    this.stats = stats;
    this.physics = physics;
  }

  /**
   * Updates combat state
   * 
   * @param deltaMs - Time elapsed since last update
   * 
   * @example
   * ```typescript
   * // In game loop
   * playerCombat.update(ticker.deltaMS);
   * ```
   */
  public update(deltaMs: number): void {
    // Update cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - deltaMs);
    }
  }

  /**
   * Attempts to attack
   * Creates a temporary hitbox at attack position
   * 
   * @param attackX - Attack X position
   * @param attackY - Attack Y position
   * @returns True if attack was performed
   * 
   * @example
   * ```typescript
   * // Attack in front of player
   * const pos = player.getPosition();
   * combat.attack(pos.x + 30, pos.y);
   * ```
   */
  public attack(attackX: number, attackY: number): boolean {
    if (!this.canAttack()) {
      return false;
    }

    // Create temporary attack hitbox
    const hitbox = Matter.Bodies.circle(attackX, attackY, this.attackRange / 2, {
      isSensor: true,
      label: 'player-attack'
    });

    this.physics.addBody(hitbox);

    // Remove hitbox after short duration
    setTimeout(() => {
      this.physics.removeBody(hitbox);
    }, 100);

    // Set cooldown
    this.attackCooldown = this.attackCooldownMax;

    return true;
  }

  /**
   * Checks if player can attack
   * @returns True if not on cooldown
   */
  public canAttack(): boolean {
    return this.attackCooldown === 0;
  }

  /**
   * Gets attack cooldown remaining
   * @returns Cooldown in milliseconds
   */
  public getCooldown(): number {
    return this.attackCooldown;
  }

  /**
   * Gets cooldown as percentage (0-1)
   * @returns Cooldown percentage
   */
  public getCooldownPercentage(): number {
    return this.attackCooldown / this.attackCooldownMax;
  }

  /**
   * Gets attack range
   * @returns Attack range value
   */
  public getAttackRange(): number {
    return this.attackRange;
  }

  /**
   * Gets attack damage
   * @returns Attack damage value
   */
  public getAttackDamage(): number {
    return this.attackDamage;
  }

  /**
   * Sets attack damage
   * @param damage - New damage value
   */
  public setAttackDamage(damage: number): void {
    this.attackDamage = damage;
  }

  /**
   * Sets attack cooldown max
   * @param cooldownMs - Cooldown in milliseconds
   */
  public setAttackCooldownMax(cooldownMs: number): void {
    this.attackCooldownMax = cooldownMs;
  }

  /**
   * Sets attack range
   * @param range - Attack range value
   */
  public setAttackRange(range: number): void {
    this.attackRange = range;
  }

  /**
   * Resets attack cooldown (instant attack available)
   */
  public resetCooldown(): void {
    this.attackCooldown = 0;
  }
}
