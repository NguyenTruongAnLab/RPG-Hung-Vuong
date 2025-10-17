#!/usr/bin/env node

/**
 * Audio Generation Script for RPG Hùng Vương
 * 
 * Generates all voice lines, music, and SFX using Web Audio API
 * All audio is code-generated - no external dependencies or APIs
 * 
 * Features:
 * - Vietnamese voice simulation using melodic beeps
 * - Chiptune music generation
 * - SFX generation with synthesized sounds
 * - Proper file organization
 */

const fs = require('fs');
const path = require('path');
const { allScripts } = require('./audio-scripts.cjs');

// Audio output directory
const AUDIO_DIR = path.join(__dirname, '../public/assets/audio');

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// ========================================
// AUDIO BUFFER UTILITIES
// ========================================

/**
 * Create a simple WAV header for audio data
 */
function createWavHeader(dataLength, sampleRate = 44100, numChannels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);
  
  // "RIFF" chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  
  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  
  return buffer;
}

/**
 * Generate a simple tone at specified frequency
 */
function generateTone(frequency, duration, sampleRate = 44100, volume = 0.3) {
  const samples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(samples * 2); // 16-bit samples
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t) * volume;
    const sample = Math.floor(value * 32767);
    buffer.writeInt16LE(sample, i * 2);
  }
  
  return buffer;
}

/**
 * Generate an ADSR envelope
 */
function applyEnvelope(samples, attack = 0.1, decay = 0.1, sustain = 0.7, release = 0.2) {
  const totalSamples = samples.length / 2;
  const attackSamples = Math.floor(totalSamples * attack);
  const decaySamples = Math.floor(totalSamples * decay);
  const releaseSamples = Math.floor(totalSamples * release);
  const sustainSamples = totalSamples - attackSamples - decaySamples - releaseSamples;
  
  for (let i = 0; i < totalSamples; i++) {
    let envelope = 1.0;
    
    if (i < attackSamples) {
      // Attack phase
      envelope = i / attackSamples;
    } else if (i < attackSamples + decaySamples) {
      // Decay phase
      const decayProgress = (i - attackSamples) / decaySamples;
      envelope = 1.0 - (1.0 - sustain) * decayProgress;
    } else if (i < attackSamples + decaySamples + sustainSamples) {
      // Sustain phase
      envelope = sustain;
    } else {
      // Release phase
      const releaseProgress = (i - attackSamples - decaySamples - sustainSamples) / releaseSamples;
      envelope = sustain * (1.0 - releaseProgress);
    }
    
    const currentSample = samples.readInt16LE(i * 2);
    const newSample = Math.floor(currentSample * envelope);
    samples.writeInt16LE(newSample, i * 2);
  }
  
  return samples;
}

/**
 * Mix multiple audio buffers together
 */
function mixBuffers(...buffers) {
  const maxLength = Math.max(...buffers.map(b => b.length));
  const mixed = Buffer.alloc(maxLength);
  
  for (let i = 0; i < maxLength; i += 2) {
    let sum = 0;
    let count = 0;
    
    for (const buffer of buffers) {
      if (i < buffer.length) {
        sum += buffer.readInt16LE(i);
        count++;
      }
    }
    
    if (count > 0) {
      const avg = Math.floor(sum / count);
      mixed.writeInt16LE(Math.max(-32768, Math.min(32767, avg)), i);
    }
  }
  
  return mixed;
}

// ========================================
// VOICE GENERATION (Melodic Beeps)
// ========================================

/**
 * Generate a melodic beep sequence for voice simulation
 * Vietnamese tones are approximated with pitch variations
 */
