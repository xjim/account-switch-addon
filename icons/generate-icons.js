// Simple Node.js script to generate PNG icons from SVG
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 48, 128];
const svgPath = './icon128.svg';

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error('Error: icon128.svg not found!');
    return;
  }

  for (const size of sizes) {
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(`./icon${size}.png`);
      
      console.log(`✓ Generated icon${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon${size}.png:`, error.message);
    }
  }
  
  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
