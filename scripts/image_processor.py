# Установка зависимостей (для Google Colab)
!apt-get install -q python3-gdal
!pip install -q pyproj matplotlib

from osgeo import gdal
import matplotlib.pyplot as plt
import numpy as np
from pyproj import Proj, transform
from google.colab import files
import os
import sys
import json
import math
import matplotlib

# Set matplotlib to use non-interactive backend
matplotlib.use("Agg")

# Define input and output directories
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(SCRIPT_DIR, "input")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")

# Ensure output directories exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

def process_image(image_path):
    """
    Process a single image and generate channel visualizations and tile data
    """
    print(f"Processing image: {image_path}")
    
    # Open the dataset
    dataset = gdal.Open(image_path)
    if not dataset:
        raise FileNotFoundError(f"❌ Не удалось открыть файл: {image_path}")

    # === 2. Extract geodata ===
    geo = dataset.GetGeoTransform()
    projection = dataset.GetProjection()
    pixel_width = abs(geo[1])
    pixel_height = abs(geo[5])
    origin_x = geo[0]
    origin_y = geo[3]
    width = dataset.RasterXSize
    height = dataset.RasterYSize
    bands = dataset.RasterCount

    # === 3. Image size in meters ===
    image_width_m = width * pixel_width
    image_height_m = height * pixel_height
    image_area_m2 = image_width_m * image_height_m

    # === 4. Determine projection ===
    srs = osr.SpatialReference()
    srs.ImportFromWkt(projection)

    print("\n📌 МЕТАДАННЫЕ СНИМКА:")
    print(f"- Размер: {width} x {height} пикселей")
    print(f"- Пиксель: {pixel_width:.4f} м (X), {pixel_height:.4f} м (Y)")
    print(f"- Origin: ({origin_x}, {origin_y})")
    print(f"\n🖼 ФИЗИЧЕСКИЙ РАЗМЕР СНИМКА:")
    print(f"- Ширина: {image_width_m:.2f} м")
    print(f"- Высота: {image_height_m:.2f} м")
    print(f"- Площадь: {image_area_m2:.2f} м² ({image_area_m2/1e6:.3f} км²)")

    print("\n🌍 ПРОЕКЦИЯ (WKT):")
    print(srs.ExportToPrettyWkt())

    if srs.IsGeographic():
        print("📌 Тип координат: Geographic (градусы)")
    elif srs.IsProjected():
        print(f"📌 Тип координат: Projected (метры)")
        print(f"🗺 Название проекции: {srs.GetAttrValue('projcs')}")
    else:
        print("❓ Тип координат: Неизвестно")

    # === 5. Tiling (max 2.25 m) ===
    tile_target_size_m = 2.25
    tile_width_px = max(1, int(tile_target_size_m // pixel_width))
    tile_height_px = max(1, int(tile_target_size_m // pixel_height))
    tile_width_m = tile_width_px * pixel_width
    tile_height_m = tile_height_px * pixel_height

    tile_cols = width // tile_width_px
    tile_rows = height // tile_height_px
    actual_tile_count = tile_cols * tile_rows
    tile_area_m2 = tile_width_m * tile_height_m
    total_area_m2 = tile_area_m2 * actual_tile_count

    print(f"\n📦 Тайлов: {tile_rows} x {tile_cols} = {actual_tile_count}")
    print(f"🔲 Размер тайла: {tile_width_px}px x {tile_height_px}px → {tile_width_m:.2f} м x {tile_height_m:.2f} м")
    print(f"🧮 Площадь 1 тайла: {tile_area_m2:.2f} м²")
    print(f"📏 Общая площадь покрытия: {total_area_m2:.2f} м² ({total_area_m2/1e6:.3f} км²)")

    # === 6. Channel descriptions ===
    band_descriptions = {
        1: "255 x shadowMask x cos(Ig).clipped",
        2: "cos(Ig).clipped (Температура)",
        3: "binary_mask of cos(Ig)",
        4: "shadowMask",
        5: "SLOPE(deg)",
        6: "DEM(km)",
        7: "SDIST(km)"
    }

    # === 7. Read all channels ===
    band_data = {}
    for band_num in range(1, bands + 1):
        band = dataset.GetRasterBand(band_num)
        array = band.ReadAsArray()
        array[~np.isfinite(array)] = np.nanmin(array)
        band_data[band_num] = array

    # === 8. Save PNG with grid ===
    print("\n💾 Сохраняем каналы в PNG...")
    for band_num, data in band_data.items():
        fig, ax = plt.subplots(figsize=(10, 6))
        cmap = "terrain" if band_num in [5, 6, 7] else "gray"
        im = ax.imshow(data, cmap=cmap)
        plt.colorbar(im, ax=ax, label="Значение пикселя")
        ax.set_title(f"Канал {band_num}: {band_descriptions.get(band_num, 'Без описания')}")
        ax.axis('off')

        for r in range(tile_rows):
            for c in range(tile_cols):
                x = c * tile_width_px
                y = r * tile_height_px
                rect = plt.Rectangle((x, y), tile_width_px, tile_height_px, fill=False,
                                     edgecolor='red', linewidth=1)
                ax.add_patch(rect)

        # Save to output/images directory
        output_path = os.path.join(IMAGES_DIR, f"band_{band_num}.png")
        plt.savefig(output_path, bbox_inches='tight')
        plt.close()
    print("✅ PNG-файлы сохранены.")

    # === 9. Generate JSON tiles ===
    dem = band_data[6]
    slope = band_data[5]
    tiles_json = []

    for row in range(tile_rows):
        for col in range(tile_cols):
            x0 = col * tile_width_px
            y0 = row * tile_height_px
            x1 = x0 + tile_width_px
            y1 = y0 + tile_height_px
            if x1 > width or y1 > height:
                continue

            dem_tile = dem[y0:y1, x0:x1]
            slope_tile = slope[y0:y1, x0:x1]

            avg_dem = float(np.mean(dem_tile))
            avg_slope = float(np.mean(slope_tile))
            x_coord = origin_x + x0 * pixel_width
            y_coord = origin_y + y0 * pixel_height

            tile_json = {
                "id": f"tile_{row}_{col}",
                "x": round(x_coord, 2),
                "y": round(y_coord, 2),
                "размер_в_пикселях": [tile_width_px, tile_height_px],
                "размер_в_метрах": {
                    "ширина": round(tile_width_m, 2),
                    "высота": round(tile_height_m, 2)
                },
                "площадь_м2": round(tile_area_m2, 2),
                "средняя_высота": round(avg_dem, 3),
                "средний_уклон": round(avg_slope, 3)
            }

            tiles_json.append(tile_json)

    # === 10. Save JSON ===
    base_filename = os.path.splitext(os.path.basename(image_path))[0]
    json_path = os.path.join(OUTPUT_DIR, f"{base_filename}_tiles.json")
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(tiles_json, f, indent=4, ensure_ascii=False)

    print(f"\n✅ Сохранено {len(tiles_json)} тайлов в {json_path}")
    print("\n📌 Пример тайла:")
    print(json.dumps(tiles_json[0], ensure_ascii=False, indent=4))
    
    return True

def main():
    """
    Main function to process all images in the input directory
    """
    # Check if input directory exists
    if not os.path.exists(INPUT_DIR):
        print(f"❌ Input directory not found: {INPUT_DIR}")
        return
    
    # Get all files in the input directory
    input_files = [f for f in os.listdir(INPUT_DIR) if os.path.isfile(os.path.join(INPUT_DIR, f))]
    
    if not input_files:
        print(f"❌ No files found in input directory: {INPUT_DIR}")
        print("Please place your image files in the input directory and try again.")
        return
    
    print(f"Found {len(input_files)} files in input directory")
    
    # Process each file
    for filename in input_files:
        input_path = os.path.join(INPUT_DIR, filename)
        try:
            process_image(input_path)
            print(f"✅ Successfully processed: {filename}")
        except Exception as e:
            print(f"❌ Error processing {filename}: {str(e)}")

if __name__ == "__main__":
    main() 