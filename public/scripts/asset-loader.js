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

  const BUILD_ID = 'e6de500'; // Git commit hash used for encryption key
  
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
     * Load all encrypted chunks
     */
    async loadChunks() {
      console.log(`📦 [AssetLoader] Loading ${this.metadata.chunks.length} encrypted chunks...`);
      
      let totalLoaded = 0;
      
      for (let i = 0; i < this.metadata.chunks.length; i++) {
        const chunkInfo = this.metadata.chunks[i];
        const chunkUrl = `./${chunkInfo.filename}`;
        
        try {
          const response = await fetch(chunkUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const chunk = await response.arrayBuffer();
          this.chunks.push(chunk);
          
          totalLoaded += chunk.byteLength;
          const percent = Math.round((totalLoaded / this.metadata.totalSize) * 100);
          console.log(
            `✅ [AssetLoader] Chunk ${i + 1}/${this.metadata.chunks.length} loaded ` +
            `(${(totalLoaded / 1024 / 1024).toFixed(2)}/${(this.metadata.totalSize / 1024 / 1024).toFixed(2)} MB - ${percent}%)`
          );
        } catch (error) {
          console.error(`❌ [AssetLoader] Failed to load chunk ${i}:`, error);
          throw error;
        }
      }
      
      console.log(`✅ [AssetLoader] All chunks loaded: ${(totalLoaded / 1024 / 1024).toFixed(2)} MB`);
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
     */
    async decrypt(encryptedData, key) {
      console.log('🔓 [AssetLoader] Decrypting assets with AES-256-GCM...');
      
      try {
        // Extract IV (first 16 bytes) and auth tag (last 16 bytes)
        const iv = encryptedData.slice(0, 16);
        const authTag = encryptedData.slice(encryptedData.length - 16);
        const ciphertext = encryptedData.slice(16, encryptedData.length - 16);
        
        // Combine ciphertext and auth tag for Web Crypto API
        const combined = new Uint8Array(ciphertext.length + authTag.length);
        combined.set(ciphertext);
        combined.set(authTag, ciphertext.length);
        
        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv,
            additionalData: new TextEncoder().encode('rpg-hung-vuong'),
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
        
        // Load metadata
        await this.loadMetadata();
        
        // Load chunks
        await this.loadChunks();
        
        // Derive key
        console.log(`🔑 [AssetLoader] Deriving decryption key from build ID: ${BUILD_ID}`);
        const key = await this.deriveKey(BUILD_ID);
        
        // Concatenate chunks
        const concatenated = this.concatenateChunks();
        
        // Decrypt
        this.decryptedData = await this.decrypt(concatenated, key);
        
        // Mark as ready
        this.ready = true;
        window.encryptedAssetsReady = true;
        window.decryptedAssetData = this.decryptedData;
        
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
     * Intercept fetch requests to serve decrypted assets
     */
    _interceptFetch() {
      const originalFetch = window.fetch;
      const asarReader = this.asarReader;
      
      window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input.url;
        
        // Check if this is an asset request
        // Patterns: /assets/..., /RPG-Hung-Vuong/assets/..., ./assets/...
        const assetMatch = url.match(/(?:\/RPG-Hung-Vuong)?\/assets\/(.+)$/);
        
        if (assetMatch) {
          const assetPath = 'assets/' + assetMatch[1];
          console.log(`🔍 [AssetLoader] Intercepting fetch: ${url} → ${assetPath}`);
          
          const data = asarReader.readFile(assetPath);
          
          if (data) {
            console.log(`✅ [AssetLoader] Served from ASAR: ${assetPath} (${data.byteLength} bytes)`);
            
            // Determine content type from extension
            const ext = assetPath.split('.').pop().toLowerCase();
            const contentType = {
              'json': 'application/json',
              'png': 'image/png',
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
              'mp3': 'audio/mpeg',
              'wav': 'audio/wav',
              'ogg': 'audio/ogg',
              'txt': 'text/plain',
            }[ext] || 'application/octet-stream';
            
            // Return mock Response
            return new Response(data, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': contentType,
                'Content-Length': data.byteLength.toString(),
              }
            });
          } else {
            console.warn(`⚠️  [AssetLoader] Asset not found in ASAR: ${assetPath}`);
            // Fall back to original fetch (will likely 404)
          }
        }
        
        // Not an asset request, use original fetch
        return originalFetch.call(this, input, init);
      };
      
      console.log('✅ [AssetLoader] Fetch interception active');
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const loader = new EncryptedAssetLoader();
      window.assetLoader = loader;
      loader.initialize();
    });
  } else {
    const loader = new EncryptedAssetLoader();
    window.assetLoader = loader;
    loader.initialize();
  }

})();