function generateVoiceLine(text, duration = 2.0) {
  const words = text.split(' ');
  const beepDuration = duration / words.length;
  const sampleRate = 44100;
  
  // Vietnamese-inspired melodic frequencies (Hz)
  const tones = [523, 587, 659, 698, 784, 880]; // C5 to A5
  
  const segments = [];
  
  words.forEach((word, i) => {
    // Select frequency based on word position (pseudo-Vietnamese tones)
    const toneIndex = (word.length + i) % tones.length;
    const frequency = tones[toneIndex];
    
    // Generate beep
    let beep = generateTone(frequency, beepDuration * 0.8, sampleRate, 0.25);
    beep = applyEnvelope(beep, 0.05, 0.1, 0.6, 0.25);
    
    // Add silence between words
    const silence = Buffer.alloc(Math.floor(sampleRate * beepDuration * 0.2 * 2));
    
    segments.push(beep, silence);
  });
  
  // Concatenate all segments
  const totalLength = segments.reduce((sum, seg) => sum + seg.length, 0);
  const result = Buffer.concat(segments, totalLength);
  
  return result;
}

// ========================================
// MUSIC GENERATION
// ========================================

/**
 * Generate a simple chiptune melody
 */
function generateMelody(notes, tempo = 120, sampleRate = 44100) {
  const beatDuration = 60 / tempo; // seconds per beat
  const segments = [];
  
  notes.forEach(({ freq, beats, volume = 0.2 }) => {
    const duration = beatDuration * beats;
    let tone = generateTone(freq, duration, sampleRate, volume);
    tone = applyEnvelope(tone, 0.01, 0.1, 0.7, 0.2);
    segments.push(tone);
  });
  
  return Buffer.concat(segments);
}

/**
 * Generate overworld music (adventurous theme)
 */
function generateOverworldMusic() {
  // Simple melodic pattern - Vietnamese-inspired pentatonic scale
  const notes = [
    { freq: 523, beats: 0.5 }, // C5
    { freq: 587, beats: 0.5 }, // D5
    { freq: 659, beats: 0.5 }, // E5
    { freq: 784, beats: 0.5 }, // G5
    { freq: 880, beats: 1.0 }, // A5
    { freq: 784, beats: 0.5 }, // G5
    { freq: 659, beats: 0.5 }, // E5
    { freq: 587, beats: 0.5 }, // D5
    { freq: 523, beats: 1.0 }, // C5
    { freq: 0, beats: 0.5 },   // Rest
    
    // Repeat with variation
    { freq: 659, beats: 0.5 },
    { freq: 784, beats: 0.5 },
    { freq: 880, beats: 0.5 },
    { freq: 1047, beats: 0.5 }, // C6
    { freq: 880, beats: 1.0 },
    { freq: 784, beats: 0.5 },
    { freq: 659, beats: 0.5 },
    { freq: 587, beats: 1.0 },
  ];
  
  const melody = generateMelody(notes, 140);
  
  // Add simple bass line
  const bassNotes = [
    { freq: 131, beats: 2.0, volume: 0.15 }, // C3
    { freq: 147, beats: 2.0, volume: 0.15 }, // D3
    { freq: 165, beats: 2.0, volume: 0.15 }, // E3
    { freq: 147, beats: 2.0, volume: 0.15 }, // D3
  ];
  
  const bass = generateMelody(bassNotes, 140);
  
  return mixBuffers(melody, bass);
}

/**
 * Generate battle music (intense theme)
 */
function generateBattleMusic() {
  // Aggressive pattern
  const notes = [
    { freq: 440, beats: 0.25 }, // A4
    { freq: 440, beats: 0.25 },
    { freq: 523, beats: 0.5 },  // C5
    { freq: 659, beats: 0.25 }, // E5
    { freq: 784, beats: 0.75 }, // G5
    { freq: 659, beats: 0.5 },
    { freq: 523, beats: 0.5 },
    { freq: 440, beats: 1.0 },
    
    { freq: 494, beats: 0.25 }, // B4
    { freq: 494, beats: 0.25 },
    { freq: 587, beats: 0.5 },  // D5
    { freq: 698, beats: 0.25 }, // F5
    { freq: 880, beats: 0.75 }, // A5
    { freq: 698, beats: 0.5 },
    { freq: 587, beats: 0.5 },
    { freq: 494, beats: 1.0 },
  ];
  
  return generateMelody(notes, 160);
}

