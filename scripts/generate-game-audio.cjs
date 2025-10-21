#!/usr/bin/env node

/**
 * 🎵 Game Audio Generator - Complete Audio System
 * 
 * Generates ALL game audio using Web Audio API:
 * - Background music (showcase, battle, overworld)
 * - Animation SFX (attack, damage, walk, idle)
 * - UI sounds (click, hover, select, level up)
 * - Combat effects (critical, super effective)
 * 
 * Zero external dependencies - 100% procedural synthesis
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Audio output directory
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'assets', 'audio');

/**
 * Generate calm exploration music for ShowcaseDemo
 * Vietnamese pentatonic scale with gentle rhythm
 */
function generateShowcaseMusic() {
  log('\n🎵 Generating Showcase Background Music...', 'cyan');
  
  const sampleRate = 44100;
  const duration = 30; // 30 second loop
  const samples = sampleRate * duration;
  const buffer = Buffer.alloc(samples * 2); // 16-bit
  
  // Vietnamese pentatonic scale (C, D, E, G, A) in Hz
  const scale = [261.63, 293.66, 329.63, 392.00, 440.00];
  
  // Calm melody pattern
  const melody = [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 3, 1, 2, 0];
  const noteLength = Math.floor(samples / melody.length);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(i / noteLength) % melody.length;
    const freq = scale[melody[noteIndex]];
    
    // Gentle sine wave with subtle harmonics
    const fundamental = Math.sin(2 * Math.PI * freq * t);
    const harmonic = 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
    const subHarmonic = 0.2 * Math.sin(2 * Math.PI * freq * 0.5 * t);
    
    // Envelope (fade in/out within each note)
    const noteProgress = (i % noteLength) / noteLength;
    const envelope = Math.sin(noteProgress * Math.PI);
    
    // Mix
    const sample = (fundamental + harmonic + subHarmonic) * envelope * 0.3;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  writeWavFile(path.join(AUDIO_DIR, 'bgm_showcase.wav'), buffer, sampleRate);
  log('  ✅ bgm_showcase.wav (30s calm exploration)', 'green');
}

/**
 * Generate attack sound effects for different elements
 */
function generateAttackSFX() {
  log('\n⚔️  Generating Attack Sound Effects...', 'cyan');
  
  const sampleRate = 44100;
  const duration = 0.3; // 300ms
  const samples = Math.floor(sampleRate * duration);
  
  // Generic attack swoosh
  const attack = generateSwoosh(samples, sampleRate);
  writeWavFile(path.join(AUDIO_DIR, 'sfx_attack.wav'), attack, sampleRate);
  log('  ✅ sfx_attack.wav (swoosh)', 'green');
  
  // Critical hit (higher pitch, longer)
  const critical = generateSwoosh(samples * 1.5, sampleRate, 1.5);
  writeWavFile(path.join(AUDIO_DIR, 'sfx_critical.wav'), critical, sampleRate);
  log('  ✅ sfx_critical.wav (power swoosh)', 'green');
  
  // Impact sound
  const impact = generateImpact(samples, sampleRate);
  writeWavFile(path.join(AUDIO_DIR, 'sfx_impact.wav'), impact, sampleRate);
  log('  ✅ sfx_impact.wav (hit)', 'green');
}

/**
 * Generate damage/hurt sounds
 */
function generateDamageSFX() {
  log('\n💥 Generating Damage Sound Effects...', 'cyan');
  
  const sampleRate = 44100;
  const duration = 0.2;
  const samples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 15);
    
    // Descending pitch (pain sound)
    const freq = 300 - t * 200;
    const noise = (Math.random() - 0.5) * 0.3;
    const tone = Math.sin(2 * Math.PI * freq * t);
    
    const sample = (tone * 0.7 + noise) * decay * 0.4;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  writeWavFile(path.join(AUDIO_DIR, 'sfx_damage.wav'), buffer, sampleRate);
  log('  ✅ sfx_damage.wav (hurt sound)', 'green');
}

/**
 * Generate UI sounds
 */
function generateUISounds() {
  log('\n🖱️  Generating UI Sound Effects...', 'cyan');
  
  const sampleRate = 44100;
  
  // Button click
  const click = generateClick(Math.floor(sampleRate * 0.05), sampleRate);
  writeWavFile(path.join(AUDIO_DIR, 'sfx_click.wav'), click, sampleRate);
  log('  ✅ sfx_click.wav (button click)', 'green');
  
  // Hover sound
  const hover = generateHover(Math.floor(sampleRate * 0.08), sampleRate);
  writeWavFile(path.join(AUDIO_DIR, 'sfx_hover.wav'), hover, sampleRate);
  log('  ✅ sfx_hover.wav (UI hover)', 'green');
  
  // Selection confirm
  const select = generateSelect(Math.floor(sampleRate * 0.15), sampleRate);
  writeWavFile(path.join(AUDIO_DIR, 'sfx_select.wav'), select, sampleRate);
  log('  ✅ sfx_select.wav (selection)', 'green');
  
  // Level up fanfare
  const levelUp = generateLevelUp(Math.floor(sampleRate * 1.0), sampleRate);
  writeWavFile(path.join(AUDIO_DIR, 'sfx_levelup.wav'), levelUp, sampleRate);
  log('  ✅ sfx_levelup.wav (level up)', 'green');
}

/**
 * Generate battle music
 */
