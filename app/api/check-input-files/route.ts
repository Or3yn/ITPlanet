import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const inputDir = path.join(process.cwd(), 'public', 'input');
    
    // Проверяем существование директории
    if (!fs.existsSync(inputDir)) {
      return NextResponse.json({ files: [] });
    }

    // Получаем список файлов
    const files = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.tif') || file.endsWith('.tiff'))
      .map(file => ({
        name: file.replace(/\.[^/.]+$/, ""), // Убираем расширение
        fullName: file
      }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error checking input files:', error);
    return NextResponse.json({ error: 'Failed to check input files' }, { status: 500 });
  }
} 