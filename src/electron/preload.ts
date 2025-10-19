/**
 * preload.ts - Electron Preload Script
 * 
 * Safely exposes Electron APIs to renderer process
 * Uses context isolation for security
 */

import { contextBridge, ipcRenderer } from 'electron';

/**
 * Game context - exposes secure APIs to renderer
 */
contextBridge.exposeInMainWorld('game', {
  /**
   * Get path to decrypted assets
   * Returns absolute path on disk or ASAR path
   */
  getAssetsPath: async (): Promise<string | null> => {
    return ipcRenderer.invoke('get-assets-path');
  },

  /**
   * Check if running in development mode
   * (using raw assets instead of encrypted bundle)
   */
  isDevMode: async (): Promise<boolean> => {
    return ipcRenderer.invoke('get-is-dev-mode');
  },

  /**
   * Get current platform
   */
  platform: process.platform,

  /**
   * Get app version
   */
  appVersion: process.env.APP_VERSION || '1.0.0'
});

// Declare global type
declare global {
  interface Window {
    game: {
      getAssetsPath(): Promise<string | null>;
      isDevMode(): Promise<boolean>;
      platform: string;
      appVersion: string;
    };
  }
}

export {};
