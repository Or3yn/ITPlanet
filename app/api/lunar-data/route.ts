import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Get the area parameter from the URL
    const { searchParams } = new URL(request.url)
    const area = searchParams.get('area')

    if (!area) {
      return NextResponse.json({ error: 'Area parameter is required' }, { status: 400 })
    }
    
    // Sanitize the area to prevent directory traversal
    const sanitizedArea = area.replace(/[^a-zA-Z0-9-_]/g, '')
    
    // Define the path to the JSON file
    const filePath = path.join(process.cwd(), 'public', 'output', 'json', `${sanitizedArea}_tiles.json`)
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Data for area "${area}" not found` }, { status: 404 })
    }
    
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching lunar data:', error)
    return NextResponse.json({ error: 'Failed to fetch lunar data' }, { status: 500 })
  }
} 