import matplotlib.pyplot as plt
from osgeo import gdal, osr
import numpy as np
import os
import sys
import json
from pathlib import Path
from tqdm import tqdm
import argparse

# Настройки matplotlib
import matplotlib
matplotlib.use("Agg")

# Определяем пути к директориям
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent  # Корневая директория проекта
PUBLIC_DIR = PROJECT_ROOT / 'public'
OUTPUT_DIR = PUBLIC_DIR / 'output'  # Путь к директории output
INPUT_DIR = PUBLIC_DIR / 'input'    # Путь к директории input

# Создаем подкаталоги
IMAGES_DIR = OUTPUT_DIR / 'images'  # Путь к директории images
JSON_DIR = OUTPUT_DIR / 'json'      # Путь к директории json
LAYERS_DIR = OUTPUT_DIR / 'layers'   # Путь к директории layers

# Создаем директории, если они не существуют
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
JSON_DIR.mkdir(parents=True, exist_ok=True)
LAYERS_DIR.mkdir(parents=True, exist_ok=True)
INPUT_DIR.mkdir(parents=True, exist_ok=True)  # Создаем директорию для входных файлов

print(f"Script directory: {SCRIPT_DIR}")
print(f"Project root: {PROJECT_ROOT}")
print(f"Public directory: {PUBLIC_DIR}")
print(f"Input directory: {INPUT_DIR}")
print(f"Layers directory: {LAYERS_DIR}")
print(f"Output directory: {OUTPUT_DIR}")
print(f"JSON directory: {JSON_DIR}")
print(f"Images directory: {IMAGES_DIR}")

# Создаем директории если их нет
OUTPUT_DIR.mkdir(exist_ok=True)
JSON_DIR.mkdir(exist_ok=True)
PUBLIC_DIR.mkdir(exist_ok=True)
LAYERS_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)  # Создаем директорию для изображений

class TileProcessor:
    def __init__(self, ds):
        self.ds = ds
        self.width = ds.RasterXSize
        self.height = ds.RasterYSize
        self.num_tiles = 25
        self.tile_size_x = self.width // self.num_tiles
        self.tile_size_y = self.height // self.num_tiles
        
        # Геопривязка
        self.geotransform = ds.GetGeoTransform()
        self.projection = ds.GetProjection()
        if not self.projection:
            print("Warning: No projection found in the input file.")
            self.src_srs = None
            self.coord_transform = None
        else:
            self.src_srs = osr.SpatialReference()
            self.src_srs.ImportFromWkt(self.projection)
            self.dst_srs = self.src_srs.CloneGeogCS()
            if self.dst_srs is None:
                 print("Warning: Could not clone spatial reference to geographic coordinates.")
                 self.coord_transform = None
            else:
                 self.coord_transform = osr.CoordinateTransformation(self.src_srs, self.dst_srs)
                 if self.coord_transform is None:
                     print("Warning: Could not create coordinate transformation.")

    def pixel_to_coords(self, px, py):
        """Конвертация пиксельных координат в географические"""
        if not self.geotransform or not self.coord_transform:
            # print("Debug: Returning None from pixel_to_coords due to missing geotransform/coord_transform")
            return None, None # Возвращаем None, если геопривязка не удалась
            
        try:
            # Рассчитываем координаты в исходной проекции
            x = self.geotransform[0] + px * self.geotransform[1] + py * self.geotransform[2]
            y = self.geotransform[3] + px * self.geotransform[4] + py * self.geotransform[5]
            # Трансформируем в географические координаты (долгота, широта)
            lon, lat, _ = self.coord_transform.TransformPoint(x, y)
            # print(f"Debug: Transformed ({px},{py}) -> ({x},{y}) -> ({lon},{lat})")
            return lon, lat
        except Exception as e:
            print(f"Error during coordinate transformation for pixel ({px}, {py}): {e}")
            return None, None

    def process_tiles(self, layers_data):
        """Генерация данных по тайлам"""
        tiles = []
        tile_id = 0
        
        print("Starting tile processing...")
        for i in tqdm(range(self.num_tiles), desc="Обработка тайлов"):
            for j in range(self.num_tiles):
                # Границы тайла
                x_min = j * self.tile_size_x
                y_min = i * self.tile_size_y
                x_max = x_min + self.tile_size_x
                y_max = y_min + self.tile_size_y
                
                # Географические координаты углов
                lon_min, lat_min = self.pixel_to_coords(x_min, y_min)
                lon_max, lat_max = self.pixel_to_coords(x_max, y_max)
                
                # Если координаты не удалось получить, пропускаем гео-блок
                geo_coords_data = None
                if lon_min is not None and lat_min is not None and lon_max is not None and lat_max is not None:
                    geo_coords_data = {
                        "lon_min": round(lon_min, 6),
                        "lat_min": round(lat_min, 6),
                        "lon_max": round(lon_max, 6),
                        "lat_max": round(lat_max, 6)
                    }

                # Собираем данные по слоям
                tile_data = {
                    "tile_id": tile_id,
                    "pixel_coords": {
                        "x_min": int(x_min),
                        "y_min": int(y_min),
                        "x_max": int(x_max),
                        "y_max": int(y_max)
                    },
                    "geo_coords": geo_coords_data, # Может быть None
                    "layers": {}
                }
                
                # Анализ данных слоев
                for layer_name, data in layers_data.items():
                    if data is not None:  # Проверка, что данные слоя существуют
                        # Проверяем, что границы тайла не выходят за пределы данных
                        if y_max <= data.shape[0] and x_max <= data.shape[1]:
                             tile_slice = data[y_min:y_max, x_min:x_max]
                             if tile_slice.size > 0 and not np.all(np.isnan(tile_slice)):
                                 try:
                                     tile_data["layers"][layer_name] = {
                                         "mean": round(float(np.nanmean(tile_slice)), 2),
                                         "max": round(float(np.nanmax(tile_slice)), 2),
                                         "min": round(float(np.nanmin(tile_slice)), 2)
                                     }
                                 except Exception as e:
                                     print(f"Warning: Error calculating stats for tile {tile_id}, layer {layer_name}. Slice shape: {tile_slice.shape}. Error: {e}")
                                     tile_data["layers"][layer_name] = {"mean": None, "max": None, "min": None}
                             else:
                                 tile_data["layers"][layer_name] = {"mean": None, "max": None, "min": None}
                        else:
                             # Границы тайла вышли за пределы массива данных
                             # print(f"Warning: Tile slice {tile_id} ({y_min}:{y_max}, {x_min}:{x_max}) out of bounds for layer {layer_name} with shape {data.shape}")
                             tile_data["layers"][layer_name] = {"mean": None, "max": None, "min": None}
                    else:
                        tile_data["layers"][layer_name] = None # Устанавливаем None, если данных слоя нет
                
                tiles.append(tile_data)
                tile_id += 1
        print("Tile processing finished.")
        return tiles

