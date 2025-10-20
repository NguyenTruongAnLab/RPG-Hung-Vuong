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

function copyEntry(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }

  const stats = fs.lstatSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const entry of fs.readdirSync(src)) {
      copyEntry(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
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
  
  // Copy main build files
  copyEntry(path.join(distDir, 'index.html'), path.join(releaseDir, 'index.html'));
  copyEntry(path.join(distDir, 'js'), path.join(releaseDir, 'js'));
  
  // ⚠️ DO NOT copy assets folder - we only use encrypted chunks
  // Assets are decrypted in browser from encrypted chunks
  // copy(path.join(distDir, 'assets'), path.join(releaseDir, 'assets'));
  
  // Copy favicon if exists
  if (fs.existsSync(path.join(distDir, 'favicon.ico'))) {
    copyEntry(path.join(distDir, 'favicon.ico'), path.join(releaseDir, 'favicon.ico'));
  }
  if (fs.existsSync(path.join(distDir, 'favicon.svg'))) {
    copyEntry(path.join(distDir, 'favicon.svg'), path.join(releaseDir, 'favicon.svg'));
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
 * Copy asset loader scripts
 */
function copyAssetLoader(releaseDir) {
  log('\n🔧 Copying asset loader scripts...', 'cyan');
  
  const publicScriptsDir = path.join(__dirname, '..', 'public', 'scripts');
  
  // Copy asset-loader.js
  const assetLoaderSrc = path.join(publicScriptsDir, 'asset-loader.js');
  const assetLoaderDest = path.join(releaseDir, 'asset-loader.js');
  
  if (fs.existsSync(assetLoaderSrc)) {
    fs.copyFileSync(assetLoaderSrc, assetLoaderDest);
    log(`   ✓ Copied asset-loader.js`, 'green');
  } else {
    log(`   ⚠️  asset-loader.js not found in public/scripts`, 'yellow');
  }
  
  // Copy asar-reader.js
  const asarReaderSrc = path.join(publicScriptsDir, 'asar-reader.js');
  const asarReaderDest = path.join(releaseDir, 'asar-reader.js');
  
  if (fs.existsSync(asarReaderSrc)) {
    fs.copyFileSync(asarReaderSrc, asarReaderDest);
    log(`   ✓ Copied asar-reader.js`, 'green');
  } else {
    log(`   ⚠️  asar-reader.js not found in public/scripts`, 'yellow');
  }
  
  log(`✅ Asset loader scripts copied`, 'green');
}

/**
 * Inject asset loader into index.html
 * CRITICAL: Scripts must load BEFORE the game module in <head>
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
  
  // Inject scripts in <head> BEFORE game module (critical for proper load order)
  // Asset loader must be available when main.ts executes
  const scripts = `
  <!-- 🔐 CRITICAL: Load asset system BEFORE game module! -->
  <script src="./asar-reader.js"></script>
  <script src="./asset-loader.js"></script>
  
  <!-- Game module loads after asset system is initialized -->
  `;
  
  // Find the first <script type="module"> tag and inject before it
  const moduleScriptPattern = /(<script type="module")/;
  if (moduleScriptPattern.test(html)) {
    html = html.replace(moduleScriptPattern, `${scripts}$1`);
    log(`✅ Enhanced index.html with encrypted asset system (in <head>)`, 'green');
  } else {
    log(`⚠️  Could not find module script tag, falling back to </head> injection`, 'yellow');
    html = html.replace('</head>', `${scripts}\n</head>`);
  }
  
  fs.writeFileSync(htmlPath, html);
}

/**
 * Create index-local.html for local testing
 * Converts GitHub Pages paths to relative paths
 */
function createLocalVersion(releaseDir) {
  log('\n🏠 Creating local testing version...', 'cyan');
  
  const htmlPath = path.join(releaseDir, 'index.html');
  const localPath = path.join(releaseDir, 'index-local.html');
  
  if (!fs.existsSync(htmlPath)) {
    log(`⚠️  index.html not found`, 'yellow');
    return;
  }
  
  let html = fs.readFileSync(htmlPath, 'utf-8');
  
  // Replace GitHub Pages paths with relative paths
  html = html.replace(/\/RPG-Hung-Vuong\//g, './');
  
  // Update title
  html = html.replace(/<title>(.*?)<\/title>/, '<title>$1 (Local Test)</title>');
  
  // Add loading UI
  const loadingUI = `
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-size: 24px;
        }
        #loading-progress {
            margin-top: 20px;
            font-size: 18px;
            color: #4CAF50;
        }`;
  
  html = html.replace('</style>', `${loadingUI}\n    </style>`);
  
  // Add loading div
  const loadingDiv = `
        <div id="loading">
            🔐 Loading encrypted assets...
            <div id="loading-progress">Please wait...</div>
        </div>`;
  
  html = html.replace('<div id="game-container">', `<div id="game-container">${loadingDiv}`);
  
  // Add event listeners
  const eventListeners = `

<script>
    // Update loading progress
    window.addEventListener('assetsReady', () => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = '✅ Assets ready! Starting game...';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 1000);
        }
    });
    
    window.addEventListener('assetsFailed', () => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = '❌ Failed to load assets!<br>Check console for details.';
        }
    });
</script>`;
  
  html = html.replace('</body>', `${eventListeners}\n</body>`);
  
  fs.writeFileSync(localPath, html);
  log(`✅ Created index-local.html for local testing`, 'green');
}

function createLocalMirror(releaseDir, repoBase = 'RPG-Hung-Vuong') {
  log('\n🪞 Creating local base-path mirror...', 'cyan');
  
  // OPTIMIZED: Only create .html redirect files, no duplication
  // Use index-local.html for local testing (already uses relative paths)
  // Only create minimal index.html in subfolder for GitHub Pages path testing
  
  const mirrorDir = path.join(releaseDir, repoBase);

  if (fs.existsSync(mirrorDir)) {
    removeDir(mirrorDir);
  }

  fs.mkdirSync(mirrorDir, { recursive: true });

  // Create minimal redirect to show the mirror exists
  const redirectHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=../index-local.html">
</head>
<body>
    <p>Redirecting to local test page...</p>
    <p>If not redirected, use <a href="../index-local.html">index-local.html</a> for local testing.</p>
</body>
</html>`;

  fs.writeFileSync(path.join(mirrorDir, 'index.html'), redirectHtml);
  
  log(`✅ Local mirror ready at ${repoBase}/ (lightweight redirect only)`, 'green');
  log(`   💡 Use index-local.html directly for testing (no duplication)`, 'blue');
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
    
  // Step 6: Create local testing version
    createLocalVersion(releaseDir);
    
  // Step 7: Mirror release for absolute GitHub Pages base path
  createLocalMirror(releaseDir);

  // Step 8: Show statistics
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
    log(`   1. Test locally: npx serve release -p 3000`, 'blue');
    log(`   2. Open http://localhost:3000/index-local.html`, 'blue');
    log(`   3. Verify decryption works in browser console`, 'blue');
    log(`   4. Deploy to your hosting platform`, 'blue');
    log(`   5. Check browser console for "✅ Game assets ready!"`, 'blue');
    log(`\n   📝 Note: Use index-local.html for local testing`, 'yellow');
    log(`   📝 Use index.html for GitHub Pages deployment`, 'yellow');
    
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
