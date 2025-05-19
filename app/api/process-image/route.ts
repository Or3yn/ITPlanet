import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadName = formData.get('uploadName') as string | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    let outputPrefix = 'default_output'
    if (uploadName && uploadName.trim()) {
        outputPrefix = uploadName.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    } else {
        outputPrefix = path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9_\-]/g, '_');
        console.log('API: uploadName not provided, using filename stem as prefix:', outputPrefix);
    }
    if (!outputPrefix) {
        outputPrefix = `processed_${Date.now()}`;
    }

    const inputDir = path.join(process.cwd(), 'public', 'input')
    const outputDir = path.join(process.cwd(), 'public', 'output')
    const imagesDir = path.join(outputDir, 'images')
    const jsonDir = path.join(outputDir, 'json')

    console.log('Creating directories...')
    console.log('Input dir:', inputDir)
    console.log('Output dir:', outputDir)
    console.log('Images dir:', imagesDir)
    console.log('JSON dir:', jsonDir)

    fs.mkdirSync(inputDir, { recursive: true })
    fs.mkdirSync(imagesDir, { recursive: true })
    fs.mkdirSync(jsonDir, { recursive: true })

    try {
        const filesInInputDir = fs.readdirSync(inputDir);
        console.log('API: Clearing input directory...', filesInInputDir);
        for (const f of filesInInputDir) {
          fs.unlinkSync(path.join(inputDir, f));
        }
    } catch (err) {
        console.warn("API: Could not clear input directory (maybe it was empty?):", err);
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const inputFilePath = path.join(inputDir, file.name)
    fs.writeFileSync(inputFilePath, buffer)
    console.log(`File saved to ${inputFilePath}`)

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'image_processor.py')
      
      // Get Python path from environment variable or use default paths
      let pythonPath = process.env.PYTHON_PATH;
      
      if (!pythonPath) {
        // Try to find Python in standard locations based on OS
        if (process.platform === 'win32') {
          // Check common Windows paths
          const possiblePaths = [
            'python', // from PATH
            'python3',
            'C:\\Python39\\python.exe',
            'C:\\Python310\\python.exe',
            'C:\\Program Files\\Python\\Python39\\python.exe',
            'C:\\Program Files\\Python\\Python310\\python.exe',
            'C:\\ProgramData\\Anaconda3\\python.exe',
            'C:\\Users\\Ruslan\\anaconda3\\envs\\gis\\python.exe' // Keep the original as fallback
          ];
          
          for (const path of possiblePaths) {
            try {
              // Use 'where' command on Windows to locate executable
              if (path === 'python' || path === 'python3') {
                const whichProcess = require('child_process').spawnSync('where', [path]);
                if (whichProcess.status === 0) {
                  pythonPath = path;
                  break;
                }
              } else if (fs.existsSync(path)) {
                pythonPath = path;
                break;
              }
            } catch (error) {
              console.log(`Failed to check Python path: ${path}`);
            }
          }
        } else {
          // For Unix-like systems (Linux, macOS)
          const possiblePaths = [
            'python3', // from PATH
            'python',  // from PATH
            '/usr/bin/python3',
            '/usr/local/bin/python3',
            '/opt/anaconda3/bin/python'
          ];
          
          for (const path of possiblePaths) {
            try {
              // Use 'which' command on Unix to locate executable
              if (path === 'python' || path === 'python3') {
                const whichProcess = require('child_process').spawnSync('which', [path]);
                if (whichProcess.status === 0) {
                  pythonPath = path;
                  break;
                }
              } else if (fs.existsSync(path)) {
                pythonPath = path;
                break;
              }
            } catch (error) {
              console.log(`Failed to check Python path: ${path}`);
            }
          }
        }
        
        // If we still don't have a python path, default to 'python'
        if (!pythonPath) {
          pythonPath = 'python';
          console.warn('Using default python command from PATH. Set PYTHON_PATH env variable for custom location.');
        }
      }

      console.log(`Using Python executable: ${pythonPath}`);

      if (!fs.existsSync(scriptPath)) {
        console.error(`Python script not found at ${scriptPath}`);
        return resolve(NextResponse.json({ error: `Python script not found at ${scriptPath}` }, { status: 500 }));
      }

      const scriptArgs = [scriptPath, inputFilePath, outputPrefix]; 
      console.log(`Running Python: ${pythonPath} ${scriptArgs.join(' ')}`);

      const pythonProcess = spawn(pythonPath, scriptArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.dirname(scriptPath)
      })

      let scriptOutput = ''
      let scriptError = ''

      pythonProcess.stdout.on('data', (data) => {
        const message = data.toString()
        console.log(`Python stdout: ${message}`)
        scriptOutput += message
      })

      pythonProcess.stderr.on('data', (data) => {
        const message = data.toString()
        console.error(`Python stderr: ${message}`)
        scriptError += message
      })

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`)
        if (code !== 0) {
            const errorMsg = scriptError || `Python script failed with code ${code}`;
            console.error("Python script execution failed:", errorMsg);
            return resolve(NextResponse.json({ error: `Python script failed: ${errorMsg}` }, { status: 500 }))
        }

        const expectedPngFiles = [
            `${outputPrefix}_elevation.png`,
            `${outputPrefix}_slope.png`,
            `${outputPrefix}_shadows.png`,
            `${outputPrefix}_illumination.png`,
            `${outputPrefix}_ice.png`
        ];
        const expectedJsonFile = `${outputPrefix}_tiles.json`;

        const missingPngFiles = expectedPngFiles.filter(f => !fs.existsSync(path.join(imagesDir, f)));
        const jsonFileExists = fs.existsSync(path.join(jsonDir, expectedJsonFile));

        if (missingPngFiles.length > 0 || !jsonFileExists) {
            const missingDetails = [];
            if (missingPngFiles.length > 0) missingDetails.push(`Missing PNGs: ${missingPngFiles.join(', ')}`);
            if (!jsonFileExists) missingDetails.push(`Missing JSON: ${expectedJsonFile}`);
            const errorMessage = `Processing finished, but some output files are missing. ${missingDetails.join('. ')}`;
            console.error(errorMessage);
            return resolve(NextResponse.json({ error: errorMessage }, { status: 500 }))
        }

        console.log("Processing successful, all expected files generated.");
        resolve(NextResponse.json({
          message: `Image '${outputPrefix}' processed successfully`,
          generatedFiles: {
            png: expectedPngFiles.map(f => `/output/images/${f}`),
            json: `/output/json/${expectedJsonFile}`
          },
          outputLog: scriptOutput
        }))
      });

      pythonProcess.on('error', (err) => {
          console.error("Failed to start Python process:", err);
          resolve(NextResponse.json({ error: `Failed to start Python process: ${err.message}` }, { status: 500 }))
      });
    })
  } catch (error: any) {
    console.error('Error in /api/process-image:', error)
    return NextResponse.json({ error: `Internal server error: ${error.message || error}` }, { status: 500 })
  }
} 