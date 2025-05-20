# 🌕 Lunar Base Planner / Планировщик лунной базы

## 📘 Project Overview (EN)

This project is part of the **"IT-Planet 2025" International Olympiad**, in the "Space Cup: MISSION MOON" track.

The goal of the first stage is to develop a **concept and web-based prototype** for planning and navigating a lunar base at the Moon's South Pole. This system should assist future colonists in organizing infrastructure, analyzing terrain, and managing resources efficiently.

Key functions:
- Researching lunar terrain for optimal infrastructure placement
- Planning safe, logical, and functional layouts of habitats and facilities
- Managing resources and supporting sustainable base development
- UI prototype for map-based interaction and route planning
- Automatic validation of placement criteria
- Support for importing terrain data and spectral analysis

---

## 📗 Обзор проекта (RU)

Этот проект создан в рамках **Международной олимпиады "IT-Планета 2025"**, в треке «Космический кубок: МИССИЯ ЛУНА».

Цель первого этапа – разработать **концепцию и прототип Web-решения** для планирования строительства лунной базы на Южном полюсе Луны и навигации по ней.

Основные задачи:
- Исследование лунной поверхности для выбора подходящих площадок
- Оптимальное размещение объектов инфраструктуры
- Управление ресурсами и устойчивое развитие базы
- Прототип интерфейса для отображения карты и прокладки маршрутов
- Проверка соответствия объектов заданным критериям
- Поддержка анализа высот по спектральным данным

---
## ✅ Как писать коммиты (Conventional Commits)

### 📌 Формат:
```
<тип>(область): краткое описание
```
Пример:
```
feat(auth): add login form
```

---

### 🔖 Типы коммитов:
- `feat` — новая фича
- `fix` — багфикс
- `docs` — документация
- `style` — стили, форматирование (не влияет на логику)
- `refactor` — переработка кода (без новых фич и фиксов)
- `test` — тесты
- `chore` — тех. задачи: зависимости, конфиги
- `perf` — улучшения производительности
- `build` — сборочная система
- `ci` — CI/CD процессы
- `revert` — откат коммита

---

## 🚀 Инструкция по запуску проекта с нуля

1. **Склонируй репозиторий:**
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2. **Установи зависимости:**
```bash
pnpm install
```
> Если pnpm не установлен:
```bash
npm install -g pnpm
```

3. **Запусти проект:**
```bash
pnpm dev
```

4. **Открой в браузере:**
```
http://localhost:3000

---

## ✅ Настройка окружения для корректной работы с GDAL и геоданными

### 🔹 **Шаг 1: Создание окружения**

Открываем **Anaconda Prompt** и создаём новое окружение:

```bash
conda create -n gis python=3.11
conda activate gis
```

---

### 🔹 **Шаг 2: Установка библиотек**

Устанавливаем нужные библиотеки из файла `scripts/requirements.txt`, **но только через `conda`**, так как `pip` может не корректно установить `GDAL`:

```bash
conda install -c conda-forge gdal pyproj matplotlib numpy rasterio
```

---

### 🔹 **Шаг 3: Проверка ошибок**

Если при запуске в консоли вы видите ошибку вроде:

```
Python stderr:   File "...\image_processor.py", line 2, in <module>
    from osgeo import gdal, osr
ModuleNotFoundError: No module named 'osgeo'

Python process exited with code 1
```

Это значит, что **модуль `osgeo` не установлен**. Устанавливать его также нужно через `conda` (если ещё не установлен):

```bash
conda install -c conda-forge gdal
```

**Важно:** не использовать `pip install gdal` — это приведёт к некорректной установке.

---

### 🔹 **Шаг 4: Указание пути к Python**

Всё ещё в **Anaconda Prompt**, выполняем:

```bash
where python
```

Нужна строка, указывающая путь к `python.exe` внутри окружения `gis`, например:

```
C:\Users\Ruslan\anaconda3\envs\gis\python.exe
```

---

### 🔹 **Шаг 5: Настройка `.env.local`**

В корневой папке проекта создаём файл `.env.local` и прописываем туда следующее:

```
PYTHON_PATH=C:\Users\Ruslan\anaconda3\envs\gis\python.exe
```

Замените путь на тот, который вы получили на предыдущем шаге.

---

### ✅ **Готово!**

Если всё настроено правильно, после загрузки файла в консоли сервера должна появиться строка:

```
POST /api/process-image 200 in 9426ms
```

Это означает, что сервер успешно обработал изображение с помощью нужных библиотек.



## Структура проекта

```
/
├── app/                     # Frontend (Next.js)
│   ├── api/                 # API-маршруты
│   │   ├── process-image/   # Обработка загруженных изображений
│   │   └── list-processed-images/ # Получение списка обработанных изображений
│   ├── components/          # React-компоненты
│   ├── moon-map/            # Страница конструктора лунной базы
│   └── spectral-analysis/   # Страница с информацией о спектральном анализе
├── scripts/                 # Python-скрипты для обработки изображений
│   ├── image_processor.py   # Основной скрипт обработки
│   ├── input/               # Входные изображения
│   ├── output/              # Выходные данные
│   │   ├── images/          # Сгенерированные визуализации
│   │   └── json/            # JSON-файлы с данными анализа
│   └── requirements.txt     # Зависимости Python
└── public/                  # Статические файлы
```

## Использование приложения

1. Откройте главную страницу приложения
2. Перейдите в раздел "Спектральный анализ"
3. Загрузите изображение поверхности Луны для обработки
4. После обработки просмотрите результаты анализа
5. Перейдите в "Конструктор" для планирования лунной базы, используя полученные данные

## Решение проблем

### Не удается найти Python

Если приложение не может найти Python:

1. Убедитесь, что Python установлен и доступен в PATH
2. Задайте путь к Python через переменную окружения PYTHON_PATH
3. Проверьте наличие всех зависимостей в Python-окружении (см. `scripts/requirements.txt`)

### Ошибки при обработке изображений

1. Проверьте, что формат загружаемого изображения поддерживается (рекомендуется GeoTIFF)
2. Убедитесь, что в вашем Python-окружении установлены все необходимые библиотеки
3. Проверьте логи сервера для получения дополнительной информации

## Вклад в проект

1. Fork репозитория
2. Создайте ветку для вашей функциональности (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add some amazing feature'`)
4. Push в вашу ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## Лицензия

[MIT](LICENSE)
