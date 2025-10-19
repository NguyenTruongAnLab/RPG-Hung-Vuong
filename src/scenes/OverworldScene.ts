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
import { ParticleManager } from '../managers/ParticleManager';
import { FilterManager } from '../managers/FilterManager';
import { WeatherManager } from '../managers/WeatherManager';
import { NPCSystem } from '../systems/NPCSystem';
import { DragonBonesManager } from '../core/DragonBonesManager';
import { AssetManager } from '../core/AssetManager';
import { resolveAudioPath } from '../utils/paths';
import testMapData from '../data/maps/test-map.json';

export class OverworldScene extends Scene {
  private physics: PhysicsManager;
  private input: InputManager;
  private eventBus: EventBus;
  private transitionManager: TransitionManager;
  private audioManager: AudioManager;
  private particleManager: ParticleManager;
  private filterManager: FilterManager;
  private weatherManager: WeatherManager;
  private npcSystem: NPCSystem;
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
    this.particleManager = ParticleManager.getInstance();
    this.filterManager = FilterManager.getInstance();
    this.weatherManager = WeatherManager.getInstance();
    this.npcSystem = NPCSystem.getInstance();
    this.sceneManager = sceneManager || null;
  }

  /**
   * Initializes the overworld scene
   */
  async init(): Promise<void> {
    console.log('Initializing OverworldScene...');

    try {
      // Load overworld audio (gracefully fails if audio missing)
      await this.audioManager.load('bgm_overworld', resolveAudioPath('bgm_overworld.wav'), 'music');
      await this.audioManager.load('sfx_menu_select', resolveAudioPath('sfx_menu_select.wav'), 'sfx');

      // Initialize systems
      this.physics.init();
      this.input.init();
      console.log('✅ Physics and Input initialized');

      // Initialize visual effects managers
      await this.particleManager.init(this.app);
      await this.weatherManager.init(this.app);
      this.npcSystem.init(this.app);
      console.log('✅ Particle, Weather, and NPC managers initialized');

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

      // Setup initial weather (light leaves for atmosphere)
      this.weatherManager.setWeather('leaves', this.worldContainer, 'light');
      console.log('✅ Weather system active');

      // Setup NPCs
      this.npcSystem.setWorldContainer(this.worldContainer);
      this.spawnDemoNPCs();

      // Show tutorial if first time
      if (!TutorialOverlay.isComplete()) {
        this.showTutorial();
      }

      // Listen for battle end events
      this.eventBus.on('battle:end', this.onBattleEnd.bind(this));

      console.log('✅ OverworldScene initialized successfully');
      console.log('✅ Controls: WASD/Arrow keys to move, Mouse wheel to zoom');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to initialize OverworldScene:', errorMsg);
      alert(`⚠️ Failed to initialize game:\n${errorMsg}\n\nPlease refresh the page or check the console for details.`);
      throw error;
    }
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
    
    // Try to load and display DragonBones character
    this.loadPlayerAnimation();
    
    // Create fallback visual (circle) in case DragonBones fails to load
    const playerGraphics = new PIXI.Graphics();
    playerGraphics.circle(0, 0, 16).fill(0x0088ff);
    
    this.worldContainer.addChild(playerGraphics);
    
    // Store reference for animation integration
    (this as any).playerGraphics = playerGraphics;
    
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
   * Loads and applies player DragonBones animation
   */
  private async loadPlayerAnimation(): Promise<void> {
    try {
      const assetManager = AssetManager.getInstance();
      const dragonBonesManager = new DragonBonesManager(this.app);
      
      // Load a player character (use Absolution as default player character)
      console.log('📂 Loading player character animation...');
      const asset = await assetManager.loadDragonBonesCharacter('Absolution');
      
      // Create armature display
      const armatureDisplay = dragonBonesManager.createDisplay(asset, asset.armatureName);
      
      if (!armatureDisplay) {
        console.warn('⚠️ Failed to create player armature display');
        return;
      }
      
      // Scale to appropriate size for overworld
      armatureDisplay.scale.x = 0.5;
      armatureDisplay.scale.y = 0.5;
      
      // Replace placeholder circle with DragonBones display
      const playerGraphics = (this as any).playerGraphics;
      if (playerGraphics) {
        try {
          this.worldContainer.removeChild(playerGraphics);
        } catch (e) {
          // Graphics may not be in container, ignore
        }
      }
      
      // Add armature to world
      this.worldContainer.addChild(armatureDisplay);
      
      // Position at player location
      if (this.player) {
        const pos = this.player.getPosition();
        armatureDisplay.x = pos.x;
        armatureDisplay.y = pos.y;
      }
      
      // Update position in ticker
      this.app.ticker.add(() => {
        if (this.player) {
          const pos = this.player.getPosition();
          armatureDisplay.x = pos.x;
          armatureDisplay.y = pos.y;
          this.playerPosition = { x: pos.x, y: pos.y };
        }
      });
      
      // Play idle animation
      if (asset.animations.includes('Idle')) {
        dragonBonesManager.playAnimation(armatureDisplay, 'Idle', 0);
      } else if (asset.animations.length > 0) {
        // Fallback to first available animation
        dragonBonesManager.playAnimation(armatureDisplay, asset.animations[0], 0);
      }
      
      // Integrate with PlayerAnimation component and pass available animations
      this.player.animation.setArmatureDisplay(armatureDisplay, asset.animations);
      
      console.log('✅ Player character loaded:', {
        character: 'Absolution',
        armature: asset.armatureName,
        animations: asset.animations.length,
        available: asset.animations.slice(0, 5).join(', ')
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ Failed to load player animation: ${errorMsg}`);
      console.log('💡 Using placeholder circle fallback');
    }
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

  /**
   * Spawn demo NPCs for testing
   */
  private spawnDemoNPCs(): void {
    // Elder near spawn
    this.npcSystem.createNPC({
      id: 'elder_main',
      name: 'Tộc Trưởng',
      type: 'elder',
      x: 250,
      y: 200,
      dialogue: 'elder_greeting'
    });

    // Merchant in town area
    this.npcSystem.createNPC({
      id: 'merchant_01',
      name: 'Thương Nhân',
      type: 'merchant',
      x: 450,
      y: 350,
      dialogue: 'merchant_intro',
      shopId: 'shop_general'
    });

    // Trainer for battles
    this.npcSystem.createNPC({
      id: 'trainer_01',
      name: 'Chiến Binh',
      type: 'trainer',
      x: 700,
      y: 450,
      dialogue: 'trainer_challenge'
    });

    // Guide character
    this.npcSystem.createNPC({
      id: 'guide_01',
      name: 'Hướng Dẫn Viên',
      type: 'guide',
      x: 150,
      y: 150,
      dialogue: 'guide_help'
    });

    // Villagers for atmosphere
    this.npcSystem.createNPC({
      id: 'villager_01',
      name: 'Dân Làng',
      type: 'villager',
      x: 350,
      y: 250,
      dialogue: 'villager_gossip'
    });

    this.npcSystem.createNPC({
      id: 'villager_02',
      name: 'Dân Làng',
      type: 'villager',
      x: 550,
      y: 200,
      dialogue: 'villager_gossip'
    });

    console.log('✅ Demo NPCs spawned (6 NPCs)');
  }

  update(dt: number): void {
    // Convert dt from milliseconds to seconds for particle/weather systems
    const deltaSeconds = dt / 1000;
    
    // Update player FIRST so movement input is applied before physics step
    if (this.player) {
      const playerPos = this.player.getPosition();
      
      this.player.update(dt, this.input);
      
      // Update camera to follow player
      if (this.camera) {
        this.camera.follow(playerPos);
      }
      
      // Check for encounters
      if (this.encounters) {
        this.encounters.checkPosition(playerPos);
      }
      
      // Update NPC system (proximity checks, interaction indicators)
      this.npcSystem.update(playerPos.x, playerPos.y);
      
      // Update UI
      if (this.ui) {
        this.ui.updateHP(this.player.getHp(), this.player.getMaxHp());
      }
    }
    
    // Update physics AFTER player input so forces are included
    this.physics.update(dt);
    
    // Update visual effects
    this.particleManager.update(deltaSeconds);
    this.weatherManager.update(deltaSeconds);
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
    
    // Cleanup managers
    this.particleManager.cleanup();
    this.weatherManager.clearWeather();
    this.filterManager.cleanup();
    this.npcSystem.clearAll();
    
    // Remove event listeners
    this.eventBus.off('encounter:trigger', this.handleEncounter);
    this.eventBus.off('battle:end', this.onBattleEnd);
    
    // Destroy PIXI containers
    this.worldContainer.destroy({ children: true });
  }
}
