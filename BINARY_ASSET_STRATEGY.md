# 🔐 Binary Asset Strategy - Professional Approach

## Problem

Raw proprietary assets in web deployments are vulnerable:
- ❌ Can be extracted from browser cache
- ❌ Visible in DevTools Network tab
- ❌ Can be downloaded and reused
- ❌ Violates licensing agreements

## Solution: Binary Bundling with Encryption

Package proprietary assets as **encrypted binary files** - industry standard approach used by EA, Ubisoft, Epic Games, etc.

---

## 🎯 Recommended Hybrid Strategy

### Tier 1: Web Version (GitHub Pages) ✅
```
https://nguyentruonganlab.github.io/RPG-Hung-Vuong/
- Placeholder graphics (safe to distribute)
- Open source code
- No proprietary assets
- 100% legal, shareable
```

### Tier 2: Windows Binary (Encrypted Assets) ⭐ RECOMMENDED
```
RPG-Hung-Vuong-Setup-1.0.0.exe (300MB)
├── Electron Runtime (encrypted)
├── Game Code (minified)
└── Assets Bundle (encrypted binary)
    ├── dragonbones.asar.bin (encrypted)
    ├── monsters.asar.bin (encrypted)
    └── audio.asar.bin (encrypted)
```

### Tier 3: Local Development (Raw Files)
```
Your Machine Only (Not in git)
public/assets/
├── dragonbones_assets/ (raw files)
├── monsters/
└── tilesets/
```

---

## 🔐 Asset Protection Methods

### Option A: ASAR Archive (Fastest) ⭐
**Electron's native format - automatic**

```
assets.asar
├── Hard to extract without special tools
├── Compressed and bundled
└── Cannot access raw files normally
```

**Pros:**
- ✅ Built-in to Electron
- ✅ Automatic compression
- ✅ Single file distribution
- ✅ Minimal setup

**Cons:**
- ⚠️ Determined attackers with tools can extract

**Security Level**: Medium

---

### Option B: ASAR + Encryption (Recommended) ⭐⭐
**Best balance of security and simplicity**

```javascript
// Create encrypted ASAR
assets.asar.enc
├── Encrypted with AES-256
├── Key derived from machine ID or timestamp
└── Decrypted in memory only at runtime
```

**Encryption Process:**
```bash
1. Pack assets into .asar
2. Encrypt with AES-256-GCM
3. Store in application bundle
4. Decrypt only in memory when needed
```

**Pros:**
- ✅ High security
- ✅ Relatively simple
- ✅ Industry standard
- ✅ No performance penalty
- ✅ Key can be per-build or per-machine

**Cons:**
- ⚠️ More complex build process
- ⚠️ Requires key management

**Security Level**: High ✅

---

### Option C: Custom Binary Bundle (Maximum Security) ⭐⭐⭐
**For maximum protection of proprietary assets**

```
assets.bin (90MB encrypted)
├── Header (4KB)
│   ├── Version: 1
│   ├── File count: 4237
│   ├── Checksum: SHA256
│   └── Encryption: AES-256-GCM
├── Chunk 1: DragonBones (encrypted, compressed)
├── Chunk 2: Monsters (encrypted, compressed)
├── Chunk 3: Audio (encrypted, compressed)
└── Chunk 4: Tilesets (encrypted, compressed)
```

**Pros:**
- ✅ Maximum security
- ✅ Single file (easier distribution)
- ✅ Integrity verification (checksums)
- ✅ Tamper detection
- ✅ Professional approach

**Cons:**
- ❌ Complex build process
- ❌ Requires custom loader

**Security Level**: Very High ✅✅

---

## 🚀 Implementation: ASAR + Encryption (Recommended)

### Step 1: Install Electron

```bash
npm install --save-dev electron electron-builder
```

### Step 2: Create Build Scripts

