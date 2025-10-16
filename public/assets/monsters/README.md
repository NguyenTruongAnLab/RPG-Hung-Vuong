# Monster Assets - Placeholder Directory

This directory contains placeholder assets for the 200 Divine Beasts in the game.

## Current Status

### Placeholder Assets (Testing Only)
Currently, we have 3 placeholder monsters with basic DragonBones structure:
- **char001** - Rồng Kim (Kim/Metal element) - Gold colored
- **char041** - Rồng Mộc (Mộc/Wood element) - Green colored
- **char081** - Rồng Thủy (Thủy/Water element) - Blue colored

### Asset Structure

Each monster directory contains:
```
charXXX/
├── skeleton.json      # DragonBones skeleton data
├── texture.json       # DragonBones texture atlas
└── texture.png        # Texture image (currently SVG placeholders)
```

### Animations

Each placeholder has 2 basic animations:
- **idle** - Idle animation (24 frames)
- **attack** - Attack animation (12 frames)

## Generating Placeholders

To regenerate placeholder assets:
```bash
node scripts/generate-placeholder-assets.cjs
```

## Production Assets

### Requirements
For production, each of the 200 monsters will need:
1. **Skeleton Data** - DragonBones armature structure
2. **Texture Atlas** - Sprite sheet metadata
3. **Texture PNG** - High-quality sprite sheet (recommended 512x512 or 1024x1024)
4. **Animations**:
   - idle (loop)
   - attack
   - hit (take damage)
   - defeat (knocked out)
   - victory (optional)

### Asset Specifications
- **Format**: DragonBones 5.5+ compatible JSON + PNG
- **Texture Size**: Power of 2 (512x512, 1024x1024, 2048x2048)
- **Color Coding**: Each element should have distinct color scheme
  - Kim (Metal): Gold/Silver/Gray tones
  - Mộc (Wood): Green/Brown tones
  - Thủy (Water): Blue/Cyan tones
  - Hỏa (Fire): Red/Orange tones
  - Thổ (Earth): Brown/Yellow tones

### Asset Pipeline (Future)

1. **Design Phase**: Create concept art for 40 monsters per element
2. **Rigging Phase**: Create DragonBones armatures
3. **Animation Phase**: Animate idle, attack, hit, defeat
4. **Export Phase**: Export to JSON + PNG
5. **Optimization**: Compress textures, optimize JSON
6. **Integration**: Test with AssetManager lazy loading

### Estimated Requirements

- **Total Assets**: 200 monsters
- **Total Storage**: ~50-100 MB (optimized)
- **Load Strategy**: Lazy load on-demand, preload common monsters
- **Memory Budget**: Max 10 monsters loaded simultaneously

## Notes

- SVG placeholders are used for development
- Real PNG textures needed for production
- Consider using texture atlases to reduce draw calls
- Implement progressive loading for better UX

## Tools

Recommended tools for creating DragonBones assets:
- [DragonBones Pro](http://dragonbones.com/) - Official editor
- [Spine](http://esotericsoftware.com/) - Alternative (requires export plugin)
- [TexturePacker](https://www.codeandweb.com/texturepacker) - For sprite sheets

## License

Assets should be original work or properly licensed.
Credit artists in the main README.md.
