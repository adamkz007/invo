const fs = require('fs');
const path = require('path');

// Source logo file
const logoPath = path.join(__dirname, '../public/invo-logo.png');

// Destination paths
const destinations = [
  { path: path.join(__dirname, '../public/favicon.ico'), name: 'favicon.ico' },
  { path: path.join(__dirname, '../public/apple-touch-icon.png'), name: 'apple-touch-icon.png' },
  { path: path.join(__dirname, '../public/favicon-16x16.png'), name: 'favicon-16x16.png' },
  { path: path.join(__dirname, '../public/favicon-32x32.png'), name: 'favicon-32x32.png' },
  { path: path.join(__dirname, '../public/icons/icon-72x72.png'), name: 'icon-72x72.png' },
  { path: path.join(__dirname, '../public/icons/icon-96x96.png'), name: 'icon-96x96.png' },
  { path: path.join(__dirname, '../public/icons/icon-128x128.png'), name: 'icon-128x128.png' },
  { path: path.join(__dirname, '../public/icons/icon-144x144.png'), name: 'icon-144x144.png' },
  { path: path.join(__dirname, '../public/icons/icon-152x152.png'), name: 'icon-152x152.png' },
  { path: path.join(__dirname, '../public/icons/icon-192x192.png'), name: 'icon-192x192.png' },
  { path: path.join(__dirname, '../public/icons/icon-384x384.png'), name: 'icon-384x384.png' },
  { path: path.join(__dirname, '../public/icons/icon-512x512.png'), name: 'icon-512x512.png' },
  { path: path.join(__dirname, '../public/icons/maskable-icon.png'), name: 'maskable-icon.png' },
];

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy the logo to all destination paths
destinations.forEach(({ path: destPath, name }) => {
  fs.copyFile(logoPath, destPath, (err) => {
    if (err) {
      console.error(`Error copying to ${name}:`, err);
    } else {
      console.log(`Created ${name}`);
    }
  });
});

console.log('Note: These files are identical copies of the logo.');
console.log('For production, you should use a proper image manipulation tool to resize them correctly.');
console.log('Consider installing sharp and running the generate-favicons.js script instead.'); 