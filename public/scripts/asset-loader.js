/**
 * 🔐 Encrypted Asset Loader for Browser
 * 
 * This script:
 * 1. Downloads encrypted chunks from GitHub Pages
 * 2. Decrypts them using AES-256-GCM
 * 3. Creates a virtual file system from the decrypted ASAR
 * 4. Intercepts asset requests and serves decrypted data
 * 
 * THE GAME MUST WAIT for 'assetsReady' event before loading assets!
 */

(function() {
  'use strict';

  console.log('🔐 [AssetLoader] Initializing encrypted asset system...');

  class EncryptedAssetLoader {
    constructor() {
      this.chunks = [];
      this.metadata = null;
      this.decryptedData = null;
      this.ready = false;
    }

    /**
     * Derive encryption key from build ID using PBKDF2
     */
    async deriveKey(buildId) {
      const encoder = new TextEncoder();
      const data = encoder.encode(buildId);
      const salt = encoder.encode('rpg-hung-vuong-assets-v1');
      
      const importedKey = await crypto.subtle.importKey(
        'raw',
        data,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      
      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        importedKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
    }

    /**
     * Load chunk metadata
     */
    async loadMetadata() {
      console.log('📦 [AssetLoader] Loading metadata...');
      try {
        const response = await fetch('./assets.meta.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        this.metadata = await response.json();
        console.log(`✅ [AssetLoader] Metadata loaded: ${this.metadata.chunks.length} chunks, ${(this.metadata.totalSize / 1024 / 1024).toFixed(2)} MB total`);
        return this.metadata;
      } catch (error) {
        console.error('❌ [AssetLoader] Failed to load metadata:', error);
        throw error;
      }
    }

    /**
     * Load all encrypted chunks IN PARALLEL for maximum speed
     */
    async loadChunks() {
      console.log(`📦 [AssetLoader] Loading ${this.metadata.chunks.length} encrypted chunks in parallel...`);
      this._updateLoadingUI('Downloading encrypted chunks...');
      
      const startTime = performance.now();
      let completedChunks = 0;
      
      // Create all fetch promises at once (parallel downloads)
      const chunkPromises = this.metadata.chunks.map(async (chunkInfo, i) => {
        const chunkUrl = `./${chunkInfo.filename}`;
        
        try {
          const response = await fetch(chunkUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const chunk = await response.arrayBuffer();
          
          completedChunks++;
          const percent = Math.round((completedChunks / this.metadata.chunks.length) * 100);
          const sizeMB = (chunk.byteLength / 1024 / 1024).toFixed(2);
          
          console.log(`✅ [AssetLoader] Chunk ${i} loaded (${sizeMB} MB)`);
          this._updateLoadingUI(`Loading chunks: ${completedChunks}/${this.metadata.chunks.length} (${percent}%)`);
          
          return { index: i, data: chunk };
        } catch (error) {
          console.error(`❌ [AssetLoader] Failed to load chunk ${i}:`, error);
          throw error;
        }
      });
      
      // Wait for all chunks to download in parallel
      const results = await Promise.all(chunkPromises);
      
      // Sort by index to ensure correct order
      results.sort((a, b) => a.index - b.index);
      
      // Store in correct order
      this.chunks = results.map(r => r.data);
      
      const totalLoaded = this.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      const elapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);
      const speedMBps = (totalLoaded / 1024 / 1024 / elapsedTime).toFixed(2);
      
      console.log(
        `✅ [AssetLoader] All chunks loaded: ${(totalLoaded / 1024 / 1024).toFixed(2)} MB ` +
        `in ${elapsedTime}s (${speedMBps} MB/s)`
      );
    }
    
    /**
     * Update loading UI with progress
     */
    _updateLoadingUI(message) {
      const progressEl = document.getElementById('loading-progress');
      if (progressEl) {
        progressEl.textContent = message;
      }
    }

    /**
     * Concatenate all chunks
     */
    concatenateChunks() {
      console.log('🔗 [AssetLoader] Concatenating chunks...');
      
      let totalSize = 0;
      for (const chunk of this.chunks) {
        totalSize += chunk.byteLength;
      }
      
      const concatenated = new Uint8Array(totalSize);
      let offset = 0;
      
      for (const chunk of this.chunks) {
        concatenated.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }
      
      console.log(`✅ [AssetLoader] Concatenated: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      return concatenated;
    }

    /**
     * Decrypt concatenated data using AES-256-GCM
     * IV and authTag are stored in metadata, not in the encrypted data
     */
    async decrypt(encryptedData, key) {
      console.log('🔓 [AssetLoader] Decrypting assets with AES-256-GCM...');
      
      try {
        // Get IV and authTag from metadata (stored as hex strings)
        const iv = new Uint8Array(
          this.metadata.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );
        const authTag = new Uint8Array(
          this.metadata.authTag.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );
        
        console.log(`🔑 [AssetLoader] IV: ${this.metadata.iv}`);
        console.log(`🔑 [AssetLoader] AuthTag: ${this.metadata.authTag}`);
        console.log(`📦 [AssetLoader] Encrypted data: ${encryptedData.byteLength} bytes`);
        
        // For AES-GCM in Web Crypto API, we need to append the authTag to the ciphertext
        const combined = new Uint8Array(encryptedData.byteLength + authTag.byteLength);
        combined.set(encryptedData);
        combined.set(authTag, encryptedData.byteLength);
        
        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128,
          },
          key,
          combined
        );
        
        console.log(
          `✅ [AssetLoader] Decryption successful: ${(decrypted.byteLength / 1024 / 1024).toFixed(2)} MB`
        );
        
        return new Uint8Array(decrypted);
      } catch (error) {
        console.error('❌ [AssetLoader] Decryption failed:', error);
        throw new Error('Failed to decrypt assets. Possible wrong encryption key or corrupted data.');
      }
    }

    /**
     * Initialize the asset loader
     */
    async initialize() {
      try {
        console.log('🔐 [AssetLoader] Starting initialization...');
        this._updateLoadingUI('Loading asset metadata...');
        
        // Load metadata
        await this.loadMetadata();
        
        // Get buildId from metadata (encryption script stores it there)
        const buildId = this.metadata.buildId || 'default';
        console.log(`🔑 [AssetLoader] Using build ID from metadata: ${buildId}`);
        
        // Load chunks
        await this.loadChunks();
        
        // Derive key using buildId from metadata
        console.log(`🔑 [AssetLoader] Deriving decryption key from build ID: ${buildId}`);
        this._updateLoadingUI('Preparing decryption key...');
        const key = await this.deriveKey(buildId);
        
        // Concatenate chunks
        this._updateLoadingUI('Combining encrypted chunks...');
        const concatenated = this.concatenateChunks();
        
        // Decrypt
        this._updateLoadingUI('Decrypting assets (this may take a moment)...');
        this.decryptedData = await this.decrypt(concatenated, key);
        
        // Mark as ready
        this.ready = true;
        window.encryptedAssetsReady = true;
        window.decryptedAssetData = this.decryptedData;
        
        this._updateLoadingUI('✅ Assets ready! Starting game...');
        console.log('✅ [AssetLoader] Asset system ready! Decrypted ASAR available.');
        console.log(`📊 [AssetLoader] Total decrypted size: ${(this.decryptedData.byteLength / 1024 / 1024).toFixed(2)} MB`);
        
        // Dispatch event
        window.dispatchEvent(new Event('assetsReady'));
        console.log('🎉 [AssetLoader] Dispatched "assetsReady" event');
        
        // Show warning if game tries to load assets before ready
        this._setupAssetInterception();
        
      } catch (error) {
        console.error('❌ [AssetLoader] Initialization failed:', error);
        window.encryptedAssetsFailed = true;
        window.dispatchEvent(new ErrorEvent('assetsFailed', { error }));
      }
    }

    /**
     * Setup asset request interception
     * Creates ASAR reader and intercepts fetch requests
     */
    _setupAssetInterception() {
      try {
        // Create ASAR reader
        console.log('📦 [AssetLoader] Creating ASAR reader...');
        this.asarReader = new window.AsarReader(this.decryptedData);
        
        // List all files in archive
        const files = this.asarReader.listFiles();
        console.log(`✅ [AssetLoader] ASAR contains ${files.length} files`);
        
        // Store reader globally for game access
        window.asarReader = this.asarReader;
        
        // Intercept fetch requests
        this._interceptFetch();
        
      } catch (error) {
        console.error('❌ [AssetLoader] Failed to setup ASAR reader:', error);
      }
    }
    
    /**
     * Intercept fetch requests and XMLHttpRequest to serve decrypted assets
     */
    _interceptFetch() {
      const originalFetch = window.fetch;
      const originalXHROpen = XMLHttpRequest.prototype.open;
      const originalXHRSend = XMLHttpRequest.prototype.send;
      const asarReader = this.asarReader;

      // Helper function to check if URL is an asset request
      const getAssetPath = (url) => {
        const assetMatch = url.match(/(?:\/RPG-Hung-Vuong)?\/assets\/(.+)$/);
        return assetMatch ? assetMatch[1] : null;
      };

      // Helper function to get content type from extension
      const getContentType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        return {
          'json': 'application/json',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'mp3': 'audio/mpeg',
          'wav': 'audio/wav',
          'ogg': 'audio/ogg',
          'txt': 'text/plain',
        }[ext] || 'application/octet-stream';
      };

      // Intercept fetch requests
      window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input.url;
        const assetPath = getAssetPath(url);
        
        if (assetPath) {
          console.log(`🔍 [AssetLoader] Intercepting fetch: ${url} → ${assetPath}`);
          
          const data = asarReader.readFile(assetPath);
          
          if (data) {
            console.log(`✅ [AssetLoader] Served from ASAR (fetch): ${assetPath} (${data.byteLength} bytes)`);
            
            return new Response(data, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': getContentType(assetPath),
                'Content-Length': data.byteLength.toString(),
              }
            });
          } else {
            console.warn(`⚠️  [AssetLoader] Asset not found in ASAR (fetch): ${assetPath}`);
          }
        }
        
        // Not an asset request, use original fetch
        return originalFetch.call(this, input, init);
      };

      // Intercept XMLHttpRequest (for PixiJS image loading)
      XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        this._url = url;
        this._assetPath = getAssetPath(url);
        
        if (this._assetPath) {
          console.log(`🔍 [AssetLoader] Intercepting XHR: ${url} → ${this._assetPath}`);
        }
        
        return originalXHROpen.call(this, method, url, async, user, password);
      };

      XMLHttpRequest.prototype.send = function(body) {
        if (this._assetPath) {
          const assetPath = this._assetPath;
          const data = asarReader.readFile(assetPath);
          
          if (data) {
            console.log(`✅ [AssetLoader] Served from ASAR (XHR): ${assetPath} (${data.byteLength} bytes)`);
            
            // Simulate successful response
            Object.defineProperty(this, 'status', { writable: true, value: 200 });
            Object.defineProperty(this, 'statusText', { writable: true, value: 'OK' });
            Object.defineProperty(this, 'readyState', { writable: true, value: 4 });
            Object.defineProperty(this, 'response', { writable: true, value: data.buffer });
            Object.defineProperty(this, 'responseType', { writable: true, value: 'arraybuffer' });
            
            // Set response headers
            this.getResponseHeader = function(name) {
              const headers = {
                'content-type': getContentType(assetPath),
                'content-length': data.byteLength.toString()
              };
              return headers[name.toLowerCase()] || null;
            };
            
            // Trigger events
            setTimeout(() => {
              if (this.onloadstart) this.onloadstart(new Event('loadstart'));
              if (this.onload) this.onload(new Event('load'));
              if (this.onloadend) this.onloadend(new Event('loadend'));
            }, 0);
            
            return;
          } else {
            console.warn(`⚠️  [AssetLoader] Asset not found in ASAR (XHR): ${assetPath}`);
          }
        }
        
        // Not an asset request or asset not found, use original send
        return originalXHRSend.call(this, body);
      };
      
      console.log('✅ [AssetLoader] Fetch and XHR interception active');
    }
  }

  // Auto-initialize when DOM is ready
  const loader = new EncryptedAssetLoader();
  window.assetLoader = loader;

  let initializationStarted = false;

  const startInitialization = () => {
    if (initializationStarted) {
      return;
    }
    initializationStarted = true;
    if (typeof loader.initialize === 'function') {
      loader.initialize();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitialization, { once: true });
  } else {
    startInitialization();
  }

})();
