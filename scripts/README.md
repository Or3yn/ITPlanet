# Image Processing Script for Lunar Surface Analysis

This script processes satellite imagery to extract terrain data, generate visualizations for elevation, slope, shadows, illumination, and ice probability, and create tile metadata for  lunar base planning.

## Directory Structure

```
scripts/
├── input/           # Place your input images here (GeoTIFF format recommended)
├── output/          # Output files will be saved here
│   ├── images/      # Channel visualizations (PNG format)
│   └── json/        # JSON metadata for tiles
├── image_processor.py  # Main processing script
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Requirements

### Python Environment

The script requires Python 3.8+ with the following libraries:
- GDAL (Geospatial Data Abstraction Library)
- NumPy
- Matplotlib
- PyProj
- Rasterio

These are scientific computing libraries that may require specific system-level dependencies depending on your operating system.

### Installation

#### Option 1: Using Anaconda (Recommended)

Anaconda provides the easiest way to set up the required environment, especially for Windows users:

```bash
# Create a new environment
conda create -n gis python=3.9
conda activate gis

# Install dependencies
conda install -c conda-forge gdal numpy matplotlib pyproj rasterio

# Install remaining dependencies
pip install -r requirements.txt
```

#### Option 2: Using pip (May require system dependencies)

```bash
# Create a virtual environment
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies (may require system libraries)
pip install -r requirements.txt
```

Note: On some systems, you may need to install GDAL system libraries before pip install will work:
- Ubuntu/Debian: `sudo apt-get install libgdal-dev`
- macOS: `brew install gdal`

## Usage

### Running from command line

```bash
python image_processor.py input_file.tif output_prefix
```

Where:
- `input_file.tif` is the path to your GeoTIFF input file
- `output_prefix` is a prefix for output filenames

### Example

```bash
python image_processor.py ./input/lunar_south_pole.tif test_run
```

This will generate:
- PNG images in `output/images/`:
  - `test_run_elevation.png`
  - `test_run_slope.png`
  - `test_run_shadows.png`
  - `test_run_illumination.png`
  - `test_run_ice_probability.png`
- JSON file in `output/json/`:
  - `test_run_tiles.json`

## Input Data Format

The script works best with GeoTIFF files containing elevation data for lunar surface. The input should:
- Be georeferenced with proper coordinate system
- Contain elevation data as the primary band
- Preferably cover the lunar South Pole region

## Troubleshooting

### Common Issues

1. **GDAL/Rasterio Import Errors**
   - Make sure you've installed GDAL properly for your system
   - On Windows, Anaconda is strongly recommended for GDAL setup

2. **Memory Errors**
   - For large images, ensure your system has enough RAM
   - Try processing smaller image sections if needed

3. **Missing Output Files**
   - Check console output for error messages
   - Verify the input file format is correct (GeoTIFF with elevation data)

### When Working with the Web Application

When this script is called from the web application:
1. Input files will be placed in the `input/` directory
2. The application expects output files in the format described above
3. The script will be passed the necessary arguments automatically 