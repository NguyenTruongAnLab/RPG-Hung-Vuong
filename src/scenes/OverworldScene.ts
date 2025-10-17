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
import { Scene, SceneManager } from '../core/SceneManager';
import { PhysicsManager } from '../core/PhysicsManager';
import { InputManager } from '../core/InputManager';
import { EventBus } from '../core/EventBus';
import { TransitionManager } from '../core/TransitionManager';
import { AudioManager } from '../core/AudioManager';
import { Player } from '../entities/Player';
import { Tilemap } from '../world/Tilemap';
import { TilemapCollision } from '../world/TilemapCollision';
import { TilemapEncounters } from '../world/TilemapEncounters';
import { Camera } from '../world/Camera';
import { OverworldUI } from './OverworldUI';
import { BattleSceneV2, EncounterData } from './BattleSceneV2';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import testMapData from '../data/maps/test-map.json';

export class OverworldScene extends Scene {
  private physics: PhysicsManager;
  private input: InputManager;
  private eventBus: EventBus;
  private transitionManager: TransitionManager;
  private audioManager: AudioManager;
  private sceneManager: SceneManager | null = null;
  private player: Player | null = null;
  private tilemap: Tilemap | null = null;
  private collision: TilemapCollision | null = null;
  private encounters: TilemapEncounters | null = null;
  private camera: Camera | null = null;
  private ui: OverworldUI | null = null;
  private worldContainer: PIXI.Container;
  private playerPosition: { x: number; y: number } = { x: 320, y: 240 };
  private tutorial: TutorialOverlay | null = null;

  constructor(app: PIXI.Application, sceneManager?: SceneManager) {
    super(app);
    this.worldContainer = new PIXI.Container();
    this.addChild(this.worldContainer);

    // Get singleton instances
    this.physics = PhysicsManager.getInstance();
    this.input = InputManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.transitionManager = TransitionManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.sceneManager = sceneManager || null;
  }

  /**
   * Initializes the overworld scene
   */
  async init(): Promise<void> {
    console.log('Initializing OverworldScene...');

    // Load overworld audio
    await this.audioManager.load('bgm_overworld', '/assets/audio/bgm_overworld.mp3', 'music');
    await this.audioManager.load('sfx_menu_select', '/assets/audio/sfx_menu_select.mp3', 'sfx');

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

    // Play overworld music
    this.audioManager.playMusic('bgm_overworld', 1000);

    // Show tutorial if first time
    if (!TutorialOverlay.isComplete()) {
      this.showTutorial();
    }

    // Listen for battle end events
    this.eventBus.on('battle:end', this.onBattleEnd.bind(this));

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
    // Use saved position or default spawn
    const spawnX = this.playerPosition.x;
    const spawnY = this.playerPosition.y;
    
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
        // Save position
        this.playerPosition = { x: pos.x, y: pos.y };
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
    
    // Add zoom controls via mouse wheel
    this.setupZoomControls();
  }
  
  /**
   * Sets up zoom controls via mouse wheel
   */
  private setupZoomControls(): void {
    const zoomHandler = (event: WheelEvent) => {
      event.preventDefault();
      
      if (!this.camera) return;
      
      // Get current scale
      const currentScale = this.worldContainer.scale.x;
      
      // Calculate new scale (zoom in/out by 10% per scroll)
      const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.5, Math.min(2.0, currentScale * zoomDelta));
      
      // Apply zoom
      this.camera.zoom(newScale, 0.2);
    };
    
    // Add wheel event listener to canvas
    this.app.canvas.addEventListener('wheel', zoomHandler, { passive: false });
    
    // Store handler for cleanup
    (this as any).zoomHandler = zoomHandler;
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
  private async handleEncounter(data: any): Promise<void> {
    console.log('Encounter triggered!', data);
    
    if (this.ui) {
      this.ui.showEncounterMessage('Wild Thần Thú appeared!');
    }
    
    // Wait a moment to show the message
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fade out
    await this.transitionManager.fadeOut(this, 0.5);
    
    // Switch to battle scene
    if (this.sceneManager) {
      const encounterData: EncounterData = {
        enemyMonsterId: 'char001',
        zone: data.zone || 'unknown',
        canEscape: true
      };
      
      const battleScene = new BattleSceneV2(this.app, encounterData, this.sceneManager);
      await this.sceneManager.switchTo(battleScene);
      
      // Fade in battle scene
      await this.transitionManager.fadeIn(battleScene, 0.5);
    }
  }

  /**
   * Handles battle end event
   */
  private async onBattleEnd(result: 'victory' | 'defeat'): Promise<void> {
    console.log('Battle ended:', result);
    
    if (result === 'victory') {
      console.log('Victory! Returning to overworld...');
    } else {
      console.log('Defeat! Returning to overworld...');
    }
    
    // Return to overworld will be handled by the battle scene
    // transitioning back to a new OverworldScene instance
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
  /**
   * Show tutorial overlay
   */
  private showTutorial(): void {
    this.tutorial = new TutorialOverlay();
    this.addChild(this.tutorial);
    
    this.tutorial.on('tutorial-complete', () => {
      if (this.tutorial) {
        this.removeChild(this.tutorial);
        this.tutorial = null;
      }
    });
  }

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
    
    // Remove zoom handler
    if ((this as any).zoomHandler) {
      this.app.canvas.removeEventListener('wheel', (this as any).zoomHandler);
    }
    
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
    this.eventBus.off('battle:end', this.onBattleEnd);
    
    // Destroy PIXI containers
    this.worldContainer.destroy({ children: true });
  }
}