def process_image(input_file_path: Path, output_prefix: str):
    """Основная функция обработки изображения"""
    print(f"\nОбработка файла: {input_file_path.name} с префиксом '{output_prefix}'")

    gdal.UseExceptions() # Включаем исключения GDAL для лучшей диагностики
    ds = None
    try:
        ds = gdal.Open(str(input_file_path))
    except RuntimeError as e:
         print(f"GDAL Error opening file {input_file_path}: {e}")
         return False
         
    if ds is None:
        # Эта проверка может быть избыточной, если UseExceptions включен
        print(f"Ошибка: Не удалось открыть файл {input_file_path} (ds is None)")
        return False

    # Получаем размеры и проекцию
    width = ds.RasterXSize
    height = ds.RasterYSize
    projection = ds.GetProjection()
    
    print(f"Image size: {width}x{height}")
    print(f"Projection: {projection}")
    
    # Инициализация процессора тайлов
    tile_processor = TileProcessor(ds)

    # Словарь для хранения данных слоев
    layers_data = {}

    # Обработка слоев с сохранением данных
    layers_data['elevation'] = process_elevation_layer(ds)
    layers_data['slope'] = process_slope_layer(ds)
    layers_data['shadows'] = process_shadow_layer(ds)
    layers_data['illumination'] = process_illumination_layer(ds)
    # Рассчитываем лед только после того, как собрали остальные данные
    layers_data['ice'] = process_ice_layer(layers_data['elevation'], layers_data['slope'], layers_data['shadows'])

    # --- Создание PNG визуализаций --- 
    print("--- Создание PNG изображений ---")
    save_elevation_png(layers_data.get('elevation'), output_prefix)
    save_slope_png(layers_data.get('slope'), output_prefix)
    save_shadows_png(layers_data.get('shadows'), output_prefix)
    save_illumination_png(layers_data.get('illumination'), output_prefix)
    save_ice_png(layers_data.get('ice'), output_prefix)

    # Генерация тайлов
    tiles = tile_processor.process_tiles(layers_data)

    # Сохранение в JSON
    output_json_filename = f"{output_prefix}_tiles.json"
    output_json_path = JSON_DIR / output_json_filename
    print(f"Сохранение JSON в: {output_json_path}")
    with open(output_json_path, 'w') as f:
        json.dump(tiles, f, indent=2)
    
    ds = None
    print(f"Файл {input_file_path.name} успешно обработан (префикс: {output_prefix}).")
    return True

