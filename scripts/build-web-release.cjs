#!/usr/bin/env node

/**
 * 🌐 Web Release Builder
 * 
 * Combines Vite build + chunked encryption + asset loader
 * Creates complete release folder ready for GitHub Pages
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Ensure release folder is clean
 */
function cleanReleaseFolder(releaseDir) {
  log('\n🧹 Cleaning existing release folder...', 'cyan');
  
  if (fs.existsSync(releaseDir)) {
    // Remove everything except assets.meta.json and encrypted chunks
    const entries = fs.readdirSync(releaseDir);
    for (const entry of entries) {
      const fullPath = path.join(releaseDir, entry);
      if (entry.startsWith('assets.asar.enc.chunk') || entry === 'assets.meta.json') {
        // Keep encrypted chunks and metadata
        continue;
      }
      
      if (fs.lstatSync(fullPath).isDirectory()) {
        removeDir(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }
    log(`✅ Cleaned release folder`, 'green');
  } else {
    fs.mkdirSync(releaseDir, { recursive: true });
    log(`✅ Created release folder`, 'green');
  }
}

/**
 * Recursively remove directory
 */
function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.lstatSync(fullPath).isDirectory()) {
      removeDir(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dir);
}

/**
 * Copy build files to release folder
 */
function copyBuildFiles(distDir, releaseDir) {
  log('\n📁 Copying web build files...', 'cyan');
  
  const copy = (src, dest) => {
    if (!fs.existsSync(src)) return;
    
    if (fs.lstatSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      for (const entry of fs.readdirSync(src)) {
        copy(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  // Copy main build files
  copy(path.join(distDir, 'index.html'), path.join(releaseDir, 'index.html'));
  copy(path.join(distDir, 'js'), path.join(releaseDir, 'js'));
  copy(path.join(distDir, 'assets'), path.join(releaseDir, 'assets'));
  
  // Copy favicon if exists
  if (fs.existsSync(path.join(distDir, 'favicon.ico'))) {
    fs.copyFileSync(path.join(distDir, 'favicon.ico'), path.join(releaseDir, 'favicon.ico'));
  }
  if (fs.existsSync(path.join(distDir, 'favicon.svg'))) {
    fs.copyFileSync(path.join(distDir, 'favicon.svg'), path.join(releaseDir, 'favicon.svg'));
  }
  
  log(`✅ Build files copied`, 'green');
}

/**
 * Copy encrypted chunks to release folder
 */
function copyEncryptedChunks(sourceDir, releaseDir) {
  log('\n🔐 Copying encrypted asset chunks...', 'cyan');
  
  let chunkCount = 0;
  for (let i = 0; i < 10; i++) {
    const chunkFile = `assets.asar.enc.chunk${i}`;
    const sourcePath = path.join(sourceDir, chunkFile);
    
    if (fs.existsSync(sourcePath)) {
      const destPath = path.join(releaseDir, chunkFile);
      fs.copyFileSync(sourcePath, destPath);
      
      const stat = fs.statSync(sourcePath);
      const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
      log(`   ✓ Copied ${chunkFile} (${sizeMB} MB)`, 'green');
      chunkCount++;
    } else {
      break;
    }
  }
  
  // Copy metadata
  const metaSource = path.join(sourceDir, 'assets.meta.json');
  if (fs.existsSync(metaSource)) {
    fs.copyFileSync(metaSource, path.join(releaseDir, 'assets.meta.json'));
    log(`   ✓ Copied assets.meta.json`, 'green');
  }
  
  log(`✅ Copied ${chunkCount} encrypted chunks`, 'green');
}

/**
 * Copy asset loader
 */
function copyAssetLoader(releaseDir) {
  log('\n🔧 Creating asset loader...', 'cyan');
  
  const assetLoaderPath = path.join(releaseDir, 'asset-loader.js');
  if (fs.existsSync(assetLoaderPath)) {
    log(`✅ Asset loader already exists`, 'green');
  } else {
    log(`⚠️  Asset loader not found, creating placeholder`, 'yellow');
    fs.writeFileSync(assetLoaderPath, '// Asset loader placeholder\n');
  }
}

/**
 * Inject asset loader into index.html
 */
function injectAssetLoader(releaseDir) {
  log('\n🎨 Enhancing index.html...', 'cyan');
  
  const htmlPath = path.join(releaseDir, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    log(`⚠️  index.html not found`, 'yellow');
    return;
  }
  
  let html = fs.readFileSync(htmlPath, 'utf-8');
  
  // Check if asset loader is already injected
  if (html.includes('asset-loader.js')) {
    log(`✅ Asset loader already injected`, 'green');
    return;
  }
  
  // Inject before closing body tag
  const assetLoaderScript = '<script src="./asset-loader.js"></script>';
  html = html.replace('</body>', `${assetLoaderScript}\n</body>`);
  
  fs.writeFileSync(htmlPath, html);
  log(`✅ Enhanced index.html with asset loader`, 'green');
}

/**
 * Calculate and display size statistics
 */
function showSizeStats(releaseDir) {
  log('\n📊 Calculating sizes...', 'cyan');
  
  let totalSize = 0;
  let encryptedSize = 0;
  const chunks = [];
  
  const entries = fs.readdirSync(releaseDir);
  for (const entry of entries) {
    const fullPath = path.join(releaseDir, entry);
    if (fs.lstatSync(fullPath).isFile()) {
      const stat = fs.statSync(fullPath);
      totalSize += stat.size;
      
      if (entry.startsWith('assets.asar.enc.chunk')) {
        encryptedSize += stat.size;
        const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
        chunks.push(sizeMB);
      }
    }
  }
  
  log(`✅ Encrypted assets: ${(encryptedSize / 1024 / 1024).toFixed(2)} MB (${chunks.length} chunks)`, 'green');
  chunks.forEach((size, i) => {
    log(`   - Chunk ${i}: ${size} MB`, 'blue');
  });
  
  log(`✅ Total release size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`, 'green');
}

/**
 * Main execution
 */
async function main() {
  log(`\n╔════════════════════════════════════════════════════╗`, 'cyan');
  log(`║   🌐 RPG Hùng Vương - Web Release Builder        ║`, 'cyan');
  log(`╚════════════════════════════════════════════════════╝`, 'cyan');
  
  try {
    const releaseDir = path.join(process.cwd(), 'release');
    const distDir = path.join(process.cwd(), 'dist');
    
    // Already completed by npm scripts:
    // - npm run build:web (creates dist/)
    // - npm run encrypt-assets-chunked (creates chunks and metadata)
    
    // Step 1: Clean release folder
    cleanReleaseFolder(releaseDir);
    
    // Step 2: Copy build files
    copyBuildFiles(distDir, releaseDir);
    
    // Step 3: Copy encrypted chunks
    copyEncryptedChunks(process.cwd(), releaseDir);
    
    // Step 4: Copy asset loader
    copyAssetLoader(releaseDir);
    
    // Step 5: Inject asset loader
    injectAssetLoader(releaseDir);
    
    // Step 6: Show statistics
    showSizeStats(releaseDir);
    
    // Success summary
    log(`\n╔════════════════════════════════════════════════════╗`, 'cyan');
    log(`║           ✅ Web Release Build Complete!          ║`, 'cyan');
    log(`╚════════════════════════════════════════════════════╝`, 'cyan');
    
    log(`\n📦 Output:`, 'green');
    log(`   📁 release/ - Complete web release`, 'blue');
    log(`   🔐 assets.asar.enc.* - Encrypted chunks`, 'blue');
    log(`   📋 assets.meta.json - Encryption metadata`, 'blue');
    log(`   🔧 asset-loader.js - Browser decryption runtime`, 'blue');
    
    log(`\n🚀 Deployment Options:`, 'green');
    log(`   1. GitHub Pages: Push release/ folder to gh-pages branch`, 'blue');
    log(`   2. Netlify: Drag & drop release/ folder`, 'blue');
    log(`   3. Vercel: Deploy release/ as static site`, 'blue');
    log(`   4. Any static host: Upload release/ contents`, 'blue');
    
    log(`\n💡 Next Steps:`, 'green');
    log(`   1. Test locally: npx serve release/ -p 3000`, 'blue');
    log(`   2. Verify decryption works in browser console`, 'blue');
    log(`   3. Deploy to your hosting platform`, 'blue');
    log(`   4. Check browser console for "✅ Game assets ready!"`, 'blue');
    
    log(`\n✅ Build complete!\n`, 'green');
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});
