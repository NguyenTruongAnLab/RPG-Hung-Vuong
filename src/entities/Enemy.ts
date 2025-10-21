/**
 * Enemy.ts - AI-controlled enemy entity with DragonBones animations
 * 
 * Full-featured enemy with:
 * - DragonBones character rendering
 * - HP/Mana bars
 * - AI behaviors (idle, patrol, chase, attack)
 * - Collision detection with walls
 * - Random attack animations
 * 
 * @example
 * ```typescript
 * const enemy = new Enemy(x, y, 'Absolution', physics, worldContainer);
 * await enemy.init();
 * 
 * // In update loop
 * enemy.update(deltaMs, playerPos);
 * ```
 */

import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { PhysicsManager } from '../core/PhysicsManager.js';
import { AssetManager } from '../core/AssetManager.js';
import { DragonBonesManager } from '../core/DragonBonesManager.js';
import { Vector2D } from '../utils/Vector2D.js';
import { createCircleBody } from '../utils/MatterHelpers.js';
import type { PixiArmatureDisplay } from 'pixi-dragonbones-runtime';

/**
 * Enemy AI states
 */
export type EnemyState = 'idle' | 'patrol' | 'chase' | 'attack' | 'damaged' | 'dead';

/**
 * Enemy configuration
 */
export interface EnemyConfig {
  maxHp: number;
  maxMana: number;
  moveSpeed: number;
  attackRange: number;
  detectionRange: number;
  attackCooldown: number; // ms
  patrolRadius: number;
}

/**
 * Enemy class
 */
export class Enemy {
  private body: Matter.Body;
  private display: PIXI.Container;
  private armatureDisplay: PixiArmatureDisplay | null = null;
  private dbManager: DragonBonesManager;
  private assetManager: AssetManager;
  private physics: PhysicsManager;
  
  // Stats
  private hp: number;
  private maxHp: number;
  private mana: number;
  private maxMana: number;
  
  // AI state
  private state: EnemyState = 'idle';
  private spawnPosition: Vector2D;
  private targetPosition: Vector2D | null = null;
  private lastAttackTime: number = 0;
  
  // Config
  private config: EnemyConfig;
  private characterName: string;
  
  // UI elements
  private hpBar: PIXI.Graphics;
  private manaBar: PIXI.Graphics;
  private nameText: PIXI.Text;
  
  // Animation tracking
  private availableAttacks: string[] = [];
  private currentAnimation: string = 'idle';

