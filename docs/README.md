# Documentation Index - RPG Hùng Vương

## 📚 Documentation Overview

This folder contains comprehensive documentation for the RPG Hùng Vương project, focusing on architecture, implementation guides, and AI agent instructions.

---

## 🚀 Quick Start for AI Agents

**New to this project? Start here:**

1. **Read First**: [`AI_AGENT_QUICK_REFERENCE.md`](./AI_AGENT_QUICK_REFERENCE.md) (5 minutes)
   - One-page cheat sheet with all critical rules
   - Golden rules for file size, libraries, testing
   - Common commands and quick API reference
   - Pre-commit checklist

2. **Then Read**: [`../.github/copilot-instructions.md`](../.github/copilot-instructions.md) (15 minutes)
   - Complete architectural guidelines
   - Project overview and existing systems
   - Coding style and conventions
   - CI/CD pipeline
   - Testing requirements

3. **For Implementation**: [`PHASE2_IMPLEMENTATION_GUIDE.md`](./PHASE2_IMPLEMENTATION_GUIDE.md) (30 minutes)
   - Step-by-step implementation order
   - Code examples for each component
   - Testing requirements
   - Success criteria

---

## 📖 Documentation Files

### Core Documentation

#### [`AI_AGENT_QUICK_REFERENCE.md`](./AI_AGENT_QUICK_REFERENCE.md) (254 lines)
**Purpose**: One-page reference card for AI agents  
**Contents**:
- Golden rules (file size, libraries, composition, JSDoc)
- Project structure quick lookup
- Common commands
- Library API quick reference (Matter.js, GSAP, @pixi/tilemap)
- Testing rules
- Commit message format
- Common mistakes to avoid
- Pre-commit checklist

**When to use**: Before starting any coding task, as a quick refresher

---

#### [`PHASE2_IMPLEMENTATION_GUIDE.md`](./PHASE2_IMPLEMENTATION_GUIDE.md) (587 lines)
**Purpose**: Detailed implementation guide for Phase 2 (Matter.js Physics + Overworld)  
**Contents**:
- Pre-implementation checklist
- Implementation order (Week 2-3 breakdown)
- Task-by-task instructions with code examples
- File size enforcement process
- Library integration steps
- Testing requirements per component
- Success metrics and verification
- Common issues and solutions
- Reference implementation examples

**When to use**: During Phase 2 implementation, follow sequentially

---

#### [`LIBRARIES.md`](./LIBRARIES.md) (329 lines)
**Purpose**: Rationale for library choices and usage guides  
**Contents**:
- Why Matter.js over custom physics
- Why GSAP over custom animations
- Why @pixi/tilemap over custom rendering
- Library decision matrix
- Installation scripts
- API examples for each library
- Libraries to avoid
- Learning resources

**When to use**: When deciding whether to use a library or write custom code

---

#### [`GAMEPLAY.md`](./GAMEPLAY.md) (456 lines)
**Purpose**: Complete gameplay mechanics documentation  
**Contents**:
- Overworld system (Phase 2 features)
- Movement controls (keyboard, mobile)
- Physics system (Matter.js integration)
- Encounter system mechanics
- Battle system flow
- Damage calculation formulas
- Element advantages (Ngũ Hành)
- Capture system mechanics
- Map system
- Monster stats and evolution
- Rarity tiers

**When to use**: Understanding game mechanics, implementing features

---

### Folder Documentation

#### [`../src/core/README.md`](../src/core/README.md) (95 lines)
**Purpose**: Core game systems documentation  
**Contents**:
- Existing managers (Game, I18n, EventBus, SceneManager, AssetManager, DragonBonesManager)
- File size status
- Planned Phase 2 managers
- Architecture principles
- Usage examples

**When to use**: Working on core systems

---

#### [`../src/systems/README.md`](../src/systems/README.md) (164 lines)
**Purpose**: Game systems documentation  
**Contents**:
- Existing systems (Battle, Capture, MapExplorer)
- Planned Phase 2 systems (Collision, Encounter, Movement)
- System design principles
- Flow diagrams
- Ngũ Hành element system
- Testing requirements

**When to use**: Working on game logic systems

---

#### [`../src/data/README.md`](../src/data/README.md) (211 lines)
**Purpose**: Game data structure documentation  
**Contents**:
- Monster database format
- Ngũ Hành elements
- Rarity tiers
- Evolution chains
- Planned data organization
- Data validation rules
- Localization requirements

**When to use**: Working with monster data or game constants

---

## 🎯 Documentation by Use Case

### "I want to implement a new feature"
1. Read [`AI_AGENT_QUICK_REFERENCE.md`](./AI_AGENT_QUICK_REFERENCE.md)
2. Check [`PHASE2_IMPLEMENTATION_GUIDE.md`](./PHASE2_IMPLEMENTATION_GUIDE.md) for implementation order
3. Check relevant folder README.md for patterns
4. Follow [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) architectural rules

### "I want to add a new library"
1. Read [`LIBRARIES.md`](./LIBRARIES.md) decision matrix
2. Follow library integration checklist
3. Update LIBRARIES.md with rationale
4. Update folder README.md

