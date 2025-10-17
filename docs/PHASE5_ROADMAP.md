# Phase 5 Roadmap: Narrative Integration & Visual Polish

> **⚠️ IMPORTANT UPDATE**: This roadmap has been superseded by the plugin-based approach.  
> **See `.github/07-ROADMAP.md` Phase 5+ section** for the updated implementation plan using mature PixiJS plugins.

**Migration Note**: The original Phase 5 plan focused on custom implementations. The new approach leverages:
- @pixi/particle-emitter for all particle effects
- @pixi/filters for visual effects and atmosphere
- @pixi/ui for professional UI components
- pixi-lights for advanced lighting

This reduces development time while increasing visual quality and maintainability.

---

## 🎯 Phase Overview (LEGACY - See .github/07-ROADMAP.md for updated plan)

**Goal**: Transform the game from a technical demo into a complete, story-driven Vietnamese mythology experience.

**Duration**: 9 days (2 work weeks)  
**Prerequisites**: Phase 4 complete (audio system with 86 files)  
**Current State**: 184 tests passing, all systems functional

---

## 📅 Week 1: Story Infrastructure & Core Systems

### Day 1: Story Data Foundation

**Focus**: Create all story data files and structure

#### Tasks
1. **Create directory structure**
   ```bash
   mkdir -p src/data/story
   ```

2. **Implement story-main.json** (<500 lines)
   - 4 acts (Awakening, Journey, Confrontation, Final Battle)
   - 15 major scenes
   - Scene triggers and prerequisites
   - Estimated: 3 hours

3. **Implement story-npcs.json** (<500 lines)
   - 10+ NPCs with full dialogs
   - Quest giver data
   - Location associations
   - Estimated: 2 hours

4. **Implement story-zones.json** (<400 lines)
   - 5 elemental zones
   - Zone entry dialogs
   - Encounter tables
   - Special events
   - Estimated: 2 hours

5. **Implement story-bosses.json** (<400 lines)
   - 6 major bosses
   - Pre/post battle cutscenes
   - Rewards and progression
   - Estimated: 1 hour

#### Deliverables
- [x] 4 JSON files in `src/data/story/`
- [x] All files <500 lines ✅
- [x] Valid JSON structure
- [x] All Vietnamese text with proper diacritics

#### Success Criteria
```bash
# Validate JSON
npm run validate-story-data  # Create this script

# Check file sizes
wc -l src/data/story/*.json
# All files must be <500 lines
```

---

### Day 2: Dialog System Implementation

**Focus**: Create dialog engine for text display and choices

#### Tasks
1. **Create DialogSystem.ts** (<350 lines)
   ```typescript
   class DialogSystem {
     loadDialogData(file: string): Promise<void>
     getDialog(id: string): Dialog
     playDialog(id: string): Promise<void>
     playDialogSequence(ids: string[]): Promise<void>
     showChoices(dialogId: string): Promise<Choice>
   }
   ```
   - Estimated: 4 hours

2. **Create DialogBox.ts** (<250 lines)
   - Text box UI component
   - Typewriter effect (1 char per 50ms)
   - Portrait display
   - Next arrow animation
   - Estimated: 3 hours

3. **Create Subtitles.ts** (<150 lines)
   - Subtitle overlay for voice lines
   - Auto-hide after duration
   - Position above dialog box
   - Estimated: 1 hour

#### Deliverables
- [x] DialogSystem.ts (<350 lines)
- [x] DialogBox.ts (<250 lines)
- [x] Subtitles.ts (<150 lines)
- [x] All files pass type check

#### Success Criteria
```bash
# Test dialog display
npm run dev
# Open browser, trigger dialog
# Verify typewriter effect works
# Verify choices are selectable
```

---

### Day 3: Cutscene Engine

**Focus**: Create cinematic cutscene playback system