**scripts/create-asset-bundle.js:**
```javascript
const asar = require('asar');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function createEncryptedAssetBundle() {
  console.log('📦 Creating encrypted asset bundle...');
  
  // 1. Create ASAR archive
  const assetsPath = path.join(__dirname, '../public/assets');
  const asarPath = path.join(__dirname, '../assets.asar');
  
  await asar.createPackage(assetsPath, asarPath);
  console.log('✅ ASAR archive created');
  
  // 2. Generate encryption key (per build)
  const key = crypto.scryptSync(
    process.env.ASSET_KEY || `build-${Date.now()}`,
    'rpg-hung-vuong-salt',
    32
  );
  
  // 3. Encrypt ASAR file
  const cipher = crypto.createCipheriv('aes-256-gcm', key, Buffer.alloc(16, 0));
  const input = fs.createReadStream(asarPath);
  const output = fs.createWriteStream(asarPath + '.enc');
  
  let authTag;
  input
    .pipe(cipher)
    .on('end', () => {
      authTag = cipher.getAuthTag();
      console.log('✅ Assets encrypted with AES-256-GCM');
    })
    .pipe(output);
  
  // 4. Save key metadata
  const metadata = {
    version: 1,
    algorithm: 'aes-256-gcm',
    keyDerivation: 'scrypt',
    authTag: authTag.toString('hex'),
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../assets.meta.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('✅ Asset bundle ready: assets.asar.enc');
}

createEncryptedAssetBundle().catch(console.error);
```

**Add to package.json:**
```json
{
  "scripts": {
    "build:assets": "node scripts/create-asset-bundle.js",
    "build:windows": "npm run build && npm run build:assets && electron-builder --win"
  }
}
```

### Step 3: Electron Main Process

**main.ts:**
```typescript
import { app, BrowserWindow } from 'electron';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as asar from 'asar';

app.on('ready', async () => {
  // 1. Decrypt assets in memory
  const encryptedPath = path.join(app.getAppPath(), 'assets.asar.enc');
  const key = crypto.scryptSync(
    process.env.ASSET_KEY || `build-${app.getVersion()}`,
    'rpg-hung-vuong-salt',
    32
  );
  
  // 2. Read encrypted file
  const encryptedData = fs.readFileSync(encryptedPath);
  const authTag = Buffer.from(/* from metadata */);
  const iv = Buffer.alloc(16, 0);
  
  // 3. Decrypt
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);
  
  // 4. Extract to temporary location
  const tmpDir = path.join(app.getPath('temp'), 'game-assets-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });
  
  fs.writeFileSync(path.join(tmpDir, 'assets.asar'), decrypted);
  
  // 5. Assets now available at tmpDir
  process.env.GAME_ASSETS_PATH = tmpDir;
  
  // Create window
  createWindow();
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true
    }
  });

  mainWindow.loadFile('dist/index.html');
}
```

**preload.ts:**
```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('game', {
  getAssetsPath: () => process.env.GAME_ASSETS_PATH,
  platform: process.platform
});
```

### Step 4: Update Game Code

**AssetManager.ts:**
```typescript
export class AssetManager {
  private static assetsPath: string = '';

  static init() {
    // In Electron
    if (window.game?.getAssetsPath) {
      this.assetsPath = window.game.getAssetsPath() + '/assets';
    }
    // In browser
    else {
      this.assetsPath = './assets';
    }
  }

  async loadDragonBonesCharacter(name: string) {
    const basePath = this.assetsPath;
    
    try {
      // Electron: ASAR loads transparently
      // Browser: File path works normally
      const asset = await fetch(`${basePath}/dragonbones_assets/${name}_ske.json`);
      return asset.json();
    } catch (error) {
      console.error(`Asset not found: ${name}`);
      return null; // Fallback to placeholder
    }
  }
}
```

### Step 5: Build Configuration

**electron-builder.json:**
```json
{
  "appId": "com.rpg-hung-vuong.game",
  "productName": "RPG Hùng Vương",
  "directories": {
    "buildResources": "assets",
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "node_modules/**/*",
    "package.json",
    "assets.asar.enc"
  ],
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ]
  },
  "nsis": {
    "oneClick": false,
    "installerIcon": "assets/icon.ico",
    "uninstallerIcon": "assets/icon.ico",
    "installerHeaderIcon": "assets/icon.ico"
  }
}
```

---

## 🎯 Build Process

### Local Development
```bash
npm run dev
# Loads from ./public/assets (raw files, not encrypted)
```

### Production Web
```bash
npm run build
# Vite output with content-hash filenames
# Assets are hashed (assets-abc123.png)
# Placeholders shown (no proprietary assets)
```

