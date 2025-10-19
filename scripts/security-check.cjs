#!/usr/bin/env node

/**
 * 🔒 Security Pre-Release Checklist
 * Run this before creating a release to verify everything is secure
 * 
 * Usage: node scripts/security-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(name, condition) {
  if (condition) {
    log(`✅ ${name}`, 'green');
    return true;
  } else {
    log(`❌ ${name}`, 'red');
    return false;
  }
}

/**
 * Recursively find all files matching a pattern
 * Windows-compatible version of Unix 'find' command
 */
function findFiles(dir, pattern) {
  const results = [];
  try {
    const files = fs.readdirSync(dir, { recursive: true });
    files.forEach(file => {
      if (file.match(pattern)) {
        results.push(path.join(dir, file));
      }
    });
  } catch (e) {
    // Directory doesn't exist or can't be read
  }
  return results;
}

/**
 * Recursively calculate directory size
 * Windows-compatible version of Unix 'du' command
 * Excludes node_modules and common ignore patterns
 */
function getDirectorySize(dir) {
  let totalSize = 0;
  const ignore = ['node_modules', '.git', 'dist/node_modules'];
  
  try {
    const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
    files.forEach(file => {
      // Skip ignored directories
      const fullPath = file.parentPath ? path.join(file.parentPath, file.name) : file.name;
      if (ignore.some(pattern => fullPath.includes(pattern))) {
        return;
      }
      
      if (file.isFile()) {
        const filePath = path.join(file.parentPath || dir, file.name);
        try {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        } catch (e) {
          // Skip files we can't read
        }
      }
    });
  } catch (e) {
    // Directory doesn't exist
  }
  return totalSize;
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

let allPassed = true;

log('\n🔒 RPG Hùng Vương - Security Pre-Release Checklist\n', 'blue');

// 1. Check if build exists
log('1️⃣  Checking build artifacts...', 'yellow');
if (!fs.existsSync('dist')) {
  log('   ⚠️  dist/ folder not found. Run: npm run build', 'yellow');
  allPassed = check('Build exists', false) && allPassed;
} else {
  allPassed = check('Build exists', true) && allPassed;

  // 2. Check for source maps (Windows-compatible)
  log('\n2️⃣  Scanning for source maps...', 'yellow');
  const sourceMaps = findFiles('dist', /\.map$/);
  const hasSourceMaps = sourceMaps.length > 0;
  allPassed = check('No source maps in dist/', !hasSourceMaps) && allPassed;
  if (hasSourceMaps) {
    log(`   Found ${sourceMaps.length} source maps:`, 'red');
    sourceMaps.slice(0, 5).forEach(file => {
      log(`   - ${file}`, 'red');
    });
    if (sourceMaps.length > 5) {
      log(`   ... and ${sourceMaps.length - 5} more`, 'red');
    }
  }

  // 3. Check build size (Windows-compatible)
  log('\n3️⃣  Checking build size...', 'yellow');
  const sizeBytes = getDirectorySize('dist');
  const sizeFormatted = formatBytes(sizeBytes);
  
  // Calculate JS-only size (ignoring assets)
  const jsFiles = findFiles('dist', /\.js$/);
  let jsOnlySize = 0;
  jsFiles.forEach(file => {
    try {
      const stats = fs.statSync(file);
      jsOnlySize += stats.size;
    } catch (e) {
      // Skip files we can't read
    }
  });
  
  log(`   Total build size: ${sizeFormatted}`, 'blue');
  log(`   JS code size: ${formatBytes(jsOnlySize)}`, 'blue');
  
  // Check JS code is minified (should be < 2MB for typical game)
  if (jsOnlySize > 2 * 1024 * 1024) {
    log('   ⚠️  JavaScript code is too large (>2MB). Check if minification is working.', 'yellow');
    allPassed = false;
  } else {
    allPassed = check('JS code is properly minified', true) && allPassed;
  }
  
  // Note about assets
  if (sizeBytes > 5 * 1024 * 1024) {
    log(`   ℹ️  Large build size is expected (contains ~122MB of game assets/audio)`, 'blue');
  }
}

// 4. Check .env files
log('\n4️⃣  Checking environment files...', 'yellow');
const envFiles = ['.env', '.env.local', '.env.production'];
let foundEnvFiles = [];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    foundEnvFiles.push(file);
  }
});

if (foundEnvFiles.length > 0) {
  log(`   ⚠️  Found ${foundEnvFiles.join(', ')} in repo`, 'red');
  log('   These should NOT be committed to git!', 'red');
  allPassed = false;
} else {
  allPassed = check('No .env files in repo', true) && allPassed;
}

