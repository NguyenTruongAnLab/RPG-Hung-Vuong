/**
 * Debug script to test ASAR path normalization
 */

const asar = require('asar');
const fs = require('fs');

// Create test ASAR
console.log('Creating test ASAR...');
asar.createPackage('./public/assets', './debug.asar').then(() => {
  console.log('✅ ASAR created');
  
  // Load ASAR content
  const buffer = fs.readFileSync('./debug.asar');
  const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  
  // Parse header like the browser code
  const headerSize = dataView.getUint32(4, true);
  const headerPayloadSize = dataView.getUint32(8, true);
  const jsonLength = dataView.getUint32(12, true);

  const jsonStart = 16;
  const jsonEnd = jsonStart + jsonLength;
  const jsonBytes = buffer.slice(jsonStart, jsonEnd);
  const headerText = new TextDecoder('utf-8').decode(jsonBytes);

  const fileTree = JSON.parse(headerText);
  
  console.log('\n📁 Raw file tree structure:');
  console.log('Root keys:', Object.keys(fileTree.files));
  
  // Check dragonbones_assets
  const dbAssets = fileTree.files;
  const dbKeys = Object.keys(dbAssets).filter(k => k.includes('dragonbones_assets'));
  console.log('\nDragonBones keys found:', dbKeys);
  
  // Show first few files in dragonbones_assets
  if (dbKeys.length > 0) {
    const dbKey = dbKeys[0];
    console.log(`\nContents of '${dbKey}':`, Object.keys(dbAssets[dbKey].files).slice(0, 5));
  }
  
  // Test path lookup
  console.log('\n🧪 Testing path lookups:');
  
  // Function to find file with different path formats
  function testPath(testPath) {
    console.log(`\nTesting: "${testPath}"`);
    
    // Try direct lookup using forward slashes
    const parts = testPath.split('/').filter(p => p.length > 0);
    let current = fileTree.files;
    let found = true;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      console.log(`  Looking for part: "${part}"`);
      console.log(`  Available keys:`, Object.keys(current).slice(0, 5), '...');
      
      if (current[part]) {
        console.log(`  ✅ Found "${part}"`);
        if (i === parts.length - 1) {
          console.log(`  📄 Final file info:`, current[part]);
        } else {
          current = current[part].files;
        }
      } else {
        console.log(`  ❌ Not found "${part}"`);
        found = false;
        break;
      }
    }
    
    return found;
  }
  
  testPath('dragonbones_assets/Absolution_ske.json');
  
  // Clean up
  fs.unlinkSync('./debug.asar');
  console.log('\n🧹 Cleaned up debug ASAR');
}).catch(err => console.error('Error:', err));