#!/usr/bin/env node

/**
 * 🔐 Asset Encryption Script
 * 
 * Creates encrypted ASAR bundle of proprietary assets
 * Output: assets.asar.enc (encrypted with AES-256-GCM)
 * 
 * Usage:
 *   node scripts/encrypt-assets.cjs
 */

const asar = require('asar');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * Generate a consistent key from build metadata
 * Uses scrypt for strong key derivation
 */
function generateEncryptionKey(buildId) {
  try {
    return crypto.scryptSync(
      buildId,
      Buffer.from('rpg-hung-vuong-assets-v1'),
      32 // 256-bit key for AES-256
    );
  } catch (error) {
    log(`❌ Error generating key: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Create ASAR archive from assets directory
 */
async function createAsarArchive(assetsDir, asarFile) {
  log(`\n📦 Creating ASAR archive...`, 'cyan');
  
  try {
    if (!fs.existsSync(assetsDir)) {
      throw new Error(`Assets directory not found: ${assetsDir}`);
    }

    // Count files using fs instead of execSync for cross-platform compatibility
    function countFiles(dir) {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          count += countFiles(path.join(dir, entry.name));
        } else {
          count++;
        }
      }
      return count;
    }

    const fileCount = countFiles(assetsDir);

    log(`  📁 Source: ${assetsDir}`, 'blue');
    log(`  ✓ Found ${fileCount} asset files`, 'green');

    await asar.createPackage(assetsDir, asarFile);
    
    const stats = fs.statSync(asarFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    log(`  ✅ ASAR created: ${asarFile} (${sizeMB} MB)`, 'green');
    return asarFile;
  } catch (error) {
    log(`  ❌ Error creating ASAR: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Encrypt ASAR file with AES-256-GCM
 */
function encryptAsarFile(asarFile, encryptedFile, key) {
  log(`\n🔐 Encrypting ASAR with AES-256-GCM...`, 'cyan');
  
  try {
    // Use random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    // Read ASAR file
    const input = fs.readFileSync(asarFile);
    
    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(input),
      cipher.final()
    ]);
    
    // Get auth tag for integrity verification
    const authTag = cipher.getAuthTag();
    
    // Write encrypted file: IV + authTag + encryptedData
    const combined = Buffer.concat([iv, authTag, encrypted]);
    fs.writeFileSync(encryptedFile, combined);
    
    const origSizeMB = (input.length / 1024 / 1024).toFixed(2);
    const encSizeMB = (combined.length / 1024 / 1024).toFixed(2);
    
    log(`  ✅ Encryption complete`, 'green');
    log(`     Original: ${origSizeMB} MB`, 'blue');
    log(`     Encrypted: ${encSizeMB} MB (IV + authTag + ciphertext)`, 'blue');
    
    return { iv, authTag, combined };
  } catch (error) {
    log(`  ❌ Error encrypting: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Save metadata for decryption at runtime
 */
function saveMetadata(metaFile, keyInfo, iv, authTag) {
  log(`\n📋 Saving metadata...`, 'cyan');
  
  try {
    const metadata = {
      version: 1,
      algorithm: 'aes-256-gcm',
      keySize: 256,
      keyDerivation: 'scrypt',
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      timestamp: new Date().toISOString(),
      buildId: keyInfo.buildId,
      hint: 'Decryption key derived from build ID + salt'
    };
    
    fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 2));
    log(`  ✅ Metadata saved: ${metaFile}`, 'green');
    
    return metadata;
  } catch (error) {
    log(`  ❌ Error saving metadata: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Verify encrypted file integrity
 */
function verifyEncryption(encryptedFile, key, metadata) {
  log(`\n🔍 Verifying encryption...`, 'cyan');
  
  try {
    const combined = fs.readFileSync(encryptedFile);
    
    // Extract components
    const iv = Buffer.from(metadata.iv, 'hex');
    const authTag = Buffer.from(metadata.authTag, 'hex');
    const encrypted = combined.slice(32); // After IV + authTag (16 + 16)
    
    // Try to decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    try {
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      log(`  ✅ Encryption verified successfully`, 'green');
      log(`     Decrypted size: ${(decrypted.length / 1024 / 1024).toFixed(2)} MB`, 'blue');
      return true;
    } catch (authError) {
      log(`  ❌ Authentication tag mismatch - file may be corrupted`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ Verification failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main encryption workflow
 */
async function main() {
  try {
    log('\n╔════════════════════════════════════════════════════╗', 'cyan');
    log('║     🔐 RPG Hùng Vương - Asset Encryption Tool     ║', 'cyan');
    log('╚════════════════════════════════════════════════════╝', 'cyan');
    
    const rootDir = path.join(__dirname, '..');
    const assetsDir = path.join(rootDir, 'public', 'assets');
    const asarFile = path.join(rootDir, 'assets.asar');
    const encryptedFile = path.join(rootDir, 'assets.asar.enc');
    const metaFile = path.join(rootDir, 'assets.meta.json');
    
    // Check if assets exist
    if (!fs.existsSync(assetsDir)) {
      log(`\n❌ Assets directory not found: ${assetsDir}`, 'red');
      log('   Make sure you have assets in public/assets/', 'yellow');
      process.exit(1);
    }
    
    // Generate build ID (use git commit hash or timestamp)
    let buildId = process.env.ASSET_KEY;
    if (!buildId) {
      try {
        buildId = execSync('git rev-parse --short HEAD', { 
          encoding: 'utf-8',
          cwd: rootDir,
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        log(`\nℹ️  Using git commit: ${buildId}`, 'blue');
      } catch {
        buildId = `build-${Date.now()}`;
        log(`\nℹ️  Using timestamp build ID: ${buildId}`, 'blue');
      }
    } else {
      log(`\nℹ️  Using ASSET_KEY environment variable`, 'blue');
    }
    
    // Step 1: Create ASAR
    await createAsarArchive(assetsDir, asarFile);
    
    // Step 2: Generate encryption key
    const key = generateEncryptionKey(buildId);
    log(`\n🔑 Encryption key generated (AES-256)`, 'green');
    
    // Step 3: Encrypt ASAR
    const { iv, authTag } = encryptAsarFile(asarFile, encryptedFile, key);
    
    // Step 4: Save metadata
    const metadata = saveMetadata(metaFile, { buildId }, iv, authTag);
    
    // Step 5: Verify
    const verified = verifyEncryption(encryptedFile, key, metadata);
    
    if (!verified) {
      log('\n⚠️  Verification failed! Encryption may have issues.', 'yellow');
      process.exit(1);
    }
    
    // Step 6: Cleanup
    log(`\n🧹 Cleaning up...`, 'cyan');
    if (fs.existsSync(asarFile)) {
      fs.unlinkSync(asarFile);
      log(`  ✅ Removed temporary ASAR: ${asarFile}`, 'green');
    }
    
    // Summary
    log('\n╔════════════════════════════════════════════════════╗', 'green');
    log('║              ✅ Encryption Complete!              ║', 'green');
    log('╚════════════════════════════════════════════════════╝', 'green');
    
    log(`\n📦 Output Files:`, 'cyan');
    log(`   • ${encryptedFile}`, 'blue');
    log(`   • ${metaFile}`, 'blue');
    
    log(`\n🔑 Key Information:`, 'cyan');
    log(`   Build ID: ${buildId}`, 'blue');
    log(`   Algorithm: AES-256-GCM`, 'blue');
    log(`   IV: ${iv.toString('hex').substring(0, 16)}...`, 'blue');
    log(`   Auth Tag: ${authTag.toString('hex')}`, 'blue');
    
    log(`\n💡 Next Steps:`, 'cyan');
    log(`   1. Include assets.asar.enc in your Electron build`, 'blue');
    log(`   2. Update main.ts to decrypt at runtime`, 'blue');
    log(`   3. Build: npm run build:windows`, 'blue');
    
    log(`\n✅ Ready for Windows binary packaging!\n`, 'green');
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run
main().catch(error => {
  log(`\nUnhandled error: ${error.message}`, 'red');
  process.exit(1);
});
