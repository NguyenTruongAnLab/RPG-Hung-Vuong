const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-BMQOY_5J.js', 'utf-8');

// Search for BASE_URL references
const matches = content.match(/BASE_URL/g);
console.log('Total BASE_URL references:', matches ? matches.length : 0);

// Check for the string "/RPG-Hung-Vuong/"
const pathMatches = content.match(/\/RPG-Hung-Vuong\//g);
console.log('Total /RPG-Hung-Vuong/ references:', pathMatches ? pathMatches.length : 0);

// Find the getBasePath implementation
const getBasePathMatch = content.match(/function \$r\(\)\{[^}]+\}/);
console.log('\ngetBasePath implementation:');
console.log(getBasePathMatch ? getBasePathMatch[0] : 'Not found');
