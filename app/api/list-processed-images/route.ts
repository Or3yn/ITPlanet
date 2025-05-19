import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const imagesDir = path.join(process.cwd(), 'public', 'output', 'images');
  const jsonDir = path.join(process.cwd(), 'public', 'output', 'json');
  console.log(`API: Checking images directory: ${imagesDir}`);

  try {
    // Check if directories exist
    if (!fs.existsSync(imagesDir) || !fs.existsSync(jsonDir)) {
      console.log('API: Output directories do not exist.');
      return NextResponse.json({ images: [] });
    }
    
    // Read image files
    const imageFiles = fs.readdirSync(imagesDir);
    console.log(`API: Found ${imageFiles.length} items in images directory`);

    // Group images by their prefix (remove _elevation.png, _slope.png, etc.)
    const processedSets = new Map();
    
    imageFiles.forEach(file => {
      if (!file.endsWith('.png')) return;
      
      // Extract the prefix before the last underscore
      const lastUnderscoreIndex = file.lastIndexOf('_');
      if (lastUnderscoreIndex === -1) return;
      
      const prefix = file.substring(0, lastUnderscoreIndex);
      const type = file.substring(lastUnderscoreIndex + 1).replace('.png', '');
      
      if (!processedSets.has(prefix)) {
        processedSets.set(prefix, {
          prefix,
          images: {},
          jsonPath: `${prefix}_tiles.json`
        });
      }
      
      const set = processedSets.get(prefix);
      set.images[type] = `/output/images/${file}`;
    });
    
    // Check if JSON files exist for each set
    const result = Array.from(processedSets.values()).map(set => {
      const jsonFilePath = path.join(jsonDir, set.jsonPath);
      return {
        ...set,
        jsonExists: fs.existsSync(jsonFilePath),
        jsonPath: fs.existsSync(jsonFilePath) ? `/output/json/${set.jsonPath}` : null
      };
    });

    return NextResponse.json({ 
      images: result,
      count: result.length
    });

  } catch (error) {
    console.error('API: Error reading processed images:', error);
    return NextResponse.json(
      { error: 'Failed to list processed images' },
      { status: 500 }
    );
  }
} 