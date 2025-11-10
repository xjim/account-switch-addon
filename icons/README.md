# Icon Generation Script for AccountSwitch Extension

This folder contains the icons for the AccountSwitch Chrome extension.

## Files

- `icon128.svg` - Source SVG icon (128x128)
- `icon16.png` - 16x16 PNG icon
- `icon32.png` - 32x32 PNG icon
- `icon48.png` - 48x48 PNG icon
- `icon128.png` - 128x128 PNG icon

## Generating PNG Icons

Since SVG to PNG conversion requires image processing tools, you have several options:

### Option 1: Online Conversion (Easiest)
1. Visit https://svgtopng.com/ or https://cloudconvert.com/svg-to-png
2. Upload `icon128.svg`
3. Generate PNG files at the following sizes: 16x16, 32x32, 48x48, 128x128
4. Download and save them in this folder with the correct names

### Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Convert to different sizes
magick icon128.svg -resize 16x16 icon16.png
magick icon128.svg -resize 32x32 icon32.png
magick icon128.svg -resize 48x48 icon48.png
magick icon128.svg -resize 128x128 icon128.png
```

### Option 3: Using Inkscape (GUI)
1. Open `icon128.svg` in Inkscape
2. Go to File > Export PNG Image
3. Set the desired width and height
4. Export each size

### Option 4: Using Node.js
If you have Node.js installed, you can use sharp:

```bash
npm install sharp
node generate-icons.js
```

## Temporary Solution

For development and testing purposes, you can use the SVG file directly or create simple colored squares as placeholder icons. The extension will work with any icon format as long as the files are present.

The SVG icon features:
- Gradient background (purple to blue)
- Two user silhouettes representing account switching
- Arrows indicating the swap action
- Modern, clean design
