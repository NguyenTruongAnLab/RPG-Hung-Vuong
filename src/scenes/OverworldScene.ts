/**
 * OverworldScene - Pokemon-style overworld exploration scene
 * 
 * Main gameplay scene with player movement, tilemap, camera,
 * and encounter system.
 * 
 * @example
 * ```typescript
 * const scene = new OverworldScene(app);
 * await scene.init();
 * ```
 */
import * as PIXI from 'pixi.js';
import { Scene } from '../core/SceneManager';
import { PhysicsManager } from '../core/PhysicsManager';
import { InputManager } from '../core/InputManager';
import { EventBus } from '../core/EventBus';
import { Player } from '../entities/Player';
import { Tilemap } from '../world/Tilemap';
import { TilemapCollision } from '../world/TilemapCollision';
import { TilemapEncounters } from '../world/TilemapEncounters';
import { Camera } from '../world/Camera';
import { OverworldUI } from './OverworldUI';
import testMapData from '../data/maps/test-map.json';

export class OverworldScene extends Scene {
  private physics: PhysicsManager;
  private input: InputManager;
  private eventBus: EventBus;
  private player: Player | null = null;
  private tilemap: Tilemap | null = null;
  private collision: TilemapCollision | null = null;
  private encounters: TilemapEncounters | null = null;
  private camera: Camera | null = null;
  private ui: OverworldUI | null = null;
  private worldContainer: PIXI.Container;

  constructor(app: PIXI.Application) {
    super(app);
    this.worldContainer = new PIXI.Container();
    this.addChild(this.worldContainer);

    // Get singleton instances
    this.physics = PhysicsManager.getInstance();
    this.input = InputManager.getInstance();
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Initializes the overworld scene
   */
  async init(): Promise<void> {
    console.log('Initializing OverworldScene...');

    // Initialize systems
    this.physics.init();
    this.input.init();

    // Create tilemap with placeholder texture
    await this.createTilemap();

    // Create player
    this.createPlayer();

    // Setup camera
    this.setupCamera();

    // Setup collision
    this.setupCollision();

    // Setup encounters
    this.setupEncounters();

    // Create UI
    this.createUI();

    console.log('OverworldScene initialized');
  }

  /**
   * Creates the tilemap
   */
  private async createTilemap(): Promise<void> {
    this.tilemap = new Tilemap();
    
    // Create simple tileset texture (placeholder)
    const graphics = new PIXI.Graphics();
    
    // Tile 1: Gray (wall)
    graphics.rect(0, 0, 32, 32).fill(0x666666);
    
    // Tile 2: Green (grass)
    graphics.rect(32, 0, 32, 32).fill(0x44aa44);
    
    // Tile 3: Brown (dirt)
    graphics.rect(64, 0, 32, 32).fill(0x8B4513);
    
    const tilesetTexture = this.app.renderer.generateTexture(graphics);
    
    // Load test map
    this.tilemap.load(testMapData, tilesetTexture);
    this.worldContainer.addChild(this.tilemap.getContainer());
  }

  /**
   * Creates the player
   */
  private createPlayer(): void {
    // Spawn player at center of map
    const spawnX = 320; // 10 tiles * 32px
    const spawnY = 240; // 7.5 tiles * 32px
    
    this.player = new Player(spawnX, spawnY, this.physics);
    
    // Create player visual (simple circle for now)
    const playerGraphics = new PIXI.Graphics();
    playerGraphics.circle(0, 0, 16).fill(0x0088ff);
    
    this.worldContainer.addChild(playerGraphics);
    
    // Update player graphics position in update loop
    this.app.ticker.add(() => {
      if (this.player) {
        const pos = this.player.getPosition();
        playerGraphics.x = pos.x;
        playerGraphics.y = pos.y;
      }
    });
  }

  /**
   * Sets up the camera system
   */
  private setupCamera(): void {
    this.camera = new Camera(
      this.worldContainer,
      this.app.screen.width,
      this.app.screen.height,
      0.1 // Smooth follow
    );
  }

  /**
   * Sets up collision system
   */
  private setupCollision(): void {
    if (!this.tilemap) return;
    
    this.collision = new TilemapCollision(this.physics);
    this.collision.createOptimized(this.tilemap, 'collision');
  }

  /**
   * Sets up encounter system
   */
  private setupEncounters(): void {
    if (!this.tilemap) return;
    
    this.encounters = new TilemapEncounters(this.tilemap, this.eventBus);
    this.encounters.loadFromLayer('encounters');
    
    // Listen for encounter events
    this.eventBus.on('encounter:trigger', (data) => {
      this.handleEncounter(data);
    });
  }

  /**
   * Handles encounter trigger
   */
  private handleEncounter(data: any): void {
    console.log('Encounter triggered!', data);
    
    if (this.ui) {
      this.ui.showEncounterMessage('Wild Thần Thú appeared!');
    }
    
    // TODO: Transition to battle scene
    // For now, just log
  }

  /**
   * Creates the UI overlay
   */
  private createUI(): void {
    this.ui = new OverworldUI(this.app.screen.width, this.app.screen.height);
    this.addChild(this.ui.getContainer());
    
    // Update HP display
    if (this.player) {
      this.ui.updateHP(this.player.getHp(), this.player.getMaxHp());
    }
  }

  /**
   * Updates the scene
   * 
   * @param dt - Delta time in milliseconds
   */
  update(dt: number): void {
    // Update physics
    this.physics.update(dt);
    
    // Update player
    if (this.player) {
      this.player.update(dt, this.input);
      
      // Update camera to follow player
      if (this.camera) {
        this.camera.follow(this.player.getPosition());
      }
      
      // Check for encounters
      if (this.encounters) {
        this.encounters.checkPosition(this.player.getPosition());
      }
      
      // Update UI
      if (this.ui) {
        this.ui.updateHP(this.player.getHp(), this.player.getMaxHp());
      }
    }
  }

  /**
   * Cleans up the scene
   */
  destroy(): void {
    console.log('Destroying OverworldScene...');
    
    // Cleanup player
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    
    // Cleanup tilemap
    if (this.tilemap) {
      this.tilemap.destroy();
      this.tilemap = null;
    }
    
    // Cleanup collision
    if (this.collision) {
      this.collision.destroy();
      this.collision = null;
    }
    
    // Cleanup UI
    if (this.ui) {
      this.ui.destroy();
      this.ui = null;
    }
    
    // Clear physics
    this.physics.clear();
    
    // Remove event listeners
    this.eventBus.off('encounter:trigger', this.handleEncounter);
    
    // Destroy PIXI containers
    this.worldContainer.destroy({ children: true });
  }
}
