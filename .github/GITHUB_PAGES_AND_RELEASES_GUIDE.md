# GitHub Pages & Release Deployment Guide

## 🚀 Quick Summary

Your game has **TWO distribution channels** that work together:

| Channel | What | How | When |
|---------|------|-----|------|
| **GitHub Pages** | Web version with placeholders | ✅ Automatic (on every push) | Always latest |
| **GitHub Releases** | Windows .exe with encrypted assets | ⏳ Manual (you build locally) | When ready |

---

## 🌐 GitHub Pages (Automatic Web Deploy)

### How It Works

```
You: git push to main
   ↓
GitHub Actions: Runs deploy.yml
   ↓
1. Checkout code ✅
2. npm install ✅
3. npm run type-check ✅
4. npm run test ✅
5. npm run build:web ✅ (uses placeholders)
6. Deploy dist/ to GitHub Pages ✅
   ↓
Your game is live!
URL: https://nguyentruonganlab.github.io/RPG-Hung-Vuong/
```

### What Gets Deployed
- ✅ Web build from `dist/` folder
- ✅ Placeholder graphics (no proprietary assets)
- ✅ All game mechanics work normally
- ✅ CSS, JavaScript, HTML all minified
- ✅ No source maps (secure)

### When It Updates
- **Automatic:** Every push to `main` branch
- **Manual trigger:** GitHub Actions → Workflows → Deploy to GitHub Pages → Run workflow
- **Time:** ~2 minutes to live

### Example Workflow
```bash
# You make changes
echo "Game update" >> src/main.ts

# Push to GitHub
git add .
git commit -m "Update game mechanics"
git push origin main

# 2 minutes later...
# ✅ https://nguyentruonganlab.github.io/RPG-Hung-Vuong/ is updated!
```

---

## 🪟 GitHub Releases (Manual Windows Deploy)

### Why Manual?

**GitHub Actions CANNOT encrypt assets because:**
1. Assets are .gitignored (not in git)
2. No encryption key in CI environment
3. File too large (122 MB > 100 MB GitHub limit)
4. Can't safely store secrets in workflows

**You CAN build locally because:**
1. ✅ You have the asset files
2. ✅ You have the encryption key (auto-generated)
3. ✅ Your computer has enough storage
4. ✅ You control what gets released

### How It Works

#### Step 1: Build on Your Computer
```bash
npm run build:windows
# Creates release/*.exe with encrypted assets
# Time: ~30-60 seconds
# Output:
#   - RPG-Hung-Vuong-1.0.0.exe (installer)
#   - RPG-Hung-Vuong-1.0.0-portable.exe (portable)
```

#### Step 2: Create Empty Release on GitHub
```bash
# Via GitHub Actions workflow (manual trigger):
gh workflow run release.yml -f version=1.0.0
# OR: GitHub UI → Actions → Release workflow → Run

# Creates empty release: v1.0.0
# Ready to receive .exe files
```

#### Step 3: Upload .exe to Release
```bash
# Option A: GitHub CLI (fastest)
gh release upload v1.0.0 release/*.exe

# Option B: Manual UI
# 1. Go to: https://github.com/YOUR-USERNAME/RPG-Hung-Vuong/releases
# 2. Find release: v1.0.0
# 3. Click "Edit"
# 4. Drag & drop: release/*.exe files
# 5. Click "Update release"
```

#### Step 4: Users Download and Play
```
Users see: GitHub Releases page
           ↓
           Download RPG-Hung-Vuong-1.0.0-portable.exe
           ↓
           Run .exe
           ↓
           Game with full graphics + sound
```

---

## 📋 Complete Release Checklist