#### Tasks
1. **Create CutsceneManager.ts** (<400 lines)
   ```typescript
   class CutsceneManager {
     loadCutscene(id: string): Promise<void>
     playCutscene(id: string): Promise<void>
     skip(): void
     pause(): void
     resume(): void
   }
   ```
   - Camera animations (pan, zoom)
   - Background transitions
   - Character sprite movements
   - Voice sync
   - Letterbox effect
   - Estimated: 5 hours

2. **Create IntroScene.ts** (<350 lines)
   - Opening cinematic implementation
   - Uses CutsceneManager
   - 60-90 second sequence
   - Skippable with Space/ESC
   - Estimated: 2 hours

3. **Create EndingScene.ts** (<300 lines)
   - Victory celebration
   - Credits roll
   - Post-credits teaser
   - Estimated: 1 hour

#### Deliverables
- [x] CutsceneManager.ts (<400 lines)
- [x] IntroScene.ts (<350 lines)
- [x] EndingScene.ts (<300 lines)
- [x] Skip controls working

#### Success Criteria
```bash
# Test intro cutscene
npm run dev
# Verify:
# - Camera pans smoothly
# - Voice lines play at correct times
# - Letterbox effect appears
# - Can skip with Space
```

---

### Day 4: Quest System

**Focus**: Implement quest tracking and progression

#### Tasks
1. **Create QuestManager.ts** (<400 lines)
   ```typescript
   class QuestManager {
     loadQuestData(file: string): Promise<void>
     startQuest(id: string): void
     updateObjective(questId: string, objId: string): void
     completeQuest(id: string): void
     getActiveQuests(): Quest[]
     getCompletedQuests(): Quest[]
   }
   ```
   - Quest state management
   - Objective tracking
   - Reward distribution
   - Save/load integration
   - Estimated: 4 hours

2. **Create QuestLog.ts** (<200 lines)
   - Quest list UI
   - Active quest display
   - Objective checkboxes
   - Reward preview
   - Keyboard shortcut (Q key)
   - Estimated: 3 hours

3. **Create NPCDialog.ts** (<200 lines)
   - NPC interaction handler
   - Quest giver logic
   - Quest state-based dialogs
   - Estimated: 1 hour

#### Deliverables
- [x] QuestManager.ts (<400 lines)
- [x] QuestLog.ts (<200 lines)
- [x] NPCDialog.ts (<200 lines)
- [x] UI opens with Q key

#### Success Criteria
```bash
# Test quest system
npm run dev
# Start quest from NPC
# Verify quest appears in log
# Complete objective
# Verify objective marked complete
# Return to NPC, get reward
```

---

### Day 5: Story Manager Integration

**Focus**: Connect story system to game world

#### Tasks
1. **Create StoryManager.ts** (<450 lines)
   ```typescript
   class StoryManager {
     loadStoryData(): Promise<void>
     getCurrentAct(): number
     triggerScene(id: string): Promise<void>
     checkTriggers(location: string): string[]
     markSceneComplete(id: string): void
     hasCompletedScene(id: string): boolean
     getStoryProgress(): StoryProgress
   }
   ```
   - Story progression tracking
   - Scene trigger detection
   - Act management
   - Save/load integration
   - Estimated: 5 hours

2. **Update OverworldScene.ts**
   - Integrate StoryManager
   - Check triggers on zone entry
   - Play cutscenes at correct times
   - Estimated: 2 hours

3. **Create first 3 story scenes**
   - Scene 1.1: Opening cinematic
   - Scene 1.2: Meet the Elder
   - Scene 1.3: First battle tutorial
   - Estimated: 1 hour

#### Deliverables
- [x] StoryManager.ts (<450 lines)
- [x] OverworldScene updated
- [x] 3 scenes playable
- [x] Story progresses correctly

#### Success Criteria
```bash
# Test story flow
npm run dev
# Verify:
# - Opening cinematic plays on first launch
# - Elder dialog triggers in village
# - First battle tutorial works
# - Story state saves between sessions
```

---

## 📅 Week 2: Polish & Enhancement

### Day 6: Voice Enhancement

**Focus**: Improve voice playback and character voices