def process_elevation_layer(ds):
    """Обработка высот с возвратом данных"""
    print("Обработка высот...")
    try:
        band = ds.GetRasterBand(6)
        if band is None:
            print("Ошибка: Не найден 6-й канал (высоты).")
            return None
        dem = band.ReadAsArray().astype(np.float32)
        # Проверяем, не пустой ли массив перед конвертацией
        if dem.size == 0: 
             print("Ошибка: Канал высот пуст.")
             return None
        dem *= 1000  # Конвертация в метры
        # Используем np.nan для некорректных значений
        dem[dem < -10000] = np.nan 
        print("Данные высот обработаны.")
        return dem
    except Exception as e:
        print(f"Ошибка при обработке высот: {e}")
        return None

def process_slope_layer(ds):
    """Обработка наклона с возвратом данных"""
    print("Обработка наклона...")
    try:
        band = ds.GetRasterBand(5)
        if band is None:
            print("Ошибка: Не найден 5-й канал (наклон).")
            return None
        slope = band.ReadAsArray().astype(np.float32)
        if slope.size == 0:
             print("Ошибка: Канал наклона пуст.")
             return None
        slope[slope < 0] = np.nan # Используем np.nan
        print("Данные наклона обработаны.")
        return slope
    except Exception as e:
        print(f"Ошибка при обработке наклона: {e}")
        return None

def process_shadow_layer(ds):
    """Обработка теней с возвратом данных"""
    print("Обработка теней...")
    try:
        band = ds.GetRasterBand(4)
        if band is None:
            print("Ошибка: Не найден 4-й канал (тени).")
            return None
        shadows = band.ReadAsArray().astype(np.float32)
        if shadows.size == 0:
             print("Ошибка: Канал теней пуст.")
             return None
        # Можно добавить проверку на значения (например, только 0 и 1)
        print("Данные теней обработаны.")
        return shadows 
    except Exception as e:
        print(f"Ошибка при обработке теней: {e}")
        return None

def process_illumination_layer(ds):
    """Обработка освещенности с возвратом данных"""
    print("Обработка освещенности...")
    try:
        band = ds.GetRasterBand(2)
        if band is None:
            print("Ошибка: Не найден 2-й канал (освещенность).")
            return None
        illumination = band.ReadAsArray().astype(np.float32)
        if illumination.size == 0:
             print("Ошибка: Канал освещенности пуст.")
             return None
        illumination[illumination < 0] = np.nan # Используем np.nan
        print("Данные освещенности обработаны.")
        return illumination
    except Exception as e:
        print(f"Ошибка при обработке освещенности: {e}")
        return None

def process_ice_layer(dem, slope, shadows):
    """Генерация данных по льду на основе других слоев"""
    print("Расчет вероятности льда...")
    if dem is None or slope is None or shadows is None:
        print("Ошибка: Недостаточно данных для расчета вероятности льда (один из слоев = None).")
        return None

    try:
        # Проверка на совпадение размеров массивов
        if not (dem.shape == slope.shape == shadows.shape):
             print(f"Ошибка: Размеры массивов не совпадают - DEM:{dem.shape}, Slope:{slope.shape}, Shadows:{shadows.shape}")
             return None
             
        ice_prob = np.zeros_like(dem, dtype=np.float32)
        # Условия расчета вероятности (могут быть скорректированы)
        # Применяем маски NaN перед расчетами
        valid_mask = ~np.isnan(dem) & ~np.isnan(slope) & ~np.isnan(shadows)
        
        ice_prob[valid_mask] += 0.4 * ((slope[valid_mask] < 5) & (slope[valid_mask] >= 0))
        ice_prob[valid_mask] += 0.3 * (shadows[valid_mask] == 1)
        ice_prob[valid_mask] += 0.3 * ((dem[valid_mask] > 0) & (dem[valid_mask] < 3000))
        
        # Устанавливаем NaN там, где были NaN во входных данных
        ice_prob[~valid_mask] = np.nan 
        print("Вероятность льда рассчитана.")
        return np.clip(ice_prob, 0, 1)
    except Exception as e:
        print(f"Ошибка при расчете вероятности льда: {e}")
        return None

# --- Функции сохранения PNG изображений --- 

