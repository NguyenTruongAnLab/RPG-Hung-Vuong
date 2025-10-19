/**
 * WildEncounterSystem - Manages wild Thần Thú spawning and encounters
 * 
 * Handles random spawning of wild creatures in the overworld and
 * triggering battles when the player collides with them.
 * 
 * @example
 * ```typescript
 * const wildSystem = new WildEncounterSystem(eventBus, physics);
 * await wildSystem.init(app);
 * 
 * // In update loop
 * wildSystem.update(playerPos);
 * ```
 */
import * as PIXI from 'pixi.js';
import { EventBus } from '../core/EventBus';
import { PhysicsManager } from '../core/PhysicsManager';
import { Vector2D } from '../utils/Vector2D';
import { MonsterDatabase } from '../data/MonsterDatabaseWrapper';
import Matter from 'matter-js';
import { createCircleBody } from '../utils/MatterHelpers';

export interface WildCreature {
  id: string;
  monsterId: string;
  level: number;
  position: Vector2D;
  body: Matter.Body;
  display: PIXI.Container;
  health: number;
  maxHealth: number;
}

export class WildEncounterSystem {
  private eventBus: EventBus;
  private physics: PhysicsManager;
  private creatures: Map<string, WildCreature> = new Map();
  private spawnZones: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    encounterRate: number;
    allowedMonsterIds: string[];
  }> = [];
  private timeSinceLastSpawn: number = 0;
  private spawnCheckInterval: number = 1500; // ms between spawn checks (faster spawning)
  private maxCreaturesActive: number = 15; // More creatures visible at once
  private worldContainer: PIXI.Container | null = null;
  private lastPlayerPos: Vector2D | null = null;
  private collisionCheckRadius: number = 100; // pixels for collision with wild creature

  constructor(eventBus: EventBus, physics: PhysicsManager) {
    this.eventBus = eventBus;
    this.physics = physics;
  }

  /**
   * Initialize the wild encounter system
   * 
   * @param app - PixiJS application
   * @param worldContainer - World container for adding creature displays
   */
  public async init(app: PIXI.Application, worldContainer: PIXI.Container): Promise<void> {
    this.worldContainer = worldContainer;
    
    // Setup default spawn zones across the map
    this.setupDefaultSpawnZones();
    
    console.log('✅ WildEncounterSystem initialized');
  }

  /**
   * Sets up default spawn zones across the map
   * These are areas where wild Thần Thú can spawn
   */
  private setupDefaultSpawnZones(): void {
    const monsterDb = MonsterDatabase.getInstance();
    const allMonsters = monsterDb.getAllMonsters();
    const waterMonsters = allMonsters.filter(m => m.element === 'Thủy').map(m => m.id);
    const fireMonsters = allMonsters.filter(m => m.element === 'Hỏa').map(m => m.id);
    const metalMonsters = allMonsters.filter(m => m.element === 'Kim').map(m => m.id);
    const woodMonsters = allMonsters.filter(m => m.element === 'Mộc').map(m => m.id);
    const earthMonsters = allMonsters.filter(m => m.element === 'Thổ').map(m => m.id);

    // New large map is 200x150 tiles = 6400x4800 pixels
    // Player spawns at (1280, 960)
    // Create spawn zones for different areas across the large explorable world
    this.spawnZones = [
      // ⭐ STARTER AREA near player spawn (1280, 960) - Mixed common creatures
      { x: 1000, y: 700, width: 600, height: 600, encounterRate: 0.20, allowedMonsterIds: allMonsters.filter(m => m.rarity === 'common').map(m => m.id) },
      
      // Lake area (top-left) - Water creatures
      { x: 300, y: 300, width: 500, height: 500, encounterRate: 0.15, allowedMonsterIds: waterMonsters },
      
      // Mountain area (top-right) - Fire/Metal creatures
      { x: 1800, y: 200, width: 600, height: 600, encounterRate: 0.15, allowedMonsterIds: fireMonsters.concat(metalMonsters) },
      
      // Forest area (center) - Wood/Earth creatures
      { x: 900, y: 600, width: 700, height: 500, encounterRate: 0.12, allowedMonsterIds: woodMonsters.concat(earthMonsters) },
      
      // Grassland (bottom-left) - Mixed creatures
      { x: 200, y: 1200, width: 800, height: 600, encounterRate: 0.12, allowedMonsterIds: allMonsters.map(m => m.id) },
      
      // Deep forest (bottom-right) - Rare creatures
      { x: 1600, y: 1300, width: 700, height: 500, encounterRate: 0.10, allowedMonsterIds: allMonsters.filter(m => m.rarity === 'rare' || m.rarity === 'epic').map(m => m.id).length > 0 ? allMonsters.filter(m => m.rarity === 'rare' || m.rarity === 'epic').map(m => m.id) : fireMonsters.concat(metalMonsters) }
    ];

    console.log(`📍 Setup ${this.spawnZones.length} spawn zones including starter area near (1280, 960)`);
  }

  /**
   * Update the wild encounter system
   * Spawns new creatures and checks for collisions
   * 
   * @param playerPos - Player position
   * @param deltaMs - Delta time in milliseconds
   */
  public update(playerPos: Vector2D, deltaMs: number = 16): void {
    // Track time for spawning
    this.timeSinceLastSpawn += deltaMs;
    this.lastPlayerPos = playerPos;

    // Spawn new creatures periodically
    if (this.timeSinceLastSpawn > this.spawnCheckInterval) {
      this.timeSinceLastSpawn = 0;
      this.trySpawnCreature(playerPos);
    }

    // Check for collisions with wild creatures
    this.checkPlayerCollisions(playerPos);

    // Update creature displays
    this.updateCreatureDisplays();

    // Despawn creatures that are too far away
    this.despawnDistantCreatures(playerPos);
  }

  /**
   * Tries to spawn a new wild creature
   */
  private trySpawnCreature(playerPos: Vector2D): void {
    if (this.creatures.size >= this.maxCreaturesActive) {
      return; // Max creatures reached
    }

    // Pick a random spawn zone
    const zone = this.spawnZones[Math.floor(Math.random() * this.spawnZones.length)];
    if (!zone.allowedMonsterIds.length) {
      return;
    }

    // Check if zone spawn rolls successfully
    if (Math.random() > zone.encounterRate) {
      return;
    }

    // Pick a random monster from the zone's allowed list
    const monsterId = zone.allowedMonsterIds[Math.floor(Math.random() * zone.allowedMonsterIds.length)];
    const monsterDb = MonsterDatabase.getInstance();
    const monsterData = monsterDb.getMonsterById(monsterId);

    if (!monsterData) {
      console.warn(`Monster ${monsterId} not found in database`);
      return;
    }

    // Random level between 3-25
    const level = Math.floor(Math.random() * 23) + 3;

    // Random spawn point in zone (away from player)
    let spawnX: number;
    let spawnY: number;
    let distanceFromPlayer: number;
    
    // Ensure spawn is at least 200 pixels away from player
    do {
      spawnX = zone.x + Math.random() * zone.width;
      spawnY = zone.y + Math.random() * zone.height;
      const dx = spawnX - playerPos.x;
      const dy = spawnY - playerPos.y;
      distanceFromPlayer = Math.sqrt(dx * dx + dy * dy);
    } while (distanceFromPlayer < 200);

    // Create physics body
    const body = createCircleBody(spawnX, spawnY, 16, {
      label: 'wild-creature',
      friction: 0,
      frictionAir: 0.02,
      density: 0.5,
      isStatic: false
    });

    this.physics.addBody(body);

    // Create display (simple circle for now, can be replaced with sprites/animations)
    const display = new PIXI.Container();
    const circle = new PIXI.Graphics();
    
    // Color based on element
    const elementColors: Record<string, number> = {
      'Thủy': 0x0099ff, // Blue
      'Hỏa': 0xff6600,  // Orange
      'Kim': 0xcccccc,  // Silver
      'Mộc': 0x00cc00,  // Green
      'Thổ': 0x996633   // Brown
    };
    
    const color = elementColors[monsterData.element] || 0xffffff;
    circle.circle(0, 0, 12);
    circle.fill(color);
    circle.stroke({ color: 0xffffff, width: 2 });
    
    display.addChild(circle);
    display.x = spawnX;
    display.y = spawnY;

    if (this.worldContainer) {
      this.worldContainer.addChild(display);
    }

    // Add level label
    const label = new PIXI.Text(level.toString(), {
      fontSize: 10,
      fill: 0xffffff,
      align: 'center'
    });
    label.anchor.set(0.5);
    label.y = -5;
    display.addChild(label);

    // Create creature record
    const creatureId = `wild_${Date.now()}_${Math.random()}`;
    const maxHp = Math.floor(20 + level * 2);
    
    const creature: WildCreature = {
      id: creatureId,
      monsterId,
      level,
      position: { x: spawnX, y: spawnY },
      body,
      display,
      health: maxHp,
      maxHealth: maxHp
    };

    this.creatures.set(creatureId, creature);
    console.log(`🎯 Spawned wild ${monsterData.name} (Level ${level}) at ${spawnX.toFixed(0)}, ${spawnY.toFixed(0)}`);
  }

  /**
   * Checks for collisions between player and wild creatures
   */
  private checkPlayerCollisions(playerPos: Vector2D): void {
    for (const [creatureId, creature] of this.creatures) {
      const dx = creature.position.x - playerPos.x;
      const dy = creature.position.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Collision if within collision radius
      if (distance < this.collisionCheckRadius) {
        this.triggerWildEncounter(creature);
        // Remove creature after encounter
        this.removeCreature(creatureId);
        break; // Only one encounter at a time
      }
    }
  }

  /**
   * Triggers a wild encounter battle
   */
  private triggerWildEncounter(creature: WildCreature): void {
    const monsterDb = MonsterDatabase.getInstance();
    const monsterData = monsterDb.getMonsterById(creature.monsterId);

    if (!monsterData) {
      return;
    }

    console.log(`⚔️ Wild encounter triggered! Encountered ${monsterData.name} Level ${creature.level}`);

    this.eventBus.emit('wild-encounter:trigger', {
      wildCreature: {
        monsterId: creature.monsterId,
        name: monsterData.name,
        level: creature.level,
        health: creature.health,
        maxHealth: creature.maxHealth,
        element: monsterData.element
      }
    });
  }

  /**
   * Updates creature display positions from physics bodies
   */
  private updateCreatureDisplays(): void {
    for (const creature of this.creatures.values()) {
      creature.position = {
        x: creature.body.position.x,
        y: creature.body.position.y
      };
      creature.display.x = creature.position.x;
      creature.display.y = creature.position.y;
    }
  }

  /**
   * Despawns creatures that are too far from the player
   */
  private despawnDistantCreatures(playerPos: Vector2D): void {
    const despawnDistance = 600; // pixels

    for (const [creatureId, creature] of this.creatures) {
      const dx = creature.position.x - playerPos.x;
      const dy = creature.position.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > despawnDistance) {
        this.removeCreature(creatureId);
      }
    }
  }

  /**
   * Removes a creature from the world
   */
  private removeCreature(creatureId: string): void {
    const creature = this.creatures.get(creatureId);
    if (!creature) {
      return;
    }

    // Remove physics body
    this.physics.removeBody(creature.body);

    // Remove display
    if (creature.display.parent) {
      creature.display.parent.removeChild(creature.display);
    }
    creature.display.destroy({ children: true });

    // Remove from map
    this.creatures.delete(creatureId);
  }

  /**
   * Gets all active wild creatures
   * @returns Array of wild creatures
   */
  public getCreatures(): WildCreature[] {
    return Array.from(this.creatures.values());
  }

  /**
   * Gets creature count
   * @returns Number of active creatures
   */
  public getCreatureCount(): number {
    return this.creatures.size;
  }

  /**
   * Clears all creatures
   */
  public clear(): void {
    for (const [creatureId] of this.creatures) {
      this.removeCreature(creatureId);
    }
  }

  /**
   * Sets spawn check interval
   * @param interval - Interval in milliseconds
   */
  public setSpawnInterval(interval: number): void {
    this.spawnCheckInterval = Math.max(1000, interval);
  }

  /**
   * Sets max active creatures
   * @param max - Maximum number of creatures
   */
  public setMaxCreatures(max: number): void {
    this.maxCreaturesActive = Math.max(1, max);
  }
}
