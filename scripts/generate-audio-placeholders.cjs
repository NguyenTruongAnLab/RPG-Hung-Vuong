const fs = require('fs');
const path = require('path');

// Audio placeholders to create
const audioPlaceholders = [
  { id: 'bgm_overworld', name: 'bgm_overworld.mp3' },
  { id: 'bgm_battle', name: 'bgm_battle.mp3' },
  { id: 'sfx_menu_select', name: 'sfx_menu_select.mp3' },
  { id: 'sfx_attack', name: 'sfx_attack.mp3' },
  { id: 'sfx_capture', name: 'sfx_capture.mp3' },
  { id: 'sfx_victory', name: 'sfx_victory.mp3' },
  { id: 'voice_battle_start', name: 'voice_battle_start.mp3' }
];

const audioDir = path.join(__dirname, '../public/assets/audio');

// Create audio directory
fs.mkdirSync(audioDir, { recursive: true });

console.log('Creating audio placeholders...\n');

audioPlaceholders.forEach(audio => {
  // Create empty file (will be silent)
  const filePath = path.join(audioDir, audio.name);
  fs.writeFileSync(filePath, '');
  console.log(`✅ Created placeholder: ${audio.name}`);
});

// Create a README
const readme = `# Audio Assets

## Placeholder Files

The following audio files are placeholders and should be replaced with real audio:

### Music (BGM)
- \`bgm_overworld.mp3\` - Overworld exploration music
- \`bgm_battle.mp3\` - Battle music

### Sound Effects (SFX)
- \`sfx_menu_select.mp3\` - Menu selection sound
- \`sfx_attack.mp3\` - Attack hit sound
- \`sfx_capture.mp3\` - Monster capture sound
- \`sfx_victory.mp3\` - Battle victory sound

### Voice Lines
- \`voice_battle_start.mp3\` - Battle start voice (Vietnamese)

## Recommended Sources

### Free Music
- **Incompetech**: https://incompetech.com/music/royalty-free/
- **FreePD**: https://freepd.com/
- **OpenGameArt**: https://opengameart.org/

### Free Sound Effects
- **Freesound**: https://freesound.org/
- **Zapsplat**: https://www.zapsplat.com/
- **OpenGameArt**: https://opengameart.org/

### Vietnamese Voice
- Record custom voice lines
- Use text-to-speech (TTS) services with Vietnamese support
- Hire voice actors on Fiverr or similar platforms

## Format Requirements

- **Format**: MP3 or OGG
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bitrate**: 128 kbps or higher
- **Channels**: Stereo or Mono

## License

Ensure all audio files are licensed for use in games. Prefer:
- Public Domain (CC0)
- Creative Commons (CC-BY or CC-BY-SA)
- Royalty-free licenses

Always attribute as required by the license.
`;

fs.writeFileSync(path.join(audioDir, 'README.md'), readme);
console.log('✅ Created README.md');

console.log('\n⚠️  IMPORTANT: Replace placeholder files with real audio!');
console.log('\nNext steps:');
console.log('1. Visit recommended sources above');
console.log('2. Download appropriate audio files');
console.log('3. Replace the placeholder files');
console.log('4. Ensure proper licensing and attribution');
