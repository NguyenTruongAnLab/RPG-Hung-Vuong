# GitHub Copilot Instructions

## 📖 IMPORTANT: Read the Modular Documentation

**This file is now an INDEX. The real content is in separate, focused files.**

All documentation has been split into modular files for better readability and maintenance. Each file is <400 lines and focused on a specific topic.

---

## 🚀 Quick Start

### For First-Time Reading:
**Read these files in order:**

1. **.github/00-START-HERE.md** ⭐ Start here first!
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

---

## 📁 Complete Documentation Structure

```
.github/
├── 00-START-HERE.md              # ⭐ Entry point & navigation guide
├── 01-PROJECT-VISION.md          # Game concept & goals
├── 02-ARCHITECTURE-RULES.md      # The 4 Commandments (non-negotiable!)
├── 03-TECH-STACK.md              # Required libraries & versions
├── 04-CODING-STANDARDS.md        # Style guide & commit format
├── 05-DIRECTORY-STRUCTURE.md     # Where files go
├── 06-CURRENT-STATE.md           # What's implemented (auto-update)
├── 07-ROADMAP.md                 # Task list & priorities (auto-update)
├── 08-TESTING-GUIDE.md           # Testing requirements
├── 09-COMMON-TASKS.md            # Code recipes & examples
├── 10-TROUBLESHOOTING.md         # Debug guide
├── VERIFICATION.md               # Human playability checklist (REQUIRED)
└── copilot-instructions.md       # This file (index)
```

---

## ⚡ Emergency Quick Reference

### The Golden Rules (from 02-ARCHITECTURE-RULES.md)

1. **1000-Line Law**: NO project file exceeds 1000 lines (split at 800)
2. **Use Popular Libraries**: Matter.js, GSAP, @pixi/tilemap (no custom implementations)
3. **Extreme Modularity**: Component-based entities, composition over inheritance
4. **Documentation = Success**: JSDoc with @example, folder READMEs, WHY comments
5. **Human Verification Required**: No feature is "DONE" until verified in `.github/VERIFICATION.md`
6. **Vendor Exception**: External libraries and runtime files (libs/, vendor/, node_modules/) are exempt from line limits

### Quick Commands
```bash
# Check file sizes (must be <1000 lines for project code)
find src -name "*.ts" -exec wc -l {} + | awk '$1 > 1000 {print $2, $1}'

# Run all pre-commit checks
npm run type-check && npm run test && npm run build

# Human playability test
npm run build && npm run preview
# Then follow .github/VERIFICATION.md checklist
```

---

## 🎯 When to Read Which File

### Before Writing Code
- **Where does this file go?** → Read **05-DIRECTORY-STRUCTURE.md**
- **Which library to use?** → Read **03-TECH-STACK.md**
- **Is this already done?** → Read **06-CURRENT-STATE.md**
- **What's the priority?** → Read **07-ROADMAP.md**

### While Coding
- **How to format code?** → Read **04-CODING-STANDARDS.md**
- **Need code example?** → Read **09-COMMON-TASKS.md**
- **Am I following rules?** → Read **02-ARCHITECTURE-RULES.md**

### When Testing
- **How to write tests?** → Read **08-TESTING-GUIDE.md**
- **Pre-commit checklist?** → Read **08-TESTING-GUIDE.md**

### When Stuck
- **Error or bug?** → Read **10-TROUBLESHOOTING.md**
- **Confused about project?** → Read **01-PROJECT-VISION.md**

### After Finishing Task
- **Mark complete** → Update **06-CURRENT-STATE.md**
- **Check off task** → Update **07-ROADMAP.md**
- **Commit format** → Follow **04-CODING-STANDARDS.md**
- **Verify playability** → Complete **VERIFICATION.md** checklist

---

## 📊 Documentation Statistics

- **Total files**: 12 (including this index)
- **Total lines**: ~3,800 lines distributed
- **Average per file**: ~317 lines
- **Largest file**: 04-CODING-STANDARDS.md (477 lines)
- **All files**: <500 lines ✅

**Comparison**:
- **Old system**: 1 file, 1,581 lines (hard to navigate)
- **New system**: 12 files, ~317 lines average (easy to navigate)

---

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

**Other files** - Update when:
- Rules change (rare, requires team discussion)
- New libraries added
- New patterns adopted
- New common tasks identified

### Auto-Update Comment
Files marked with `<!-- AUTO-UPDATED -->` should be updated by agents after completing tasks.

---

## 🎮 Project Quick Facts

**Name**: Thần Thú Văn Lang (RPG Hùng Vương)  
**Type**: Vietnamese Mythology Pokemon-Style RPG  
**Tech**: PixiJS 8, Matter.js, GSAP, DragonBones  
**Phase**: Phase 2 (Overworld) - 40% complete  
**Tests**: 192 passing, 85% coverage  
**Files**: 28 TypeScript files, all <1000 lines

**Core Pillars**:
1. Collect 200 Thần Thú (Divine Beasts)
2. Explore Văn Lang (ancient Vietnam)
3. Battle with Ngũ Hành (Five Elements) system
4. Evolve and progress

---

## 📚 Additional Documentation

Beyond this modular system, see also:

- **README.md** - Project overview
- **ARCHITECTURE.md** - System design
- **ROADMAP.md** - Root roadmap (legacy)
- **CODING_STYLE.md** - Additional style notes
- **docs/** folder - Supplementary documentation

---

## ⚠️ Important Notes

### Do NOT Edit This File Directly

This file is an **index**. To change content:
- Edit the appropriate numbered file (00-10)
- Keep this file as a navigation guide only

### Reading Order Matters

The numbered files (00-10) are designed to be read in order:
- **00-07**: Core knowledge (read in sequence)
- **08-10**: Reference material (read as needed)

### Files Are Interconnected

Files reference each other. For example:
- **00-START-HERE.md** references all other files
- **02-ARCHITECTURE-RULES.md** references **03-TECH-STACK.md**
- **09-COMMON-TASKS.md** uses libraries from **03-TECH-STACK.md**

---

## 🚨 Critical Reminder

**Before doing ANYTHING:**
1. Read **00-START-HERE.md** (navigation)
2. Read **02-ARCHITECTURE-RULES.md** (the 4 Commandments are non-negotiable!)
3. Check **06-CURRENT-STATE.md** (don't duplicate existing work)
4. Check **07-ROADMAP.md** (work on priorities)

**The 4 Commandments from 02-ARCHITECTURE-RULES.md:**
1. No project file >1000 lines (vendor/libs exempt)
2. Use popular libraries (Matter.js, GSAP, @pixi/tilemap)
3. Extreme modularity (component-based entities)
4. Documentation = success (JSDoc, READMEs, comments)

---

**System Version**: 1.0.0  
**Last Updated**: 2025-10-17  
**Migration**: Single file (1,581 lines) → 12 modular files (~317 lines avg)

**Start your journey**: Open **.github/00-START-HERE.md** now! 🚀
