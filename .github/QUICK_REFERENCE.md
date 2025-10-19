# 🎯 Quick Reference: GitHub Actions Strategy

## Two-Channel Distribution System

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR GAME DISTRIBUTION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CHANNEL 1: GitHub Pages (Web)     CHANNEL 2: GitHub Releases  │
│  ══════════════════════════════════ ═══════════════════════════  │
│                                                                 │
│  🌐 What                           🪟 What                     │
│  └─ Browser-based game             └─ Windows .exe game        │
│                                                                 │
│  ⚙️ How Built                       ⚙️ How Built                │
│  └─ GitHub Actions (automatic)     └─ Your Computer (manual)   │
│                                                                 │
│  📦 Assets                          📦 Assets                   │
│  └─ Placeholders (no encrypted)    └─ Full (encrypted)         │
│                                                                 │
│  🚀 Deploy                          🚀 Deploy                   │
│  └─ Auto on every git push         └─ When you upload          │
│                                                                 │
│  ⏱️ Time to Live                    ⏱️ Time to Live             │
│  └─ ~2 minutes                      └─ ~5 minutes             │
│                                                                 │
│  📍 URL                             📍 URL                      │
│  └─ GitHub Pages link              └─ GitHub Releases link     │
│                                                                 │
│  👥 Best For                        👥 Best For                 │
│  └─ Demo, sharing, quick play      └─ Full game, offline play  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Simple Workflow

```
┌──────────────────────────────────────────────────────────────┐
│ YOU DEVELOP GAME                                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Make changes → git commit → git push origin main            │
│                                    ↓                         │
│  ✅ GitHub Pages auto-updates (2 minutes)                   │
│  └─ Users can play web demo immediately                     │
│                                                              │
│  When ready for Windows release:                            │
│  └─ npm run build:windows                                   │
│  └─ gh release create v1.0.0 (create empty shell)          │
│  └─ gh release upload v1.0.0 release/*.exe (upload .exe)   │
│  └─ ✅ Users can download Windows version                   │
│                                                              │
│  Total time to release: ~5 minutes                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Decision Tree

```
"I want to release an update"
│
├─ "Just code changes (no new assets)"
│  ├─ git push to main
│  └─ ✅ Web auto-updates in 2 minutes
│  └─ Optional: npm run build:windows + upload for new .exe
│
├─ "New assets + code changes"
│  ├─ Update public/assets/ locally
│  ├─ npm run build:windows
│  ├─ gh release create v1.0.0
│  ├─ gh release upload v1.0.0 release/*.exe
│  └─ ✅ Both web (code only) and Windows (full) updated
│
└─ "Just assets (no code changes)"
   ├─ Update public/assets/ locally
   ├─ npm run build:windows
   ├─ gh release create v1.0.0
   ├─ gh release upload v1.0.0 release/*.exe
   └─ ✅ Windows gets new assets, web unchanged (uses placeholders)
```

---

## 🛠️ Command Reference

### For Web Auto-Deploy
```bash
git push origin main
# That's it! GitHub Actions handles the rest
```

### For Windows Release
```bash
# Step 1: Build locally (30-60 seconds)
npm run build:windows

# Step 2: Create release on GitHub (30 seconds)
gh release create v1.0.0

# Step 3: Upload .exe files (30-60 seconds)
gh release upload v1.0.0 release/*.exe

# Total: ~5 minutes
```

### Verify Everything
```bash
# Check web version
open https://nguyentruonganlab.github.io/RPG-Hung-Vuong/

# Check Windows release
gh release view v1.0.0
```

---

## ❓ FAQ

**Q: Why can't GitHub Actions build Windows version?**
```
A: Assets are .gitignored (not in git)
   GitHub Actions can't access local files
   File size too large for GitHub limits
```

**Q: How often do I need to build Windows?**
```
A: Whenever you want to release it
   Could be every day or every month
   Your choice when to build & release
```

**Q: Do I need to manually update GitHub Pages?**
```
A: No! It's fully automatic
   Every git push = auto update (2 min)
   You don't need to do anything
```

**Q: What's the difference between builds?**
```
Web:     No assets (placeholders)     - Play in browser
Windows: Full assets (encrypted)      - Download .exe
```

**Q: Can users play offline?**
```
Web:     No (needs internet)
Windows: Yes (fully offline)
```

---

## 🎯 Summary

```
Your Setup:
├─ ✅ GitHub Pages deployment (automatic)
├─ ✅ Asset encryption (local)
├─ ✅ Two distribution channels (web + Windows)
└─ ✅ Professional release process

User Experience:
├─ Web users: Click link → Play immediately
├─ Windows users: Download .exe → Install → Play
└─ Both: Get great game experience

Your Workflow:
├─ Code changes: git push (2 min auto-deploy)
├─ Release ready: npm run build:windows + gh release upload (5 min)
└─ Total setup: Already done ✅

Security:
├─ ✅ Assets encrypted (Windows only)
├─ ✅ Code open source (GitHub)
├─ ✅ No secrets exposed
└─ ✅ IP protected
```

---

## 🚀 You're Ready!

Everything is set up and working:
- ✅ Web auto-deploys
- ✅ Windows builds manually
- ✅ Both versions available
- ✅ Documentation complete

**Start committing, release when ready!** 🎮

---

*Quick Reference*  
*October 20, 2025*
