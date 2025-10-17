# Start Here - AI Agent Guide

## 📖 Reading Order (Read These In Sequence)

When you start any task, read these files in order:

1. **00-START-HERE.md** (this file) - Navigation
2. **01-PROJECT-VISION.md** - Understand what we're building
3. **02-ARCHITECTURE-RULES.md** - Critical rules (4 Commandments)
4. **03-TECH-STACK.md** - Libraries you MUST use
5. **06-CURRENT-STATE.md** - What's already done (check first!)
6. **07-ROADMAP.md** - What to work on next

Then, based on task type, read:
- **Coding task** → Read **04-CODING-STANDARDS.md**
- **New feature** → Read **05-DIRECTORY-STRUCTURE.md**
- **Tests failing** → Read **08-TESTING-GUIDE.md**
- **Need examples** → Read **09-COMMON-TASKS.md**
- **Stuck/Error** → Read **10-TROUBLESHOOTING.md**

## 🔍 Quick Lookups

### Before Writing Code
- Check **06-CURRENT-STATE.md** → Is this feature already done?
- Check **07-ROADMAP.md** → What's the next priority?
- Check **05-DIRECTORY-STRUCTURE.md** → Where does this file go?
- Check **03-TECH-STACK.md** → Which library should I use?

### While Coding
- Refer **03-TECH-STACK.md** → Which library to use?
- Refer **04-CODING-STANDARDS.md** → How to format?
- Refer **09-COMMON-TASKS.md** → Code examples and recipes
- Refer **02-ARCHITECTURE-RULES.md** → Am I following the rules?

### After Finishing
- Update **06-CURRENT-STATE.md** → Mark as complete
- Update **07-ROADMAP.md** → Check off task
- Follow commit message format from **04-CODING-STANDARDS.md**
- Run pre-commit checks from **08-TESTING-GUIDE.md**

## ⚡ Emergency Quick Reference

### The Golden Rules
1. **File size limit**: 500 lines maximum (split at 400)
   - Check before commit: `wc -l filename.ts`
2. **Use popular libraries**: Matter.js, GSAP, @pixi/tilemap
   - No custom implementations of physics, animations, or tilemaps
3. **Component-based entities**: Composition over inheritance
4. **Automated tests only**: No manual user approval required

### Quick Commands
```bash
# Check file size (must be <500 lines)
wc -l src/**/*.ts | awk '$1 > 500'

# Run all pre-commit checks
npm run type-check && npm run test && npm run build

# Run tests with coverage
npm run test:coverage

# Development server
npm run dev
```

### Common Questions

**Q: File is approaching 400 lines. What do I do?**
A: Read **02-ARCHITECTURE-RULES.md** → Commandment 1 for splitting strategy

**Q: Should I create a custom physics system?**
A: No! Read **03-TECH-STACK.md** → Use Matter.js instead

**Q: Where do I put a new Player component?**
A: Read **05-DIRECTORY-STRUCTURE.md** → `src/entities/components/`

**Q: How do I write a good commit message?**
A: Read **04-CODING-STANDARDS.md** → Commit Message Format section

**Q: Tests are failing. Help!**
A: Read **10-TROUBLESHOOTING.md** → Common test failures

**Q: Need example code for GSAP animation?**
A: Read **09-COMMON-TASKS.md** → Animation recipes

## 📁 Documentation Structure

All documentation lives in `.github/` folder:

```
.github/
├── 00-START-HERE.md                 # ⭐ This file - Entry point
├── 01-PROJECT-VISION.md             # Game concept and goals
├── 02-ARCHITECTURE-RULES.md         # The 4 Commandments (critical!)
├── 03-TECH-STACK.md                 # Required libraries
├── 04-CODING-STANDARDS.md           # Style guide and conventions
├── 05-DIRECTORY-STRUCTURE.md        # File organization
├── 06-CURRENT-STATE.md              # What's already implemented
├── 07-ROADMAP.md                    # Task list and priorities
├── 08-TESTING-GUIDE.md              # Testing requirements
├── 09-COMMON-TASKS.md               # Code recipes and examples
├── 10-TROUBLESHOOTING.md            # Debugging guide
└── copilot-instructions.md          # Index pointing to these files
```

## 🎯 Workflow Overview

### Starting a New Task
1. Read files 00-07 in order (if first time)
2. Check **06-CURRENT-STATE.md** for existing implementation
3. Check **07-ROADMAP.md** for priority
4. Read relevant specialized docs (04, 05, 09)
5. Start coding following **02-ARCHITECTURE-RULES.md**

### While Working
1. Keep files <500 lines (check frequently)
2. Use popular libraries from **03-TECH-STACK.md**
3. Follow patterns in **09-COMMON-TASKS.md**
4. Write tests per **08-TESTING-GUIDE.md**

### Before Committing
1. Run: `npm run type-check && npm run test && npm run build`
2. Check file sizes: `wc -l src/**/*.ts | awk '$1 > 500'`
3. Update **06-CURRENT-STATE.md** and **07-ROADMAP.md**
4. Use commit format from **04-CODING-STANDARDS.md**

### If Something Goes Wrong
1. Read **10-TROUBLESHOOTING.md** for common issues
2. Check **06-CURRENT-STATE.md** for known problems
3. Review **02-ARCHITECTURE-RULES.md** to ensure compliance

## 🚀 Getting Started Right Now

If you're reading this for the first time:

1. **Read next**: Go to **01-PROJECT-VISION.md** to understand the game
2. **Then**: Read **02-ARCHITECTURE-RULES.md** - These rules are CRITICAL
3. **Finally**: Read **06-CURRENT-STATE.md** and **07-ROADMAP.md** to see what to do

If you're returning to work on a task:

1. **Quick check**: **06-CURRENT-STATE.md** and **07-ROADMAP.md**
2. **Refer as needed**: Other specialized docs (04, 05, 08, 09, 10)

---

**Remember**: This is a modular documentation system. Each file is focused and <400 lines. Read what you need, when you need it. Start with 00-07, then branch to specialized docs!

**Current Version**: 1.0.0  
**Last Updated**: 2025-10-17
