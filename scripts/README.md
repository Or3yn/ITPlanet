# Image Processing Script

This script processes satellite imagery to extract channel data, generate visualizations, and create tile metadata.

## Directory Structure

```
scripts/
├── input/           # Place your input images here
├── output/          # Output files will be saved here
│   └── images/      # Channel visualizations will be saved here
├── image_processor.py  # Main processing script
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Place your satellite imagery files in the `input` directory.

## Usage

Run the script from the command line:
```
python image_processor.py
```

The script will:
1. Process all images in the `input` directory
2. Generate visualizations for each channel in `output/images/`
3. Create a JSON file with tile metadata in the `output` directory

## Output

For each input image, the script generates:
- PNG visualizations for each channel in `output/images/`
- A JSON file with tile metadata in `output/` named `{original_filename}_tiles.json`

The JSON file contains information about each tile, including:
- Tile ID
- Coordinates (x, y)
- Size in pixels and meters
- Area in square meters
- Average elevation
- Average slope

## Requirements

- Python 3.6+
- GDAL
- NumPy
- Matplotlib
- PyProj
- Rasterio 