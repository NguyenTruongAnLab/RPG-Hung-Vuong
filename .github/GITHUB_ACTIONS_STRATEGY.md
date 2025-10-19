# GitHub Actions Workflow Strategy

## 🔴 The Problem

GitHub Actions workflows **cannot** create encrypted assets because:

1. **Assets not in git** - `public/assets/` is .gitignored (proprietary)
2. **No key in CI** - Encryption key (build ID) not accessible in Actions
3. **Workflow isolation** - Each run is sandboxed, can't access local encrypted bundle
4. **File size limit** - Can't store 122.72 MB encrypted bundle in Actions

## ✅ The Solution: Hybrid Approach

### Strategy Overview

```
LOCAL DEVELOPMENT              GITHUB ACTIONS                  DEPLOYMENT
┌─────────────────┐           ┌──────────────┐               ┌──────────────┐
│ You on Computer │           │  Auto Build  │               │   Users      │
├─────────────────┤           ├──────────────┤               ├──────────────┤
│ npm run build:  │           │              │               │              │
│ • build:web ✅  │ PUSH       │ • Test ✅    │  ARTIFACTS   │ GitHub Pages │
│ • encrypt ✅    │ ──────────→│ • Web build  │──────────────→│ + Release    │
│ • build:windows │  CODE      │   ✅        │   (No crypto)│              │
│ • Manual upload │           │              │               │              │
└─────────────────┘           └──────────────┘               └──────────────┘
    (You have                 (Can't access
     encrypted                 local assets)
     bundle)
```

---

## 📋 Implementation Options

### Option 1: Manual Release Process (RECOMMENDED) ⭐

**Best for:** Your current setup (proprietary assets, no CI/CD secrets)

#### What GitHub Actions Does (Automatic)
```yaml
# .github/workflows/deploy.yml - GitHub Pages
ON EVERY PUSH TO MAIN:
  1. Checkout code
  2. npm ci
  3. npm run type-check
  4. npm run test
  5. npm run build:web        # ← No assets (uses placeholders)
  6. Deploy dist/ to GitHub Pages
  
RESULT: Web version auto-deploys ✅ (always works)
```

#### What You Do Manually (One-Time Per Release)
```bash
# On your local machine
npm run build:windows        # Creates release/*.exe with encrypted assets

# Upload to GitHub manually (or GitHub CLI)
gh release create v1.0.0 \
  --title "Release 1.0.0" \
  --notes "Full game with encrypted assets" \
  release/RPG-Hung-Vuong-*.exe
```

**Pros:**
- ✅ Web version auto-deploys every push
- ✅ No secrets needed in GitHub
- ✅ Encrypted assets stay safe locally
- ✅ You control what gets released
- ✅ Simple, works now

**Cons:**
- ⏳ Manual Windows builds (1-2 min)
- ⏳ Manual GitHub release uploads
- ⏳ Must remember to build before releasing

**Setup Time:** 5 minutes

---

### Option 2: GitHub Releases with Artifacts

**Setup local encryption, upload artifact manually**

#### Workflow
```bash
# Step 1: Build everything locally (one time)
npm run build:windows
# Creates: release/*.exe + assets.asar.enc

# Step 2: Upload to GitHub Release via CLI
gh release create v1.0.0 release/*.exe

# Result:
# - release/*.exe available to download
# - Web version auto-deployed by Actions
# - Both versions available to users
```

**Pros:**
- ✅ Both web + Windows available
- ✅ Users download from GitHub
- ✅ Professional distribution

**Cons:**
- ⏳ Manual build + upload per release

**Time Per Release:** 3-5 minutes

---

### Option 3: Store Assets in GitHub Secrets (NOT RECOMMENDED ⚠️)

**Upload encrypted assets as secrets, Actions decrypts**

#### Why Not Recommended
```
❌ Security Risk: Private key exposed in Actions logs
❌ Storage Limit: Only 3GB per secret
❌ Assets too large: 122.72 MB exceeds practical limits
❌ Unnecessary complexity: You're already building locally
❌ CI/CD overhead: Adds 10+ minutes to Actions run time
```

**Not recommended for your use case.**

---

### Option 4: Git LFS for Encrypted Bundle (ADVANCED)

**Store encrypted assets in Git LFS**

#### How It Works
```
1. Create assets.asar.enc (122.72 MB)
2. Upload to GitHub LFS (paid feature)
3. GitHub Actions pulls from LFS
4. Windows build uses assets.asar.enc
5. Automatic release creation
```

**Pros:**
- ✅ Fully automated
- ✅ Every commit gets encrypted assets
- ✅ True CI/CD pipeline

