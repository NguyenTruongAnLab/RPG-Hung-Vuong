// Type definitions for dragonbones.js
// This is a minimal declaration file for the DragonBones library

declare module 'dragonbones.js' {
  export namespace dragonBones {
    export class PixiFactory {
      static factory: PixiFactory;
      parseDragonBonesData(data: any): void;
      parseTextureAtlasData(data: any, texture: any): void;
      buildArmatureDisplay(armatureName: string): PixiArmatureDisplay;
      clear(): void;
    }

    export class PixiArmatureDisplay {
      animation: Animation;
    }

    export class Animation {
      animationNames: string[];
      play(animationName: string, playTimes?: number): void;
      stop(): void;
    }
  }

  export = dragonBones;
}