  constructor(
    x: number,
    y: number,
    characterName: string,
    physics: PhysicsManager,
    worldContainer: PIXI.Container,
    app: PIXI.Application,
    config: Partial<EnemyConfig> = {}
  ) {
    this.physics = physics;
    this.characterName = characterName;
    this.spawnPosition = { x, y };
    this.assetManager = AssetManager.getInstance();
    this.dbManager = new DragonBonesManager(app);
    
    // Default config
    this.config = {
      maxHp: 100,
      maxMana: 50,
      moveSpeed: 1500, // 75% of player speed (2000 * 0.75) - balanced for chase mechanics [10x faster]
      attackRange: 80,
      detectionRange: 300,
      attackCooldown: 2000,
      patrolRadius: 150,
      ...config
    };
    
    this.hp = this.config.maxHp;
    this.maxHp = this.config.maxHp;
    this.mana = this.config.maxMana;
    this.maxMana = this.config.maxMana;
    
    // Create physics body with proper collision settings
    this.body = createCircleBody(x, y, 20, {
      label: `enemy_${characterName}`,
      friction: 0.01,
      frictionAir: 0.01,      // Low damping for responsive AI movement
      restitution: 0.0,       // No bounciness - solid collisions
      density: 0.001,         // Low density for responsive movement (not 0.01!)
      inertia: Infinity       // Prevent rotation
    });
    
    // Set collision filter: enemies collide with everything
    this.physics.setCollisionFilter(this.body, 'enemy');
    
    console.log(`[ENEMY] ${characterName} created at (${x}, ${y}), collision filter set`);
    
    // Create display container
    this.display = new PIXI.Container();
    this.display.x = x;
    this.display.y = y;
    
    // Create UI elements
    this.hpBar = new PIXI.Graphics();
    this.manaBar = new PIXI.Graphics();
    this.nameText = new PIXI.Text({
      text: characterName,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFF0000, // Red for enemy
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 }
      }
    });
    this.nameText.anchor.set(0.5, 1);
    this.nameText.y = -60;
    
    worldContainer.addChild(this.display);
    this.physics.addBody(this.body);
  }

  /**
   * Initialize enemy (load DragonBones character)
   */
  async init(): Promise<void> {
    try {
      // Load DragonBones character using AssetManager
      const asset = await this.assetManager.loadDragonBonesCharacter(this.characterName);
      
      // Create armature display using DragonBonesManager
      this.armatureDisplay = this.dbManager.createDisplay(asset, this.characterName);
      
      if (this.armatureDisplay) {
        // CRITICAL: DragonBones assets face LEFT by default, flip to face RIGHT
        this.armatureDisplay.scale.set(-0.35, 0.35); // Negative X to face RIGHT
        this.display.addChild(this.armatureDisplay);
        
        // Find all attack animations
        const animationNames = this.dbManager.getAnimationNames(this.armatureDisplay);
        this.availableAttacks = animationNames.filter(name => 
          name.toLowerCase().includes('attack') || 
          name.toLowerCase().includes('skill') ||
          name.toLowerCase().includes('cast')
        );
        
        console.log(`✅ Enemy ${this.characterName} loaded with ${this.availableAttacks.length} attack animations:`, this.availableAttacks);
        
        // Start idle animation (smart resolver will find correct variant)
        this.playAnimation('idle');
      }
      
      // Add UI elements
      this.display.addChild(this.nameText);
      this.display.addChild(this.hpBar);
      this.display.addChild(this.manaBar);
      
      this.updateStatBars();
      
    } catch (error) {
      console.error(`Failed to load enemy ${this.characterName}:`, error);
    }
  }

  /**
   * Update enemy AI and rendering
   */
  update(deltaMs: number, playerPos: Vector2D): void {
    if (this.state === 'dead') return;
    
    // Sync display with physics body
    const pos = this.getPosition();
    this.display.x = pos.x;
    this.display.y = pos.y;
    
    // Update AI
    this.updateAI(deltaMs, playerPos);
    
    // Update stat bars
    this.updateStatBars();
  }

  /**
   * Update AI behavior
   */
  private updateAI(deltaMs: number, playerPos: Vector2D): void {
    const pos = this.getPosition();
    const distanceToPlayer = this.getDistance(pos, playerPos);
    
    // State transitions
    if (this.hp <= 0) {
      this.setState('dead');
      return;
    }
    
    if (distanceToPlayer <= this.config.attackRange) {
      this.setState('attack');
    } else if (distanceToPlayer <= this.config.detectionRange) {
      this.setState('chase');
    } else if (this.state === 'chase' || this.state === 'attack') {
      this.setState('idle');
    }
    
    // Execute behavior
    switch (this.state) {
      case 'idle':
        this.behaviorIdle(deltaMs);
        break;
      case 'patrol':
        this.behaviorPatrol(deltaMs);
        break;
      case 'chase':
        this.behaviorChase(deltaMs, playerPos);
        break;
      case 'attack':
        this.behaviorAttack(deltaMs, playerPos);
        break;
    }
  }

  /**
   * Idle behavior - occasionally switch to patrol
   */
  private behaviorIdle(deltaMs: number): void {
    if (Math.random() < 0.01) { // 1% chance per frame
      this.setState('patrol');
      this.pickRandomPatrolTarget();
    }
  }

  /**
   * Patrol behavior - walk to random point near spawn
   */
  private behaviorPatrol(deltaMs: number): void {
    if (!this.targetPosition) {
      this.pickRandomPatrolTarget();
      return;
    }
    
    const pos = this.getPosition();
    const distance = this.getDistance(pos, this.targetPosition);
    
    if (distance < 20) {
      // Reached target, go idle
      this.setState('idle');
      this.targetPosition = null;
      Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    } else {
      // Move towards target
      const direction = this.normalize({
        x: this.targetPosition.x - pos.x,
        y: this.targetPosition.y - pos.y
      });
      
      // Convert speed from pixels/second to pixels/tick (Matter.js runs at ~60 FPS)
      const velocityPerTick = this.config.moveSpeed / 60;
      
      Matter.Body.setVelocity(this.body, {
        x: direction.x * velocityPerTick,
        y: direction.y * velocityPerTick
      });
    }
  }

  /**
   * Chase behavior - follow player
   */
  private behaviorChase(deltaMs: number, playerPos: Vector2D): void {
    const pos = this.getPosition();
    const direction = this.normalize({
      x: playerPos.x - pos.x,
      y: playerPos.y - pos.y
    });
    
    // Convert speed from pixels/second to pixels/tick (Matter.js runs at ~60 FPS)
    // Chase 50% faster than patrol speed
    const chaseSpeed = this.config.moveSpeed * 1.5;
    const velocityPerTick = chaseSpeed / 60;
    
    Matter.Body.setVelocity(this.body, {
      x: direction.x * velocityPerTick,
      y: direction.y * velocityPerTick
    });
    
    // Face player
    if (direction.x < 0) {
      this.display.scale.x = -1;
    } else {
      this.display.scale.x = 1;
    }
  }

  /**
   * Attack behavior - play attack animation
   */
  private behaviorAttack(deltaMs: number, playerPos: Vector2D): void {
    const now = Date.now();
    
    // Stop moving
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    
    // Attack cooldown
    if (now - this.lastAttackTime > this.config.attackCooldown) {
      this.lastAttackTime = now;
      this.performAttack();
    }
    
    // Face player
    const pos = this.getPosition();
    if (playerPos.x < pos.x) {
      this.display.scale.x = -1;
    } else {
      this.display.scale.x = 1;
    }
  }

  /**
   * Perform attack (play random attack animation)
   */
  private performAttack(): void {
    if (this.availableAttacks.length === 0) {
      console.warn(`${this.characterName} has no attack animations`);
      return;
    }
    
    // Pick random attack
    const attackAnim = this.availableAttacks[Math.floor(Math.random() * this.availableAttacks.length)];
    this.playAnimation(attackAnim);
    
    console.log(`🗡️ ${this.characterName} uses ${attackAnim}!`);
    
    // After animation, return to idle
    setTimeout(() => {
      if (this.armatureDisplay && !this.isDead()) {
        this.playAnimation('idle');
      }
    }, 1000);
  }

  /**
   * Pick random patrol target near spawn
   */
  private pickRandomPatrolTarget(): void {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * this.config.patrolRadius;
    
    this.targetPosition = {
      x: this.spawnPosition.x + Math.cos(angle) * distance,
      y: this.spawnPosition.y + Math.sin(angle) * distance
    };
  }

  /**
   * Set AI state
   */
  private setState(newState: EnemyState): void {
    if (this.state === newState) return;
    
    this.state = newState;
    
    // Play appropriate animation
    switch (newState) {
      case 'idle':
        this.playAnimation('idle'); // Smart resolver will find Idle, idle, Stand, etc.
        break;
      case 'patrol':
      case 'chase':
        // Try to play walk animation, fallback to idle
        if (this.armatureDisplay) {
          const walkAnims = this.dbManager.getAnimationNames(this.armatureDisplay).filter(name => 
            name.toLowerCase().includes('walk') || 
            name.toLowerCase().includes('run') ||
            name.toLowerCase().includes('move')
          );
          if (walkAnims.length > 0) {
            this.playAnimation(walkAnims[0]);
          } else {
            this.playAnimation('idle'); // Smart resolver will find any idle variant
          }
        }
        break;
      case 'dead':
        this.playAnimation('damage'); // Smart resolver will find Damage, damage, Hurt, etc.
        setTimeout(() => {
          this.destroy();
        }, 2000);
        break;
    }
  }

  /**
   * Play animation with smart name resolution
   * Tries multiple variations of the animation name
   */
  private playAnimation(animName: string): void {
    if (this.currentAnimation === animName) return;
    if (!this.armatureDisplay) return;
    
    // Get available animations
    const availableAnims = this.dbManager.getAnimationNames(this.armatureDisplay);
    
    // Try to find matching animation (case-insensitive, flexible matching)
    const animToPlay = this.findBestAnimationMatch(animName, availableAnims);
    
    if (animToPlay) {
      this.currentAnimation = animName;
      this.dbManager.playAnimation(this.armatureDisplay, animToPlay, 0);
    } else {
      // Fallback: just play first available animation
      if (availableAnims.length > 0) {
        this.currentAnimation = animName;
        this.dbManager.playAnimation(this.armatureDisplay, availableAnims[0], 0);
      }
    }
  }

  /**
   * Find best matching animation name from available animations
   * Tries multiple variations: exact, lowercase, uppercase, partial match
   */
  private findBestAnimationMatch(targetName: string, availableAnims: string[]): string | null {
    // 1. Try exact match
    if (availableAnims.includes(targetName)) {
      return targetName;
    }
    
    // 2. Try case-insensitive match
    const lowerTarget = targetName.toLowerCase();
    const caseInsensitive = availableAnims.find(anim => anim.toLowerCase() === lowerTarget);
    if (caseInsensitive) return caseInsensitive;
    
    // 3. Try common variations for specific animations
    if (lowerTarget === 'idle') {
      const idleVariations = ['Idle', 'idle', 'IDLE', 'Stand', 'stand', 'Rest', 'rest'];
      for (const variant of idleVariations) {
        if (availableAnims.includes(variant)) return variant;
      }
    }
    
    if (lowerTarget.includes('walk') || lowerTarget.includes('run')) {
      const walkVariations = ['Walk', 'walk', 'Run', 'run', 'Move', 'move'];
      for (const variant of walkVariations) {
        if (availableAnims.includes(variant)) return variant;
      }
    }
    
    if (lowerTarget.includes('damage') || lowerTarget.includes('hurt') || lowerTarget.includes('hit')) {
      const damageVariations = ['Damage', 'damage', 'Hurt', 'hurt', 'Hit', 'hit', 'Damaged', 'damaged'];
      for (const variant of damageVariations) {
        if (availableAnims.includes(variant)) return variant;
      }
    }
    
    // 4. Try partial match (animation name contains target)
    const partialMatch = availableAnims.find(anim => 
      anim.toLowerCase().includes(lowerTarget)
    );
    if (partialMatch) return partialMatch;
    
    // 5. No match found
    return null;
  }

  /**
   * Update HP and mana bars
   */
  private updateStatBars(): void {
    const barWidth = 50;
    const barHeight = 4;
    const barY = -50;
    
    // HP bar (red)
    this.hpBar.clear();
    this.hpBar.rect(-barWidth / 2, barY, barWidth, barHeight);
    this.hpBar.fill({ color: 0x2C1810 }); // Background
    this.hpBar.rect(-barWidth / 2, barY, barWidth * (this.hp / this.maxHp), barHeight);
    this.hpBar.fill({ color: 0xFF0000 }); // Red HP
    
    // Mana bar (blue)
    this.manaBar.clear();
    this.manaBar.rect(-barWidth / 2, barY + barHeight + 2, barWidth, barHeight);
    this.manaBar.fill({ color: 0x2C1810 }); // Background
    this.manaBar.rect(-barWidth / 2, barY + barHeight + 2, barWidth * (this.mana / this.maxMana), barHeight);
    this.manaBar.fill({ color: 0x0000FF }); // Blue Mana
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    
    // Flash red
    if (this.armatureDisplay) {
      this.armatureDisplay.tint = 0xFF0000;
      setTimeout(() => {
        if (this.armatureDisplay) {
          this.armatureDisplay.tint = 0xFFFFFF;
        }
      }, 100);
    }
    
    // Play damage animation
    this.playAnimation('Damage');
    setTimeout(() => {
      if (this.hp > 0 && this.armatureDisplay) {
        this.playAnimation('Idle');
      }
    }, 500);
    
    console.log(`💥 ${this.characterName} took ${amount} damage! HP: ${this.hp}/${this.maxHp}`);
  }

  /**
   * Helper: Get distance between two points
   */
  private getDistance(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Helper: Normalize vector
   */
  private normalize(vec: Vector2D): Vector2D {
    const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vec.x / length, y: vec.y / length };
  }

  /**
   * Get current position
   */
  getPosition(): Vector2D {
    return { x: this.body.position.x, y: this.body.position.y };
  }

  /**
   * Get HP
   */
  getHp(): number {
    return this.hp;
  }

  /**
   * Get max HP
   */
  getMaxHp(): number {
    return this.maxHp;
  }

  /**
   * Check if dead
   */
  isDead(): boolean {
    return this.state === 'dead';
  }

  /**
   * Destroy enemy
   */
  destroy(): void {
    // Clear any pending animation timers
    if (this.armatureDisplay) {
      this.armatureDisplay.animation.stop();
    }
    
    this.physics.removeBody(this.body);
    this.display.destroy({ children: true });
    
    // Clear references to prevent memory leaks
    this.armatureDisplay = null;
  }
}
