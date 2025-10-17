// Type definitions for pixi-dragonbones-runtime
// Extended type definitions for DragonBones Pixi 8.x runtime
// Package: pixi-dragonbones-runtime v8.0.3+

import type * as PIXI from 'pixi.js';

declare module 'pixi-dragonbones-runtime' {
  // Re-export the base types
  import type { Animation } from 'pixi-dragonbones-runtime';
  
  export class PixiFactory {
    static readonly factory: PixiFactory;
    readonly clock: WorldClock;
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
    clock: WorldClock | null;
    cacheFrameRate: number;
    getBone(name: string): Bone | null;
    dispose(): void;
  }

  export class Bone {
    readonly name: string;
    offset: Transform;
    global: Transform;
    invalidUpdate(): void;
    updateGlobalTransform(): void;
  }

  export class Transform {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
  }

  export class WorldClock {
    time: number;
    timeScale: number;
    advanceTime(passedTime: number): void;
  }
}
