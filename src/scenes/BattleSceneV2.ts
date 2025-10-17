/**
 * BattleSceneV2 - Turn-based battle scene
 * 
 * Implements the battle system with Ngũ Hành (Five Elements) advantages.
 * Handles player vs enemy monster battles with turn-based combat.
 * 
 * @example
 * ```typescript
 * const encounterData = {
 *   enemyMonster: 'char001',
 *   zone: 'forest'
 * };
 * const battleScene = new BattleSceneV2(app, encounterData);
 * await battleScene.init();
 * ```
 */
import * as PIXI from 'pixi.js';
import { Scene, SceneManager } from '../core/SceneManager';
import { EventBus } from '../core/EventBus';
import { TransitionManager } from '../core/TransitionManager';
import { AudioManager } from '../core/AudioManager';
import { ParticleSystem } from '../utils/ParticleSystem';
import { Camera } from '../world/Camera';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { BattleAnimations } from './BattleAnimations';
import gsap from 'gsap';

// Element types for the Five Elements system
export type Element = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

// Element advantages: Kim > Mộc > Thổ > Thủy > Hỏa > Kim
const ELEMENT_ADVANTAGES: Record<Element, Element> = {
  kim: 'moc',
  moc: 'tho',
  tho: 'thuy',
  thuy: 'hoa',
  hoa: 'kim'
};

/**
 * Monster stats interface
 */
export interface MonsterStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

/**
 * Monster interface
 */
export interface Monster {
  id: string;
  name: string;
  element: Element;
  stats: MonsterStats;
  currentHP: number;
  isPlayer: boolean;
}

/**
 * Encounter data passed to battle scene
 */
export interface EncounterData {
  enemyMonsterId?: string;
  zone?: string;
  canEscape?: boolean;
}

/**
 * Attack result interface
 */
export interface AttackResult {
  damage: number;
  advantage: number;
  isCritical: boolean;
  remainingHP: number;
  isKO: boolean;
}

/**
 * BattleSceneV2 - Main battle scene
 */
export class BattleSceneV2 extends Scene {
  private eventBus: EventBus;
  private transitionManager: TransitionManager;
  private audioManager: AudioManager;
  private sceneManager: SceneManager | null = null;
  private encounterData: EncounterData;
  
  // Battle state
  private turn: number = 0;
  private isPlayerTurn: boolean = true;
  private playerMonster: Monster | null = null;
  private enemyMonster: Monster | null = null;
  private battleActive: boolean = true;
  
  // UI elements
  private background: PIXI.Graphics | null = null;
  private playerSprite: PIXI.Graphics | null = null;
  private enemySprite: PIXI.Graphics | null = null;
  private battleText: PIXI.Text | null = null;
  
  // Visual effects
  private particles: ParticleSystem | null = null;
  private camera: Camera | null = null;
  private worldContainer: PIXI.Container | null = null;
  private animations: BattleAnimations | null = null;

  /**
   * Creates a new BattleSceneV2
   * 
   * @param app - The PixiJS application
   * @param encounterData - Data about the encounter
   * @param sceneManager - Optional scene manager for transitions
   */
  constructor(app: PIXI.Application, encounterData: EncounterData = {}, sceneManager?: SceneManager) {
    super(app);
    this.encounterData = encounterData;
    this.eventBus = EventBus.getInstance();
    this.transitionManager = TransitionManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.sceneManager = sceneManager || null;
  }

  /**
   * Initializes the battle scene
   */
  async init(): Promise<void> {
    console.log('Initializing BattleSceneV2...');
    
    // Load battle audio
    await this.audioManager.load('bgm_battle', '/assets/audio/bgm_battle.mp3', 'music');
    await this.audioManager.load('sfx_attack', '/assets/audio/sfx_attack.mp3', 'sfx');
    await this.audioManager.load('sfx_victory', '/assets/audio/sfx_victory.mp3', 'sfx');

    // Create world container for camera
    this.worldContainer = new PIXI.Container();
    this.addChild(this.worldContainer);

    // Setup camera
    this.camera = new Camera(this.worldContainer, this.app.screen.width, this.app.screen.height);
    
    // Create battle UI
    this.createBackground();
    this.createMonsters();
    this.createBattleUI();
    
    // Add particles on top
    this.particles = new ParticleSystem();
    this.worldContainer.addChild(this.particles);

    // Create animation helper
    this.animations = new BattleAnimations(this.particles, this.camera);

    // Play battle music
    this.audioManager.playMusic('bgm_battle', 500);
    
    // Start battle
    this.startBattle();
    
    console.log('BattleSceneV2 initialized');
  }

