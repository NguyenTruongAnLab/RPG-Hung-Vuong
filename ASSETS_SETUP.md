# Setting Up Local Assets

## Overview

The `public/assets/` folder contains large binary files (868 files totaling ~1.5GB) that are kept **locally only** and not tracked in git. This keeps the repository lean and fast for cloning.

### Assets Included (Not in Git)

- **Audio Files** (~500MB)
  - 68 voice lines (Vietnamese narration)
  - 4 background music tracks
  - 14 sound effects
  - All in WAV/MP3 format

- **DragonBones Animation Assets** (~900MB)
  - 207 monster animations (character models)
  - JSON skeleton definitions
  - PNG texture atlases
  - Settings files

- **Game Tileset** (~100MB)
  - World map graphics

## Quick Setup for Cloners

### Option 1: Download from Private Release (Recommended)

If you have access to the private release:

```bash
# Extract the assets zip to your local repo
unzip RPG-Hung-Vuong-assets.zip -d public/
```

### Option 2: Generate Missing Assets (Dev Mode)

For development without audio/animations, use placeholder generation:

```bash
# Generate placeholder assets
npm run generate-placeholder-assets

# Generate placeholder audio
npm run generate-audio-placeholders
```

This creates stub files that allow the game to run without actual audio/animations.

### Option 3: Manual Asset Population

If you have the assets from the original developer:

1. **Audio Files**:
   ```
   public/assets/audio/
   ├── bgm_*.wav          (4 background music files)
   ├── sfx_*.wav          (14 sound effect files)
   ├── voice_*.mp3        (68 voice line files)
   └── audio-manifest.json (metadata file)
   ```

2. **DragonBones Animations**:
   ```
   public/assets/dragonbones_assets/
   ├── Absolution_ske.json
   ├── Absolution_tex.png
   ├── Absolution_tex.json
   └── ... (repeat for 207 monsters)
   ```

3. **Monster Models**:
   ```
   public/assets/monsters/
   ├── char001/
   │   ├── skeleton.json
   │   ├── texture.json
   │   └── texture.svg
   └── ... (char002 through char200)
   ```

4. **Tileset**:
   ```
   public/assets/tilesets/
   └── showcase-tileset.png
   ```

## File Structure Preserved

The git repository includes `.gitkeep` files to preserve folder structure:

```
public/assets/
├── .gitkeep              (marks folder for git)
├── audio/                (empty - audio files excluded)
├── dragonbones_assets/   (empty - animation files excluded)
├── monsters/             (empty - model files excluded)
└── tilesets/             (empty - tileset files excluded)
```

## Running the Game

### With Full Assets
```bash
npm run dev
# Game runs with all 200+ monsters, full audio, and animations
```

### Without Assets (Placeholder Mode)
```bash
npm run generate-placeholder-assets
npm run generate-audio-placeholders
npm run dev
# Game runs with stub files - useful for testing without huge downloads
```

## GitHub Actions Notes

The CI/CD pipeline (`build` and `test` jobs) uses placeholder assets since large files aren't committed to git. The game still builds and passes tests successfully with these stubs.

## Contributing

If you're contributing monster animations or audio:

1. Create your assets in the appropriate `public/assets/` subdirectory
2. Add the files to `.gitignore` (already configured)
3. Test locally with `npm run dev`
4. Submit a pull request - just the code changes
5. Share large assets via Discord/email with the maintainer

## Troubleshooting

**Q: Game won't load - "Asset not found" error**
- A: Run `npm run generate-placeholder-assets` to create stub files

**Q: Audio isn't playing**
- A: Check if audio files exist in `public/assets/audio/`
- Run `npm run generate-audio-placeholders` if missing

**Q: Monsters aren't animating**
- A: Check if DragonBones files exist in `public/assets/dragonbones_assets/`
- Verify file names match exactly (case-sensitive)

**Q: What if I want to use my own assets?**
- A: Place them in the correct subdirectory under `public/assets/`
- Ensure JSON structure matches the expected format
- Test with `npm run dev`

## Storage Estimates

```
Placeholder Assets:  ~50MB
Full Assets:        ~1.5GB
  - Audio:          ~500MB
  - Animations:     ~900MB
  - Tilesets:       ~100MB
```

## For Maintainers

When updating assets:

1. **Commit code changes** to main branch (assets excluded automatically via .gitignore)
2. **Store full assets** separately:
   - Private cloud storage
   - Release artifacts
   - Asset distribution system
3. **Document any format changes** in the code repository
4. **Version control the asset manifest** (`audio-manifest.json`, etc.)

---

**Last Updated**: 2024  
**Repository**: https://github.com/NguyenTruongAnLab/RPG-Hung-Vuong
