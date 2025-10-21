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
import Matter from 'matter-js';
import gsap from 'gsap';
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
import { ParallaxBackground } from '../world/ParallaxBackground';
import { OverworldUI } from './OverworldUI';
import { BattleSceneV2, EncounterData } from './BattleSceneV2';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { ParticleManager } from '../managers/ParticleManager';
import { FilterManager } from '../managers/FilterManager';
import { WeatherManager } from '../managers/WeatherManager';
import { NPCSystem } from '../systems/NPCSystem';
import { WildEncounterSystem } from '../systems/WildEncounterSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ToolDurability } from '../systems/ToolDurability';
import { DialogueSystem } from '../systems/DialogueSystem';
import { QuestSystem } from '../systems/QuestSystem';
import { QuestLog } from '../ui/QuestLog';
import { Enemy } from '../entities/Enemy.js';
import { DragonBonesManager } from '../core/DragonBonesManager';
import { AssetManager } from '../core/AssetManager';
import { MonsterDatabase } from '../data/MonsterDatabaseWrapper';
import { resolveAudioPath } from '../utils/paths';
import { ALL_SAMPLE_QUESTS } from '../data/sampleQuests';
import overworldMapData from '../data/maps/overworld-map.json';

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
  private wildEncounters: WildEncounterSystem;
  private weaponSystem: WeaponSystem;
  private combatSystem: CombatSystem;
  private collisionSystem: CollisionSystem;
  private toolDurability: ToolDurability;
  private dialogueSystem: DialogueSystem;
  private questSystem: QuestSystem;
  private questLog: QuestLog | null = null;
  private enemies: Enemy[] = [];
  private sceneManager: SceneManager | null = null;
  private player: Player | null = null;
  private playerDisplay: PIXI.Container | null = null;
  private tilemap: Tilemap | null = null;
  private collision: TilemapCollision | null = null;
  private encounters: TilemapEncounters | null = null;
  private camera: Camera | null = null;
  private parallaxBg: ParallaxBackground | null = null;
  private ui: OverworldUI | null = null;
  private worldContainer: PIXI.Container;
  private playerPosition: { x: number; y: number } = { x: 640, y: 400 }; // Safe spawn position away from borders
  private tutorial: TutorialOverlay | null = null;
  private isDestroying: boolean = false; // Flag to prevent update during destruction

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
    this.wildEncounters = new WildEncounterSystem(this.eventBus, this.physics);
    this.weaponSystem = new WeaponSystem(this.eventBus);
    this.combatSystem = new CombatSystem(this.physics, this.eventBus);
    this.collisionSystem = new CollisionSystem(this.physics, this.eventBus);
    this.toolDurability = new ToolDurability(app, this.eventBus);
    this.dialogueSystem = DialogueSystem.getInstance();
    this.questSystem = QuestSystem.getInstance();
    this.sceneManager = sceneManager || null;
  }

  /**
   * Initializes the overworld scene
   */
  async init(): Promise<void> {
    console.log('✅ OverworldScene.init() STARTED - Player movement ready');
    console.log('====================================');

    // Recreate worldContainer if destroyed
    if (!this.worldContainer || this.worldContainer.destroyed) {
      console.log('🔄 Recreating destroyed worldContainer...');
      this.worldContainer = new PIXI.Container();
      this.addChild(this.worldContainer);
    }

    // CRITICAL: Ensure canvas has focus for keyboard input
    // Canvas must be focused for window.addEventListener to work
    this.app.canvas.setAttribute('tabindex', '0');
    this.app.canvas.focus();
    console.log('✅ Canvas focused (OverworldScene) - keyboard input should work now');
    console.log(`ℹ️ Canvas focused: ${document.activeElement === this.app.canvas ? 'YES' : 'NO'}`);
    
    // Add listener to verify focus changes
    this.app.canvas.addEventListener('focus', () => {
      console.log('✅ OverworldScene: Canvas regained focus');
    });
    
    this.app.canvas.addEventListener('blur', () => {
      console.log('⚠️ OverworldScene: Canvas lost focus');
    });

    try {
      // Load overworld audio (gracefully fails if audio missing)
      await this.audioManager.load('bgm_overworld', resolveAudioPath('bgm_overworld.wav'), 'music');
      await this.audioManager.load('sfx_menu_select', resolveAudioPath('sfx_menu_select.wav'), 'sfx');

      // Initialize systems
      this.physics.init();
      this.input.init();
      console.log('✅ Physics and Input initialized');
      
      // Initialize collision system (CRITICAL for collisions to work!)
      this.collisionSystem.init();
      console.log('✅ Collision system initialized - collision events will now fire');

      // Initialize transition manager (REQUIRED for scene transitions!)
      this.transitionManager.init(this.app);
      console.log('✅ TransitionManager initialized - scene transitions ready');

      // Initialize visual effects managers
      await this.particleManager.init(this.app);
      await this.weatherManager.init(this.app);
      this.npcSystem.init(this.app);
      console.log('✅ Particle, Weather, and NPC managers initialized');

      // Initialize combat systems
      this.combatSystem.init();
      this.dialogueSystem.init(this.app);
      console.log('✅ Combat and Dialogue systems initialized');

      // Create tilemap with placeholder texture
      await this.createTilemap();

      // Add parallax background BEFORE tilemap
      this.parallaxBg = new ParallaxBackground(this.app, 'landscape');
      this.worldContainer.addChildAt(this.parallaxBg.getContainer(), 0);
      console.log('✅ Parallax background added to overworld');

      // Create player
      this.createPlayer();

      // Setup camera
      this.setupCamera();

      // Setup collision
      this.setupCollision();

      // Setup encounters
      this.setupEncounters();

      // Initialize wild encounter system
      await this.wildEncounters.init(this.app, this.worldContainer);

      // Create UI
      this.createUI();

      // Play overworld music
      this.audioManager.playMusic('bgm_overworld', 1000);

      // Setup initial weather (light leaves for atmosphere)
      // TODO: WeatherManager has a PropertyList.intValueComplex error - disable for now
      // this.weatherManager.setWeather('leaves', this.worldContainer, 'light');
      console.log('✅ Weather system disabled (fixing emitter validation error)');

      // Setup NPCs
      this.npcSystem.setWorldContainer(this.worldContainer);
      this.spawnDemoNPCs();
      
      // Initialize sample quests
      this.initializeSampleQuests();

      // Setup Enemies
      await this.spawnDemoEnemies();
      
      // Setup enemy collision detection (Pokemon-style battle trigger)
      console.log('🔧 About to setup enemy collisions...');
      try {
        this.setupEnemyCollisions();
        console.log('✅ setupEnemyCollisions() completed');
      } catch (error) {
        console.error('❌ setupEnemyCollisions() failed:', error);
      }

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
    
    // Load large overworld map (80x60 tiles = 2560x1920 pixels)
    this.tilemap.load(overworldMapData, tilesetTexture);
    this.worldContainer.addChild(this.tilemap.getContainer());
    console.log('✅ Loaded large overworld map (80x60 tiles) for exploration');
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
    
    // Store reference for update loop (CRITICAL: update() references this.playerDisplay)
    this.playerDisplay = playerGraphics;
  }

  /**
   * Loads and applies player DragonBones animation
   */
  private async loadPlayerAnimation(): Promise<void> {
    try {
      const assetManager = AssetManager.getInstance();
      const dragonBonesManager = new DragonBonesManager(this.app);
      
      // Load selected player character from localStorage, or default to Absolution
      console.log('📂 Loading player character animation...');
      const selectedPartyJson = localStorage.getItem('playerParty');
      const selectedCharacter = selectedPartyJson 
        ? JSON.parse(selectedPartyJson)[0]  // Get first selected character
        : 'Absolution';  // Fallback to Absolution
      
      console.log(`� Loading selected character: ${selectedCharacter}`);
      const asset = await assetManager.loadDragonBonesCharacter(selectedCharacter);
      
      // Create armature display
      const armatureDisplay = dragonBonesManager.createDisplay(asset, asset.armatureName);
      
      if (!armatureDisplay) {
        console.warn('⚠️ Failed to create player armature display');
        return;
      }
      
      // Remove placeholder circle with DragonBones display
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
      
      // Add player name label (GREEN for player vs RED for enemies)
      const nameText = new PIXI.Text({
        text: '👤 YOU',
        style: {
          fontFamily: 'Arial',
          fontSize: 14,
          fill: 0x00FF00, // Bright green for player
          fontWeight: 'bold',
          stroke: { color: 0x000000, width: 3 }
        }
      });
      nameText.anchor.set(0.5, 1);
      nameText.y = -60;
      armatureDisplay.addChild(nameText);
      
      // Store reference for update loop to sync position
      this.playerDisplay = armatureDisplay;
      
      // Position at player location
      if (this.player) {
        const pos = this.player.getPosition();
        armatureDisplay.x = pos.x;
        armatureDisplay.y = pos.y;
      }
      
      // Play idle animation
      if (asset.animations.includes('Idle')) {
        dragonBonesManager.playAnimation(armatureDisplay, 'Idle', 0);
      } else if (asset.animations.length > 0) {
        // Fallback to first available animation
        dragonBonesManager.playAnimation(armatureDisplay, asset.animations[0], 0);
      }
      
      // Integrate with PlayerAnimation component and pass available animations
      // NOTE: PlayerAnimation.setArmatureDisplay() will apply uniform 0.35 scale
      this.player.animation.setArmatureDisplay(armatureDisplay, asset.animations);
      
      console.log('✅ Player character loaded:', {
        character: selectedCharacter,
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
    
    // Create collision bodies from tilemap
    this.collision.createOptimized(this.tilemap, 'collision');
    
    // Get map dimensions to create boundary walls
    const mapWidth = this.tilemap.getWidth();
    const mapHeight = this.tilemap.getHeight();
    
    console.log(`🗺️ Map size: ${mapWidth}x${mapHeight} pixels`);
    console.log(`📦 Total physics bodies: ${this.physics.getAllBodies().length}`);
    
    // Create boundary walls around the map to prevent characters from falling off
    this.collision.createBoundaries(mapWidth, mapHeight);
    
    console.log(`✅ Collision system ready with ${this.physics.getAllBodies().length} bodies`);
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
    
    // Listen for wild encounter events
    this.eventBus.on('wild-encounter:trigger', (data) => {
      this.handleWildEncounter(data);
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
   * Handles wild encounter trigger
   */
  private async handleWildEncounter(data: any): Promise<void> {
    const wildCreature = data.wildCreature;
    console.log('Wild encounter triggered!', wildCreature);
    
    if (this.ui) {
      this.ui.showEncounterMessage(`Wild ${wildCreature.name} (Lv. ${wildCreature.level}) appeared!`);
    }
    
    // Wait a moment to show the message
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fade out
    await this.transitionManager.fadeOut(this, 0.5);
    
    // Switch to battle scene with the wild creature
    if (this.sceneManager) {
      const encounterData: EncounterData = {
        enemyMonsterId: wildCreature.monsterId,
        zone: 'wild',
        canEscape: true
      };
      
      const battleScene = new BattleSceneV2(this.app, encounterData, this.sceneManager);
      await this.sceneManager.switchTo(battleScene);
      
      // Fade in battle scene
      await this.transitionManager.fadeIn(battleScene, 0.5);
    }
  }

  /**
   * Creates the UI overlay
   */
  private createUI(): void {
    this.ui = new OverworldUI(this.app.screen.width, this.app.screen.height);
    this.addChild(this.ui.getContainer());
    
    // Create quest log
    this.questLog = new QuestLog(450, 550);
    this.addChild(this.questLog.getContainer());
    
    // Update HP display
    if (this.player) {
      this.ui.updateHP(this.player.getHp(), this.player.getMaxHp());
    }
    
    // Register player in combat system
    if (this.player) {
      this.combatSystem.registerEntity(
        'player',
        this.player.getBody(),
        this.player.getHp(),
        this.player.getMaxHp()
      );
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
   * Handle keyboard shortcuts
   */
  private handleKeyboardShortcuts(): void {
    // Toggle quest log with Q key
    if (this.input.isKeyDown('q') && this.questLog) {
      this.questLog.toggle();
      
      // Update quest log if opened
      if (this.questLog.getContainer().visible) {
        const activeQuests = this.questSystem.getActiveQuests();
        this.questLog.updateQuests(activeQuests);
      }
    }
    
    // Skip dialogue with Space
    if (this.input.isKeyDown(' ') && this.dialogueSystem.isDialogueActive()) {
      this.dialogueSystem.skipTypewriter();
      this.eventBus.emit('dialogue:continue');
    }
    
    // Dodge roll with Shift + direction
    if (this.input.isKeyDown('shift') && this.player) {
      const moveVector = this.input.getMovementVector();
      if (moveVector.x !== 0 || moveVector.y !== 0) {
        // Normalize direction
        const length = Math.sqrt(moveVector.x * moveVector.x + moveVector.y * moveVector.y);
        const direction = {
          x: moveVector.x / length,
          y: moveVector.y / length
        };
        this.combatSystem.dodgeRoll('player', direction);
      }
    }
    
    // Block with B key
    if (this.input.isKeyDown('b')) {
      this.combatSystem.startBlock('player');
    }
  }

  /**
   * Spawn demo NPCs for testing
   * Player spawns at (1280, 960), so place NPCs nearby
   */
  private spawnDemoNPCs(): void {
    // Elder near player spawn
    this.npcSystem.createNPC({
      id: 'elder_main',
      name: 'Tộc Trưởng',
      type: 'elder',
      x: 1200,
      y: 900,
      dialogue: 'elder_greeting'
    });

    // Merchant near player spawn
    this.npcSystem.createNPC({
      id: 'merchant_01',
      name: 'Thương Nhân',
      type: 'merchant',
      x: 1350,
      y: 950,
      dialogue: 'merchant_intro',
      shopId: 'shop_general'
    });

    // Trainer for battles
    this.npcSystem.createNPC({
      id: 'trainer_01',
      name: 'Chiến Binh',
      type: 'trainer',
      x: 1280,
      y: 800,
      dialogue: 'trainer_challenge'
    });

    // Guide character (close to player)
    this.npcSystem.createNPC({
      id: 'guide_01',
      name: 'Hướng Dẫn Viên',
      type: 'guide',
      x: 1150,
      y: 1000,
      dialogue: 'guide_help'
    });

    // Villagers for atmosphere
    this.npcSystem.createNPC({
      id: 'villager_01',
      name: 'Dân Làng',
      type: 'villager',
      x: 1400,
      y: 900,
      dialogue: 'villager_gossip'
    });

    this.npcSystem.createNPC({
      id: 'villager_02',
      name: 'Dân Làng',
      type: 'villager',
      x: 1200,
      y: 1050,
      dialogue: 'villager_gossip'
    });

    console.log(`✅ Demo NPCs spawned (6 NPCs) near player spawn (${this.playerPosition.x}, ${this.playerPosition.y})`);
  }
  
  /**
   * Initialize sample quests
   */
  private initializeSampleQuests(): void {
    console.log('Initializing sample quests...');
    
    // Add all sample quests to quest system
    for (const quest of ALL_SAMPLE_QUESTS) {
      this.questSystem.addQuest(quest);
    }
    
    // Automatically start tutorial quest
    const tutorialQuest = ALL_SAMPLE_QUESTS.find(q => q.id === 'tutorial_001');
    if (tutorialQuest) {
      this.questSystem.startQuest(tutorialQuest.id);
    }
    
    console.log(`✅ Initialized ${ALL_SAMPLE_QUESTS.length} sample quests`);
  }

  /**
   * Spawn demo enemies for testing
   * Player spawns at (1280, 960), so place enemies around the area
   */
  private async spawnDemoEnemies(): Promise<void> {
    // Array of available DragonBones characters
    const characterPool = [
      'Absolution', 'Agravain', 'Alfadriel', 'AncientAutomaton', 'ApexB'
    ];
    
    // Spawn 5 enemies around the player spawn area
    const enemyConfigs = [
      { x: 1000, y: 800, character: characterPool[0] },
      { x: 1500, y: 900, character: characterPool[1] },
      { x: 1100, y: 1100, character: characterPool[2] },
      { x: 1400, y: 750, character: characterPool[3] },
      { x: 950, y: 1000, character: characterPool[4] }
    ];
    
    for (const config of enemyConfigs) {
      try {
        const enemy = new Enemy(
          config.x,
          config.y,
          config.character,
          this.physics,
          this.worldContainer,
          this.app,
          {
            maxHp: 80,
            maxMana: 40,
            moveSpeed: 1500, // 75% of player speed (2000 * 0.75), 10x faster for responsive gameplay
            attackRange: 80,
            detectionRange: 250,
            attackCooldown: 2000,
            patrolRadius: 100
          }
        );
        
        await enemy.init();
        this.enemies.push(enemy);
        
        console.log(`✅ Enemy spawned: ${config.character} at (${config.x}, ${config.y})`);
      } catch (error) {
        console.error(`Failed to spawn enemy ${config.character}:`, error);
      }
    }
    
    console.log(`✅ Demo enemies spawned (${this.enemies.length} enemies)`);
  }
  
  /**
   * Setup enemy collision detection for Pokemon-style battle triggers
   * When player touches an enemy, start a battle
   */
  private setupEnemyCollisions(): void {
    console.log('🔧🔧🔧 setupEnemyCollisions() CALLED 🔧🔧🔧');
    
    const engine = this.physics.getEngine();
    
    console.log(`🔧 Engine is: ${engine ? 'VALID' : 'NULL'}`);
    
    if (!engine) {
      console.error('❌❌❌ Cannot setup enemy collisions: Physics engine is null! ❌❌❌');
      return;
    }
    
    console.log('🔧 Setting up enemy collision detection...');
    console.log(`   Engine has ${engine.world.bodies.length} bodies`);
    console.log(`   Engine.enableSleeping: ${engine.enableSleeping}`);
    console.log(`   Engine.detector type: ${engine.detector?.constructor?.name}`);
    
    // Find player and enemy bodies for debugging
    const playerBody = engine.world.bodies.find(b => b.label === 'player');
    const enemyBodies = engine.world.bodies.filter(b => b.label?.startsWith('enemy_'));
    
    console.log(`   Found player body: ${playerBody ? 'YES' : 'NO'}`);
    console.log(`   Found ${enemyBodies.length} enemy bodies`);
    
    if (playerBody) {
      console.log(`   Player collision filter: category=${playerBody.collisionFilter.category}, mask=${playerBody.collisionFilter.mask}`);
      console.log(`   Player isSensor: ${playerBody.isSensor}, isStatic: ${playerBody.isStatic}`);
      
      // ⚡ FORCE player body to be awake
      Matter.Sleeping.set(playerBody, false);
    }
    
    if (enemyBodies.length > 0) {
      console.log(`   First enemy collision filter: category=${enemyBodies[0].collisionFilter.category}, mask=${enemyBodies[0].collisionFilter.mask}`);
      console.log(`   First enemy isSensor: ${enemyBodies[0].isSensor}, isStatic: ${enemyBodies[0].isStatic}`);
      
      // ⚡ FORCE all enemy bodies to be awake
      enemyBodies.forEach(body => {
        Matter.Sleeping.set(body, false);
      });
    }
    
    console.log(`   Engine pairs count BEFORE manual update: ${engine.pairs ? engine.pairs.list.length : 'N/A'}`);
    
    // ⚡ FORCE a physics update to generate collision pairs
    Matter.Engine.update(engine, 16);
    
    console.log(`   Engine pairs count AFTER manual update: ${engine.pairs ? engine.pairs.list.length : 'N/A'}`);
    
    // Listen for collision events from Matter.js physics engine
    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      // Log ALL collisions for debugging
      console.log(`🔍🔍🔍 [setupEnemyCollisions] Detected ${pairs.length} collision pair(s) 🔍🔍🔍`);
      
      for (const pair of pairs) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        console.log(`🔍 [setupEnemyCollisions] ${bodyA.label} <-> ${bodyB.label}`);
        
        // Check if collision involves player and an enemy
        const isPlayerA = bodyA.label === 'player';
        const isPlayerB = bodyB.label === 'player';
        const isEnemyA = bodyA.label?.startsWith('enemy_');
        const isEnemyB = bodyB.label?.startsWith('enemy_');
        
        if ((isPlayerA && isEnemyB) || (isPlayerB && isEnemyA)) {
          // Player touched an enemy - trigger battle!
          const enemyBody = isEnemyA ? bodyA : bodyB;
          const enemyName = enemyBody.label.replace('enemy_', '');
          
          console.log(`⚔️ BATTLE START! Player encountered ${enemyName}!`);
          
          // Trigger battle with this enemy
          this.startEnemyBattle(enemyName);
          
          // Remove the enemy from overworld (they're in battle now)
          const enemyIndex = this.enemies.findIndex(e => 
            e.getPosition().x === enemyBody.position.x && 
            e.getPosition().y === enemyBody.position.y
          );
          
          if (enemyIndex !== -1) {
            this.enemies[enemyIndex].destroy();
            this.enemies.splice(enemyIndex, 1);
          }
          
          break; // Only handle one battle at a time
        }
      }
    });
    
    console.log('✅✅✅ Enemy collision detection setup (Pokemon-style battle triggers) ✅✅✅');
  }
  
  /**
   * Start a battle with an enemy monster
   * @param enemyCharacter - Enemy DragonBones character name
   */
  private async startEnemyBattle(enemyCharacter: string): Promise<void> {
    try {
      console.log(`🎮 Starting battle with ${enemyCharacter}...`);
      
      // Stop overworld music
      this.audioManager.stop('bgm_overworld');
      
      // Fade out
      await this.transitionManager.fadeOut(this, 0.5);
      
      // Get random monster from database for the enemy
      const monsterDb = MonsterDatabase.getInstance();
      const randomMonster = monsterDb.getRandomMonster();
      
      console.log(`🎲 Random monster selected:`, {
        id: randomMonster.id,
        name: randomMonster.name,
        assetName: randomMonster.assetName
      });
      
      // Create encounter data (use assetName for DragonBones, not ID)
      const encounterData = {
        enemyMonsterId: randomMonster.assetName || randomMonster.id, // Use assetName if available
        zone: 'overworld'
      };
      
      // Switch to battle scene
      if (this.sceneManager) {
        const { BattleSceneV2 } = await import('./BattleSceneV2');
        const battleScene = new BattleSceneV2(this.app, encounterData, this.sceneManager);
        await this.sceneManager.switchTo(battleScene);
        await this.transitionManager.fadeIn(battleScene, 0.5);
      }
    } catch (error) {
      console.error('Failed to start enemy battle:', error);
    }
  }

  update(dt: number): void {
    // CRITICAL: Don't update if scene is being destroyed
    // This prevents "updateLocalTransform is not a function" errors
    if (this.isDestroying || this.destroyed) {
      return;
    }
    
    // Convert dt from milliseconds to seconds for particle/weather systems
    const deltaSeconds = dt / 1000;
    
    // Handle keyboard shortcuts
    this.handleKeyboardShortcuts();
    
    // Update player FIRST so movement input is applied before physics step
    if (this.player) {
      this.player.update(dt, this.input);
    }
    
    // Update physics AFTER player input so forces are included in the step
    this.physics.update(dt);
    
    // ⚔️ MANUAL COLLISION DETECTION: Check if player overlaps any enemy
    // Matter.js events don't work for stationary bodies, so we check manually each frame
    const allBodies = this.physics.getAllBodies();
    const playerBody = allBodies.find(b => b.label === 'player');
    const enemyBodies = allBodies.filter(b => b.label?.startsWith('enemy_'));
    
    if (playerBody && enemyBodies.length > 0) {
      // Check each enemy for overlap with player
      for (const enemyBody of enemyBodies) {
        // Calculate distance between centers
        const distance = Math.sqrt(
          Math.pow(playerBody.position.x - enemyBody.position.x, 2) + 
          Math.pow(playerBody.position.y - enemyBody.position.y, 2)
        );
        
        // Get body radii (assuming circular bodies)
        const playerRadius = (playerBody.circleRadius || 16);
        const enemyRadius = (enemyBody.circleRadius || 20);
        const collisionThreshold = playerRadius + enemyRadius;
        
        // DEBUG: Log physics update periodically (every ~60 frames = ~1 second)
        if (Math.random() < 0.016 && enemyBody === enemyBodies[0]) {
          console.log(`🎯 Physics check: Player at (${Math.round(playerBody.position.x)}, ${Math.round(playerBody.position.y)}), First enemy at (${Math.round(enemyBody.position.x)}, ${Math.round(enemyBody.position.y)}), Distance: ${Math.round(distance)}px`);
          console.log(`   Collision threshold: ${Math.round(collisionThreshold)}px (player: ${playerRadius}px + enemy: ${enemyRadius}px)`);
          console.log(`   Player velocity: (${playerBody.velocity.x.toFixed(2)}, ${playerBody.velocity.y.toFixed(2)})`);
        }
        
        // Check if bodies are overlapping (distance < sum of radii)
        if (distance < collisionThreshold) {
          // COLLISION DETECTED! Player touched an enemy
          const enemyName = enemyBody.label.replace('enemy_', '');
          
          console.log(`⚔️⚔️⚔️ BATTLE START! Player collided with ${enemyName}! ⚔️⚔️⚔️`);
          console.log(`   Distance: ${Math.round(distance)}px < Threshold: ${Math.round(collisionThreshold)}px`);
          
          // Trigger battle with this enemy
          this.startEnemyBattle(enemyName);
          
          // Remove the enemy from overworld (they're in battle now)
          const enemyIndex = this.enemies.findIndex(e => {
            const pos = e.getPosition();
            return Math.abs(pos.x - enemyBody.position.x) < 1 && 
                   Math.abs(pos.y - enemyBody.position.y) < 1;
          });
          
          if (enemyIndex !== -1) {
            this.enemies[enemyIndex].destroy();
            this.enemies.splice(enemyIndex, 1);
            this.physics.removeBody(enemyBody);
          }
          
          // Only handle one battle at a time
          break;
        }
      }
    }
    
    // Update combat system
    this.combatSystem.update(dt);
    this.toolDurability.update(dt);
    
    // NOW get position AFTER physics has been updated
    if (this.player) {
      const playerPos = this.player.getPosition();
      
      // Sync player display position with physics body (CRITICAL for movement to show)
      if (this.playerDisplay) {
        this.playerDisplay.x = playerPos.x;
        this.playerDisplay.y = playerPos.y;
      }
      
      // Update camera to follow player
      if (this.camera) {
        this.camera.follow(playerPos);
        
        // Update parallax background to follow camera
        if (this.parallaxBg) {
          const camPos = this.camera.getPosition();
          this.parallaxBg.update(camPos.x, camPos.y);
        }
      }
      
      // Check for encounters
      if (this.encounters) {
        this.encounters.checkPosition(playerPos);
      }
      
      // Update NPC system (proximity checks, interaction indicators)
      this.npcSystem.update(playerPos.x, playerPos.y);
      
      // Update all enemies (AI, animations, stat bars)
      for (const enemy of this.enemies) {
        if (!enemy.isDead()) {
          enemy.update(dt, playerPos);
          
          // DEBUG: Check distance to player
          const enemyPos = enemy.getPosition();
          const distance = Math.sqrt(
            Math.pow(playerPos.x - enemyPos.x, 2) + 
            Math.pow(playerPos.y - enemyPos.y, 2)
          );
          
          // Log when player gets close to enemy
          if (distance < 50 && Math.random() < 0.01) { // 1% chance per frame to avoid spam
            console.log(`📏 Player distance to enemy: ${distance.toFixed(0)}px`);
          }
        }
      }
      
      // Remove dead enemies
      this.enemies = this.enemies.filter(enemy => !enemy.isDead());
      
      // Update wild encounter system
      this.wildEncounters.update(playerPos, dt);
      
      // Update UI
      if (this.ui) {
        this.ui.updateHP(this.player.getHp(), this.player.getMaxHp());
      }
    }
    
    // Update visual effects
    this.particleManager.update(deltaSeconds);
    this.weatherManager.update(deltaSeconds);
  }

  /**
   * Cleans up the scene
   */
  destroy(): void {
    // Set flag to prevent further updates
    this.isDestroying = true;
    
    console.log('🗑️ [OverworldScene] Destroying scene...');
    
    // CRITICAL: Kill all GSAP animations on this scene to prevent "Cannot set properties of null" errors
    gsap.killTweensOf(this.worldContainer);
    gsap.killTweensOf(this);
    
    if (this.camera) {
      gsap.killTweensOf(this.camera);
      this.camera.stopAnimations();
      this.camera = null;
    }
    if (this.parallaxBg) {
      this.parallaxBg.destroy();
      this.parallaxBg = null;
    }
    
    // Remove zoom handler
    if ((this as any).zoomHandler) {
      this.app.canvas.removeEventListener('wheel', (this as any).zoomHandler);
    }
    
    // CRITICAL: Remove and dispose player DragonBones animation BEFORE destroying containers
    if (this.playerDisplay && this.playerDisplay.parent) {
      this.playerDisplay.parent.removeChild(this.playerDisplay);
      // PlayerAnimation.dispose() will be called by player.destroy()
    }
    
    // Cleanup managers BEFORE destroying containers
    this.particleManager.cleanup();
    this.weatherManager.clearWeather();
    this.filterManager.cleanup();
    this.npcSystem.clearAll();
    this.wildEncounters.clear();
    
    // Clear physics
    this.physics.clear();
    
    // Cleanup enemies
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
    
    // Remove event listeners
    this.eventBus.off('encounter:trigger', this.handleEncounter);
    this.eventBus.off('wild-encounter:trigger', this.handleWildEncounter);
    this.eventBus.off('battle:end', this.onBattleEnd);
    
    // Destroy world container with all children
    if (this.worldContainer) {
      this.worldContainer.destroy({ children: true });
    }
    
    // Null out references (already destroyed as children of worldContainer)
    this.player = null;
    this.playerDisplay = null;
    this.tilemap = null;
    this.collision = null;
    this.encounters = null;
    this.ui = null;
    this.tutorial = null;
    this.questLog = null;
    
    // Call PIXI.Container destroy to cleanup this scene container
    PIXI.Container.prototype.destroy.call(this, { children: true });
    
    console.log('✅ [OverworldScene] Scene destroyed successfully');
  }
}