  /**
   * Creates the battle background
   */
  private createBackground(): void {
    this.background = new PIXI.Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x88aa88); // Green background
    this.worldContainer!.addChild(this.background);
  }

  /**
   * Creates the monster sprites
   */
  private createMonsters(): void {
    // Create player monster (temporary placeholder)
    this.playerMonster = {
      id: 'player_001',
      name: 'Rồng Thần',
      element: 'thuy',
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 20,
        defense: 10,
        speed: 15
      },
      currentHP: 100,
      isPlayer: true
    };

    // Create enemy monster (temporary placeholder)
    const enemyId = this.encounterData.enemyMonsterId || 'char001';
    this.enemyMonster = {
      id: enemyId,
      name: 'Wild Beast',
      element: 'moc',
      stats: {
        hp: 80,
        maxHp: 80,
        attack: 15,
        defense: 8,
        speed: 12
      },
      currentHP: 80,
      isPlayer: false
    };

    // Create player sprite (blue circle)
    this.playerSprite = new PIXI.Graphics();
    this.playerSprite.circle(0, 0, 40);
    this.playerSprite.fill(0x0088ff);
    this.playerSprite.x = 200;
    this.playerSprite.y = this.app.screen.height - 150;
    this.worldContainer!.addChild(this.playerSprite);

    // Create enemy sprite (red circle)
    this.enemySprite = new PIXI.Graphics();
    this.enemySprite.circle(0, 0, 40);
    this.enemySprite.fill(0xff4444);
    this.enemySprite.x = this.app.screen.width - 200;
    this.enemySprite.y = 150;
    this.worldContainer!.addChild(this.enemySprite);
  }

  /**
   * Creates the battle UI
   */
  private createBattleUI(): void {
    // Battle text
    this.battleText = new PIXI.Text({
      text: 'Battle Start!',
      style: {
        fontSize: 24,
        fill: 0xffffff
      }
    });
    this.battleText.x = this.app.screen.width / 2 - this.battleText.width / 2;
    this.battleText.y = this.app.screen.height - 50;
    this.addChild(this.battleText);
  }

  /**
   * Starts the battle
   */
  private startBattle(): void {
    this.turn = 0;
    this.battleActive = true;
    console.log('Battle started!');
    this.eventBus.emit('battle:start', { 
      playerMonster: this.playerMonster,
      enemyMonster: this.enemyMonster
    });
    
    // Auto-attack for demo (will be replaced with player input)
    console.log('Scheduling first turn in 1 second...');
    setTimeout(() => this.executeTurn(), 1000);
  }

  /**
   * Executes a battle turn
   */
  private async executeTurn(): Promise<void> {
    if (!this.battleActive || !this.playerMonster || !this.enemyMonster) {
      console.log('Battle not active or monsters missing');
      return;
    }

    this.turn++;
    console.log(`Turn ${this.turn}`);

    if (this.isPlayerTurn) {
      // Player attacks
      const result = this.attack(this.playerMonster, this.enemyMonster);
      const message = `Player attacks for ${result.damage} damage!`;
      console.log(message);
      this.updateBattleText(message);
      
      // Visual effects
      await this.playAttackAnimation(true);
      
      if (result.isKO) {
        console.log('Enemy defeated!');
        this.endBattle('victory');
        return;
      }
    } else {
      // Enemy attacks
      const result = this.attack(this.enemyMonster, this.playerMonster);
      const message = `Enemy attacks for ${result.damage} damage!`;
      console.log(message);
      this.updateBattleText(message);
      
      // Visual effects
      await this.playAttackAnimation(false);
      
      if (result.isKO) {
        console.log('Player defeated!');
        this.endBattle('defeat');
        return;
      }
    }

    // Switch turn
    this.isPlayerTurn = !this.isPlayerTurn;
    console.log(`Next turn: ${this.isPlayerTurn ? 'Player' : 'Enemy'}`);
    
    // Continue battle
    setTimeout(() => this.executeTurn(), 1500);
  }

  /**
   * Calculates and executes an attack
   * 
   * @param attacker - The attacking monster
   * @param defender - The defending monster
   * @returns Attack result
   */
  private attack(attacker: Monster, defender: Monster): AttackResult {
    let baseDamage = attacker.stats.attack;
    
    // Apply element advantage
    const advantage = this.getElementAdvantage(attacker.element, defender.element);
    baseDamage *= advantage;
    
    // Apply defense
    const finalDamage = Math.max(1, Math.floor(baseDamage - defender.stats.defense / 2));
    
    // Apply damage
    defender.currentHP = Math.max(0, defender.currentHP - finalDamage);
    
    // Check for critical (10% chance)
    const isCritical = Math.random() < 0.1;
    
    return {
      damage: finalDamage,
      advantage: advantage,
      isCritical: isCritical,
      remainingHP: defender.currentHP,
      isKO: defender.currentHP === 0
    };
  }

  /**
   * Gets element advantage multiplier
   * 
   * @param attackerElement - Attacker's element
   * @param defenderElement - Defender's element
   * @returns Damage multiplier
   */
  private getElementAdvantage(attackerElement: Element, defenderElement: Element): number {
    if (ELEMENT_ADVANTAGES[attackerElement] === defenderElement) {
      return 1.5; // Super effective
    } else if (ELEMENT_ADVANTAGES[defenderElement] === attackerElement) {
      return 0.5; // Not very effective
    }
    return 1.0; // Normal damage
  }

  /**
   * Updates the battle text display
   * 
   * @param text - Text to display
   */
  private updateBattleText(text: string): void {
    if (this.battleText) {
      this.battleText.text = text;
    }
  }

  /**
   * Ends the battle
   * 
   * @param result - Battle result ('victory' or 'defeat')
   */
  private async endBattle(result: 'victory' | 'defeat'): Promise<void> {
    this.battleActive = false;
    console.log(`Battle ended: ${result}`);
    
    // Play victory sound
    if (result === 'victory') {
      this.audioManager.playSFX('sfx_victory');
      
      // Award EXP
      const progression = ProgressionSystem.getInstance();
      const enemyLevel = 3; // Could be from enemy monster data
      const expReward = progression.calculateExpReward(enemyLevel, true);
      const leveledUp = progression.addExp(expReward);
      
      if (leveledUp) {
        this.updateBattleText(`Victory! +${expReward} EXP - Level Up!`);
      } else {
        this.updateBattleText(`Victory! +${expReward} EXP`);
      }
    } else {
      this.updateBattleText('Defeat!');
    }
    
    // Emit battle end event
    this.eventBus.emit('battle:end', result);
    
    // Wait a moment
    console.log('Waiting 2 seconds before returning to overworld...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fade out
    console.log('Fading out battle scene...');
    await this.transitionManager.fadeOut(this, 0.5);
    
    // Return to overworld
    if (this.sceneManager) {
      console.log('Loading overworld scene...');
      const { OverworldScene } = await import('./OverworldScene');
      const overworldScene = new OverworldScene(this.app, this.sceneManager);
      await this.sceneManager.switchTo(overworldScene);
      
      // Fade in overworld
      console.log('Fading in overworld scene...');
      await this.transitionManager.fadeIn(overworldScene, 0.5);
    }
  }

  /**
   * Play attack animation
   */
  private async playAttackAnimation(isPlayerAttacking: boolean): Promise<void> {
    if (!this.playerSprite || !this.enemySprite || !this.animations) {
      return;
    }

    const attacker = isPlayerAttacking ? this.playerSprite : this.enemySprite;
    const defender = isPlayerAttacking ? this.enemySprite : this.playerSprite;

    await this.animations.playAttackAnimation(attacker, defender, isPlayerAttacking);
  }

  /**
   * Updates the battle scene
   * 
   * @param dt - Delta time in milliseconds
   */
  update(dt: number): void {
    // Update particles
    if (this.particles) {
      this.particles.update(dt / 16.67); // Convert to 60fps delta
    }
  }

  /**
   * Cleans up the battle scene
   */
  destroy(): void {
    console.log('Destroying BattleSceneV2...');
    
    // Cleanup sprites
    if (this.background) {
      this.background.destroy();
      this.background = null;
    }
    
    if (this.playerSprite) {
      this.playerSprite.destroy();
      this.playerSprite = null;
    }
    
    if (this.enemySprite) {
      this.enemySprite.destroy();
      this.enemySprite = null;
    }
    
    if (this.battleText) {
      this.battleText.destroy();
      this.battleText = null;
    }
    
    // Note: Don't remove event listeners as other scenes need them
  }
}