/**
 * Generate victory fanfare
 */
function generateVictoryMusic() {
  const notes = [
    { freq: 523, beats: 0.25 },  // C5
    { freq: 659, beats: 0.25 },  // E5
    { freq: 784, beats: 0.25 },  // G5
    { freq: 1047, beats: 1.0 },  // C6
    { freq: 784, beats: 0.5 },   // G5
    { freq: 1047, beats: 1.5 },  // C6
  ];
  
  return generateMelody(notes, 120);
}

// ========================================
// SFX GENERATION
// ========================================

/**
 * Generate menu selection sound
 */
function generateMenuSelectSFX() {
  const tone1 = generateTone(880, 0.05, 44100, 0.3);
  const tone2 = generateTone(1047, 0.05, 44100, 0.3);
  return Buffer.concat([tone1, tone2]);
}

/**
 * Generate attack/hit sound
 */
function generateAttackSFX() {
  // Start high and sweep down
  const sampleRate = 44100;
  const duration = 0.15;
  const samples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const freq = 800 - (t / duration) * 600; // Sweep from 800Hz to 200Hz
    const value = Math.sin(2 * Math.PI * freq * t) * 0.4;
    const sample = Math.floor(value * 32767);
    buffer.writeInt16LE(sample, i * 2);
  }
  
  return applyEnvelope(buffer, 0.01, 0.3, 0.5, 0.2);
}

/**
 * Generate explosion/impact sound
 */
function generateExplosionSFX() {
  // White noise burst
  const sampleRate = 44100;
  const duration = 0.3;
  const samples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const value = (Math.random() * 2 - 1) * 0.5;
    const sample = Math.floor(value * 32767);
    buffer.writeInt16LE(sample, i * 2);
  }
  
  return applyEnvelope(buffer, 0.001, 0.1, 0.3, 0.6);
}

/**
 * Generate elemental effect sounds
 */
function generateElementalSFX(element) {
  switch (element) {
    case 'fire':
      // Crackling fire - random high frequency noise
      return generateExplosionSFX();
      
    case 'water':
      // Splash - filtered noise
      const waterNoise = generateExplosionSFX();
      return applyEnvelope(waterNoise, 0.05, 0.2, 0.5, 0.25);
      
    case 'metal':
      // Metallic clang - high frequency tone
      return generateTone(1200, 0.2, 44100, 0.4);
      
    case 'wood':
      // Rustling - mid frequency sweep
      const woodSweep = generateAttackSFX();
      return applyEnvelope(woodSweep, 0.1, 0.2, 0.6, 0.1);
      
    case 'earth':
      // Rumble - low frequency
      return generateTone(80, 0.4, 44100, 0.35);
      
    default:
      return generateAttackSFX();
  }
}

// ========================================
// FILE WRITING
// ========================================

/**
 * Write audio buffer to WAV file
 */
function writeWavFile(filename, audioData, sampleRate = 44100) {
  const header = createWavHeader(audioData.length, sampleRate);
  const wavData = Buffer.concat([header, audioData]);
  const filepath = path.join(AUDIO_DIR, filename);
  fs.writeFileSync(filepath, wavData);
  return filepath;
}

// ========================================
// MAIN GENERATION LOGIC
// ========================================

console.log('🎵 Starting Audio Generation for RPG Hùng Vương\n');
console.log('=' .repeat(60));

// Track statistics
const stats = {
  voices: 0,
  music: 0,
  sfx: 0,
  total: 0
};

// Generate all voice lines
console.log('\n📢 Generating Vietnamese Voice Lines...\n');
Object.entries(allScripts).forEach(([key, script]) => {
  const { vi, file, category } = script;
  
  // Determine duration based on text length
  const duration = Math.max(1.5, Math.min(4.0, vi.length / 20));
  
  const audioData = generateVoiceLine(vi, duration);
  writeWavFile(file, audioData);
  
  console.log(`✅ ${file.padEnd(40)} [${category}]`);
  stats.voices++;
  stats.total++;
});

