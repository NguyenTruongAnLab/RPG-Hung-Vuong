/**
 * main.ts - Electron Main Process
 * 
 * Handles:
 * 1. Decrypting encrypted asset bundle at startup
 * 2. Creating application window
 * 3. Asset path management for renderer process
 * 4. IPC communication with renderer
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const asar = require('asar');

interface DecryptedAssets {
  assetsPath: string;
  isDecrypted: boolean;
  isDevMode: boolean;
}

let decryptedAssets: DecryptedAssets | null = null;

/**
 * Derive encryption key from build ID
 */
function deriveKey(buildId: string): Buffer {
  try {
    return crypto.scryptSync(
      buildId,
      Buffer.from('rpg-hung-vuong-assets-v1'),
      32 // 256-bit key
    );
  } catch (error) {
    console.error('Error deriving key:', error);
    throw error;
  }
}

/**
 * Decrypt encrypted ASAR bundle
 */
function decryptAssets(): DecryptedAssets {
  console.log('🔐 [Main] Starting asset decryption...');

  // Check if in development mode (assets not encrypted)
  const devAssetsPath = path.join(app.getAppPath(), '..', '..', 'public', 'assets');
  if (fs.existsSync(devAssetsPath)) {
    console.log('✅ [Main] Development mode - using raw assets:', devAssetsPath);
    return {
      assetsPath: devAssetsPath,
      isDecrypted: false,
      isDevMode: true
    };
  }

  // Production: decrypt from bundle
  const encryptedPath = path.join(app.getAppPath(), 'assets.asar.enc');
  const metadataPath = path.join(app.getAppPath(), 'assets.meta.json');

  if (!fs.existsSync(encryptedPath)) {
    console.error('❌ [Main] Encrypted assets not found:', encryptedPath);
    throw new Error('Encrypted asset bundle not found');
  }

  if (!fs.existsSync(metadataPath)) {
    console.error('❌ [Main] Asset metadata not found:', metadataPath);
    throw new Error('Asset metadata not found');
  }

  try {
    // Read metadata
    const metadataRaw = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataRaw);

    console.log('📋 [Main] Metadata loaded:');
    console.log('   Algorithm:', metadata.algorithm);
    console.log('   Key derivation:', metadata.keyDerivation);
    console.log('   Build ID:', metadata.buildId);

    // Derive decryption key
    const key = deriveKey(metadata.buildId);
    console.log('🔑 [Main] Key derived from build ID');

    // Read encrypted file
    const encryptedData = fs.readFileSync(encryptedPath);
    console.log(`📦 [Main] Encrypted asset size: ${(encryptedData.length / 1024 / 1024).toFixed(2)} MB`);

    // Extract components: IV (16) + authTag (16) + ciphertext
    const iv = Buffer.from(metadata.iv, 'hex');
    const authTag = Buffer.from(metadata.authTag, 'hex');
    const ciphertext = encryptedData.slice(32);

    console.log('🔍 [Main] Extracting IV and auth tag...');

    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted: Buffer;
    try {
      decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ]);
      console.log('✅ [Main] Decryption successful');
      console.log(`   Decrypted size: ${(decrypted.length / 1024 / 1024).toFixed(2)} MB`);
    } catch (authError) {
      console.error('❌ [Main] Authentication failed - encrypted data may be corrupted');
      throw new Error('Decryption authentication failed');
    }

    // Extract to temporary directory
    const tmpDir = path.join(app.getPath('temp'), `rpg-assets-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    const asarPath = path.join(tmpDir, 'assets.asar');
    fs.writeFileSync(asarPath, decrypted);
    console.log('💾 [Main] Extracted ASAR to:', asarPath);

    // Verify ASAR structure
    try {
      const files = asar.listPackage(asarPath);
      console.log(`✅ [Main] ASAR verified - contains ${files.length} files`);
    } catch (error) {
      console.error('❌ [Main] ASAR verification failed:', error);
      throw error;
    }

    return {
      assetsPath: asarPath,
      isDecrypted: true,
      isDevMode: false
    };

  } catch (error) {
    console.error('❌ [Main] Decryption failed:', error);
    throw error;
  }
}

/**
 * Create application window
 */
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      sandbox: true,
      // Disable node integration for security
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';
  const startUrl = isDev
    ? 'http://localhost:5173' // Vite dev server
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Production build

  mainWindow.loadURL(startUrl);

  // Development: open DevTools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    app.quit();
  });
}

/**
 * Handle app ready event
 */
app.on('ready', async () => {
  try {
    // Decrypt assets
    decryptedAssets = decryptAssets();
    console.log('✅ [Main] Assets ready');

    // Store in global for IPC access
    (global as any).decryptedAssets = decryptedAssets;

    // Setup IPC handlers
    ipcMain.handle('get-assets-path', () => {
      return decryptedAssets?.assetsPath || null;
    });

    ipcMain.handle('get-is-dev-mode', () => {
      return decryptedAssets?.isDevMode || false;
    });

    // Create window
    createWindow();

  } catch (error) {
    console.error('❌ [Main] Fatal error during startup:', error);
    // Show error dialog
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Startup Failed',
      `Failed to initialize game assets.\n\n${error instanceof Error ? error.message : String(error)}`
    );
    app.quit();
  }
});

/**
 * Handle app quit
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

export {};
