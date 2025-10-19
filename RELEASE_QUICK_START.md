# 🚀 Quick Start: Creating Your First Release

## Before You Release (5 minutes)

### Step 1: Run Security Check
```bash
npm run security-check
```

✅ Should see all green checkmarks. If any fail, fix them first.

### Step 2: Verify Build Works Locally
```bash
npm run build
```

✅ Should complete without errors  
✅ Should create `dist/` folder with index.html

### Step 3: Verify No Source Maps
```bash
# On Windows PowerShell:
Get-ChildItem dist -Recurse -Include "*.map"

# On Mac/Linux:
find dist -name "*.map"
```

✅ Should find NOTHING

---

## Creating Your First Release (10 minutes)

### Method 1: GitHub Web UI (Easiest) ⭐

1. **Go to your repository**
   - https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong

2. **Click the "Actions" tab**

3. **Select "Create Release (Web + Windows Build)"** from left sidebar

4. **Click "Run workflow" button** (right side)

5. **Enter release version**
   - Format: `1.0.0`, `1.1.0`, `2.0.0` etc.
   - Click "Run workflow" button

6. **Wait for completion** (~15-20 minutes)
   - You'll see a checkmark ✅ when done
   - If any step fails ❌, click it to see error logs

7. **View your release**
   - Go to **Releases** tab
   - Your new release is at the top
   - Download files or share link

---

## What Gets Built

### 🌐 Web Build
```
RPG-Hung-Vuong-web-1.0.0.zip
├── index.html
├── js/
│   ├── main-[hash].js
│   ├── pixi-[hash].js
│   └── animation-[hash].js
└── assets/
    └── [compressed game assets]
```

**Use for:**
- GitHub Pages (already deployed automatically)
- Offline deployment
- Desktop web browsers
- Cross-platform distribution

---

### 🪟 Windows Builds

#### Portable Executable
```
RPG-Hung-Vuong-1.0.0-portable.exe
(~300MB - includes Electron runtime)
```

**Use for:**
- Distribution to Windows users
- No installation needed
- Just run the .exe file
- Perfect for USB drives or quick sharing

---

#### Windows Installer
```
RPG-Hung-Vuong-Setup-1.0.0.exe
(~300MB - professional installer)
```

**Use for:**
- Professional distribution
- Creates Start Menu shortcuts
- Uninstall via Control Panel
- Better for non-technical users

---

## After Release is Created

### 1. **Download and Test**
```bash
# Extract web build
unzip RPG-Hung-Vuong-web-1.0.0.zip

# Serve locally
python -m http.server 8000

# Open http://localhost:8000
```

### 2. **Create Release Notes** (Optional)
- Go to Releases tab
- Click "Edit" on your release
- Add description of new features/fixes

### 3. **Share with Users**
```
GitHub Releases:
https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong/releases

GitHub Pages (Always Latest):
https://nguyentruonganlab.github.io/RPG-Hung-Vuong/
```

### 4. **Announce**
- Social media
- Game forums
- Friends & community

---

## Troubleshooting Release Issues

### ❌ Release Workflow Failed?

Check the error logs:
1. Go to **Actions** tab
2. Click on your failed release workflow
3. Click on the failed job (e.g., "build-windows")
4. Scroll to see the error message

**Common Issues:**

| Error | Fix |
|-------|-----|
| "Build failed" | Run `npm run build` locally to see error |
| "Tests failed" | Run `npm run test` locally, fix failures |
| "Source maps found" | Check `vite.config.js` has `sourcemap: false` |
| "Type errors" | Run `npm run type-check`, fix TypeScript errors |

---

## Version Numbering Guide

Use **Semantic Versioning**: `MAJOR.MINOR.PATCH`

```
1.0.0  ← First release!
1.0.1  ← Bug fix
1.1.0  ← New features
2.0.0  ← Major breaking changes
```

**When to increment:**
- **MAJOR** (1.x.x): Major new content or breaking changes
- **MINOR** (x.1.x): New features, levels, or content
- **PATCH** (x.x.1): Bug fixes only

---

## Monitoring Your Releases

### GitHub Releases Page
Shows:
- Download counts
- Release date
- Who downloaded what

### GitHub Analytics
Shows:
- Traffic to GitHub Pages
- User engagement
- Download trends

---

## Automation You Now Have ✨

### ✅ On Every Push to Main
- Type checking ✓
- Unit tests ✓
- Build verification ✓
- GitHub Pages deployment ✓

### ✅ On Release Creation
- Web build (minified, no source maps) ✓
- Windows portable executable ✓
- Windows installer ✓
- GitHub Release with download links ✓

---

## Next Release Checklist

```
For Release v1.1.0:

Before Release (5 min):
□ Run `npm run security-check`
□ Run `npm run test` (all pass?)
□ Run `npm run build` (dist/ created?)
□ Check no .map files in dist/

Create Release (GitHub Actions):
□ Go to Actions → Create Release workflow
□ Enter version: 1.1.0
□ Wait for completion
□ All jobs green ✅?

After Release:
□ Download and test locally
□ Update release notes
□ Share with community
□ Celebrate! 🎉
```

---

## Production Deployment Done! 🎉

Your game is now:
- ✅ Secure (minified, no source maps, secrets scanned)
- ✅ Optimized (small bundle, content-hashed)
- ✅ Tested (all CI/CD checks passing)
- ✅ Distributed (Web + Windows builds)
- ✅ Professional (automated releases)

**Every release you create will be:**
- Automatically tested
- Automatically built for multiple platforms
- Available for download on GitHub Releases
- Deployed to GitHub Pages

---

## 📚 Additional Help

- **Full Security Guide**: Read `SECURITY_AND_RELEASE_GUIDE.md`
- **Build Errors**: Check GitHub Actions logs
- **Type Errors**: Run `npm run type-check`
- **Test Failures**: Run `npm run test`

---

**Repository**: https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong  
**Status**: Ready for production releases 🚀
