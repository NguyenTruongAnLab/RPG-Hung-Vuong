/**
 * TilemapEncounters - Manages encounter zones on tilemap
 * 
 * Tracks player steps in encounter zones and triggers
 * random encounters.
 * 
 * @example
 * ```typescript
 * const encounters = new TilemapEncounters(tilemap, eventBus);
 * encounters.loadFromLayer('encounters');
 * 
 * // In game loop
 * encounters.checkPosition(player.getPosition());
 * ```
 */
import { EventBus } from '../core/EventBus';
import { Tilemap } from './Tilemap';
import { Vector2D } from '../utils/Vector2D';

export interface EncounterZone {
  tileX: number;
  tileY: number;
  encounterRate: number;
}

export class TilemapEncounters {
  private tilemap: Tilemap;
  private eventBus: EventBus;
  private zones: EncounterZone[] = [];
  private lastPosition: Vector2D | null = null;
  private stepsSinceLastCheck: number = 0;
  private stepsPerCheck: number = 10;

  constructor(tilemap: Tilemap, eventBus: EventBus) {
    this.tilemap = tilemap;
    this.eventBus = eventBus;
  }

  /**
   * Loads encounter zones from a tilemap layer
   * 
   * @param layerName - Name of encounter layer
   * 
   * @example
   * ```typescript
   * encounters.loadFromLayer('encounters');
   * ```
   */
  public loadFromLayer(layerName: string): void {
    const layer = this.tilemap.getLayer(layerName);
    
    if (!layer) {
      console.warn(`Encounter layer '${layerName}' not found`);
      return;
    }

    this.zones = [];

    // Build encounter zones from layer data
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const index = y * layer.width + x;
        const gid = layer.data[index];

        // Non-zero tiles are encounter zones
        if (gid > 0) {
          this.zones.push({
            tileX: x,
            tileY: y,
            encounterRate: this.getEncounterRate(gid)
          });
        }
      }
    }
  }

  /**
   * Maps tile GID to encounter rate
   * Different tile IDs can have different encounter rates
   */
  private getEncounterRate(gid: number): number {
    // Default rates based on GID
    // 1 = low (5%), 2 = medium (10%), 3 = high (20%)
    switch (gid) {
      case 1: return 0.05;
      case 2: return 0.10;
      case 3: return 0.20;
      default: return 0.10;
    }
  }

  /**
   * Checks if position is in encounter zone and triggers encounters
   * 
   * @param position - Player position
   * 
   * @example
   * ```typescript
   * // In game loop
   * encounters.checkPosition(player.getPosition());
   * ```
   */
  public checkPosition(position: Vector2D): void {
    // Track steps
    if (this.lastPosition) {
      const dx = position.x - this.lastPosition.x;
      const dy = position.y - this.lastPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Consider ~32 pixels as one step
      if (distance > 32) {
        this.stepsSinceLastCheck++;
        this.lastPosition = { ...position };
      }
    } else {
      this.lastPosition = { ...position };
    }

    // Check every N steps
    if (this.stepsSinceLastCheck < this.stepsPerCheck) {
      return;
    }

    this.stepsSinceLastCheck = 0;

    // Check if in encounter zone
    const zone = this.getZoneAt(position);
    if (!zone) {
      return;
    }

    // Roll for encounter
    if (Math.random() < zone.encounterRate) {
      this.triggerEncounter(zone);
    }
  }

  /**
   * Gets encounter zone at position
   * 
   * @param position - World position
   * @returns Encounter zone or null
   */
  private getZoneAt(position: Vector2D): EncounterZone | null {
    const tileCoords = this.tilemap.worldToTile(position.x, position.y);
    
    return this.zones.find(
      zone => zone.tileX === tileCoords.tileX && zone.tileY === tileCoords.tileY
    ) ?? null;
  }

  /**
   * Triggers an encounter
   * Emits 'encounter:trigger' event
   */
  private triggerEncounter(zone: EncounterZone): void {
    this.eventBus.emit('encounter:trigger', {
      zone,
      encounterRate: zone.encounterRate
    });
  }

  /**
   * Manually triggers an encounter
   * For testing or forced encounters
   */
  public forceEncounter(): void {
    this.eventBus.emit('encounter:trigger', {
      zone: null,
      encounterRate: 1.0
    });
  }

  /**
   * Gets all encounter zones
   * @returns Array of zones
   */
  public getZones(): EncounterZone[] {
    return this.zones;
  }

  /**
   * Sets steps per check
   * @param steps - Number of steps between checks
   */
  public setStepsPerCheck(steps: number): void {
    this.stepsPerCheck = Math.max(1, steps);
  }

  /**
   * Resets step counter
   */
  public resetSteps(): void {
    this.stepsSinceLastCheck = 0;
  }

  /**
   * Gets current step count
   * @returns Steps since last check
   */
  public getSteps(): number {
    return this.stepsSinceLastCheck;
  }
}