#### Tasks
1. **Create VoiceManager.ts** (<300 lines)
   ```typescript
   class VoiceManager {
     playVoice(file: string, character: string): Promise<void>
     queueVoice(file: string, character: string): void
     playQueue(): Promise<void>
     setCharacterProfile(id: string, profile: VoiceProfile): void
   }
   ```
   - Voice queue system
   - Character voice profiles
   - Frequency adjustments per character
   - Auto-pause game during important lines
   - Estimated: 4 hours

2. **Create character voice profiles**
   - Tộc Trưởng: Deep, slow (lower freq)
   - Lạc Nhi: Bright, quick (higher freq)
   - Phong Dũng: Mid, steady
   - Diệp Linh: Varied, fast
   - Estimated: 2 hours

3. **Integrate with DialogSystem**
   - Play voice when showing dialog
   - Show subtitles simultaneously
   - Estimated: 2 hours

#### Deliverables
- [x] VoiceManager.ts (<300 lines)
- [x] Voice profiles for 4 main characters
- [x] Subtitle sync working

#### Success Criteria
```bash
# Test voice playback
npm run dev
# Verify:
# - Each character has distinct voice tone
# - Subtitles appear with voice
# - Voice queue plays in order
# - Game pauses during important voices
```

---

### Day 7: Visual Polish - Particles

**Focus**: Add element-specific particle effects

#### Tasks
1. **Enhance ParticleSystem.ts** (currently 219 lines → <350 lines)
   - Add Kim (Metal) particles: Metallic sparks, clang effect
   - Add Mộc (Wood) particles: Leaf swirl, vine growth
   - Add Thủy (Water) particles: Water splash, wave ripple
   - Add Hỏa (Fire) particles: Fire sparks, ember glow
   - Add Thổ (Earth) particles: Rock debris, dust cloud
   - Estimated: 4 hours

2. **Create element attack animations**
   - Each element has unique visual
   - Integrate with BattleSceneV2
   - Estimated: 2 hours

3. **Add victory/capture effects**
   - Victory confetti
   - Capture success swirl
   - Level up burst
   - Estimated: 2 hours

#### Deliverables
- [x] ParticleSystem.ts enhanced (<350 lines)
- [x] 5 element particle types
- [x] Special effect animations

#### Success Criteria
```bash
# Test particle effects
npm run dev
# Enter battle
# Verify:
# - Kim attack shows metal sparks
# - Mộc attack shows leaves
# - Thủy attack shows water
# - Hỏa attack shows fire
# - Thổ attack shows earth
```

---

### Day 8: Visual Polish - Transitions

**Focus**: Add screen effects and UI animations

#### Tasks
1. **Enhance TransitionManager.ts** (currently 165 lines → <300 lines)
   - Add wipe transitions (left, right, up, down)
   - Add flash effects (white, colored)
   - Add screen shake variations
   - Add slow-motion effect
   - Estimated: 3 hours

2. **Create UI animation utilities** (<200 lines)
   - Menu slide-in/out
   - HP bar smooth depletion
   - EXP bar fill animation
   - Button hover effects
   - Estimated: 3 hours

3. **Add letterbox effect for cutscenes**
   - Black bars top/bottom
   - Smooth appear/disappear
   - Estimated: 2 hours

#### Deliverables
- [x] TransitionManager enhanced (<300 lines)
- [x] UIAnimations.ts (<200 lines)
- [x] Letterbox component

#### Success Criteria
```bash
# Test transitions
npm run dev
# Verify:
# - Battle entry uses screen wipe
# - Super effective hits flash screen
# - Cutscenes have letterbox
# - UI elements animate smoothly
```

---

### Day 9: Testing & Documentation

**Focus**: Write tests and update docs

#### Tasks
1. **Write 40+ unit tests** (8 hours)
   - `StoryManager.test.ts` (15 tests)
     - Load story data
     - Track progression
     - Trigger scenes
     - Check prerequisites
     - Save/load state
   
   - `DialogSystem.test.ts` (12 tests)
     - Load dialogs
     - Play sequences
     - Handle choices
     - Show subtitles
     - Error handling
   
   - `QuestManager.test.ts` (13 tests)
     - Start quest
     - Update objectives
     - Complete quest
     - Give rewards
     - Track active/completed

