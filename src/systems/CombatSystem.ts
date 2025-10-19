/**
 * CombatSystem - Real-time combat mechanics
 * 
 * Handles hit detection, dodge rolling, blocking, and damage feedback
 * for real-time action combat in the overworld.
 * 
 * @example
 * ```typescript
 * const combat = new CombatSystem(physics, eventBus);
 * combat.init();
 * 
 * // Dodge roll
 * combat.dodgeRoll(playerId, direction);
 * 
 * // Block attack
 * combat.startBlock(playerId);
 * ```
 */
import * as Matter from 'matter-js';
import { PhysicsManager } from '../core/PhysicsManager';
import { EventBus } from '../core/EventBus';
import { Vector2D } from '../utils/Vector2D';
import { AttackData } from './WeaponSystem';

/**
 * Combat entity state
 */
export interface CombatEntity {
  id: string;
  body: Matter.Body;
  hp: number;
  maxHp: number;
  isBlocking: boolean;
  isDodging: boolean;
  dodgeCooldown: number;
  blockCooldown: number;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
}

/**
 * Damage feedback effect
 */
export interface DamageEffect {
  entityId: string;
  damage: number;
  position: Vector2D;
  timestamp: number;
  isCritical: boolean;
}

/**
 * CombatSystem class
 */
export class CombatSystem {
  private physics: PhysicsManager;
  private eventBus: EventBus;
  private entities: Map<string, CombatEntity> = new Map();
  private damageEffects: DamageEffect[] = [];
  private hitSensors: Map<string, Matter.Body> = new Map();
  
  // Combat constants
  private readonly DODGE_DURATION = 400; // ms
  private readonly DODGE_COOLDOWN = 1000; // ms
  private readonly DODGE_DISTANCE = 80; // pixels
  private readonly BLOCK_DURATION = 500; // ms
  private readonly BLOCK_COOLDOWN = 800; // ms
  private readonly BLOCK_REDUCTION = 0.7; // 70% damage reduction
  private readonly INVULNERABILITY_DURATION = 200; // ms after hit
  private readonly KNOCKBACK_FORCE = 5;

  constructor(physics: PhysicsManager, eventBus: EventBus) {
    this.physics = physics;
    this.eventBus = eventBus;
  }

  /**
   * Initialize combat system
   */
  init(): void {
    // Listen for weapon attacks
    this.eventBus.on('weapon:attack', this.handleWeaponAttack.bind(this));
    
    // Listen for collision events
    this.eventBus.on('collision:start:attack-entity', this.handleAttackCollision.bind(this));
  }

  /**
   * Register entity for combat
   */
  registerEntity(
    id: string,
    body: Matter.Body,
    hp: number,
    maxHp: number
  ): void {
    this.entities.set(id, {
      id,
      body,
      hp,
      maxHp,
      isBlocking: false,
      isDodging: false,
      dodgeCooldown: 0,
      blockCooldown: 0,
      isInvulnerable: false,
      invulnerabilityTimer: 0
    });
  }

  /**
   * Unregister entity
   */
  unregisterEntity(id: string): void {
    this.entities.delete(id);
    
    // Clean up hit sensor if exists
    const sensor = this.hitSensors.get(id);
    if (sensor) {
      this.physics.removeBody(sensor);
      this.hitSensors.delete(id);
    }
  }

  /**
   * Update combat system
   */
  update(deltaMs: number): void {
    const deltaSec = deltaMs / 1000;

    for (const entity of this.entities.values()) {
      // Update cooldowns
      if (entity.dodgeCooldown > 0) {
        entity.dodgeCooldown = Math.max(0, entity.dodgeCooldown - deltaMs);
      }
      
      if (entity.blockCooldown > 0) {
        entity.blockCooldown = Math.max(0, entity.blockCooldown - deltaMs);
      }

      // Update invulnerability
      if (entity.isInvulnerable) {
        entity.invulnerabilityTimer -= deltaMs;
        if (entity.invulnerabilityTimer <= 0) {
          entity.isInvulnerable = false;
          this.eventBus.emit('combat:invulnerability-end', { entityId: entity.id });
        }
      }
    }

    // Clean up old damage effects
    this.damageEffects = this.damageEffects.filter(
      effect => Date.now() - effect.timestamp < 1000
    );
  }

  /**
   * Execute dodge roll
   */
  dodgeRoll(entityId: string, direction: Vector2D): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    // Check cooldown
    if (entity.dodgeCooldown > 0) {
      this.eventBus.emit('combat:dodge-failed', { entityId, reason: 'cooldown' });
      return false;
    }

    // Set dodge state
    entity.isDodging = true;
    entity.isInvulnerable = true;
    entity.invulnerabilityTimer = this.DODGE_DURATION;
    entity.dodgeCooldown = this.DODGE_COOLDOWN;

    // Apply dodge velocity
    const dodgeVelocity = {
      x: direction.x * this.DODGE_DISTANCE,
      y: direction.y * this.DODGE_DISTANCE
    };
    Matter.Body.setVelocity(entity.body, dodgeVelocity);

    // Emit event
    this.eventBus.emit('combat:dodge-start', { entityId, direction });

