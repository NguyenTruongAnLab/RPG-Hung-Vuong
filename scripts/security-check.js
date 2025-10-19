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

let allPassed = true;

log('\n🔒 RPG Hùng Vương - Security Pre-Release Checklist\n', 'blue');

// 1. Check if build exists
log('1️⃣  Checking build artifacts...', 'yellow');
if (!fs.existsSync('dist')) {
  log('   ⚠️  dist/ folder not found. Run: npm run build', 'yellow');
  allPassed = check('Build exists', false) && allPassed;
} else {
  allPassed = check('Build exists', true) && allPassed;

  // 2. Check for source maps
  log('\n2️⃣  Scanning for source maps...', 'yellow');
  try {
    const result = execSync('find dist -name "*.map" 2>/dev/null | head -20', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const hasSourceMaps = result.trim().length > 0;
    allPassed = check('No source maps in dist/', !hasSourceMaps) && allPassed;
    if (hasSourceMaps) {
      log(`   Found ${result.split('\n').filter(l => l).length} source maps:`, 'red');
      result.split('\n').filter(l => l).forEach(file => {
        log(`   - ${file}`, 'red');
      });
    }
  } catch (e) {
    log('   ⚠️  Could not scan for source maps', 'yellow');
  }

  // 3. Check build size
  log('\n3️⃣  Checking build size...', 'yellow');
  try {
    const stats = execSync('du -sh dist 2>/dev/null', { encoding: 'utf-8' });
    const size = stats.split('\t')[0];
    log(`   Build size: ${size}`, 'blue');
    
    // Warn if too large
    const sizeNum = parseInt(size);
    if (sizeNum > 5) {
      log('   ⚠️  Build is larger than expected (>5MB)', 'yellow');
      allPassed = false;
    } else {
      allPassed = check('Build size reasonable', true) && allPassed;
    }
  } catch (e) {
    log('   ⚠️  Could not determine build size', 'yellow');
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
  execSync('npm run test 2>&1 > /dev/null', { stdio: 'pipe' });
  allPassed = check('All tests pass', true) && allPassed;
} catch (e) {
  log('   ⚠️  Tests failed! Run: npm run test', 'red');
  allPassed = false;
}

// 9. Check for common secrets
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
      try {
        const result = execSync(`grep -r "${pattern}" ${dir} 2>/dev/null || true`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        });
        
        if (result && result.length > 0) {
          result.split('\n').filter(l => l && !l.includes('node_modules')).slice(0, 3).forEach(line => {
            secretsFound.push(`${line}`);
          });
        }
      } catch (e) {
        // Ignore
      }
    });
  });
  
  if (secretsFound.length > 0) {
    log('   ⚠️  Potential secrets found:', 'red');
    secretsFound.slice(0, 5).forEach(secret => {
      log(`   ${secret}`, 'red');
    });
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