// 5. Check .gitignore for assets
log('\n5️⃣  Checking .gitignore...', 'yellow');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf-8');
  const hasAssetExclude = gitignore.includes('public/assets/');
  allPassed = check('Assets excluded from git', hasAssetExclude) && allPassed;
  
  if (!hasAssetExclude) {
    log('   Add this to .gitignore:', 'red');
    log('   public/assets/', 'red');
  }
} else {
  allPassed = check('.gitignore exists', false) && allPassed;
}

// 6. Check vite.config.js
log('\n6️⃣  Checking vite.config.js...', 'yellow');
if (fs.existsSync('vite.config.js')) {
  const viteConfig = fs.readFileSync('vite.config.js', 'utf-8');
  const hasNoSourceMaps = viteConfig.includes('sourcemap: false');
  const hasMinification = viteConfig.includes('minify: \'terser\'');
  
  allPassed = check('Source maps disabled', hasNoSourceMaps) && allPassed;
  allPassed = check('Terser minification enabled', hasMinification) && allPassed;
} else {
  allPassed = check('vite.config.js exists', false) && allPassed;
}

// 7. Check package.json version
log('\n7️⃣  Checking package.json...', 'yellow');
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  log(`   Version: ${pkg.version}`, 'blue');
  allPassed = check('package.json exists', true) && allPassed;
} else {
  allPassed = check('package.json exists', false) && allPassed;
}

// 8. Run tests
log('\n8️⃣  Running tests...', 'yellow');
try {
  // Run tests silently - capture stdout and stderr
  execSync('npm run test', { 
    stdio: ['pipe', 'pipe', 'pipe']
  });
  allPassed = check('All tests pass', true) && allPassed;
} catch (e) {
  // Check if this is a real failure or just exit code issues
  log('   ⚠️  Tests may have failed. Run: npm run test', 'red');
  allPassed = false;
}

// 9. Check for common secrets (Windows-compatible)
log('\n9️⃣  Scanning for hardcoded secrets...', 'yellow');
const secretPatterns = [
  'PRIVATE_KEY',
  'SECRET_KEY',
  'API_KEY',
  'PASSWORD',
  'TOKEN'
];

let secretsFound = [];
try {
  // Only check src/ and dist/
  const dirs = ['src', 'dist'].filter(d => fs.existsSync(d));
  
  dirs.forEach(dir => {
    secretPatterns.forEach(pattern => {
      const files = findFiles(dir, /\.(js|ts|jsx|tsx)$/);
      files.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          if (content.includes(pattern) && !file.includes('node_modules')) {
            // Get the line number and context
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (line.includes(pattern)) {
                secretsFound.push(`${file}:${idx + 1}: ${line.substring(0, 80)}`);
              }
            });
          }
        } catch (e) {
          // Skip unreadable files
        }
      });
    });
  });
  
  if (secretsFound.length > 0) {
    log('   ⚠️  Potential secrets found:', 'red');
    secretsFound.slice(0, 5).forEach(secret => {
      log(`   ${secret}`, 'red');
    });
    if (secretsFound.length > 5) {
      log(`   ... and ${secretsFound.length - 5} more`, 'red');
    }
  } else {
    allPassed = check('No obvious secrets detected', true) && allPassed;
  }
} catch (e) {
  log('   ⚠️  Could not scan for secrets', 'yellow');
}

// 10. Check GitHub workflow exists
log('\n🔟 Checking GitHub workflows...', 'yellow');
const workflows = [
  '.github/workflows/deploy.yml',
  '.github/workflows/release.yml'
];

workflows.forEach(workflow => {
  if (fs.existsSync(workflow)) {
    allPassed = check(`${workflow} exists`, true) && allPassed;
  } else {
    allPassed = check(`${workflow} exists`, false) && allPassed;
  }
});

// Summary
log('\n' + '='.repeat(50), 'blue');
if (allPassed) {
  log('✅ All security checks passed! Ready to release.', 'green');
  log('   Next steps:', 'blue');
  log('   1. Go to GitHub Actions', 'blue');
  log('   2. Run "Create Release (Web + Windows Build)" workflow', 'blue');
  log('   3. Enter version number (e.g., 1.0.0)', 'blue');
  process.exit(0);
} else {
  log('❌ Some checks failed. Please review above.', 'red');
  log('   Fix the issues and run this script again.', 'red');
  process.exit(1);
}
