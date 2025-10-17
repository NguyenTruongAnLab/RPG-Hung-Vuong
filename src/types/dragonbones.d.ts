// Type definitions for dragonbones-pixijs
// Extended type definitions for DragonBones Pixi 8.x runtime
// Package: dragonbones-pixijs v1.0.5+

import type * as PIXI from 'pixi.js';

declare module 'dragonbones-pixijs' {
  // Re-export the base types
  import type { Animation } from 'dragonbones-pixijs';
  
  export class PixiFactory {
    static readonly factory: PixiFactory;
    parseDragonBonesData(data: any): void;
    parseTextureAtlasData(data: any, texture: any): void;
    buildArmatureDisplay(armatureName: string, dragonBonesName?: string): PixiArmatureDisplay | null;
    clear(disposeData?: boolean): void;
  }

  export class PixiArmatureDisplay extends PIXI.Container {
    animation: Animation;
    armature: Armature;
    dispose(): void;
  }

  export class Animation {
    readonly animationNames: string[];
    readonly animations: Map<string, AnimationData>;
    play(animationName: string, playTimes?: number): AnimationState | null;
    stop(animationName?: string): void;
    fadeIn(animationName: string, fadeInTime?: number, playTimes?: number): AnimationState | null;
  }

  export class AnimationState {
    readonly name: string;
    playTimes: number;
    isPlaying: boolean;
    isCompleted: boolean;
  }

  export class AnimationData {
    readonly name: string;
    readonly duration: number;
    readonly frameCount: number;
  }

  export class Armature {
    readonly name: string;
    dispose(): void;
  }
}