### "I want to understand the game mechanics"
1. Read [`GAMEPLAY.md`](./GAMEPLAY.md)
2. Check [`../src/systems/README.md`](../src/systems/README.md) for implementation details
3. Check [`../src/data/README.md`](../src/data/README.md) for data structures

### "I'm an AI agent starting work on this project"
1. Read [`AI_AGENT_QUICK_REFERENCE.md`](./AI_AGENT_QUICK_REFERENCE.md) (5 min)
2. Read [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) (15 min)
3. Read [`PHASE2_IMPLEMENTATION_GUIDE.md`](./PHASE2_IMPLEMENTATION_GUIDE.md) for your task
4. Keep [`AI_AGENT_QUICK_REFERENCE.md`](./AI_AGENT_QUICK_REFERENCE.md) open as reference

### "I want to check if my code follows best practices"
1. Check [`AI_AGENT_QUICK_REFERENCE.md`](./AI_AGENT_QUICK_REFERENCE.md) pre-commit checklist
2. Verify file size: `wc -l your-file.ts` (<500 lines)
3. Run tests: `npm test`
4. Check [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) code review checklist

---

## 📊 Documentation Statistics

| File | Lines | Purpose |
|------|-------|---------|
| AI_AGENT_QUICK_REFERENCE.md | 254 | Quick reference card |
| PHASE2_IMPLEMENTATION_GUIDE.md | 587 | Implementation guide |
| LIBRARIES.md | 329 | Library rationale |
| GAMEPLAY.md | 456 | Game mechanics |
| ../src/core/README.md | 95 | Core systems |
| ../src/systems/README.md | 164 | Game systems |
| ../src/data/README.md | 211 | Data structures |
| **Total** | **2,096** | **Comprehensive docs** |

---

## 🔄 Documentation Maintenance

### When to Update Documentation

**Always update when:**
- Adding new file (update folder README.md)
- Changing architecture (update `.github/copilot-instructions.md`)
- Adding new library (update LIBRARIES.md)
- Implementing new feature (update GAMEPLAY.md if user-facing)
- Changing game mechanics (update GAMEPLAY.md)
- Completing Phase milestone (update ROADMAP.md)

**How to update:**
1. Edit relevant documentation file
2. Check line counts stay reasonable (<600 lines)
3. Commit with docs in same commit as code changes
4. Format: `docs(scope): description`

---

## 🎓 Learning Path

### For New Developers

**Week 1: Understanding the Project**
- Day 1: Read GAMEPLAY.md - Understand what the game does
- Day 2: Read LIBRARIES.md - Understand technology choices
- Day 3: Read .github/copilot-instructions.md - Understand architecture
- Day 4: Explore codebase with folder README.md files
- Day 5: Read PHASE2_IMPLEMENTATION_GUIDE.md - Understand current focus

**Week 2: Contributing**
- Start with small tasks from ROADMAP.md
- Follow PHASE2_IMPLEMENTATION_GUIDE.md step-by-step
- Reference AI_AGENT_QUICK_REFERENCE.md frequently
- Ask questions when stuck

---

## 🔗 External Resources

### PixiJS
- [Official Docs](https://pixijs.com/docs)
- [Examples](https://pixijs.com/examples)

### Matter.js
- [Official Docs](https://brm.io/matter-js/)
- [Examples](https://brm.io/matter-js/demo/)

### GSAP
- [Official Docs](https://gsap.com/docs/)
- [Cheat Sheet](https://gsap.com/cheatsheet/)

### Vitest
- [Official Guide](https://vitest.dev/guide/)

### Playwright
- [Official Docs](https://playwright.dev/)

---

## 📝 Contributing to Documentation

### Documentation Style Guide

**Markdown Formatting:**
- Use headers (##, ###) for sections
- Use code blocks with language tags
- Use bullet points for lists
- Use tables for comparisons
- Use emojis sparingly for visual markers

**Content Guidelines:**
- Write for AI agents AND humans
- Include code examples
- Explain "why", not just "what"
- Keep sections focused
- Update examples when code changes

**File Organization:**
- Keep related docs together
- Use descriptive file names
- Cross-reference related docs
- Maintain this index (README.md)

---

## ✅ Documentation Checklist

Before considering documentation complete:

- [ ] All files have clear purpose statements
- [ ] All files have tables of contents (if >200 lines)
- [ ] Code examples are tested and working
- [ ] Cross-references are accurate
- [ ] No broken links
- [ ] Consistent formatting throughout
- [ ] Updated this index (README.md)
- [ ] File sizes reasonable (<600 lines)

---

## 🆘 Documentation Help

**Can't find what you're looking for?**

1. Check this index first
2. Search in files: `grep -r "your topic" docs/`
3. Check folder README.md files
4. Check ROADMAP.md for planned features
5. Ask in project discussions

**Found outdated documentation?**

1. Update the relevant file
2. Run build and tests to verify
3. Commit with: `docs(scope): Fix outdated information about X`
4. Update this index if needed

---

**Last Updated**: Phase 2 Documentation Complete (Oct 2024)  
**Next Update**: After Phase 2 Implementation Complete