def save_layer_png(data, filename_base, prefix, cmap, normalize=True):
    """Общая функция для сохранения слоя в PNG"""
    filename = f"{prefix}_{filename_base}.png"
    if data is None:
        print(f"Данные для {filename} отсутствуют (None), изображение не будет создано.")
        return
    if data.size == 0:
        print(f"Данные для {filename} пустые, изображение не будет создано.")
        return

    print(f"Создание изображения: {filename}...")
    try:
        # Нормализация данных для корректного отображения cmap (если требуется)
        if normalize and not np.all(np.isnan(data)):
            vmin = np.nanmin(data)
            vmax = np.nanmax(data)
            # Проверка на случай, если все значения одинаковые (кроме NaN)
            if vmin == vmax:
                 plot_data = data # Не нормализуем, если все значения одинаковые
            else:
                 plot_data = data
        else:
            plot_data = data
            vmin = None
            vmax = None

        # Сохраняем версию с заголовком и легендой в public/images/layers
        plt.figure(figsize=(12, 10))
        title = {
            'elevation': 'Карта высот рельефа',
            'slope': 'Карта уклонов поверхности',
            'shadows': 'Карта теней',
            'illumination': 'Карта освещенности',
            'ice': 'Карта вероятности наличия льда'
        }.get(filename_base, filename_base.capitalize())
        
        plt.title(f"{title} - {prefix}", pad=20, fontsize=14)
        im = plt.imshow(plot_data, cmap=cmap, vmin=vmin, vmax=vmax)
        cbar = plt.colorbar(im)
        label = {
            'elevation': 'Высота (м)',
            'slope': 'Уклон (градусы)',
            'shadows': 'Затенение (0-1)',
            'illumination': 'Освещенность (%)',
            'ice': 'Вероятность наличия льда (0-1)'
        }.get(filename_base, '')
        cbar.set_label(label)
        plt.axis('off')
        output_path = LAYERS_DIR / filename
        plt.savefig(output_path, bbox_inches='tight', pad_inches=0.5, dpi=150)
        plt.close()
        print(f"Изображение с легендой сохранено в {output_path}")

        # Сохраняем версию без заголовка и легенды в scripts/output/images
        plt.figure(figsize=(10, 10))
        plt.imshow(plot_data, cmap=cmap, vmin=vmin, vmax=vmax)
        plt.axis('off')
        output_path = IMAGES_DIR / filename
        plt.savefig(output_path, bbox_inches='tight', pad_inches=0, dpi=150)
        plt.close()
        print(f"Изображение без легенды сохранено в {output_path}")

    except Exception as e:
        print(f"Ошибка при создании изображения {filename}: {e}")

def save_elevation_png(data, prefix):
    save_layer_png(data, "elevation", prefix, cmap='terrain', normalize=False) # DEM обычно имеет свой диапазон

def save_slope_png(data, prefix):
    save_layer_png(data, "slope", prefix, cmap='viridis')

def save_shadows_png(data, prefix):
    # Тени (0 или 1), нормализация не нужна, используем бинарную карту
    save_layer_png(data, "shadows", prefix, cmap='binary', normalize=False) 

def save_illumination_png(data, prefix):
    save_layer_png(data, "illumination", prefix, cmap='hot')

def save_ice_png(data, prefix):
    save_layer_png(data, "ice", prefix, cmap='Blues', normalize=False)

# --- Основной блок --- 

def main(input_file_arg: str, output_prefix_arg: str):
    """Основной скрипт"""
    print("Запуск основного скрипта...")
    input_file_path = Path(input_file_arg)
    
    if not input_file_path.is_file():
        print(f"Ошибка: Входной файл не найден или не является файлом: {input_file_path}")
        return False
        
    print(f"Получен файл: {input_file_path}")
    print(f"Получен префикс: {output_prefix_arg}")

    # Запускаем обработку для одного файла
    success = process_image(input_file_path, output_prefix_arg)

    if success:
        print("\nОбработка файла завершена успешно!")
        print(f"Результаты сохранены в: {JSON_DIR} и {LAYERS_DIR}")
    else:
        print("\nОбработка файла завершена с ошибками.")

    return success

if __name__ == '__main__':
    # --- ИЗМЕНЕНО: Парсинг аргументов командной строки --- 
    parser = argparse.ArgumentParser(description='Обработка TIFF файла для создания слоев и JSON тайлов.')
    parser.add_argument('input_file', type=str, help='Путь к входному TIFF файлу.')
    parser.add_argument('output_prefix', type=str, help='Префикс для имен выходных файлов.')
    
    args = parser.parse_args()
    # --- КОНЕЦ ИЗМЕНЕНИЯ --- 
    
    print(f"Запуск скрипта с аргументами: input_file='{args.input_file}', output_prefix='{args.output_prefix}'")

    try:
        # Передаем аргументы в main
        success = main(args.input_file, args.output_prefix)
        print(f"--- Python Script End (Success: {success}) ---")
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"CRITIC ошибка в __main__: {e}", file=sys.stderr) # Выводим ошибку в stderr
        print(f"--- Python Script End (Critical Error) ---")
        sys.exit(1)