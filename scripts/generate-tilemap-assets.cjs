const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const TILE_SIZE = 32;
const TILESET_COLS = 16;
const TILESET_ROWS = 16;

const tileCanvas = createCanvas(TILE_SIZE * TILESET_COLS, TILE_SIZE * TILESET_ROWS);
const ctx = tileCanvas.getContext('2d');

// Define tile types with colors (Vietnamese theme)
const tileTypes = {
  grass: { color: '#4CAF50', label: 'Cỏ', index: 0 },
  water: { color: '#2196F3', label: 'Nước', index: 1 },
  mountain: { color: '#795548', label: 'Núi', index: 2 },
  forest: { color: '#1B5E20', label: 'Rừng', index: 3 },
  sand: { color: '#FDD835', label: 'Cát', index: 4 },
  stone: { color: '#607D8B', label: 'Đá', index: 5 },
  path: { color: '#8D6E63', label: 'Đường', index: 6 },
  temple: { color: '#FF9800', label: 'Đền', index: 7 },
  village: { color: '#E91E63', label: 'Làng', index: 8 }
};

console.log('Generating tileset...');

// Generate tiles
for (const [key, tile] of Object.entries(tileTypes)) {
  const col = tile.index % TILESET_COLS;
  const row = Math.floor(tile.index / TILESET_COLS);
  
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  
  // Fill tile
  ctx.fillStyle = tile.color;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  
  // Add border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
  
  // Add label
  ctx.fillStyle = '#FFF';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tile.label, x + TILE_SIZE/2, y + TILE_SIZE/2);
}

// Create tilesets directory
const tilesetDir = path.join(__dirname, '../public/assets/tilesets');
fs.mkdirSync(tilesetDir, { recursive: true });

// Save tileset
const buffer = tileCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(tilesetDir, 'showcase-tileset.png'), buffer);
console.log('✅ Generated showcase tileset');

// Generate Tiled map JSON
const showcaseMap = {
  width: 50,
  height: 50,
  tilewidth: 32,
  tileheight: 32,
  infinite: false,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.0',
  type: 'map',
  version: '1.10',
  tilesets: [
    {
      firstgid: 1,
      source: '../tilesets/showcase-tileset.tsx'
    }
  ],
  layers: [
    {
      id: 1,
      name: 'ground',
      type: 'tilelayer',
      width: 50,
      height: 50,
      data: generateGroundLayer(),
      visible: true,
      opacity: 1,
      x: 0,
      y: 0
    },
    {
      id: 2,
      name: 'collision',
      type: 'tilelayer',
      width: 50,
      height: 50,
      data: generateCollisionLayer(),
      visible: true,
      opacity: 0.5,
      x: 0,
      y: 0
    },
    {
      id: 3,
      name: 'encounters',
      type: 'objectgroup',
      objects: generateEncounterZones(),
      visible: true,
      opacity: 1,
      x: 0,
      y: 0
    }
  ]
};

function generateGroundLayer() {
  const data = [];
  for (let y = 0; y < 50; y++) {
    for (let x = 0; x < 50; x++) {
      // Create regions for 5 elements
      if (x < 20 && y < 20) {
        data.push(6); // Kim region (stone/mountain - top-left)
      } else if (x >= 30 && y < 20) {
        data.push(4); // Mộc region (forest - top-right)
      } else if (x < 20 && y >= 30) {
        data.push(2); // Thủy region (water - bottom-left)
      } else if (x >= 30 && y >= 30) {
        data.push(5); // Hỏa region (sand/desert - bottom-right)
      } else {
        data.push(1); // Thổ region (grass - center)
      }
    }
  }
  return data;
}

function generateCollisionLayer() {
  const data = [];
  for (let y = 0; y < 50; y++) {
    for (let x = 0; x < 50; x++) {
      // Walls around edges
      if (x === 0 || x === 49 || y === 0 || y === 49) {
        data.push(3); // Mountain wall
      } else {
        data.push(0); // Walkable (0 = no tile)
      }
    }
  }
  return data;
}

function generateEncounterZones() {
  return [
    { 
      id: 1,
      name: 'Kim Zone', 
      x: 160, 
      y: 160, 
      width: 480, 
      height: 480, 
      type: 'encounter',
      visible: true,
      properties: [
        { name: 'element', type: 'string', value: 'kim' }
      ]
    },
    { 
      id: 2,
      name: 'Mộc Zone', 
      x: 960, 
      y: 160, 
      width: 480, 
      height: 480, 
      type: 'encounter',
      visible: true,
      properties: [
        { name: 'element', type: 'string', value: 'moc' }
      ]
    },
    { 
      id: 3,
      name: 'Thủy Zone', 
      x: 160, 
      y: 960, 
      width: 480, 
      height: 480, 
      type: 'encounter',
      visible: true,
      properties: [
        { name: 'element', type: 'string', value: 'thuy' }
      ]
    },
    { 
      id: 4,
      name: 'Hỏa Zone', 
      x: 960, 
      y: 960, 
      width: 480, 
      height: 480, 
      type: 'encounter',
      visible: true,
      properties: [
        { name: 'element', type: 'string', value: 'hoa' }
      ]
    },
    { 
      id: 5,
      name: 'Thổ Zone', 
      x: 480, 
      y: 480, 
      width: 640, 
      height: 640, 
      type: 'encounter',
      visible: true,
      properties: [
        { name: 'element', type: 'string', value: 'tho' }
      ]
    }
  ];
}

// Create maps directory
const mapsDir = path.join(__dirname, '../src/data/maps');
fs.mkdirSync(mapsDir, { recursive: true });

// Save map
fs.writeFileSync(
  path.join(mapsDir, 'showcase-map.json'),
  JSON.stringify(showcaseMap, null, 2)
);

console.log('✅ Generated showcase map');
console.log('\nMap features:');
console.log('- 50x50 tiles (1600x1600 pixels)');
console.log('- 5 element zones (Kim, Mộc, Thủy, Hỏa, Thổ)');
console.log('- Collision walls around edges');
console.log('- Encounter zones for each element');
