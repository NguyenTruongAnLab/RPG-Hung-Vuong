// Simple script to generate placeholder monster assets
// Creates basic colored squares for testing DragonBones

const fs = require('fs');
const path = require('path');

// Monster configurations
const monsters = [
  { id: 'char001', name: 'Rồng Kim', element: 'kim', color: '#FFD700' },    // Gold for Kim (Metal)
  { id: 'char041', name: 'Rồng Mộc', element: 'moc', color: '#228B22' },   // Green for Mộc (Wood)
  { id: 'char081', name: 'Rồng Thủy', element: 'thuy', color: '#1E90FF' }  // Blue for Thủy (Water)
];

// Template for skeleton.json
const skeletonTemplate = (monsterId) => ({
  frameRate: 24,
  name: monsterId,
  version: "5.5",
  compatibleVersion: "5.5",
  armature: [{
    type: "Armature",
    frameRate: 24,
    name: "armature",
    aabb: { x: -50, y: -50, width: 100, height: 100 },
    bone: [{ name: "root" }],
    slot: [{ name: "body", parent: "root" }],
    skin: [{
      name: "default",
      slot: [{
        name: "body",
        display: [{ type: "image", name: monsterId }]
      }]
    }],
    animation: [
      {
        duration: 24,
        name: "idle",
        bone: [{ name: "root", translateFrame: [{ duration: 24, tweenEasing: 0 }] }]
      },
      {
        duration: 12,
        name: "attack",
        bone: [{
          name: "root",
          translateFrame: [
            { duration: 6, tweenEasing: 0, x: 10 },
            { duration: 6, tweenEasing: 0, x: 0 }
          ]
        }]
      }
    ]
  }]
});

// Template for texture.json
const textureTemplate = (monsterId) => ({
  name: monsterId,
  imagePath: "texture.png",
  width: 128,
  height: 128,
  SubTexture: [{
    name: monsterId,
    x: 0,
    y: 0,
    width: 128,
    height: 128
  }]
});

// Generate SVG as placeholder image
const generateSVG = (color, name) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="${color}"/>
  <text x="64" y="64" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">${name}</text>
</svg>`;

// Create directories and files
monsters.forEach(monster => {
  const dir = path.join(__dirname, '..', 'public', 'assets', 'monsters', monster.id);
  
  // Create directory
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write skeleton.json
  fs.writeFileSync(
    path.join(dir, 'skeleton.json'),
    JSON.stringify(skeletonTemplate(monster.id), null, 2)
  );
  
  // Write texture.json
  fs.writeFileSync(
    path.join(dir, 'texture.json'),
    JSON.stringify(textureTemplate(monster.id), null, 2)
  );
  
  // Write SVG as PNG alternative (browsers can render SVG directly)
  fs.writeFileSync(
    path.join(dir, 'texture.svg'),
    generateSVG(monster.color, monster.name)
  );
  
  console.log(`✓ Generated placeholder for ${monster.id} (${monster.name})`);
});

console.log('\n✓ All placeholder assets generated!');
console.log('Note: SVG files created. For production, convert to PNG using ImageMagick or similar tool.');