// Generate music tracks
console.log('\n🎼 Generating Music Tracks...\n');

const musicTracks = [
  { name: 'bgm_overworld.wav', generator: generateOverworldMusic },
  { name: 'bgm_battle.wav', generator: generateBattleMusic },
  { name: 'bgm_victory.wav', generator: generateVictoryMusic },
  { name: 'bgm_menu.wav', generator: generateOverworldMusic }, // Reuse overworld for menu
];

musicTracks.forEach(({ name, generator }) => {
  const audioData = generator();
  writeWavFile(name, audioData);
  console.log(`✅ ${name.padEnd(40)} [music]`);
  stats.music++;
  stats.total++;
});

// Generate SFX
console.log('\n🔊 Generating Sound Effects...\n');

const sfxList = [
  { name: 'sfx_menu_select.wav', generator: generateMenuSelectSFX },
  { name: 'sfx_menu_back.wav', generator: () => generateTone(659, 0.1, 44100, 0.3) },
  { name: 'sfx_menu_open.wav', generator: () => generateTone(784, 0.15, 44100, 0.3) },
  { name: 'sfx_attack.wav', generator: generateAttackSFX },
  { name: 'sfx_critical.wav', generator: () => generateTone(1200, 0.2, 44100, 0.5) },
  { name: 'sfx_explosion.wav', generator: generateExplosionSFX },
  { name: 'sfx_fire.wav', generator: () => generateElementalSFX('fire') },
  { name: 'sfx_water.wav', generator: () => generateElementalSFX('water') },
  { name: 'sfx_metal.wav', generator: () => generateElementalSFX('metal') },
  { name: 'sfx_wood.wav', generator: () => generateElementalSFX('wood') },
  { name: 'sfx_earth.wav', generator: () => generateElementalSFX('earth') },
  { name: 'sfx_capture.wav', generator: () => generateTone(523, 0.3, 44100, 0.3) },
  { name: 'sfx_victory.wav', generator: generateVictoryMusic },
  { name: 'sfx_level_up.wav', generator: () => {
    const up = generateMelody([
      { freq: 523, beats: 0.2 },
      { freq: 659, beats: 0.2 },
      { freq: 784, beats: 0.4 },
    ], 120);
    return up;
  }},
];

sfxList.forEach(({ name, generator }) => {
  const audioData = generator();
  writeWavFile(name, audioData);
  console.log(`✅ ${name.padEnd(40)} [sfx]`);
  stats.sfx++;
  stats.total++;
});

// Generate summary report
console.log('\n' + '='.repeat(60));
console.log('\n📊 Generation Summary:\n');
console.log(`Voice Lines: ${stats.voices}`);
console.log(`Music Tracks: ${stats.music}`);
console.log(`Sound Effects: ${stats.sfx}`);
console.log(`Total Files: ${stats.total}`);
console.log('\n✅ All audio files generated successfully!');
console.log(`📁 Location: ${AUDIO_DIR}`);
console.log('\n⚠️  IMPORTANT: Replace these code-generated files with real audio!');
console.log('   See public/assets/audio/README.md for replacement instructions.');
console.log('\n' + '='.repeat(60));

// Generate manifest file
const manifest = {
  generated: new Date().toISOString(),
  totalFiles: stats.total,
  voices: stats.voices,
  music: stats.music,
  sfx: stats.sfx,
  files: {
    voices: Object.values(allScripts).map(s => ({
      file: s.file,
      text_vi: s.vi,
      text_en: s.en,
      category: s.category
    })),
    music: musicTracks.map(m => m.name),
    sfx: sfxList.map(s => s.name)
  }
};

fs.writeFileSync(
  path.join(AUDIO_DIR, 'audio-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('📋 Audio manifest created: audio-manifest.json\n');
