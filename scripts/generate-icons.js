// Simple script to generate icon files
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function generateIcons() {
  // Create a 512x512 canvas
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#FFE4E9');
  gradient.addColorStop(1, '#F43F5E');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Draw circles for menstrual cycle theme
  ctx.fillStyle = '#F43F5E';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(256, 200, 60, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(200, 280, 40, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(312, 280, 40, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(256, 360, 80, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw flower emoji
  ctx.globalAlpha = 1;
  ctx.font = '80px Arial';
  ctx.fillStyle = '#BE123C';
  ctx.textAlign = 'center';
  ctx.fillText('🌸', 256, 280);
  
  // Generate different sizes
  const sizes = [192, 512, 152, 167, 180, 32, 16];
  
  for (const size of sizes) {
    const resizedCanvas = createCanvas(size, size);
    const resizedCtx = resizedCanvas.getContext('2d');
    resizedCtx.drawImage(canvas, 0, 0, size, size);
    
    const buffer = resizedCanvas.toBuffer('image/png');
    fs.writeFileSync(`public/icon-${size}.png`, buffer);
  }
  
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);