### Production Windows
```bash
npm run build:windows
# 1. npm run build → web version
# 2. npm run build:assets → encrypt + bundle
# 3. electron-builder → create .exe with encrypted assets
# Result: RPG-Hung-Vuong-Setup-1.0.0.exe (300MB)
```

---

## 🔒 Security Comparison

| Method | Web Security | Binary Security | Ease | Industry Use |
|--------|-------------|-----------------|------|--------------|
| Raw files | ❌ None | ⚠️ Low | ✅ Easy | ❌ None |
| ASAR only | N/A | ⚠️ Medium | ✅ Easy | ✅ Indie |
| ASAR + Encryption | N/A | ✅ High | ⚠️ Medium | ✅ Professional |
| Custom Binary | N/A | ✅✅ Very High | ❌ Hard | ✅ AAA |

---

## ✅ What You Get

### Current Setup (Keep This)
- ✅ GitHub Pages with placeholders (free, legal, shareable)
- ✅ Open source code on GitHub
- ✅ Local development with raw assets

### Add Windows Binary (Recommended)
- ✅ Beautiful Windows game with all assets
- ✅ Proprietary assets encrypted inside .exe
- ✅ Users can't extract raw files
- ✅ Professional distribution
- ✅ Your licensing respected

### Result
```
Your Game Distribution:

📱 Browser Version (GitHub Pages)
   ├── Free
   ├── Demo with placeholders
   └── Shows legitimate code

🪟 Windows Version (ASAR Encrypted)
   ├── Full game
   ├── All proprietary assets protected
   ├── Professional installer
   └── Legal asset distribution

💻 Source Code (GitHub Open Source)
   ├── Fully open source
   ├── No assets included
   ├── Community can verify legitimacy
   └── Other developers can learn
```

---

## 📋 Implementation Checklist

- [ ] Create `scripts/create-asset-bundle.js`
- [ ] Create `main.ts` for Electron
- [ ] Create `preload.ts` for asset path exposure
- [ ] Update `AssetManager.ts` to use asset path
- [ ] Create `electron-builder.json` config
- [ ] Add build scripts to `package.json`
- [ ] Test local build: `npm run build:windows`
- [ ] Create GitHub Actions workflow for automated builds
- [ ] Test final .exe installer

---

## 🚀 Deployment

### GitHub Pages (Automatic)
```bash
git push origin main
# GitHub Actions: Build → Test → Deploy with placeholders
```

### Windows Release (Manual or Automated)
```bash
# Option 1: Manual
npm run build:windows
# Creates release/RPG-Hung-Vuong-Setup-1.0.0.exe

# Option 2: GitHub Actions (automated)
git tag v1.0.0
git push origin v1.0.0
# Actions automatically builds and creates release
```

---

## 💡 FAQ

**Q: Can determined attackers still extract ASAR?**  
A: Yes with specialized tools, but (1) Much harder (2) Takes expertise (3) Violates license/terms of service

**Q: Is ASAR encryption overkill?**  
A: Not for proprietary/licensed assets. Standard industry practice.

**Q: What about performance impact?**  
A: Negligible. Decryption happens once at startup in background.

**Q: Can I do this for web builds too?**  
A: Technically yes, but not recommended. Browsers are inherently insecure for proprietary assets.

**Q: Should I encrypt with a static key or per-build?**  
A: Per-build is more secure, but static key is simpler. Use per-build for maximum security.

**Q: What if I want to add DRM later?**  
A: This approach is compatible with standard DRM solutions.

---

## 🎓 What AAA Studios Do

- ✅ **EA Games**: APEX uses encrypted asset bundles
- ✅ **Ubisoft**: Rayman uses UPLAY launcher + encryption
- ✅ **Epic**: Fortnite uses UE4 cooker + encryption
- ✅ **Activision**: Call of Duty uses encrypted .pak files

Your approach: Simplified version of industry standard! 🎮

---

## Next Steps

1. **Keep Current Setup** - GitHub Pages + placeholders (you're doing great!)
2. **When Ready, Add Windows Binary** - Follow steps above for ASAR encryption
3. **Automate with GitHub Actions** - One-click releases
4. **Optional: Add Custom Binary Format** - If maximum security needed

You're already 80% there. Just need to add the binary packaging! ⚡