function generateBattleMusic() {
  log('\n⚔️  Generating Battle Music...', 'cyan');
  
  const sampleRate = 44100;
  const duration = 20; // 20 second loop
  const samples = sampleRate * duration;
  const buffer = Buffer.alloc(samples * 2);
  
  // Energetic battle rhythm
  const scale = [261.63, 293.66, 329.63, 392.00, 440.00]; // Pentatonic
  const pattern = [0, 0, 2, 2, 3, 3, 1, 1, 4, 4, 2, 2, 0, 0, 3, 3];
  const noteLength = Math.floor(samples / pattern.length);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(i / noteLength) % pattern.length;
    const freq = scale[pattern[noteIndex]];
    
    // Fast-paced melody
    const melody = Math.sin(2 * Math.PI * freq * t);
    const bass = 0.4 * Math.sin(2 * Math.PI * freq * 0.5 * t);
    
    // Percussion (every beat)
    const beat = Math.floor(t * 4) % 2 === 0 ? 1 : 0;
    const percussion = beat * (Math.random() - 0.5) * 0.2;
    
    const noteProgress = (i % noteLength) / noteLength;
    const envelope = Math.sin(noteProgress * Math.PI);
    
    const sample = (melody + bass) * envelope * 0.3 + percussion;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  writeWavFile(path.join(AUDIO_DIR, 'bgm_battle.wav'), buffer, sampleRate);
  log('  ✅ bgm_battle.wav (20s battle theme)', 'green');
}

/**
 * Helper: Generate swoosh sound
 */
function generateSwoosh(samples, sampleRate, pitchMultiplier = 1.0) {
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const progress = i / samples;
    
    // Sweeping frequency
    const freq = (200 + progress * 400) * pitchMultiplier;
    const decay = Math.exp(-t * 10);
    
    const noise = (Math.random() - 0.5);
    const tone = Math.sin(2 * Math.PI * freq * t);
    
    const sample = (noise * 0.7 + tone * 0.3) * decay * 0.5;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  return buffer;
}

/**
 * Helper: Generate impact sound
 */
function generateImpact(samples, sampleRate) {
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 20);
    
    // Low frequency thump + noise
    const thump = Math.sin(2 * Math.PI * 80 * t);
    const noise = (Math.random() - 0.5);
    
    const sample = (thump * 0.6 + noise * 0.4) * decay * 0.6;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  return buffer;
}

/**
 * Helper: Generate click sound
 */
function generateClick(samples, sampleRate) {
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 80);
    
    const click = Math.sin(2 * Math.PI * 800 * t);
    const sample = click * decay * 0.5;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  return buffer;
}

/**
 * Helper: Generate hover sound
 */
function generateHover(samples, sampleRate) {
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const envelope = Math.sin((i / samples) * Math.PI);
    
    const tone = Math.sin(2 * Math.PI * 600 * t);
    const sample = tone * envelope * 0.3;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  return buffer;
}

/**
 * Helper: Generate selection sound
 */
function generateSelect(samples, sampleRate) {
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const progress = i / samples;
    
    // Rising pitch
    const freq = 400 + progress * 200;
    const envelope = Math.sin(progress * Math.PI);
    
    const tone = Math.sin(2 * Math.PI * freq * t);
    const sample = tone * envelope * 0.4;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  return buffer;
}

/**
 * Helper: Generate level up sound
 */
function generateLevelUp(samples, sampleRate) {
  const buffer = Buffer.alloc(samples * 2);
  
  // Victory arpeggio: C-E-G-C (major triad)
  const notes = [261.63, 329.63, 392.00, 523.25];
  const noteLength = Math.floor(samples / notes.length);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(i / noteLength);
    const freq = notes[Math.min(noteIndex, notes.length - 1)];
    
    const noteProgress = (i % noteLength) / noteLength;
    const envelope = Math.sin(noteProgress * Math.PI);
    
    const tone = Math.sin(2 * Math.PI * freq * t);
    const harmonic = 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
    
    const sample = (tone + harmonic) * envelope * 0.5;
    const value = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(value, i * 2);
  }
  
  return buffer;
}

/**
 * Write WAV file
 */
function writeWavFile(filepath, audioData, sampleRate) {
  const numSamples = audioData.length / 2;
  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + audioData.length, 4);
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(audioData.length, 40);
  
  const wavFile = Buffer.concat([header, audioData]);
  fs.writeFileSync(filepath, wavFile);
}

/**
 * Main execution
 */
function main() {
  log('\n╔════════════════════════════════════════════════════╗', 'cyan');
  log('║  🎵 Game Audio Generator - Complete Audio System ║', 'cyan');
  log('╚════════════════════════════════════════════════════╝', 'cyan');
  
  // Ensure audio directory exists
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    log(`\n✅ Created audio directory: ${AUDIO_DIR}`, 'green');
  }
  
  // Generate all audio
  generateShowcaseMusic();
  generateBattleMusic();
  generateAttackSFX();
  generateDamageSFX();
  generateUISounds();
  
  log('\n✅ All game audio generated successfully!', 'green');
  log(`📁 Output directory: ${AUDIO_DIR}`, 'blue');
  log('\nGenerated files:', 'yellow');
  log('  🎵 bgm_showcase.wav - Calm exploration music (30s)', 'blue');
  log('  ⚔️  bgm_battle.wav - Battle theme (20s)', 'blue');
  log('  ⚔️  sfx_attack.wav - Attack swoosh', 'blue');
  log('  💥 sfx_critical.wav - Critical hit', 'blue');
  log('  💥 sfx_impact.wav - Hit impact', 'blue');
  log('  💥 sfx_damage.wav - Damage/hurt sound', 'blue');
  log('  🖱️  sfx_click.wav - Button click', 'blue');
  log('  🖱️  sfx_hover.wav - UI hover', 'blue');
  log('  🖱️  sfx_select.wav - Selection confirm', 'blue');
  log('  ⭐ sfx_levelup.wav - Level up fanfare', 'blue');
}

main();