2. **Update documentation**
   - Update `README.md` with Phase 5 completion
   - Update `.github/06-CURRENT-STATE.md`
   - Update `.github/07-ROADMAP.md`
   - Create Phase 5 summary
   - Estimated: 2 hours

#### Deliverables
- [x] 40 new unit tests
- [x] All 224 tests passing (184 + 40)
- [x] Documentation updated

#### Success Criteria
```bash
# Run all tests
npm run test
# Output: 224 tests passing ✅

# Check coverage
npm run test:coverage
# Target: ≥80% coverage

# Type check
npm run type-check
# No errors

# Build
npm run build
# Success
```

---

## 📊 Deliverables Summary

### New Files Created

```
src/
├── data/story/
│   ├── story-main.json (<500 lines)
│   ├── story-npcs.json (<500 lines)
│   ├── story-zones.json (<400 lines)
│   └── story-bosses.json (<400 lines)
├── systems/
│   ├── StoryManager.ts (<450 lines)
│   ├── QuestManager.ts (<400 lines)
│   ├── DialogSystem.ts (<350 lines)
│   └── CutsceneManager.ts (<400 lines)
├── ui/
│   ├── DialogBox.ts (<250 lines)
│   ├── Subtitles.ts (<150 lines)
│   ├── QuestLog.ts (<200 lines)
│   └── UIAnimations.ts (<200 lines)
├── scenes/
│   ├── IntroScene.ts (<350 lines)
│   └── EndingScene.ts (<300 lines)
├── core/
│   └── VoiceManager.ts (<300 lines)
└── utils/
    └── NPCDialog.ts (<200 lines)

tests/unit/
├── StoryManager.test.ts (15 tests)
├── DialogSystem.test.ts (12 tests)
└── QuestManager.test.ts (13 tests)

docs/
├── STORY_GUIDE.md (complete narrative)
├── DIALOG_FORMAT.md (JSON format guide)
└── PHASE5_ROADMAP.md (this file)
```

### Enhanced Files

```
src/
├── utils/ParticleSystem.ts (219 → <350 lines)
├── core/TransitionManager.ts (165 → <300 lines)
├── scenes/OverworldScene.ts (updated for story)
└── scenes/BattleSceneV2.ts (updated for particles)
```

### Total New Code

- **New files**: 14 TypeScript files + 4 JSON files
- **New lines**: ~4,500 lines TypeScript + ~1,600 lines JSON
- **New tests**: 40 unit tests
- **Documentation**: 3 comprehensive guides

---

## 🎯 Success Criteria Checklist

### Core Functionality
- [ ] Opening cinematic plays on first launch
- [ ] Story progresses through 4 acts
- [ ] At least 5 cutscenes fully implemented
- [ ] Dialog system with typewriter effect works
- [ ] Branching dialog choices functional
- [ ] Quest system tracks objectives
- [ ] Quest log UI accessible with Q key
- [ ] NPCs give quests based on story state
- [ ] Voice lines play with subtitles
- [ ] All 5 element types have unique particles

### Technical Requirements
- [ ] All files <500 lines (Commandment 1) ✅
- [ ] Uses GSAP for animations (Commandment 2) ✅
- [ ] Component-based architecture (Commandment 3) ✅
- [ ] Full JSDoc documentation (Commandment 4) ✅
- [ ] 224 tests passing (184 existing + 40 new)
- [ ] Test coverage ≥80%
- [ ] Type check passes with no errors
- [ ] Build succeeds

### Polish & UX
- [ ] Cutscenes are skippable (Space/ESC)
- [ ] Voice lines sync with text
- [ ] Particle effects enhance combat
- [ ] Screen transitions are smooth
- [ ] UI animations feel polished
- [ ] Letterbox effect works in cutscenes
- [ ] Game pauses during important dialogs
- [ ] Tutorial guides new players

