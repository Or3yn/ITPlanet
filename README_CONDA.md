1. в anaconda prompt создаешь окружение gis -> conda activate gis
2. устанавливаем библиотеки, описанные в файле scripts/requirements.txt - НО В ANACONDA PROMPT через conda, не через pip, т.к. не будет работать GDAL -> conda install -c conda-forge gdal pyproj matplotlib numpy rasterio
3. Если при загрузке файла в консоли будет что-то типо:
Python stderr:   File "C:\Users\Ruslan\Desktop\check-master\ITPlanet\scripts\image_processor.py", line 2, in <module>
    from osgeo import gdal, osr
ModuleNotFoundError: No module named 'osgeo'

Python process exited with code 1
Python script execution failed: Traceback (most recent call last):
  File "C:\Users\Ruslan\Desktop\check-master\ITPlanet\scripts\image_processor.py", line 2, in <module>      
    from osgeo import gdal, osr
ModuleNotFoundError: No module named 'osgeo'

 POST /api/process-image 500 in 3440ms

 это значит, что нет модуля, нужно доустановить - НО НЕ ЧЕРЕЗ pip
 

 4. В anaconda prompt прописываешь where python

 нужна строка типо:
 C:\Users\Ruslan\anaconda3\envs\gis\python.exe
 т.е. python в созданном тобой окружении gis , где установлены необходимые библиотеки (шаг 2-3)

 4. в корне проекта создаешь файл .env.local, туда вводишь строку типо:
   PYTHON_PATH=C:\Users\Ruslan\anaconda3\envs\gis\python.exe
то есть PYTHON_PATH = /* твой путь к python в окружении */ 

5. PROFIT, в консоли зарущенного проекта на сервере, после загрузки файла, должна быть строчка:
 POST /api/process-image 200 in 9426ms