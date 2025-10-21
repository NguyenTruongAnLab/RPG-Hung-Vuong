# GitHub Copilot Instructions

## 🚀 Quick Start

### For First-Time Reading:
**Read these files in order:**

2. **.github/01-PROJECT-VISION.md** - Understand what we're building
3. **.github/02-ARCHITECTURE-RULES.md** - The 4 Commandments (CRITICAL!)
4. **.github/03-TECH-STACK.md** - Libraries you MUST use
5. **.github/06-CURRENT-STATE.md** - What's already done
6. **.github/07-ROADMAP.md** - What to work on next

### For Returning to Work:
**Quick reference:**
- Check **.github/06-CURRENT-STATE.md** - What's implemented?
- Check **.github/07-ROADMAP.md** - What's next priority?
- Refer **.github/04-CODING-STANDARDS.md** - Style guide
- Refer **.github/09-COMMON-TASKS.md** - Code examples


## 📁 Complete Documentation Structure

```
.github/
├── 00-START-HERE.md              # ⭐ Entry point & navigation guide
├── 01-PROJECT-VISION.md          # Game concept & goals
├── 03-TECH-STACK.md              # Required libraries & versions
├── 05-DIRECTORY-STRUCTURE.md     # Where files go
├── 06-CURRENT-STATE.md           # What's implemented (auto-update)
├── 07-ROADMAP.md                 # Task list & priorities (auto-update)
├── 08-TESTING-GUIDE.md           # Testing requirements
├── 09-COMMON-TASKS.md            # Code recipes & examples
├── 11-DRAGONBONES-GUIDE.md       # DragonBones runtime integration guide
├── 12-PLUGIN-GUIDE-FX.md         # Particles & filters plugin guide (NEW)
├── 12-PLUGIN-GUIDE-UI.md         # UI & lighting plugin guide (NEW)
├── VERIFICATION.md               # Human playability checklist (REQUIRED)
└── copilot-instructions.md       # This file (index)
```

## ⚡ Emergency Quick Reference

### The Golden Rules

1. **1000-Line Law**: NO project file exceeds 1000 lines (split at 800)
2. **Use Popular Libraries**: Matter.js, GSAP, @pixi/tilemap (no custom implementations)
3. **Extreme Modularity**: Component-based entities, composition over inheritance
4. **Documentation = Success**: JSDoc with @example, folder READMEs, WHY comments
5. **Human Verification Required**: No feature is "DONE" until verified in `.github/VERIFICATION.md`
6. **Vendor Exception**: External libraries and runtime files (libs/, vendor/, node_modules/) are exempt from line limits
7. Do not create explainer documents or other documentation unless specifically asked to. Only edit the files listed in the documentation structure above with Files marked with `<!-- AUTO-UPDATED -->` should be updated by agents after completing tasks.
8. ❌ Never create explainer documents or summaries unless explicitly asked



## 🎯 When to Read Which File

### Before Writing Code
- **Where does this file go?** → Read **05-DIRECTORY-STRUCTURE.md**
- **Which library to use?** → Read **03-TECH-STACK.md**
- **Is this already done?** → Read **06-CURRENT-STATE.md**
- **What's the priority?** → Read **07-ROADMAP.md**

### When Testing
- **How to write tests?** → Read **08-TESTING-GUIDE.md**
- **Pre-commit checklist?** → Read **08-TESTING-GUIDE.md**

### When Working with DragonBones
- **How to use runtime?** → Read **11-DRAGONBONES-GUIDE.md**
- **Need code example?** → Read **09-COMMON-TASKS.md**

### After Finishing Task
- **Mark complete** → Update **06-CURRENT-STATE.md**
- **Check off task** → Update **07-ROADMAP.md**
- **Verify playability** → Complete **VERIFICATION.md** checklist

## 🔄 Updating Documentation

### When to Update

**06-CURRENT-STATE.md** - Update when:
- New feature completed
- New files created
- Phase milestone reached
- Tests added

**07-ROADMAP.md** - Update when:
- Task completed
- New priority identified
- Sprint changes
- Blockers found


### Auto-Update Comment
Files marked with `<!-- AUTO-UPDATED -->` should be updated by agents after completing tasks.

