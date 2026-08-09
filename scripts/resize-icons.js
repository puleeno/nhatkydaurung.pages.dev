// Resize icon script for iOS PWA
// Run with: node scripts/resize-icons.js

import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function resizeIcons() {
  try {
    console.log('Loading original icon...');
    const image = await loadImage('public/icon-512.png');
    
    const sizes = [192, 512, 152, 167, 180, 32, 16];
    
    for (const size of sizes) {
      console.log(`Generating ${size}x${size} icon...`);
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw the image scaled to the new size
      ctx.drawImage(image, 0, 0, size, size);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(`public/icon-${size}.png`, buffer);
      console.log(`✓ Generated icon-${size}.png`);
    }
    
    console.log('✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('Make sure the icon-512.png file exists in the public directory');
  }
}

resizeIcons();