**Cons:**
- ❌ Costs $5/month (1 GB free)
- ❌ Complex setup
- ❌ Overkill for single-player game
- ❌ Still need to update assets.asar.enc each time

**Cost:** $5/month (if exceeding 1 GB free tier)

---

## 🎯 RECOMMENDED: Option 1 + Option 2 Hybrid

### Setup Instructions

#### Step 1: Update Deploy Workflow (Automatic)
Your `deploy.yml` already works! It:
- ✅ Auto-deploys web version on every push
- ✅ Uses placeholders (no assets needed)
- ✅ Tests run every time
- ✅ GitHub Pages always updated

**No changes needed** ✓

#### Step 2: Manual Release Process (Your Computer)

**Build locally:**
```bash
npm run build:windows
# Output: release/RPG-Hung-Vuong-*.exe
```

**Upload to GitHub (Option A - GitHub CLI):**
```bash
# Install: https://cli.github.com/
gh release create v1.0.0 \
  --title "Release 1.0.0" \
  --generate-notes \
  release/RPG-Hung-Vuong-*.exe
```

**Upload to GitHub (Option B - Manual UI):**
1. Go to: https://github.com/YOUR-USERNAME/RPG-Hung-Vuong/releases/new
2. Create new release: `v1.0.0`
3. Drag & drop: `release/*.exe` files
4. Publish release

**Result:**
```
✅ Web version: Auto-deployed via GitHub Pages
✅ Windows version: Manually uploaded to GitHub Releases
✅ Both available to download
✅ Assets encrypted and protected
```

---

## 📊 Current Workflow State

### ✅ Working: `deploy.yml`
```yaml
Trigger: Every push to main
Output: https://nguyentruonganlab.github.io/RPG-Hung-Vuong/
Status: ✅ FULLY FUNCTIONAL
```

### ⚠️ Problem: `release.yml`
```yaml
Issue: Tries to encrypt assets in CI (won't work - no assets)
Problem: GitHub Actions cannot create encrypted bundle
Solution: Skip this workflow, do manual releases instead
Status: ❌ NEEDS REMOVAL OR REDESIGN
```

### ✅ Solution: New `release-windows-only.yml`

Replace the current `release.yml` with a Windows-only release workflow:

