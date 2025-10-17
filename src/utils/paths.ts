/**
 * Path utilities for handling asset paths with Vite base configuration
 * 
 * Vite base is configured in vite.config.js:
 * - Production (GitHub Pages): /RPG-Hung-Vuong/
 * - Development: ./
 * 
 * Public folder assets are served at base + path
 */

/**
 * Get the base path for the application
 * This matches the Vite base configuration
 */
export function getBasePath(): string {
  // In Vite, import.meta.env.BASE_URL provides the base path
  // TypeScript doesn't know about Vite's import.meta.env by default
  const meta = import.meta as any;
  return meta.env?.BASE_URL || '/';
}

/**
 * Resolve an asset path relative to the base
 * 
 * @param path - Path relative to public folder (e.g., 'assets/audio/bgm.wav')
 * @returns Full path with base applied
 * 
 * @example
 * // Development: './assets/audio/bgm.wav'
 * // Production: '/RPG-Hung-Vuong/assets/audio/bgm.wav'
 * resolveAssetPath('assets/audio/bgm.wav')
 */
export function resolveAssetPath(path: string): string {
  const base = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}

/**
 * Resolve a DragonBones asset path
 * 
 * @param characterName - e.g., 'Absolution'
 * @param fileType - 'ske.json', 'tex.json', 'tex.png', or 'settings.txt'
 * @returns Full path with base applied
 * 
 * @example
 * resolveDragonBonesPath('Absolution', 'ske.json')
 * // => '/RPG-Hung-Vuong/assets/dragonbones_assets/Absolution_ske.json'
 */
export function resolveDragonBonesPath(characterName: string, fileType: string): string {
  return resolveAssetPath(`assets/dragonbones_assets/${characterName}_${fileType}`);
}

/**
 * Resolve an audio asset path
 * 
 * @param filename - Audio filename (e.g., 'bgm_overworld.wav')
 * @returns Full path with base applied
 * 
 * @example
 * resolveAudioPath('bgm_overworld.wav')
 * // => '/RPG-Hung-Vuong/assets/audio/bgm_overworld.wav'
 */
export function resolveAudioPath(filename: string): string {
  return resolveAssetPath(`assets/audio/${filename}`);
}
