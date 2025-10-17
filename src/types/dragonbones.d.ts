// Type definitions for dragonbones.js
// This is a minimal declaration file for the DragonBones library

declare module 'dragonbones.js' {
  import * as PIXI from 'pixi.js';

  export namespace dragonBones {
    export class PixiFactory {
      static factory: PixiFactory;
      parseDragonBonesData(data: any): void;
      parseTextureAtlasData(data: any, texture: any): void;
      buildArmatureDisplay(armatureName: string): PixiArmatureDisplay;
      clear(): void;
    }

    export interface PixiArmatureDisplay extends PIXI.Container {
      animation: Animation;
      dispose(): void;
      name: string;
    }

    export class Animation {
      animationNames: string[];
      animations: { [name: string]: AnimationData };
      play(animationName: string, playTimes?: number): void;
      stop(): void;
    }

    export interface AnimationData {
      name: string;
      duration: number;
    }
  }

  export = dragonBones;
}
