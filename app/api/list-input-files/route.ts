import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const inputDir = path.join(process.cwd(), 'scripts', 'input');
  console.log(`API: Checking input directory: ${inputDir}`); // Логирование

  try {
    // Проверяем, существует ли директория
    if (!fs.existsSync(inputDir)) {
      console.log('API: Input directory does not exist.'); // Логирование
      // Если нет, возвращаем пустой массив
      return NextResponse.json({ files: [] });
    }
    
    // Читаем содержимое директории
    const files = fs.readdirSync(inputDir);
    console.log(`API: Found items in input directory: ${files}`); // Логирование

    // Фильтруем, чтобы оставить только файлы (на всякий случай)
    const fileNames = files.filter(file => {
      try {
        return fs.statSync(path.join(inputDir, file)).isFile();
      } catch (statError) {
        // Если не удалось получить статус файла, игнорируем его
        console.error(`API: Error stating file ${file}:`, statError);
        return false;
      }
    });

    console.log(`API: Returning file list: ${fileNames}`); // Логирование
    return NextResponse.json({ files: fileNames });

  } catch (error) {
    console.error('API: Error reading input directory:', error);
    return NextResponse.json(
      { error: 'Failed to list input files' },
      { status: 500 }
    );
  }
} 