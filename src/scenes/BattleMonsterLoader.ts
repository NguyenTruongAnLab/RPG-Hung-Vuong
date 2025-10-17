/**
 * BattleMonsterLoader - Helper for loading DragonBones monsters in battle
 * 
 * This helper manages loading and creating DragonBones animations for monsters
 * in battle, with fallback to simple graphics on error.
 */
import * as PIXI from 'pixi.js';
import { DragonBonesAnimation } from '../entities/components/DragonBonesAnimation';
import monsterDB from '../data/monster-database.json';
import type { Monster, Element } from './BattleSceneV2';

export class BattleMonsterLoader {
  /**
   * Load player monster from saved party
   */
  static async loadPlayerMonster(
    app: PIXI.Application,
    container: PIXI.Container,
    x: number,
    y: number
  ): Promise<{
    monster: Monster;
    animation: DragonBonesAnimation | null;
    sprite: PIXI.Graphics | null;
  }> {
    // Get player party from localStorage
    const savedParty = localStorage.getItem('playerParty');
    let playerAssetName = 'Absolution'; // Default
    
    if (savedParty) {
      try {
        const party = JSON.parse(savedParty);
        if (party.length > 0) {
          playerAssetName = party[0];
        }
      } catch (e) {
        console.warn('Failed to parse player party:', e);
      }
    }
    
    // Get player monster data
    const playerMonsterData = monsterDB.monsters.find(m => m.assetName === playerAssetName);
    
    // Create player monster
    const monster: Monster = {
      id: playerAssetName,
      name: playerMonsterData?.name || 'Player Monster',
      element: (playerMonsterData?.element as Element) || 'thuy',
      stats: {
        hp: playerMonsterData?.stats.hp || 100,
        maxHp: playerMonsterData?.stats.hp || 100,
        attack: playerMonsterData?.stats.attack || 20,
        defense: playerMonsterData?.stats.defense || 10,
        speed: playerMonsterData?.stats.speed || 15
      },
      currentHP: playerMonsterData?.stats.hp || 100,
      isPlayer: true
    };

    // Try to load DragonBones animation
    let animation: DragonBonesAnimation | null = null;
    let sprite: PIXI.Graphics | null = null;

    try {
      animation = new DragonBonesAnimation(app);
      await animation.loadCharacter(playerAssetName);
      const display = animation.getDisplay();
      
      if (!display) {
        throw new Error(`DragonBones display not created for player ${playerAssetName}`);
      }
      
      // Validate animation controller
      if (!display.animation) {
        throw new Error(`Animation controller missing for player ${playerAssetName}`);
      }
      
      display.x = x;
      display.y = y;
      display.scale.set(0.4);
      animation.play('Idle');
      container.addChild(display);
      
      console.log(`✅ Player monster loaded: ${playerAssetName}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to load player animation: ${errorMsg}`);
      
      // Show alert to user
      alert(`⚠️ Failed to load monster "${playerAssetName}":\n${errorMsg}\n\nUsing fallback placeholder.`);
      
      // Fallback to circle
      sprite = new PIXI.Graphics();
      sprite.circle(0, 0, 40);
      sprite.fill(0x0088ff);
      sprite.x = x;
      sprite.y = y;
      container.addChild(sprite);
    }

    return { monster, animation, sprite };
  }

  /**
   * Load enemy monster
   */
  static async loadEnemyMonster(
    app: PIXI.Application,
    container: PIXI.Container,
    enemyId: string,
    x: number,
    y: number
  ): Promise<{
    monster: Monster;
    animation: DragonBonesAnimation | null;
    sprite: PIXI.Graphics | null;
  }> {
    const enemyMonsterData = monsterDB.monsters.find(m => m.assetName === enemyId);
    
    const monster: Monster = {
      id: enemyId,
      name: enemyMonsterData?.name || 'Wild Beast',
      element: (enemyMonsterData?.element as Element) || 'moc',
      stats: {
        hp: enemyMonsterData?.stats.hp || 80,
        maxHp: enemyMonsterData?.stats.hp || 80,
        attack: enemyMonsterData?.stats.attack || 15,
        defense: enemyMonsterData?.stats.defense || 8,
        speed: enemyMonsterData?.stats.speed || 12
      },
      currentHP: enemyMonsterData?.stats.hp || 80,
      isPlayer: false
    };

    // Try to load DragonBones animation
    let animation: DragonBonesAnimation | null = null;
    let sprite: PIXI.Graphics | null = null;

    try {
      animation = new DragonBonesAnimation(app);
      await animation.loadCharacter(enemyId);
      const display = animation.getDisplay();
      
      if (!display) {
        throw new Error(`DragonBones display not created for enemy ${enemyId}`);
      }
      
      // Validate animation controller
      if (!display.animation) {
        throw new Error(`Animation controller missing for enemy ${enemyId}`);
      }
      
      display.x = x;
      display.y = y;
      display.scale.set(0.4);
      animation.setFlip(true); // Face left
      animation.play('Idle');
      container.addChild(display);
      
      console.log(`✅ Enemy monster loaded: ${enemyId}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to load enemy animation: ${errorMsg}`);
      
      // Show alert to user
      alert(`⚠️ Failed to load enemy monster "${enemyId}":\n${errorMsg}\n\nUsing fallback placeholder.`);
      
      // Fallback to circle
      sprite = new PIXI.Graphics();
      sprite.circle(0, 0, 40);
      sprite.fill(0xff4444);
      sprite.x = x;
      sprite.y = y;
      container.addChild(sprite);
    }

    return { monster, animation, sprite };
  }
}