    // End dodge after duration
    setTimeout(() => {
      entity.isDodging = false;
      this.eventBus.emit('combat:dodge-end', { entityId });
    }, this.DODGE_DURATION);

    return true;
  }

  /**
   * Start blocking
   */
  startBlock(entityId: string): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    // Check cooldown
    if (entity.blockCooldown > 0) {
      this.eventBus.emit('combat:block-failed', { entityId, reason: 'cooldown' });
      return false;
    }

    // Set block state
    entity.isBlocking = true;
    entity.blockCooldown = this.BLOCK_COOLDOWN;

    // Emit event
    this.eventBus.emit('combat:block-start', { entityId });

    // End block after duration
    setTimeout(() => {
      entity.isBlocking = false;
      this.eventBus.emit('combat:block-end', { entityId });
    }, this.BLOCK_DURATION);

    return true;
  }

  /**
   * Apply damage to entity
   */
  applyDamage(
    entityId: string,
    damage: number,
    attackerId: string,
    attackPosition: Vector2D
  ): number {
    const entity = this.entities.get(entityId);
    if (!entity) return 0;

    // Check invulnerability
    if (entity.isInvulnerable) {
      this.eventBus.emit('combat:damage-blocked', { entityId, reason: 'invulnerable' });
      return 0;
    }

    // Apply blocking reduction
    let actualDamage = damage;
    if (entity.isBlocking) {
      actualDamage *= (1 - this.BLOCK_REDUCTION);
      this.eventBus.emit('combat:damage-reduced', { entityId, originalDamage: damage, reducedDamage: actualDamage });
    }

    // Apply damage
    entity.hp = Math.max(0, entity.hp - actualDamage);

    // Set invulnerability frames
    entity.isInvulnerable = true;
    entity.invulnerabilityTimer = this.INVULNERABILITY_DURATION;

    // Apply knockback
    this.applyKnockback(entity, attackPosition);

    // Create damage effect
    const effect: DamageEffect = {
      entityId,
      damage: actualDamage,
      position: { x: entity.body.position.x, y: entity.body.position.y },
      timestamp: Date.now(),
      isCritical: false // TODO: Implement critical hit system
    };
    this.damageEffects.push(effect);

    // Emit damage event
    this.eventBus.emit('combat:damage-dealt', {
      entityId,
      attackerId,
      damage: actualDamage,
      remainingHp: entity.hp
    });

    // Check for death
    if (entity.hp <= 0) {
      this.eventBus.emit('combat:entity-died', { entityId, killerId: attackerId });
    }

    return actualDamage;
  }

  /**
   * Apply knockback to entity
   */
  private applyKnockback(entity: CombatEntity, attackPosition: Vector2D): void {
    const direction = {
      x: entity.body.position.x - attackPosition.x,
      y: entity.body.position.y - attackPosition.y
    };

    // Normalize
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (length > 0) {
      direction.x /= length;
      direction.y /= length;
    }

    // Apply force
    Matter.Body.applyForce(entity.body, entity.body.position, {
      x: direction.x * this.KNOCKBACK_FORCE,
      y: direction.y * this.KNOCKBACK_FORCE
    });
  }

  /**
   * Handle weapon attack event
   */
  private handleWeaponAttack(data: AttackData & { attackId: string }): void {
    // Create temporary hit sensor
    const endPosition = {
      x: data.position.x + data.direction.x * data.range,
      y: data.position.y + data.direction.y * data.range
    };

    // Check entities in attack range
    for (const entity of this.entities.values()) {
      if (entity.id === data.attackerId) continue;

      const distance = Math.sqrt(
        Math.pow(entity.body.position.x - data.position.x, 2) +
        Math.pow(entity.body.position.y - data.position.y, 2)
      );

      if (distance <= data.range) {
        // Check if attack direction aligns with entity
        const toEntity = {
          x: entity.body.position.x - data.position.x,
          y: entity.body.position.y - data.position.y
        };
        const dot = toEntity.x * data.direction.x + toEntity.y * data.direction.y;

        if (dot > 0) {
          // Hit detected
          this.applyDamage(entity.id, data.damage, data.attackerId, data.position);
        }
      }
    }
  }

  /**
   * Handle attack collision
   */
  private handleAttackCollision(data: any): void {
    // Handled by handleWeaponAttack
  }

  /**
   * Get entity combat state
   */
  getEntity(entityId: string): CombatEntity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Get all active damage effects
   */
  getDamageEffects(): DamageEffect[] {
    return [...this.damageEffects];
  }

  /**
   * Heal entity
   */
  heal(entityId: string, amount: number): number {
    const entity = this.entities.get(entityId);
    if (!entity) return 0;

    const oldHp = entity.hp;
    entity.hp = Math.min(entity.maxHp, entity.hp + amount);
    const actualHeal = entity.hp - oldHp;

    this.eventBus.emit('combat:healed', { entityId, amount: actualHeal, currentHp: entity.hp });

    return actualHeal;
  }

  /**
   * Dispose combat system
   */
  dispose(): void {
    this.entities.clear();
    this.damageEffects = [];
    
    // Clean up all hit sensors
    for (const sensor of this.hitSensors.values()) {
      this.physics.removeBody(sensor);
    }
    this.hitSensors.clear();
  }
}
