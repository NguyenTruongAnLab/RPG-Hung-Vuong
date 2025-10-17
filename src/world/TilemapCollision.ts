/**
 * TilemapCollision - Generates Matter.js collision bodies from tilemap
 * 
 * Creates static physics bodies for walls and obstacles from
 * tilemap collision layers.
 * 
 * @example
 * ```typescript
 * const collision = new TilemapCollision(physics);
 * collision.createFromLayer(tilemap, 'collision');
 * ```
 */
import Matter from 'matter-js';
import { PhysicsManager } from '../core/PhysicsManager';
import { Tilemap, TilemapLayer } from './Tilemap';
import { createRectBody } from '../utils/MatterHelpers';

export class TilemapCollision {
  private physics: PhysicsManager;
  private bodies: Matter.Body[] = [];

  constructor(physics: PhysicsManager) {
    this.physics = physics;
  }

  /**
   * Creates collision bodies from a tilemap layer
   * 
   * @param tilemap - The tilemap
   * @param layerName - Name of collision layer
   * 
   * @example
   * ```typescript
   * collision.createFromLayer(tilemap, 'collision');
   * ```
   */
  public createFromLayer(tilemap: Tilemap, layerName: string): void {
    const layer = tilemap.getLayer(layerName);
    
    if (!layer) {
      console.warn(`Layer '${layerName}' not found`);
      return;
    }

    const tileWidth = tilemap.getTileWidth();
    const tileHeight = tilemap.getTileHeight();

    // Create body for each solid tile
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const index = y * layer.width + x;
        const gid = layer.data[index];

        // Skip empty tiles
        if (gid === 0) {
          continue;
        }

        // Create static body for this tile
        const worldPos = tilemap.tileToWorld(x, y);
        const body = createRectBody(
          worldPos.x + tileWidth / 2,
          worldPos.y + tileHeight / 2,
          tileWidth,
          tileHeight,
          {
            isStatic: true,
            label: 'wall',
            friction: 0
          }
        );

        this.physics.addBody(body);
        this.bodies.push(body);
      }
    }
  }

  /**
   * Creates optimized collision bodies by merging adjacent tiles
   * More efficient than individual tile bodies
   * 
   * @param tilemap - The tilemap
   * @param layerName - Name of collision layer
   */
  public createOptimized(tilemap: Tilemap, layerName: string): void {
    const layer = tilemap.getLayer(layerName);
    
    if (!layer) {
      console.warn(`Layer '${layerName}' not found`);
      return;
    }

    const tileWidth = tilemap.getTileWidth();
    const tileHeight = tilemap.getTileHeight();
    const processed = new Set<number>();

    // Merge horizontal runs of tiles
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const index = y * layer.width + x;
        
        if (processed.has(index)) {
          continue;
        }

        const gid = layer.data[index];
        if (gid === 0) {
          continue;
        }

        // Find horizontal run
        let runLength = 1;
        while (
          x + runLength < layer.width &&
          layer.data[y * layer.width + x + runLength] !== 0 &&
          !processed.has(y * layer.width + x + runLength)
        ) {
          runLength++;
        }

        // Mark tiles as processed
        for (let i = 0; i < runLength; i++) {
          processed.add(y * layer.width + x + i);
        }

        // Create merged body
        const worldPos = tilemap.tileToWorld(x, y);
        const body = createRectBody(
          worldPos.x + (runLength * tileWidth) / 2,
          worldPos.y + tileHeight / 2,
          runLength * tileWidth,
          tileHeight,
          {
            isStatic: true,
            label: 'wall',
            friction: 0
          }
        );

        this.physics.addBody(body);
        this.bodies.push(body);
      }
    }
  }

  /**
   * Creates boundary walls around the map
   * 
   * @param width - Map width in pixels
   * @param height - Map height in pixels
   * @param thickness - Wall thickness (default: 20)
   */
  public createBoundaries(width: number, height: number, thickness: number = 20): void {
    const boundaries = [
      // Top
      createRectBody(width / 2, -thickness / 2, width, thickness, {
        isStatic: true,
        label: 'boundary'
      }),
      // Bottom
      createRectBody(width / 2, height + thickness / 2, width, thickness, {
        isStatic: true,
        label: 'boundary'
      }),
      // Left
      createRectBody(-thickness / 2, height / 2, thickness, height, {
        isStatic: true,
        label: 'boundary'
      }),
      // Right
      createRectBody(width + thickness / 2, height / 2, thickness, height, {
        isStatic: true,
        label: 'boundary'
      })
    ];

    this.physics.addBodies(boundaries);
    this.bodies.push(...boundaries);
  }

  /**
   * Gets all collision bodies
   * @returns Array of collision bodies
   */
  public getBodies(): Matter.Body[] {
    return this.bodies;
  }

  /**
   * Clears all collision bodies
   */
  public clear(): void {
    this.physics.removeBodies(this.bodies);
    this.bodies = [];
  }

  /**
   * Destroys collision system and removes all bodies
   */
  public destroy(): void {
    this.clear();
  }
}
