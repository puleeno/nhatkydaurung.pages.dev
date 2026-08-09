# Icon Setup Instructions

The app icon files need to be replaced with actual PNG images for iOS add to home screen functionality.

## Current Status

✅ PWA manifest.json created
✅ iOS meta tags added to index.html  
✅ Icon placeholders created
✅ Public directory configured in vite.config.ts

## Required Actions

### Option 1: Use an online tool (Recommended)

1. Visit https://www.favicon-generator.org/
2. Upload the icon.svg file from the public folder
3. Select "App Icons" and generate all sizes
4. Download the generated PNG files
5. Replace the placeholder files in public/:
   - icon-192.png
   - icon-512.png
   - icon-152.png
   - icon-167.png
   - icon-180.png
   - icon-32.png
   - icon-16.png

### Option 2: Use the generate-icons script

1. Install canvas library: `npm install canvas`
2. Run: `node scripts/generate-icons.js`
3. This will generate PNG files from the SVG

### Option 3: Manual creation

1. Open icon.svg in an image editor
2. Export as PNG in these sizes:
   - 192x192 (192.png)
   - 512x512 (512.png)
   - 152x152 (152.png)
   - 167x167 (167.png)
   - 180x180 (180.png)
   - 32x32 (32.png)
   - 16x16 (16.png)

## Icon Design

The current icon.svg uses:
- Pink gradient background (#FFE4E9 to #F43F5E)
- Menstrual cycle theme with circles
- Flower emoji (🌸) as the main element
- Rounded corners for iOS aesthetic

## Testing

After replacing the icon files:

1. Deploy: `npm run build` and `wrangler pages deploy dist --project-name=nhatkydaurung --commit-dirty=true`
2. On iOS Safari, open https://nhatkydaurung.pages.dev
3. Tap "Share" → "Add to Home Screen"
4. The icon should appear on your home screen

## Files Created

- public/manifest.json - PWA manifest
- public/icon.svg - SVG source file
- public/icon-*.png - PNG icons (placeholders)
- index.html - Updated with iOS meta tags
- vite.config.ts - Added publicDir configuration