### Story Completeness
- [ ] Act 1 (Awakening) fully playable
- [ ] Act 2 (Journey) with 5 zones implemented
- [ ] Act 3 (Confrontation) with major reveals
- [ ] Act 4 (Final Battle) with ending
- [ ] At least 3 side quests available
- [ ] All major bosses have intro/outro cutscenes
- [ ] Story can be completed in 6-8 hours

---

## 🚨 Risk Management

### Potential Blockers

1. **File Size Violations**
   - **Risk**: StoryManager or CutsceneManager exceeds 500 lines
   - **Mitigation**: Split early, monitor with `wc -l`
   - **Action**: If >400 lines, extract utilities

2. **Performance Issues**
   - **Risk**: Particle effects impact FPS
   - **Mitigation**: Pool particles, limit max count
   - **Action**: Profile with Chrome DevTools

3. **Voice Sync Problems**
   - **Risk**: Voice and subtitle timing off
   - **Mitigation**: Use timestamps in JSON
   - **Action**: Test thoroughly on slow devices

4. **Complex State Management**
   - **Risk**: Story/quest state becomes tangled
   - **Mitigation**: Use clear state machine
   - **Action**: Write comprehensive tests

---

## 📈 Progress Tracking

### Daily Standups

**Template**:
```
✅ Completed yesterday:
- [Task 1]
- [Task 2]

🚧 Working on today:
- [Task 3]
- [Task 4]

🚫 Blockers:
- [None / Blocker description]
```

### Weekly Review

**End of Week 1**:
- [ ] All 4 story JSON files created
- [ ] Dialog system functional
- [ ] Cutscene engine working
- [ ] Quest system implemented
- [ ] Story integration complete
- [ ] Target: 60% Phase 5 complete

**End of Week 2**:
- [ ] Voice enhancement done
- [ ] All particle effects implemented
- [ ] Screen transitions polished
- [ ] 40 tests passing
- [ ] Documentation updated
- [ ] Target: 100% Phase 5 complete

---

## 🎓 Learning Outcomes

After Phase 5, the development team will have:

1. **Mastered story data management** using JSON
2. **Implemented complex cutscene system** with GSAP
3. **Built robust dialog engine** with branching
4. **Created quest tracking system** with persistence
5. **Enhanced visual polish** with particles and transitions
6. **Integrated voice and subtitles** seamlessly
7. **Maintained code quality** (<500 lines per file)
8. **Written comprehensive tests** (224 total)

---

## 🎮 Post-Phase 5 Game State

**What players will experience**:

1. **Opening Cinematic** introducing Văn Lang
2. **Tutorial** teaching movement, battle, capture
3. **Story Campaign** with 4 complete acts
4. **5 Elemental Zones** to explore
5. **6 Boss Battles** with cinematics
6. **3+ Side Quests** with rewards
7. **200 Thần Thú** to collect
8. **Voice Acting** in Vietnamese (melodic beeps)
9. **Particle Effects** for all elements
10. **Smooth Transitions** between scenes

**Total Playtime**: 6-8 hours (main story) + 2-3 hours (side content)

---

## 🏆 Definition of Done

Phase 5 is complete when:

1. ✅ All 14 new files created (<500 lines each)
2. ✅ All 4 story JSON files validated
3. ✅ Opening cinematic plays correctly
4. ✅ Story progresses through all 4 acts
5. ✅ Dialog system works with choices
6. ✅ Quest system tracks objectives
7. ✅ Voice lines play with subtitles
8. ✅ Particle effects for all 5 elements
9. ✅ Screen transitions polished
10. ✅ 224 tests passing (100%)
11. ✅ Documentation updated
12. ✅ Build succeeds
13. ✅ Type check passes
14. ✅ Code review approved
15. ✅ Playable start-to-finish

---

**Let's build an immersive Vietnamese mythology experience!** 🇻🇳🎮✨

**Phase 5 Start Date**: TBD  
**Phase 5 Target Completion**: TBD + 9 days  
**Last Updated**: 2025-10-17