```yaml
name: Manual Release - Windows Only

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g., 1.0.0)'
        required: true
        type: string

permissions:
  contents: write

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Create Release (Empty)
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ github.event.inputs.version }}
          name: Release ${{ github.event.inputs.version }}
          body: |
            # RPG Hùng Vương - Release ${{ github.event.inputs.version }}
            
            ## 🎮 Download
            **Web Version:** https://nguyentruonganlab.github.io/RPG-Hung-Vuong/
            
            **Windows Version:** Coming soon...
            
            ⏳ Windows .exe files will be uploaded manually after build completes locally.
            
            ### To Upload Windows Build
            ```bash
            # On your local machine
            npm run build:windows
            
            # Upload via GitHub CLI
            gh release upload v${{ github.event.inputs.version }} release/*.exe
            ```
            
            ## 📖 Instructions
            - **Web:** Open browser, click link above
            - **Windows:** Download .exe and run
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Release Instructions
        run: |
          echo "✅ Release v${{ github.event.inputs.version }} created!"
          echo ""
          echo "📋 NEXT STEPS (on your local machine):"
          echo "1. npm run build:windows"
          echo "2. gh release upload v${{ github.event.inputs.version }} release/*.exe"
          echo ""
          echo "📦 Or upload via GitHub UI:"
          echo "https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong/releases/edit/v${{ github.event.inputs.version }}"
```

---

## 🚀 Complete Release Workflow

### For Web Version (Automatic)
```
git push to main
    ↓
GitHub Actions triggers deploy.yml
    ↓
npm run build:web (uses placeholders)
    ↓
Tests pass ✅
    ↓
Deploy to GitHub Pages
    ↓
https://nguyentruonganlab.github.io/RPG-Hung-Vuong/ updated
⏱️ Automatic, ~2 minutes
```

### For Windows Version (Manual)
```
On your computer:
    npm run build:windows
    ↓
    Creates: release/*.exe with encrypted assets
    ↓
    Upload to GitHub
    
Option A - GitHub CLI:
    gh release create v1.0.0 release/*.exe
    
Option B - Manual UI:
    GitHub Releases → Upload files → Publish
    
⏱️ Manual, ~3-5 minutes total
```

---

## 📋 File Checklist

### Keep
- ✅ `.github/workflows/deploy.yml` (GitHub Pages auto-deploy)
- ✅ `.github/workflows/test-pr.yml` (PR tests)

### Replace or Remove
- ⚠️ `.github/workflows/release.yml` → Replace with `release-windows-only.yml`

### Documentation
- ✅ `ENCRYPTION_IMPLEMENTATION.md` (Technical guide)
- ✅ `BINARY_ASSET_STRATEGY.md` (Strategy guide)
- ✅ `GITHUB_ACTIONS_STRATEGY.md` (This file - CI/CD guide)

---

## 💡 Why This Approach

### Problem with Full Automation
```
GitHub Actions CANNOT:
  ❌ Access your local encrypted assets (not in git)
  ❌ Store 122 MB encrypted file (GitHub limit: 100 MB)
  ❌ Generate encryption key (not in repo)
  ❌ Run 30-60 second build on every push (slow)
```

### Why Manual Release Works
```
You CAN:
  ✅ Build everything locally in 30 seconds
  ✅ Run tests before release
  ✅ Verify game works before uploading
  ✅ Control what gets released
  ✅ Upload via GitHub CLI in <1 minute
  
Total time per release: 5 minutes
```

### Hybrid Benefits
```
Automation handles: ✅ Web version (fast, safe)
Manual handles: ✅ Windows version (controlled, secure)
Users get: ✅ Both versions without extra work
```

---

## 🔧 Implementation Steps

### Step 1: Keep Current Deploy (No Changes)
`deploy.yml` works perfectly as-is ✓

### Step 2: Replace Release Workflow

**Delete:** `.github/workflows/release.yml`

**Create:** `.github/workflows/release-windows-only.yml` with content above

### Step 3: Document for Users

Update `README.md` with:
```markdown
## 📥 Downloads

### 🌐 Web Version (Auto-Updated)
- https://nguyentruonganlab.github.io/RPG-Hung-Vuong/
- Browser-based, no installation
- Updated automatically on every push

### 🪟 Windows Version (Release)
- GitHub Releases: [Download Latest](https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong/releases)
- Full game with encrypted assets
- Professional installer included
```

---

## 📝 Release Checklist

Before each release:

```bash
# 1. Update version in package.json (optional)
npm version patch --no-git-tag-version

# 2. Commit version change
git add package.json
git commit -m "chore: bump version to 1.0.0"
git push origin main

# 3. Wait for GitHub Pages to deploy (~2 minutes)
# Check: https://nguyentruonganlab.github.io/RPG-Hung-Vuong/

# 4. Build Windows version
npm run build:windows

# 5. Verify .exe files exist
ls release/RPG-Hung-Vuong-*.exe

# 6. Create GitHub release
gh release create v1.0.0 \
  --title "Release 1.0.0" \
  --generate-notes \
  release/RPG-Hung-Vuong-*.exe

# 7. Verify
# Check: https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong/releases
```

---

## ✅ Result

### What Users See
```
GitHub Repository
├── 📖 README with download links
├── 🌐 Web Version: GitHub Pages link (always latest)
├── 🪟 Windows Version: GitHub Releases section
│   └── Multiple .exe files to choose from
└── 🔒 Encrypted assets (protected, not extractable)
```

### What Happens On Each Push
```
1. GitHub Actions tests code ✅
2. Web version auto-deploys ✅
3. Windows version stays on last release ✅
   (You manually build + upload when ready)
```

### Your Workflow
```
Development: Normal - git push when ready
Testing: GitHub Actions runs tests automatically
Release Web: Automatic when you push to main
Release Windows: Manual 5-minute process when ready
```

---

## 🎓 Summary

| Aspect | Solution |
|--------|----------|
| **Web Deploy** | ✅ Automatic (GitHub Actions) |
| **Windows Build** | ⏳ Manual (Your computer) |
| **Encrypted Assets** | 🔐 Local only (kept safe) |
| **GitHub Release** | 📦 Manual upload (5 minutes) |
| **User Downloads** | ✅ Both versions available |
| **Complexity** | 🟢 Low (simple, works now) |

---

## 🚀 Next Steps

1. **Decide:** Use this hybrid approach? (Recommended: YES ✅)
2. **Update:** Replace `release.yml` with new workflow
3. **Test:** Try building Windows version: `npm run build:windows`
4. **Verify:** Check that release/*.exe files exist
5. **Document:** Update README with download links
6. **Release:** Follow checklist above for first release

---

*Strategy Document*  
*Created: October 20, 2025*  
*Recommended Implementation: Hybrid Manual + Automatic*
