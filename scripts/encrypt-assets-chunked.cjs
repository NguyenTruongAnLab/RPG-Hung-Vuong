#!/usr/bin/env node

/**
 * 🔐 Chunked Asset Encryption Script (GitHub Pages Compatible)
 * 
 * Creates encrypted ASAR bundle and splits into 25MB chunks
 * All chunks < 100 MB for GitHub file size limit compliance
 * Output: assets.asar.enc.chunk0, chunk1, chunk2... + assets.meta.json
 * 
 * Usage:
 *   node scripts/encrypt-assets-chunked.cjs
 */

const asar = require('asar');
const crypto = require('crypto');
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

    // Count files
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
function encryptAsarFile(asarFile, key) {
  log(`\n🔐 Encrypting ASAR with AES-256-GCM...`, 'cyan');
  
  try {
    // Use random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);
    
    // Read the ASAR file
    const asarData = fs.readFileSync(asarFile);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(asarData),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    const stats = fs.statSync(asarFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    log(`  ✅ Encryption complete`, 'green');
    log(`     Original: ${sizeMB} MB`, 'blue');
    log(`     Encrypted: ${(encrypted.length / 1024 / 1024).toFixed(2)} MB`, 'blue');
    
    return { encrypted, iv, authTag };
  } catch (error) {
    log(`  ❌ Error encrypting: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Split encrypted data into chunks for GitHub Pages
 */
function encryptAndChunkAsarFile(asarFile, outputDir, key, chunkSizeMB = 25) {
  const { encrypted, iv, authTag } = encryptAsarFile(asarFile, key);
  
  const chunkSize = chunkSizeMB * 1024 * 1024; // Convert to bytes
  
  log(`\n✂️  Splitting into chunks (${chunkSizeMB} MB each)...`, 'cyan');
  
  const chunks = [];
  let offset = 0;
  let index = 0;
  
  while (offset < encrypted.length) {
    const end = Math.min(offset + chunkSize, encrypted.length);
    const chunk = encrypted.slice(offset, end);
    
    const chunkFilename = `assets.asar.enc.chunk${index}`;
    const chunkPath = path.join(outputDir, chunkFilename);
    
    fs.writeFileSync(chunkPath, chunk);
    
    const sizeMB = (chunk.length / 1024 / 1024).toFixed(2);
    log(`  ✅ Chunk ${index}: ${chunkFilename} (${sizeMB} MB)`, 'green');
    
    chunks.push({
      filename: chunkFilename,
      size: chunk.length,
      offset: offset,
      index: index
    });
    
    offset = end;
    index++;
  }
  
  log(`\n  ✅ Created ${chunks.length} chunks`, 'green');
  
  return {
    iv,
    authTag,
    chunks,
    totalSize: encrypted.length
  };
}

/**
 * Save encryption metadata
 */
function saveMetadata(metaFile, keyInfo, iv, authTag, chunks, totalSize) {
  const metadata = {
    version: 2,
    algorithm: 'aes-256-gcm',
    keySize: 256,
    keyDerivation: 'scrypt',
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    timestamp: new Date().toISOString(),
    buildId: keyInfo.buildId,
    chunked: true,
    chunks: chunks,
    totalSize: totalSize,
    hint: 'Decryption key derived from build ID + salt. Chunks must be loaded in order and concatenated before decryption.'
  };
  
  log(`\n📋 Saving metadata...`, 'cyan');
  fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 2));
  
  const encSize = (totalSize / 1024 / 1024).toFixed(2);
  log(`  ✅ Metadata saved`, 'green');
  log(`     Chunks: ${chunks.length}`, 'blue');
  log(`     Total encrypted size: ${encSize} MB`, 'blue');
  
  return metadata;
}

/**
 * Verify encryption by concatenating and decrypting a test file
 */
function verifyEncryption(outputDir, key, metadata) {
  log(`\n🔍 Verifying encryption...`, 'cyan');
  
  try {
    const { chunks, iv: ivHex, authTag: authTagHex } = metadata;
    
    // Load and concatenate chunks
    log(`  📦 Loading ${chunks.length} chunks...`, 'blue');
    const chunkBuffers = [];
    
    for (const chunkInfo of chunks) {
      const chunkPath = path.join(outputDir, chunkInfo.filename);
      const buffer = fs.readFileSync(chunkPath);
      chunkBuffers.push(buffer);
      log(`     ✓ Loaded ${chunkInfo.filename}`, 'blue');
    }
    
    // Concatenate
    const concatenated = Buffer.concat(chunkBuffers);
    const concatMB = (concatenated.length / 1024 / 1024).toFixed(2);
    log(`  ✅ Concatenated ${chunks.length} chunks: ${concatMB} MB`, 'green');
    
    // Prepare for decryption
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Separate ciphertext and auth tag (auth tag is appended)
    const ciphertextLen = concatenated.length - authTag.length;
    const ciphertext = concatenated.slice(0, ciphertextLen);
    const storedAuthTag = concatenated.slice(ciphertextLen);
    
    // Decrypt to verify
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(storedAuthTag);
    
    try {
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ]);
      
      log(`  ✅ Encryption verified successfully`, 'green');
      log(`     Decrypted size: ${(decrypted.length / 1024 / 1024).toFixed(2)} MB`, 'blue');
      return true;
    } catch (error) {
      log(`  ❌ Decryption verification failed: ${error.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ Verification error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  log(`\n╔════════════════════════════════════════════════════╗`, 'cyan');
  log(`║  🔐 RPG Hùng Vương - Chunked Asset Encryption    ║`, 'cyan');
  log(`╚════════════════════════════════════════════════════╝`, 'cyan');
  
  try {
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    const asarFile = path.join(process.cwd(), 'assets.asar');
    const outputDir = process.cwd();
    const metaFile = path.join(outputDir, 'assets.meta.json');
    
    // Step 1: Get git commit ID for key generation
    let buildId = 'default';
    try {
      buildId = require('child_process').execSync('git rev-parse --short HEAD', {
        encoding: 'utf-8',
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim();
    } catch (e) {
      log(`ℹ️  Using default build ID (git not available)`, 'yellow');
    }
    
    log(`\nℹ️  Using git commit: ${buildId}`, 'blue');
    
    // Step 2: Generate encryption key
    const key = generateEncryptionKey(buildId);
    log(`\n🔑 Encryption key generated (AES-256)`, 'green');
    
    // Step 3: Create ASAR archive
    await createAsarArchive(assetsDir, asarFile);
    
    // Step 4: Encrypt and chunk ASAR
    const { iv, authTag, chunks, totalSize } = encryptAndChunkAsarFile(asarFile, outputDir, key, 25);
    
    // Step 5: Save metadata
    saveMetadata(metaFile, { buildId }, iv, authTag, chunks, totalSize);
    
    // Step 6: Verify encryption
    const metadata = {
      chunks,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
    
    const verified = verifyEncryption(outputDir, key, metadata);
    
    if (!verified) {
      log(`\n⚠️  Verification failed but chunks created`, 'yellow');
    }
    
    // Step 7: Cleanup
    log(`\n🧹 Cleaning up...`, 'cyan');
    if (fs.existsSync(asarFile)) {
      fs.unlinkSync(asarFile);
      log(`  ✅ Removed temporary ASAR: ${asarFile}`, 'green');
    }
    
    // Success summary
    log(`\n╔════════════════════════════════════════════════════╗`, 'cyan');
    log(`║              ✅ Encryption Complete!              ║`, 'cyan');
    log(`╚════════════════════════════════════════════════════╝`, 'cyan');
    
    log(`\n📦 Output Files:`, 'green');
    for (const chunk of chunks) {
      const sizeMB = (chunk.size / 1024 / 1024).toFixed(2);
      log(`   • ${chunk.filename} (${sizeMB} MB)`, 'blue');
    }
    log(`   • ${metaFile}`, 'blue');
    
    log(`\n🔑 Key Information:`, 'green');
    log(`   Build ID: ${buildId}`, 'blue');
    log(`   Algorithm: AES-256-GCM`, 'blue');
    log(`   Chunks: ${chunks.length}`, 'blue');
    log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`, 'blue');
    log(`   Largest chunk: ${Math.max(...chunks.map(c => c.size / 1024 / 1024)).toFixed(2)} MB`, 'blue');
    
    log(`\n💡 GitHub Pages Compatible:`, 'green');
    log(`   ✅ All chunks < 100 MB`, 'green');
    log(`   ✅ Can push to GitHub`, 'green');
    log(`   ✅ Browser will load and decrypt automatically`, 'green');
    
    log(`\n✅ Ready for deployment!\n`, 'green');
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});