### Before Release
- [ ] All changes pushed to main
- [ ] GitHub Pages deployment successful (check it's live)
- [ ] Decide version number (e.g., 1.0.0)

### Step 1: Create Release Shell (GitHub)
```bash
gh workflow run release.yml -f version=1.0.0
# Wait ~30 seconds...
# Release v1.0.0 created on GitHub (empty)
```

### Step 2: Build Windows Version (Your Computer)
```bash
npm run build:windows
# ⏳ Wait 30-60 seconds...
# ✅ Creates release/*.exe files

# Verify files exist
ls release/
# Output:
# - RPG-Hung-Vuong-1.0.0.exe
# - RPG-Hung-Vuong-1.0.0-portable.exe
```

### Step 3: Upload to Release (Your Computer)
```bash
# Using GitHub CLI (fastest)
gh release upload v1.0.0 release/*.exe

# OR upload manually via:
# https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong/releases/edit/v1.0.0
```

### Step 4: Verify and Announce
```bash
# Check release page
gh release view v1.0.0

# Share with users:
# "🎮 New release available! https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong/releases/tag/v1.0.0"
```

---

## 🔧 Tools Setup

### Install GitHub CLI (One-Time)

**Windows:**
```powershell
# Option 1: Winget (Recommended)
winget install GitHub.cli

# Option 2: Chocolatey
choco install gh

# Verify
gh --version
```

**macOS:**
```bash
brew install gh
gh --version
```

**Linux:**
```bash
sudo apt install gh  # Ubuntu/Debian
gh --version
```

### Authenticate
```bash
gh auth login
# Follow prompts:
# - Choose: GitHub.com
# - Choose: HTTPS
# - Choose: Paste authentication token
# OR: Authenticate with browser (easier)
```

### Test Setup
```bash
gh repo view NguyenTruongAnLab/RPG-Hung-Vuong
# Should show repository details
```

---

## 📊 Distribution Summary

### What Users See

**GitHub Page (Free Demo):**
```
✅ Play immediately in browser
✅ No installation needed
✅ Works on Windows/Mac/Linux
❌ Placeholder graphics (not full game)
```

**GitHub Releases (Full Game):**
```
✅ Full game with all graphics
✅ Encrypted assets (protected)
✅ Professional installer
❌ Windows only
```

### Your Workflow

```
Daily Development
├─ git push to main
├─ ✅ GitHub Pages auto-updates (web demo)
└─ Users can play latest web version immediately

Release Day
├─ npm run build:windows
├─ gh release create v1.0.0
├─ gh release upload v1.0.0 release/*.exe
└─ ✅ Users can download full Windows game
```

---

## ⚠️ Common Scenarios

### Scenario 1: Found a Bug
```bash
# Fix bug in code
git add src/myfile.ts
git commit -m "Fix bug in dialogue system"
git push origin main

# ✅ Web version auto-updates in ~2 minutes
# Users playing web demo get fix immediately
```

### Scenario 2: New Asset Release
```bash
# Update public/assets/ locally
# (They're .gitignored, so not pushed to git)

# Build everything
npm run build:windows

# Create release
gh release create v1.1.0
gh release upload v1.1.0 release/*.exe

# ✅ Users download new Windows version with new assets
# ✅ Web version stays same (uses placeholders)
```

### Scenario 3: Want Both Versions Updated
```bash
# Update code + assets
git add src/
git commit -m "Update mechanics"
git push origin main

# ✅ Web version auto-updates (code changes + placeholders)

# Build Windows
npm run build:windows

# Release Windows
gh release create v1.1.0
gh release upload v1.1.0 release/*.exe

# ✅ Both web and Windows updated with code changes
# ✅ Windows has full assets, web has placeholders
```

---

## 🎯 Decision Points

### "Should I Update Web Version?"
- **YES** if: Bug fix, game mechanic change, UI improvement
- **NO** if: Asset-only update (doesn't affect web)

### "Should I Update Windows Version?"
- **YES** if: Any code change OR new assets
- **NO** if: Only web demo needs updating

### "What if I Forget?"
- No problem! You can upload .exe to existing release:
  ```bash
  gh release upload v1.0.0 release/*.exe --clobber
  ```

---

## 🔐 Security Notes

### What's Protected
- ✅ Proprietary assets encrypted in Windows .exe
- ✅ Source code visible on GitHub (open source)
- ✅ No secrets in build artifacts
- ✅ No source maps in distribution

### What's Not Protected
- ❌ Web version uses placeholders (safe anyway)
- ❌ Source code visible on GitHub (intentional)
- ❌ Game can be decompiled (standard for all games)

### Your IP is Protected
- ✅ Assets encrypted (users can't extract)
- ✅ Licensing respected (proprietary content secure)
- ✅ Code open source (your contribution visible)

---

## 📞 Troubleshooting

### "GitHub Actions Never Triggered"
```bash
# Check if deploy.yml exists
ls .github/workflows/deploy.yml

# Check permissions
# GitHub Settings → Actions → Permissions
# Make sure "Allow all actions and reusable workflows" is checked
```

### "Web Version Didn't Update"
```bash
# Check GitHub Actions
# https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong/actions

# Check deployment
# https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong/deployments

# Wait 2-3 minutes (might be slow first time)
```

### "Can't Build Windows Version"
```bash
# Check prerequisites
npm run build:web    # Should work first
npm run encrypt-assets  # Should create 122 MB file
npm run build:windows   # Should create .exe

# If fails, check:
# - Enough disk space (300+ MB)
# - public/assets/ folder exists
# - Node.js 18+
```

### "Release Upload Failed"
```bash
# Make sure release exists
gh release list

# Make sure files exist
ls release/

# Try clobber (overwrite)
gh release upload v1.0.0 release/*.exe --clobber
```

---

## 🎓 What You've Accomplished

### GitHub Pages Setup
✅ Automatic deploys on every push  
✅ Web demo always available  
✅ Professional hosting (free)  
✅ No assets needed (uses placeholders)  

### GitHub Releases Setup
✅ Manual Windows builds (you control)  
✅ Encrypted assets included  
✅ Professional distribution  
✅ Users can download safely  

### Total Workflow
✅ Code changes → Auto-deploy to web  
✅ When ready → Manual release for Windows  
✅ Users get → Both options available  
✅ You benefit → Protected IP + open source  

---

## 🚀 You're Ready!

Your game now has:
- ✅ **Web version:** Auto-deployed, always latest
- ✅ **Windows version:** Manual, full game with encrypted assets
- ✅ **Professional workflow:** GitHub handles hosting and distribution
- ✅ **IP protected:** Assets encrypted, code open source

**Go make updates, push to main, and watch the magic happen!** 🎮

---

*Deployment Guide*  
*Created: October 20, 2025*  
*Last Updated: October 20, 2025*
