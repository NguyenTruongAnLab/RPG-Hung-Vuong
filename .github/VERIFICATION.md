# Human Playability Verification Checklist

**Purpose**: This checklist must be completed before marking any feature, fix, or phase as "COMPLETE" or "DONE".

**Rule**: No code is considered working unless a human has played through the complete user flow and verified that it works as experienced by the player.

---

## 🎮 Pre-Launch Verification

Before declaring game ready:

- [ ] **Game loads without errors**
  - Open browser console (F12)
  - Navigate to the deployed game URL
  - Check for 0 critical errors (404s, undefined errors, etc.)
  - Warnings are acceptable if they don't block functionality

- [ ] **Assets load correctly**
  - Character sprites/animations display (or fallback graphics work)
  - Audio files load (or silent mode works gracefully)
  - Tilemaps render properly
  - UI elements are visible

---

## 🎯 Core Game Loop Verification

### 1. Character Selection
**User Flow**: Landing → Character Selection → Pick 3 monsters → Start Game

**Verification Steps**:
- [ ] Character selection screen displays
- [ ] Element tabs (Kim, Mộc, Thủy, Hỏa, Thổ) are clickable
- [ ] Monsters display in grid (or placeholders show)
- [ ] Click on monster adds it to party (max 3)
- [ ] Selected monsters show in party panel on right
- [ ] "BẮT ĐẦU" button enables after selecting 1-3 monsters
- [ ] Click "BẮT ĐẦU" transitions to overworld

**Pass Criteria**: Can select monsters and start game without errors.

---

### 2. Overworld Exploration
**User Flow**: Overworld Scene → Move player → Encounter trigger

**Verification Steps**:
- [ ] Overworld map displays
- [ ] Player character is visible on map
- [ ] WASD/Arrow keys move player
- [ ] Player collides with walls (doesn't walk through)
- [ ] Camera follows player smoothly
- [ ] UI shows controls hint
- [ ] HP bar/stats display correctly
- [ ] Can trigger battle (manual or random encounter)

**Pass Criteria**: Can move around map and trigger battle without errors.

---

### 3. Battle System
**User Flow**: Battle Trigger → Turn-based Combat → Victory/Defeat → Return to Overworld

**Verification Steps**:
- [ ] Battle scene loads after encounter
- [ ] Player monster displays on left (or placeholder)
- [ ] Enemy monster displays on right (or placeholder)
- [ ] HP bars show current/max HP
- [ ] Turn order displays correctly
- [ ] Actions execute (Attack, Skills, Items, Run)
- [ ] Damage numbers appear
- [ ] Element advantages apply correctly (1.5x, 0.5x, 1x)
- [ ] Battle ends when one side reaches 0 HP
- [ ] Victory/Defeat screen shows
- [ ] Returns to overworld after battle

**Pass Criteria**: Can complete one full battle loop and return to overworld.

---

### 4. Audio System
**User Flow**: Game starts → Audio loads → Music plays

**Verification Steps**:
- [ ] Background music plays (or silent if missing)
- [ ] No 404 errors for audio files (check F12 console)
- [ ] Sound effects play on actions (or silent if missing)
- [ ] Volume controls work (if implemented)
- [ ] Music transitions between scenes (Overworld → Battle → Overworld)
- [ ] No crashes if audio fails to load

**Pass Criteria**: Audio loads gracefully (plays or fails silently without blocking game).

---

### 5. DragonBones Animations
**User Flow**: Monster displays → Animation plays (or fallback)

**Verification Steps**:
- [ ] Monster animations load (if assets present)
- [ ] Fallback graphics display if animations fail
- [ ] No "DragonBones not found" errors
- [ ] No "armature display not set" errors
- [ ] Animations play smoothly (idle, attack, hurt, faint)
- [ ] Game doesn't crash if DragonBones fails

**Pass Criteria**: Monsters display (animated or fallback) without blocking game.

---

## 🔧 Technical Health Check

### Browser Console (F12)
- [ ] No critical errors (red)
- [ ] Warnings acceptable if documented
- [ ] PixiJS deprecation warnings addressed
- [ ] Audio 404s handled gracefully
- [ ] DragonBones errors handled gracefully

### Performance
- [ ] Game runs at 60 FPS (or close)
- [ ] No memory leaks (check DevTools → Memory)
- [ ] Smooth transitions between scenes
- [ ] No lag during combat

### Build & Deploy
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes (192 tests)
- [ ] `npm run type-check` passes (0 errors)
- [ ] Deployed to GitHub Pages successfully
- [ ] Deployed version matches local version

---

## ✅ Final Sign-Off

**I have completed ALL the above checks and confirm**:

- [ ] Game loads and plays through complete loop (Character Select → Overworld → Battle → Return)
- [ ] No critical errors block gameplay
- [ ] All missing assets (audio, animations) fail gracefully
- [ ] Game is playable as a human user experiences it
- [ ] Documentation reflects actual game state

**Verified by**: _________  
**Date**: _________  
**Build Version**: _________  
**Deployment URL**: https://nguyentruonganlab.github.io/RPG-Hung-Vuong/

---

## 📝 Notes & Blockers

**Known Issues** (acceptable if documented):
- Audio files may be placeholders (game works silently)
- DragonBones animations may use fallback graphics
- Some monsters may not have completed assets

**Critical Blockers** (must fix before sign-off):
- Game doesn't load
- Cannot select characters
- Cannot move in overworld
- Battle doesn't execute
- Crashes on any core action

---

**Last Updated**: 2025-10-17  
**Version**: 1.0.0
