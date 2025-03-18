const fs = require('fs');
const path = require('path');

console.log('Please install sharp and run this script:');
console.log('npm install --save-dev sharp');
console.log('node scripts/generate-favicons.js');

/*
// This code requires the 'sharp' package to be installed
// Run: npm install --save-dev sharp

const sharp = require('sharp');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/invo-logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create favicon.ico (multi-size icon)
sharp(inputFile)
  .resize(32, 32)
  .toFile(path.join(__dirname, '../public/favicon.ico'))
  .then(() => console.log('Created favicon.ico'))
  .catch(err => console.error('Error creating favicon.ico:', err));

// Create apple-touch-icon.png (for iOS)
sharp(inputFile)
  .resize(180, 180)
  .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))
  .then(() => console.log('Created apple-touch-icon.png'))
  .catch(err => console.error('Error creating apple-touch-icon.png:', err));

// Create favicon-16x16.png and favicon-32x32.png
sharp(inputFile)
  .resize(16, 16)
  .toFile(path.join(__dirname, '../public/favicon-16x16.png'))
  .then(() => console.log('Created favicon-16x16.png'))
  .catch(err => console.error('Error creating favicon-16x16.png:', err));

sharp(inputFile)
  .resize(32, 32)
  .toFile(path.join(__dirname, '../public/favicon-32x32.png'))
  .then(() => console.log('Created favicon-32x32.png'))
  .catch(err => console.error('Error creating favicon-32x32.png:', err));

// Create a maskable icon (with padding for safe area)
sharp(inputFile)
  .resize(192, 192, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .extend({
    top: 20,
    bottom: 20, 
    left: 20,
    right: 20,
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .toFile(path.join(outputDir, 'maskable-icon.png'))
  .then(() => console.log('Created maskable-icon.png'))
  .catch(err => console.error('Error creating maskable-icon.png:', err));

// Generate icons for different sizes
Promise.all(
  sizes.map(size => {
    return sharp(inputFile)
      .resize(size, size)
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
      .then(() => console.log(`Created icon-${size}x${size}.png`))
      .catch(err => console.error(`Error creating icon-${size}x${size}.png:`, err));
  })
)
.then(() => console.log('All icons generated successfully!'))
.catch(err => console.error('Error generating icons:', err));
*/ 