/**
 * AudioManager - Centralized audio management system
 * 
 * Manages music, sound effects, and voice playback with
 * volume controls and fade transitions.
 * 
 * @example
 * ```typescript
 * const audio = AudioManager.getInstance();
 * await audio.load('bgm_overworld', '/assets/audio/bgm_overworld.mp3', 'music');
 * audio.playMusic('bgm_overworld');
 * audio.playSFX('sfx_attack');
 * ```
 */
import { Howl, Howler } from 'howler';

interface AudioAsset {
  id: string;
  howl: Howl;
  category: 'music' | 'sfx' | 'voice';
}

export class AudioManager {
  private static instance: AudioManager;
  private assets = new Map<string, AudioAsset>();
  private musicVolume = 0.7;
  private sfxVolume = 0.8;
  private voiceVolume = 1.0;
  private currentMusic?: string;
  private isMuted = false;
  
  private constructor() {
    Howler.volume(0.8);
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): AudioManager {
    if (!this.instance) {
      this.instance = new AudioManager();
    }
    return this.instance;
  }
  
  /**
   * Load audio asset
   * 
   * @param id - Unique identifier for the asset
   * @param src - Path to audio file
   * @param category - Type of audio (music, sfx, voice)
   * 
   * @example
   * ```typescript
   * await AudioManager.getInstance().load('bgm_overworld', '/assets/audio/bgm_overworld.mp3', 'music');
   * ```
   */
  async load(id: string, src: string, category: 'music' | 'sfx' | 'voice'): Promise<void> {
    // Skip if already loaded
    if (this.assets.has(id)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const howl = new Howl({
        src: [src],
        loop: category === 'music',
        volume: this.getVolumeForCategory(category),
        onload: () => {
          this.assets.set(id, { id, howl, category });
          console.log(`✅ Loaded audio: ${id}`);
          resolve();
        },
        onloaderror: (_, error) => {
          // Log error but don't reject - gracefully handle missing audio
          console.warn(`⚠️ Failed to load audio: ${id}`, error);
          resolve(); // Resolve anyway to not block game
        },
        onplayerror: (_, error) => {
          console.warn(`⚠️ Failed to play audio: ${id}`, error);
        }
      });
    });
  }
  
  /**
   * Play sound effect once
   * 
   * @param id - Sound effect identifier
   * 
   * @example
   * ```typescript
   * AudioManager.getInstance().playSFX('sfx_attack');
   * ```
   */
  playSFX(id: string): void {
    if (this.isMuted) return;
    
    const asset = this.assets.get(id);
    if (asset && asset.category === 'sfx') {
      asset.howl.play();
    }
  }
  
  /**
   * Play background music (stops current music)
   * 
   * @param id - Music identifier
   * @param fadeIn - Fade in duration in milliseconds (default: 1000)
   * 
   * @example
   * ```typescript
   * AudioManager.getInstance().playMusic('bgm_overworld', 500);
   * ```
   */
  playMusic(id: string, fadeIn: number = 1000): void {
    if (this.isMuted) return;
    
    // Fade out current music
    if (this.currentMusic && this.currentMusic !== id) {
      const current = this.assets.get(this.currentMusic);
      if (current) {
        current.howl.fade(this.musicVolume, 0, 500);
        setTimeout(() => current.howl.stop(), 500);
      }
    }
    
    // Fade in new music
    const asset = this.assets.get(id);
    if (asset && asset.category === 'music') {
      asset.howl.volume(0);
      asset.howl.play();
      asset.howl.fade(0, this.musicVolume, fadeIn);
      this.currentMusic = id;
    }
  }
  
  /**
   * Play voice line
   * 
   * @param id - Voice identifier
   * 
   * @example
   * ```typescript
   * AudioManager.getInstance().playVoice('voice_battle_start');
   * ```
   */
  playVoice(id: string): void {
    if (this.isMuted) return;
    
    const asset = this.assets.get(id);
    if (asset && asset.category === 'voice') {
      asset.howl.play();
    }
  }
  
  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.assets.forEach(asset => asset.howl.stop());
    this.currentMusic = undefined;
  }
  
  /**
   * Stop specific audio
   */
  stop(id: string): void {
    const asset = this.assets.get(id);
    if (asset) {
      asset.howl.stop();
      if (this.currentMusic === id) {
        this.currentMusic = undefined;
      }
    }
  }
  
  /**
   * Pause all audio
   */
  pauseAll(): void {
    this.assets.forEach(asset => asset.howl.pause());
  }
  
  /**
   * Resume all audio
   */
  resumeAll(): void {
    this.assets.forEach(asset => asset.howl.play());
  }
  
  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.assets.forEach(asset => {
      if (asset.category === 'music') {
        asset.howl.volume(this.musicVolume);
      }
    });
  }
  
  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.assets.forEach(asset => {
      if (asset.category === 'sfx') {
        asset.howl.volume(this.sfxVolume);
      }
    });
  }
  
  /**
   * Set voice volume
   */
  setVoiceVolume(volume: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
    this.assets.forEach(asset => {
      if (asset.category === 'voice') {
        asset.howl.volume(this.voiceVolume);
      }
    });
  }
  
  /**
   * Toggle mute
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
  }
  
  /**
   * Get mute state
   */
  isMutedState(): boolean {
    return this.isMuted;
  }
  
  private getVolumeForCategory(category: string): number {
    switch (category) {
      case 'music': return this.musicVolume;
      case 'sfx': return this.sfxVolume;
      case 'voice': return this.voiceVolume;
      default: return 0.8;
    }
  }
  
  /**
   * Unload audio asset
   */
  unload(id: string): void {
    const asset = this.assets.get(id);
    if (asset) {
      asset.howl.unload();
      this.assets.delete(id);
      if (this.currentMusic === id) {
        this.currentMusic = undefined;
      }
    }
  }
  
  /**
   * Unload all audio assets
   */
  unloadAll(): void {
    this.assets.forEach(asset => asset.howl.unload());
    this.assets.clear();
    this.currentMusic = undefined;
  }
}
