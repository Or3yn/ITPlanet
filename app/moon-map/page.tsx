"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check, X, Save, Edit, Trash2, ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMoonMapStore } from '@/app/store/moon-map-store'
import { Footer } from "@/components/ui/footer"

// Определение типов объектов и их размеров
interface ObjectSize {
  width: number
  height: number
  safetyZone: number
}

interface PlacedObject {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  safetyZone: number
  color: string
}

interface Route {
  id: string
  start: string
  end: string
  startObj: PlacedObject | null
  endObj: PlacedObject | null
  distance: number
  time: number
}

interface Measurement {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  distance: number
  color: string
}

interface SavedProject {
  id: string
  name: string
  date: string
  objects: PlacedObject[]
  routes: Route[]
  measurements: Measurement[]
  areaSize: number
  safetyZone: number
}

interface Layer {
  id: string
  name: string
  description: string
  enabled: boolean
  imagePath: string
  rawImagePath: string
  type: 'height' | 'spectral' | 'slope' | 'ice' | 'shadows'
  isActive: boolean
}

// Add interfaces for terrain and metadata
interface TerrainUpload {
  id: string
  name: string
  date: string
  loaded: boolean
  progress: number
  heightDataLoaded: boolean
  spectralDataLoaded: boolean
  iceDataLoaded: boolean
}

interface Metadata {
  id: string
  name: string
  date: string
  data: Record<string, any>
}

// Add type definitions for objectSizes, objectNames, and objectColors

type InfrastructureKey = 
  | "residential-ind" 
  | "residential-common" 
  | "sports" 
  | "administrative" 
  | "medical" 
  | "research" 
  | "repair" 
  | "spaceport" 
  | "communication" 
  | "plantation" 
  | "waste" 
  | "production" 
  | "astronomy" 
  | "solar" 
  | "mining";

type ObjectSizeMap = Record<InfrastructureKey, { width: number; height: number; safetyZone: number }>;

type StringMap = Record<InfrastructureKey, string>;

const objectSizes: ObjectSizeMap = {
  "residential-ind": { width: 2, height: 2, safetyZone: 1 },
  "residential-common": { width: 4, height: 3, safetyZone: 2 },
  sports: { width: 3, height: 4, safetyZone: 2 },
  administrative: { width: 3, height: 3, safetyZone: 2 },
  medical: { width: 3, height: 3, safetyZone: 2 },
  research: { width: 4, height: 3, safetyZone: 2 },
  repair: { width: 3, height: 3, safetyZone: 2 },
  spaceport: { width: 10, height: 10, safetyZone: 5 },
  communication: { width: 2, height: 2, safetyZone: 1 },
  plantation: { width: 4, height: 4, safetyZone: 2 },
  waste: { width: 5, height: 5, safetyZone: 3 },
  production: { width: 4, height: 4, safetyZone: 2 },
  astronomy: { width: 3, height: 3, safetyZone: 2 },
  solar: { width: 5, height: 3, safetyZone: 2 },
  mining: { width: 3, height: 3, safetyZone: 2 },
}

// Add interfaces for drag and measurement states
interface DragState {
  mapX: number
  mapY: number
  mouseX: number
  mouseY: number
}

interface MeasurementState {
  x: number
  y: number
}

interface CellPosition {
  x: number
  y: number
}

// Add a new interface for TileData - just before the existing interfaces
interface TileData {
  tile_id: number;
  pixel_coords: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
  geo_coords: {
    lon_min: number;
    lat_min: number;
    lon_max: number;
    lat_max: number;
  };
  layers: {
    elevation: {
      mean: number;
      max: number;
      min: number;
    };
    slope: {
      mean: number;
      max: number;
      min: number;
    };
    shadows: {
      mean: number;
      max: number;
      min: number;
    };
    illumination: {
      mean: number;
      max: number;
      min: number;
    };
    ice: {
      mean: number;
      max: number;
      min: number;
    };
  };
}

// Add an interface for the area data from JSON
interface AreaData {
  name?: string;
  description?: string;
  gridSize?: number;
  tiles: TileData[];
}

// Добавляем компонент TileInfoModal после всех интерфейсов
const TileInfoModal = ({ tile, onClose }: { tile: TileData | null; onClose: () => void }) => {
  if (!tile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Информация о тайле #{tile.tile_id}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Координаты пикселей</h3>
            <div className="bg-gray-50 p-3 rounded">
              <div>X: {tile.pixel_coords.x_min}-{tile.pixel_coords.x_max}</div>
              <div>Y: {tile.pixel_coords.y_min}-{tile.pixel_coords.y_max}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Географические координаты</h3>
            <div className="bg-gray-50 p-3 rounded">
              <div>Долгота: {tile.geo_coords.lon_min.toFixed(6)}° - {tile.geo_coords.lon_max.toFixed(6)}°</div>
              <div>Широта: {tile.geo_coords.lat_min.toFixed(6)}° - {tile.geo_coords.lat_max.toFixed(6)}°</div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Характеристики поверхности</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-sm mb-1">Высота</div>
                <div className="text-sm">
                  <div>Средняя: {tile.layers.elevation.mean.toFixed(2)} м</div>
                  <div>Мин: {tile.layers.elevation.min.toFixed(2)} м</div>
                  <div>Макс: {tile.layers.elevation.max.toFixed(2)} м</div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-sm mb-1">Наклон</div>
                <div className="text-sm">
                  <div>Средний: {tile.layers.slope.mean.toFixed(2)}°</div>
                  <div>Мин: {tile.layers.slope.min.toFixed(2)}°</div>
                  <div>Макс: {tile.layers.slope.max.toFixed(2)}°</div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-sm mb-1">Освещённость</div>
                <div className="text-sm">
                  <div>Средняя: {(tile.layers.illumination.mean * 100).toFixed(2)}%</div>
                  <div>Мин: {(tile.layers.illumination.min * 100).toFixed(2)}%</div>
                  <div>Макс: {(tile.layers.illumination.max * 100).toFixed(2)}%</div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-sm mb-1">Тени</div>
                <div className="text-sm">
                  <div>Среднее: {(tile.layers.shadows.mean * 100).toFixed(2)}%</div>
                  <div>Мин: {(tile.layers.shadows.min * 100).toFixed(2)}%</div>
                  <div>Макс: {(tile.layers.shadows.max * 100).toFixed(2)}%</div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-sm mb-1">Вероятность льда</div>
                <div className="text-sm">
                  <div>Средняя: {(tile.layers.ice.mean * 100).toFixed(2)}%</div>
                  <div>Мин: {(tile.layers.ice.min * 100).toFixed(2)}%</div>
                  <div>Макс: {(tile.layers.ice.max * 100).toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Добавляем компонент для просмотра изображения
const ImageViewerModal = ({ 
  imagePath, 
  title, 
  onClose 
}: { 
  imagePath: string; 
  title: string; 
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative aspect-video">
          <img
            src={imagePath}
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

// В начале файла, после импортов
interface Point {
  x: number;
  y: number;
}

// Вспомогательные функции
const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = yi > point.y !== yj > point.y && 
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const isPointInEllipse = (point: Point, center: Point, radiusX: number, radiusY: number): boolean => {
  const normalizedX = (point.x - center.x) / radiusX;
  const normalizedY = (point.y - center.y) / radiusY;
  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
};

export default function MoonMapPage() {
  // Get state and actions from store
  const {
    mapPosition,
    mapZoom,
    gridSize, // Это значение теперь будет установлено в 25
    cellSize,
    isDragging,
    dragStart,
    hoveredCell,
    activeAnalysisTool,
    activeMapLayer,
    restrictionEnabled,
    restrictionShape,
    ellipseWidth,
    ellipseHeight,
    polygonPoints,
    drawingPolygon,
    drawingRoute,
    routeStartObject,
    routeEndObject,
    filtersApplied,
    isMeasuring,
    measurementStart,
    measurements,
    routes,
    placedObjects,
    selectedInfrastructure,
    showCoordinateInfo,
    clickedPointInfo,
    showHelpDialog,
    selectedLayerInfo,
    restrictedArea,
    showPlacementCriteria,
    setMapPosition,
    setMapZoom,
    setIsDragging,
    setDragStart,
    setHoveredCell,
    setActiveAnalysisTool,
    setActiveMapLayer,
    setRestrictionEnabled,
    setRestrictionShape,
    setEllipseWidth,
    setEllipseHeight,
    setPolygonPoints,
    setDrawingPolygon,
    setDrawingRoute,
    setRouteStartObject,
    setRouteEndObject,
    setFiltersApplied,
    setIsMeasuring,
    setMeasurementStart,
    setMeasurements,
    setRoutes,
    setPlacedObjects,
    setSelectedInfrastructure,
    setShowCoordinateInfo,
    setClickedPointInfo,
    setShowHelpDialog,
    setSelectedLayerInfo,
    setRestrictedArea,
    setShowPlacementCriteria,
  } = useMoonMapStore()

  // Update state with proper types
  const [dragStartState, setDragStartState] = useState<DragState | null>(null)
  const [measurementStartState, setMeasurementStartState] = useState<MeasurementState | null>(null)
  const [hoveredCellState, setHoveredCellState] = useState<CellPosition | null>(null)

  // Map ref
  const mapRef = useRef<HTMLDivElement>(null)

  // Local state that doesn't need to be in the store
  // Error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [routeError, setRouteError] = useState<string | null>(null)

  // Project management
  const [projectName, setProjectName] = useState("")
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadProjectDialog, setShowLoadProjectDialog] = useState(false)

  // Upload management
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadedAreas, setUploadedAreas] = useState<string[]>([])
  const [terrainUploads, setTerrainUploads] = useState<TerrainUpload[]>([])
  const [metadataUploads, setMetadataUploads] = useState<Metadata[]>([])
  const [showMetadataEditor, setShowMetadataEditor] = useState(false)
  const [editingMetadata, setEditingMetadata] = useState<Metadata | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [terrainUploadName, setTerrainUploadName] = useState("")
  const [showTerrainDialog, setShowTerrainDialog] = useState(false)
  const [currentUploadType, setCurrentUploadType] = useState<"terrain" | "metadata" | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadataUploadName, setMetadataUploadName] = useState("")
  const [showMetadataDialog, setShowMetadataDialog] = useState(false)
  const [selectedMetadata, setSelectedMetadata] = useState<Metadata | null>(null)
  const [editableMetadata, setEditableMetadata] = useState<string>("")
  const [selectedMetadataFile, setSelectedMetadataFile] = useState<File | null>(null)
  const [baseName, setBaseName] = useState<string>('');

  // UI state
  const [sideMenuOpen, setSideMenuOpen] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [activeTab, setActiveTab] = useState("2d")
  const [showResourceInfoModal, setShowResourceInfoModal] = useState(false)
  const [resourceBlockExpanded, setResourceBlockExpanded] = useState(false)

  // Area and object selection
  const [selectedArea, setSelectedArea] = useState("shackleton")
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["shackleton"])
  const [selectedHabitableModule, setSelectedHabitableModule] = useState<string | null>(null)
  const [selectedTechObject, setSelectedTechObject] = useState<string | null>(null)
  const [draggedObject, setDraggedObject] = useState<string | null>(null)
  const [selectedObjectInfo, setSelectedObjectInfo] = useState<PlacedObject | null>(null)

  // Area configuration
  const [areaSize, setAreaSize] = useState(500)
  const [safetyZone, setSafetyZone] = useState(100)
  const [areaFilters, setAreaFilters] = useState({
    sunlight: false,
    iceProximity: false,
    flatTerrain: false,
    lavaTubes: false,
    spaceportDistance: false,
    sufficientArea: false,
  })

  // Route planning
  const [routeStart, setRouteStart] = useState<string | null>(null)
  const [routeEnd, setRouteEnd] = useState<string | null>(null)

  // Resource management
  const [objectParams, setObjectParams] = useState({
    radiationProtection: false,
    iceProximity: false,
    sunlightAccess: false,
    flatSurface: false,
  })
  const [resourceSettings, setResourceSettings] = useState({
    spacePerPerson: 20,
    crewSize: 6,
  })
  const [resourceStatus, setResourceStatus] = useState({
    water: {
      current: 450,
      capacity: 500,
      consumption: 21.24,
      percentage: 90,
      daysLeft: 21.2,
    },
    oxygen: {
      current: 120,
      capacity: 150,
      consumption: 5.04,
      percentage: 80,
      daysLeft: 23.8,
    },
    food: {
      current: 80,
      capacity: 100,
      consumption: 3.72,
      production: 2.5,
      percentage: 80,
      daysLeft: 21.5,
    },
    energy: {
      current: 1200,
      capacity: 2000,
      consumption: 150,
      production: 180,
      percentage: 60,
      daysLeft: 8,
    },
    waste: {
      current: 85,
      percentage: 85,
      generation: 8.5,
      recycling: 7.2,
    },
  })
  const [resourceAdvice, setResourceAdvice] = useState([
    "Добавьте аккумуляторы для увеличения автономности до 14 дней",
    "Рекомендуется установить дополнительный модуль переработки отходов",
    "Жилая площадь достаточна для текущего экипажа (6 человек)",
  ])

  // Layer management
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "height",
      name: "Рельеф местности",
      description: "Отображает высоту поверхности Луны. Темные области - низменности, светлые - возвышенности.",
      enabled: true,
      imagePath: "/output/images/height.png",
      rawImagePath: `/output/layers/${baseName}_elevation.png`,
      type: "height",
      isActive: true,
    },
    {
      id: "spectral",
      name: "Спектральный анализ",
      description: "Показывает минералогический состав поверхности. Разные цвета соответствуют разным минералам.",
      enabled: false,
      imagePath: "/output/images/spectral.png",
      rawImagePath: `/output/layers/${baseName}_illumination.png`,
      type: "spectral",
      isActive: false,
    },
    {
      id: "slope",
      name: "Наклон поверхности",
      description: "Отображает угол наклона поверхности. Полезно для определения пригодности участка для строительства.",
      enabled: false,
      imagePath: "/output/images/slope.png",
      rawImagePath: `/output/layers/${baseName}_slope.png`,
      type: "slope",
      isActive: false,
    },
    {
      id: "ice_probability",
      name: "Ледяные отложения",
      description: "Показывает вероятность наличия льда на поверхности.",
      enabled: false,
      imagePath: `/output/layers/${baseName}_ice_probability.png`,
      rawImagePath: `/output/images/${baseName}_ice_probability.png`,
      type: "spectral",
      isActive: false,
    },
    {
      id: "shadows",
      name: "Тени",
      description: "Показывает среднюю освещенность поверхности.",
      enabled: false,
      imagePath: "/output/images/shadows.png",
      rawImagePath: `/output/layers/${baseName}_shadows.png`,
      type: "shadows",
      isActive: false,
    }
  ])

  const objectNames: StringMap = {
    "residential-ind": "Жилой модуль (инд.)",
    "residential-common": "Жилой модуль (общий)",
    sports: "Спортивный модуль",
    administrative: "Административный модуль",
    medical: "Медицинский модуль",
    research: "Исследовательский модуль",
    repair: "Ремонтный модуль",
    spaceport: "Космодром",
    communication: "Вышка связи",
    plantation: "Плантация",
    waste: "Мусорный полигон",
    production: "Производственный модуль",
    astronomy: "Астрономическая площадка",
    solar: "Солнечная электростанция",
    mining: "Добывающая шахта",
  }

  const objectColors: StringMap = {
    "residential-ind": "bg-blue-500",
    "residential-common": "bg-blue-600",
    sports: "bg-green-500",
    administrative: "bg-green-600",
    medical: "bg-red-500",
    research: "bg-yellow-500",
    repair: "bg-gray-500",
    spaceport: "bg-purple-500",
    communication: "bg-orange-500",
    plantation: "bg-lime-500",
    waste: "bg-teal-500",
    production: "bg-indigo-500",
    astronomy: "bg-sky-500",
    solar: "bg-amber-500",
    mining: "bg-stone-500",
  }

  // Добавить функцию для начала рисования полигона после handleMapZoomOut
  const handleStartDrawPolygon = () => {
    setDrawingPolygon(true)
    setPolygonPoints([])
    setActiveAnalysisTool(null)
  }

  // Обработчик изменения параметров объекта
  const handleObjectParamChange = (param: keyof typeof objectParams) => {
    setObjectParams({
      ...objectParams,
      [param]: !objectParams[param],
    })
  }

  const handleAreaFilterChange = (filter: keyof typeof areaFilters) => {
    setAreaFilters({
      ...areaFilters,
      [filter]: !areaFilters[filter],
    })
  }

  // Обработчик выбора инфраструктуры
  const handleInfrastructureSelect = (type: InfrastructureKey, category: "habitable" | "tech") => {
    if (category === "habitable") {
      setSelectedHabitableModule(type === selectedHabitableModule ? null : type)
      setSelectedTechObject(null)
    } else {
      setSelectedTechObject(type === selectedTechObject ? null : type)
      setSelectedHabitableModule(null)
    }
    setSelectedInfrastructure(type)
    setDraggedObject(type)
    setShowPlacementCriteria(true)
  }

  // Теперь обновим функцию canPlaceObject, чтобы проверять, находится ли объект внутри активной зоны
  // Найдите функцию canPlaceObject и добавьте в нее проверку на активную зону:

  const canPlaceObject = (x: number, y: number, width: number, height: number, safetyZone: number): boolean => {
    // Проверка выхода за границы сетки
    if (x < 0 || y < 0 || x + width > GRID_SIZE || y + height > GRID_SIZE) {
      setErrorMessage("❌ Объект выходит за границы карты")
      setTimeout(() => setErrorMessage(null), 3000)
      return false
    }

    // Проверка, находится ли объект внутри активной зоны, если ограничение включено
    if (restrictionEnabled) {
      // Проверяем все тайлы, которые занимает объект
      for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < height; dy++) {
          const checkX = x + dx
          const checkY = y + dy
          
          // Для эллипса
          if (restrictionShape === "ellipse") {
            const centerX = GRID_SIZE / 2
            const centerY = GRID_SIZE / 2
            const radiusX = ellipseWidth / (2 * Math.sqrt(cellSize))
            const radiusY = ellipseHeight / (2 * Math.sqrt(cellSize))

            const normalizedX = (checkX - centerX) / radiusX
            const normalizedY = (checkY - centerY) / radiusY
            if (normalizedX * normalizedX + normalizedY * normalizedY > 1) {
              setErrorMessage("❌ Объект должен быть полностью внутри активной зоны")
              setTimeout(() => setErrorMessage(null), 3000)
              return false
            }
          }

          // Для полигона
          if (restrictionShape === "polygon" && polygonPoints.length > 2) {
            if (!isPointInPolygon({ x: checkX, y: checkY }, polygonPoints)) {
              setErrorMessage("❌ Объект должен быть полностью внутри активной зоны")
              setTimeout(() => setErrorMessage(null), 3000)
              return false
            }
          }
        }
      }
    }

    // Проверка пересечения с другими объектами и их зонами безопасности
    for (const obj of placedObjects) {
      // Проверяем каждый тайл объекта и его зоны безопасности
      const objStartX = obj.x - obj.safetyZone
      const objStartY = obj.y - obj.safetyZone
      const objEndX = obj.x + obj.width + obj.safetyZone
      const objEndY = obj.y + obj.height + obj.safetyZone

      // Проверка пересечения с зоной безопасности
      if (
        x < objEndX &&
        x + width > objStartX &&
        y < objEndY &&
        y + height > objStartY
      ) {
        setErrorMessage(`❌ Объект слишком близко к ${objectNames[obj.type as InfrastructureKey] || obj.name}`)
        setTimeout(() => setErrorMessage(null), 3000)
        return false
      }
    }

    return true
  }

  // Обработчик размещения объекта
  const handlePlaceObject = (x: number, y: number) => {
    if (!selectedInfrastructure) return

    const size = objectSizes[selectedInfrastructure as InfrastructureKey]
    if (!size) return

    const { width, height, safetyZone } = size
    
    // Проверяем возможность размещения
    if (canPlaceObject(x, y, width, height, safetyZone)) {
      const newObject: PlacedObject = {
        id: Date.now().toString(),
        type: selectedInfrastructure,
        name: `${objectNames[selectedInfrastructure as InfrastructureKey]}-${Date.now().toString().slice(-4)}`,
        x,
        y,
        width,
        height,
        safetyZone,
        color: objectColors[selectedInfrastructure as InfrastructureKey] || "bg-gray-500",
      }

      setPlacedObjects([...placedObjects, newObject])
      setErrorMessage("✅ Объект успешно размещен")
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  // Обработчик автооптимизации размещения
  const handleAutoOptimize = () => {
    // Сортируем объекты по размеру (от большего к меньшему)
    const sortedObjects = [...placedObjects].sort((a, b) => b.width * b.height - a.width * a.height)

    // Удаляем все объекты
    setPlacedObjects([])

    // Временный массив для новых позиций
    const newPositions: PlacedObject[] = []

    // Пытаемся разместить каждый объект
    for (const obj of sortedObjects) {
      let placed = false

      // Перебираем все возможные позиции на сетке
      for (let y = 0; y < GRID_SIZE && !placed; y++) {
        for (let x = 0; x < GRID_SIZE && !placed; x++) {
          // Проверяем, можно ли разместить объект в этой позиции
          if (canPlaceObjectWithExisting(x, y, obj.width, obj.height, obj.safetyZone, newPositions)) {
            // Добавляем объект в новые позиции
            newPositions.push({
              ...obj,
              x,
              y,
            })
            placed = true
          }
        }
      }

      // Если не удалось разместить объект, возвращаем его на исходную позицию
      if (!placed) {
        newPositions.push(obj)
      }
    }

    // Обновляем размещенные объекты
    setPlacedObjects(newPositions)

    // Показываем сообщение об успешной оптимизации
    setErrorMessage("✅ Оптимизация выполнена!")
    setTimeout(() => setErrorMessage(null), 3000)
  }

  // Вспомогательная функция для проверки возможности размещения с учетом существующих объектов
  const canPlaceObjectWithExisting = (
    x: number,
    y: number,
    width: number,
    height: number,
    safetyZone: number,
    existingObjects: PlacedObject[],
  ): boolean => {
    // Проверка выхода за границы сетки
    if (x < 0 || y < 0 || x + width > GRID_SIZE || y + height > GRID_SIZE) {
      return false
    }

    // Проверка пересечения с другими объектами
    for (const obj of existingObjects) {
      // Проверка пересечения самих объектов
      if (x < obj.x + obj.width && x + width > obj.x && y < obj.y + obj.height && y + height > obj.y) {
        return false
      }

      // Проверка пересечения с зоной безопасности
      if (
        x - safetyZone < obj.x + obj.width + obj.safetyZone &&
        x + width + safetyZone > obj.x - obj.safetyZone &&
        y - safetyZone < obj.y + obj.height + obj.safetyZone &&
        y + height + safetyZone > obj.y - obj.safetyZone
      ) {
        return false
      }
    }

    return true
  }

  // Map navigation handlers
  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setDragStartState({
      mapX: mapPosition.x,
      mapY: mapPosition.y,
      mouseX,
      mouseY
    })
    setIsDragging(true)
  }

  // Add new state for hover timer
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Update handleMapMouseMove with debounce
  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate cell coordinates
    const cellX = Math.floor((mouseX - mapPosition.x) / (cellSize * mapZoom))
    const cellY = Math.floor((mouseY - mapPosition.y) / (cellSize * mapZoom))

    // Clear existing timer if mouse moves to a new cell
    if (hoveredCell?.x !== cellX || hoveredCell?.y !== cellY) {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
      setShowPreview(false)
      
      // Set new timer for the current cell
      const timer = setTimeout(() => {
        setHoveredCell({ x: cellX, y: cellY })
        setShowPreview(true)
      }, 500) // 500ms delay
      
      setHoverTimer(timer)
    }

    if (isDragging && dragStartState) {
      const deltaX = mouseX - dragStartState.mouseX
      const deltaY = mouseY - dragStartState.mouseY

      setMapPosition({
        x: dragStartState.mapX + deltaX,
        y: dragStartState.mapY + deltaY
      })
    }
  }

  const handleMapMouseUp = () => {
    setIsDragging(false)
    setDragStartState(null)
  }

  const handleMapWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setMapZoom(Math.max(0.1, Math.min(3, mapZoom + delta)))
  }

  const handleObjectDragStart = (objectType: string) => {
    setDraggedObject(objectType)
  }

  const handleObjectDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!mapRef.current || !draggedObject) return

    const rect = mapRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Calculate cell coordinates from mouse position
    const cellX = Math.floor((mouseX - mapPosition.x) / (cellSize * mapZoom))
    const cellY = Math.floor((mouseY - mapPosition.y) / (cellSize * mapZoom))

    const newObject: PlacedObject = {
      id: Date.now().toString(),
      type: draggedObject,
      name: `${draggedObject}-${Date.now().toString().slice(-4)}`,
      x: cellX,
      y: cellY,
      width: 1,
      height: 1,
      safetyZone: 1,
      color: objectColors[draggedObject as InfrastructureKey] || "bg-gray-500",
    }

    setPlacedObjects([...placedObjects, newObject])
    setDraggedObject(null)
  }

  const handleObjectClick = (object: PlacedObject) => {
    setSelectedObjectInfo(object)
  }

  const handleRouteStart = (objectId: string) => {
    setRouteStartObject(objectId)
    setDrawingRoute(true)
  }

  const handleRouteEnd = (objectId: string) => {
    if (routeStartObject && routeStartObject !== objectId) {
      const newRoute = {
        id: Date.now().toString(),
        start: routeStartObject,
        end: objectId,
      }
      setRoutes([...routes, newRoute])
    }
    setRouteStartObject(null)
    setDrawingRoute(false)
  }

  // Добавить функцию для обработки клика при рисовании полигона после handleMapClick
  const handlePolygonClick = (e: React.MouseEvent) => {
    if (!drawingPolygon) return

    const rect = mapRef.current?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * gridSize
      const y = ((e.clientY - rect.top) / rect.height) * gridSize

      // Проверяем, замыкаем ли мы полигон
      if (polygonPoints.length > 2) {
        const firstPoint = polygonPoints[0]
        const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2))

        if (distance < 1) {
          // Замыкаем полигон
          setDrawingPolygon(false)
          // Рассчитываем примерную площадь (заглушка)
          setRestrictedArea(Math.floor(Math.random() * 5000) + 1000)
          return
        }
      }

      setPolygonPoints([...polygonPoints, { x, y }])
    }
  }

  // Modify the handleMapClick function to support tile data display
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Calculate cell coordinates
    const cellX = Math.floor((x - mapPosition.x) / (cellSize * mapZoom))
    const cellY = Math.floor((y - mapPosition.y) / (cellSize * mapZoom))

    // Check if coordinates tool is active and if we have area data
    if (activeAnalysisTool === "coordinates" && areaData) {
      // Find the tile at these coordinates
      const tile = areaData.tiles.find(t => 
        t?.pixel_coords?.x_min <= cellX * (500/gridSize) && 
        t?.pixel_coords?.x_max >= cellX * (500/gridSize) && 
        t?.pixel_coords?.y_min <= cellY * (500/gridSize) && 
        t?.pixel_coords?.y_max >= cellY * (500/gridSize)
      );
      
      if (tile) {
        setSelectedTile(tile);
        setShowTileModal(true); // Открываем модальное окно вместо временного отображения
      }
      return;
    }

    if (activeAnalysisTool === "measure") {
      if (!isMeasuring) {
        setMeasurementStartState({ x, y })
        setIsMeasuring(true)
      } else {
        if (measurementStartState) {
          const distance = Math.sqrt(
            Math.pow(x - measurementStartState.x, 2) + Math.pow(y - measurementStartState.y, 2)
          )
          
          // Calculate cell coordinates for start and end
          const startCellX = Math.floor((measurementStartState.x - mapPosition.x) / (cellSize * mapZoom))
          const startCellY = Math.floor((measurementStartState.y - mapPosition.y) / (cellSize * mapZoom))
          const endCellX = Math.floor((x - mapPosition.x) / (cellSize * mapZoom))
          const endCellY = Math.floor((y - mapPosition.y) / (cellSize * mapZoom))
          
          // Create a new measurement with string ID
          const newMeasurement: Measurement = {
            id: Date.now().toString(),
            startX: startCellX,
            startY: startCellY,
            endX: endCellX,
            endY: endCellY,
            distance: distance,
            color: "blue"
          }
          
          setMeasurements([...measurements, newMeasurement])
          setIsMeasuring(false)
        }
      }
    } else if (activeAnalysisTool === "polygon") {
      if (!drawingPolygon) {
        setPolygonPoints([{ x, y }])
        setDrawingPolygon(true)
      } else {
        setPolygonPoints([...polygonPoints, { x, y }])
      }
    }
  }

  const handleMapZoomIn = () => {
    setMapZoom(Math.min(mapZoom + 0.2, 3))
  }

  const handleMapZoomOut = () => {
    setMapZoom(Math.max(mapZoom - 0.2, 0.5))
  }

  // Route drawing handlers
  const handleRouteObjectClick = (obj: PlacedObject) => {
    if (drawingRoute) {
      if (!routeStartObject) {
        setRouteStartObject(obj)
      } else {
        setRouteEndObject(obj)
        // Create route
        const distance = Math.sqrt(
          Math.pow((obj.x - routeStartObject.x) * Math.sqrt(cellSize), 2) +
            Math.pow((obj.y - routeStartObject.y) * Math.sqrt(cellSize), 2),
        ).toFixed(0)

        const time = Math.ceil(Number.parseInt(distance) / 80) // Assuming 80m per minute walking speed

        const newRoute: Route = {
          id: Date.now().toString(),
          start: routeStartObject.name,
          end: obj.name,
          startObj: routeStartObject,
          endObj: obj,
          distance: Number.parseInt(distance),
          time: time,
        }

        setRoutes([...routes, newRoute])
        setDrawingRoute(false)
        setRouteStartObject(null)
        setRouteEndObject(null)
      }
    } else {
      // Show object info instead of delete confirmation
      setSelectedObjectInfo(obj)
    }
  }

  // Обработчик создания маршрута
  const handleCreateRoute = () => {
    if (!routeStart || !routeEnd) {
      setRouteError("Выберите начальную и конечную точки маршрута")
      return
    }

      const startObj = placedObjects.find((obj) => obj.name === routeStart)
      const endObj = placedObjects.find((obj) => obj.name === routeEnd)

      if (!startObj || !endObj) {
      setRouteError("Не удалось найти объекты маршрута")
        return
      }

      const distance = Math.sqrt(
        Math.pow((endObj.x - startObj.x) * Math.sqrt(cellSize), 2) +
          Math.pow((endObj.y - startObj.y) * Math.sqrt(cellSize), 2),
    )

      const newRoute: Route = {
        id: Date.now().toString(),
        start: routeStart,
        end: routeEnd,
        startObj,
        endObj,
      distance,
      time: distance / 5, // Assuming 5 m/s walking speed
      }

      setRoutes([...routes, newRoute])
      setRouteStart(null)
      setRouteEnd(null)
      setRouteError(null)
  }

  // Обработчик экспорта данных
  const handleExport = (format: string) => {
    alert(`Файл ${format} успешно экспортирован`)
  }

  // Обработчик создания отчета
  const handleCreateReport = () => {
    alert("Отчет успешно создан и скачан")
  }

  // Обработчик применения фильтров
  const handleApplyFilters = () => {
    // Check if any filter is selected
    const anyFilterSelected = Object.values(areaFilters).some((value) => value)

    if (!anyFilterSelected) {
      alert("Пожалуйста, выберите хотя бы один фильтр")
      return
    }

    setFiltersApplied(true)
    
    // If sunlight filter is selected, automatically select Malapert Mountain
    // and set it as the only available area
    if (areaFilters.sunlight) {
      setSelectedArea("malapert")
      // Make Malapert the only selected area when sunlight filter is active
      setSelectedAreas(["malapert"])
    }
  }

  // Обработчик редактирования маршрута
  const handleEditRoute = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId)
    if (route) {
      setRouteStart(route.start)
      setRouteEnd(route.end)
      setRoutes(routes.filter((r) => r.id !== routeId))
    }
  }

  // Обработчик удаления маршрута
  const handleDeleteRoute = (routeId: string) => {
    setRoutes(routes.filter((r) => r.id !== routeId))
  }

  // Обработчик удаления объекта
  const handleDeleteObject = (objectId: string) => {
    setPlacedObjects(placedObjects.filter((obj) => obj.id !== objectId))
  }

  // Обработчик удаления измерения
  const handleDeleteMeasurement = (measurementId: string) => {
    setMeasurements(measurements.filter((m) => m.id !== measurementId))
  }

  // Обработчик изменения цвета измерения
  const handleChangeMeasurementColor = (measurementId: string, color: string) => {
    setMeasurements(
      measurements.map((m) => (m.id === measurementId ? { ...m, color } : m)),
    )
  }

  // Обработчик сохранения проекта
  const handleSaveProject = () => {
    if (!projectName) {
      setErrorMessage("Введите название проекта")
      return
    }

    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: projectName,
      date: new Date().toLocaleDateString(),
      objects: placedObjects,
      routes,
      measurements,
      areaSize,
      safetyZone,
    }

    setSavedProjects([...savedProjects, newProject])
    setShowSaveDialog(false)
    setProjectName("")
    setErrorMessage(null)
  }

  // Обработчик загрузки проекта
  const handleLoadProject = (projectId: string) => {
    const project = savedProjects.find((p) => p.id === projectId)
    if (project) {
      setPlacedObjects(project.objects)
      setRoutes(project.routes)
      setMeasurements(project.measurements)
      setAreaSize(project.areaSize)
      setSafetyZone(project.safetyZone)
      setCurrentProjectId(projectId)
      setShowLoadProjectDialog(false)
    }
  }

  // Обработчик переключения слоя
  const handleToggleLayer = (layerId: string) => { 
    console.log('Toggling layer:', layerId); // Логирование
    setLayers(prevLayers => prevLayers.map(layer => {
      const computedLayerId = `${baseName}_${layer.id}`; // Составляем новое имя слоя
  
      if (computedLayerId === layerId) {
        // Если слой уже активен, деактивируем его
        if (layer.isActive) {
          console.log('Deactivating layer:', layer.id);
          return { ...layer, isActive: false };
        }
        // Если слой становится активным, деактивируем все остальные
        const updatedLayer = { 
          ...layer, 
          isActive: true,
          rawImagePath: `/output/images/${baseName}_${layer.id}.png`,
          imagePath: `/output/images/${baseName}_${layer.id}.png`
        };
        console.log('Activating layer:', layer.id, 'with rawImagePath:', updatedLayer.rawImagePath);
        return updatedLayer;
      }
      // Деактивируем все остальные слои
      return { ...layer, isActive: false };
    }));
  };

  // Обработчик выбора слоя для просмотра информации
  const handleSelectLayerInfo = (layer: Layer) => {
    setSelectedLayerInfo(layer)
  }

  // Функция для переключения в полноэкранный режим
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        setIsFullScreen(true)
    } else {
      document.exitFullscreen()
          setIsFullScreen(false)
    }
  }

  // Обновляем константы для размеров сетки
  const GRID_SIZE = 25; // 25x25 тайлов
  const TILE_SIZE = 20; // 20x20 пикселей
  const TOTAL_SIZE = 500; // 500x500 пикселей

  // Обновляем функцию renderGrid
  const renderGrid = () => {
    const cells = [];
    const activeLayerData = layers.find(l => l.isActive);

    // Вычисляем начальное смещение для центрирования
    const initialOffsetX = (windowSize.width - TOTAL_SIZE) / 2;
    const initialOffsetY = (windowSize.height - TOTAL_SIZE) / 2;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const currentTile = areaData?.tiles?.find(t => 
          t?.pixel_coords?.x_min === x * TILE_SIZE && 
          t?.pixel_coords?.y_min === y * TILE_SIZE
        );

        let isInActiveZone = true;
        if (restrictionEnabled) {
          if (restrictionShape === "ellipse") {
            const centerX = GRID_SIZE / 2;
            const centerY = GRID_SIZE / 2;
            const radiusX = ellipseWidth / (2 * Math.sqrt(TILE_SIZE));
            const radiusY = ellipseHeight / (2 * Math.sqrt(TILE_SIZE));
            isInActiveZone = isPointInEllipse(
              { x, y },
              { x: centerX, y: centerY },
              radiusX,
              radiusY
            );
          } else if (restrictionShape === "polygon" && polygonPoints.length > 2) {
            isInActiveZone = isPointInPolygon({ x, y }, polygonPoints);
          }
        }

        let cellClass = "";
        if (isInActiveZone || !restrictionEnabled) {
          cellClass = currentTile 
            ? `border border-gray-300 transition-colors ${
                activeAnalysisTool === "coordinates" 
                  ? "hover:bg-blue-200 hover:bg-opacity-50 cursor-pointer" 
                  : "hover:bg-blue-100 hover:bg-opacity-30"
              }`
            : "border border-gray-300 hover:bg-gray-100 hover:bg-opacity-30 transition-colors opacity-60";
        } else {
          cellClass = "border border-gray-300 bg-gray-500 bg-opacity-50";
        }

        cells.push(
          <div
            key={`cell-${x}-${y}`}
            className={cellClass}
            style={{ 
              gridColumn: `${x + 1} / span 1`, 
              gridRow: `${y + 1} / span 1`,
              width: `${TILE_SIZE}px`,
              height: `${TILE_SIZE}px`,
              backgroundColor: currentTile && activeAnalysisTool === "coordinates" 
                ? "rgba(0, 128, 255, 0.15)" 
                : undefined,
              position: 'relative'
            }}
            onClick={() => {
              if (activeAnalysisTool === "coordinates" && currentTile) {
                setSelectedTile(currentTile);
                setShowTileModal(true);
              } else if (selectedInfrastructure && (isInActiveZone || !restrictionEnabled)) {
                handlePlaceObject(x, y);
              }
            }}
            onMouseEnter={() => {
              setHoveredCellState({ x, y });
              if (activeAnalysisTool === "coordinates" && currentTile) {
                setHoveredTile(currentTile);
              }
            }}
            onMouseLeave={() => {
              setHoveredCellState(null);
              setHoveredTile(null);
            }}
          />
        );
      }
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div 
          className="relative"
          style={{
            width: `${TOTAL_SIZE}px`,
            height: `${TOTAL_SIZE}px`,
            transform: `scale(${mapZoom}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
            transformOrigin: 'center',
            transition: isDragging ? "none" : "transform 0.2s ease-out"
          }}
        >
          {activeLayerData && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${activeLayerData.rawImagePath})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                opacity: 0.5,
                width: `${TOTAL_SIZE}px`,
                height: `${TOTAL_SIZE}px`
              }}
            />
          )}
          <div 
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
              width: `${TOTAL_SIZE}px`,
              height: `${TOTAL_SIZE}px`
            }}
          >
            {cells}
          </div>
        </div>
      </div>
    );
  };

  // Рендер размещенных объектов
  const renderPlacedObjects = () => {
    const elements: React.ReactNode[] = []

    // First render safety zones as gray squares
    placedObjects.forEach((obj) => {
      // Calculate the area covered by the safety zone
      const startX = Math.max(0, obj.x - obj.safetyZone)
      const startY = Math.max(0, obj.y - obj.safetyZone)
      const endX = Math.min(gridSize, obj.x + obj.width + obj.safetyZone)
      const endY = Math.min(gridSize, obj.y + obj.height + obj.safetyZone)

      // Create gray squares for each cell in the safety zone
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          // Skip the object itself
          if (x >= obj.x && x < obj.x + obj.width && y >= obj.y && y < obj.y + obj.height) {
            continue
          }

          elements.push(
            <div
              key={`safety-${obj.id}-${x}-${y}`}
              className="bg-gray-300 bg-opacity-50"
              style={{
                gridColumn: `${x + 1} / span 1`,
                gridRow: `${y + 1} / span 1`,
                zIndex: 5,
              }}
            />
          )
        }
      }
    })

    // Then render the objects themselves
    placedObjects.forEach((obj) => {
      elements.push(
        <div
          key={`object-${obj.id}`}
          className={`${obj.color} rounded-md flex items-center justify-center text-white font-bold relative cursor-pointer`}
          style={{
            gridColumn: `${obj.x + 1} / span ${obj.width}`,
            gridRow: `${obj.y + 1} / span ${obj.height}`,
            zIndex: 10,
          }}
          onClick={() => handleRouteObjectClick(obj)}
          title={obj.name}
        >
          {/* И */}
          <div className="text-2xl">
            {obj.type === "residential-ind" && "🏠"}
            {obj.type === "residential-common" && "🏘️"}
            {obj.type === "sports" && "🏃"}
            {obj.type === "administrative" && "🏢"}
            {obj.type === "medical" && "🏥"}
            {obj.type === "research" && "🔬"}
            {obj.type === "repair" && "🔧"}
            {obj.type === "spaceport" && "🚀"}
            {obj.type === "communication" && "📡"}
            {obj.type === "plantation" && "🌱"}
            {obj.type === "waste" && "♻️"}
            {obj.type === "production" && "🏭"}
            {obj.type === "astronomy" && "🔭"}
            {obj.type === "solar" && "☀️"}
            {obj.type === "mining" && "⛏️"}
          </div>
        </div>
      )
    })

    return elements
  }

  // Update renderPlacementPreview with smooth transitions
  const renderPlacementPreview = () => {
    if (!hoveredCell || !selectedInfrastructure || !showPreview) return null

    const size = objectSizes[selectedInfrastructure as InfrastructureKey]
    if (!size) return null

    const { width, height, safetyZone } = size
    const { x, y } = hoveredCell

    const canPlace = canPlaceObject(x, y, width, height, safetyZone)

    return (
      <div
        className={`
          ${canPlace ? "bg-green-300 bg-opacity-50" : "bg-red-300 bg-opacity-50"}
          rounded-md border-2
          ${canPlace ? "border-green-500" : "border-red-500"}
          transition-all duration-200 ease-in-out
          opacity-0 scale-95
          data-[show=true]:opacity-100 data-[show=true]:scale-100
        `}
        data-show={showPreview}
        style={{
          gridColumn: `${x + 1} / span ${width}`,
          gridRow: `${y + 1} / span ${height}`,
          zIndex: 5,
        }}
      />
    )
  }

  // Рендер измерений
  const renderMeasurements = () => {
    return measurements.map((m) => (
      <svg key={`measurement-${m.id}`} className="absolute inset-0 w-full h-full z-20 pointer-events-none">
        <line
          x1={`${(m.startX + 0.5) * (100 / gridSize)}%`}
          y1={`${(m.startY + 0.5) * (100 / gridSize)}%`}
          x2={`${(m.endX + 0.5) * (100 / gridSize)}%`}
          y2={`${(m.endY + 0.5) * (100 / gridSize)}%`}
          stroke={m.color}
          strokeWidth="2"
        />
        <text
          x={`${((m.startX + m.endX) / 2 + 0.5) * (100 / gridSize)}%`}
          y={`${((m.startY + m.endY) / 2 + 0.5) * (100 / gridSize) - 1}%`}
          fill="black"
          fontSize="10"
          textAnchor="middle"
          className="bg-white px-1 rounded pointer-events-auto"
        >
          {m.distance.toFixed(1)}м
        </text>
      </svg>
    ))
  }

  // Рендер маршрутов
  const renderRoutes = () => {
    return routes.map((route) => {
      if (route.startObj && route.endObj) {
        const startX = (route.startObj.x + route.startObj.width / 2) * (100 / gridSize)
        const startY = (route.startObj.y + route.startObj.height / 2) * (100 / gridSize)
        const endX = (route.endObj.x + route.endObj.width / 2) * (100 / gridSize)
        const endY = (route.endObj.y + route.endObj.height / 2) * (100 / gridSize)

        return (
          <svg key={`route-${route.id}`} className="absolute inset-0 w-full h-full z-15">
            <line
              x1={`${startX}%`}
              y1={`${startY}%`}
              x2={`${endX}%`}
              y2={`${endY}%`}
              stroke="red"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x={`${(startX + endX) / 2}%`}
              y={`${(startY + endY) / 2 - 1}%`}
              fill="black"
              fontSize="10"
              textAnchor="middle"
              className="bg-white px-1 rounded"
            >
              {route.distance}м
            </text>
          </svg>
        )
      }
      return null
    })
  }

  // Рендер текущего измерения
  const renderCurrentMeasurement = () => {
    if (!isMeasuring || !measurementStartState || !hoveredCellState) return null

    return (
      <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
        <line
          x1={`${(measurementStartState.x + 0.5) * (100 / gridSize)}%`}
          y1={`${(measurementStartState.y + 0.5) * (100 / gridSize)}%`}
          x2={`${(hoveredCellState.x + 0.5) * (100 / gridSize)}%`}
          y2={`${(hoveredCellState.y + 0.5) * (100 / gridSize)}%`}
          stroke="blue"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>
    )
  }

  // Обновить функцию renderSideMenu
  const renderSideMenu = () => {
    return (
      <div
        className={`fixed top-0 ${sideMenuOpen ? "left-0" : "-left-64"} h-full w-64 bg-white shadow-lg z-50 transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Меню</h2>
        </div>

        <div className="overflow-y-auto flex-grow">
          <div className="p-4 border-b">
            <h3 className="font-medium mb-2">Проекции</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">3D проекция</button>
              <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Проекция сверху</button>
              <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">
                Равноудаленная цилиндрическая
              </button>
            </div>
          </div>

          <div className="p-4 border-b">
            <h3 className="font-medium mb-2">Инструменты</h3>
            <div className="space-y-2">
              <button
                className={`w-full text-left px-2 py-1 hover:bg-gray-100 rounded ${activeAnalysisTool === "ruler" ? "bg-blue-100" : ""}`}
                onClick={() => setActiveAnalysisTool(activeAnalysisTool === "ruler" ? null : "ruler")}
              >
                Линейка
              </button>
              <button
                className={`w-full text-left px-2 py-1 hover:bg-gray-100 rounded ${activeAnalysisTool === "coordinates" ? "bg-blue-100" : ""}`}
                onClick={() => setActiveAnalysisTool(activeAnalysisTool === "coordinates" ? null : "coordinates")}
              >
                Просмотр координат
              </button>

              {/* Новый инструмент - Ограничение активной зоны */}
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">Ограничение активной зоны</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Checkbox
                      id="restrictionEnabled"
                      checked={restrictionEnabled}
                      onCheckedChange={() => setRestrictionEnabled(!restrictionEnabled)}
                    />
                    <label htmlFor="restrictionEnabled" className="ml-2 text-sm">
                      Включить ограничение
                    </label>
                  </div>

                  <div className="ml-2">
                    <div className="text-sm font-medium mb-1">Форма:</div>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="ellipseShape"
                          name="restrictionShape"
                          checked={restrictionShape === "ellipse"}
                          onChange={() => setRestrictionShape("ellipse")}
                          className="mr-1"
                        />
                        <label htmlFor="ellipseShape" className="text-sm">
                          Эллипс
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="polygonShape"
                          name="restrictionShape"
                          checked={restrictionShape === "polygon"}
                          onChange={() => setRestrictionShape("polygon")}
                          className="mr-1"
                        />
                        <label htmlFor="polygonShape" className="text-sm">
                          Полигон
                        </label>
                      </div>
                    </div>
                  </div>

                  {restrictionShape === "ellipse" && (
                    <div className="ml-2 space-y-2">
                      <div>
                        <label htmlFor="ellipseWidth" className="block text-sm">
                          Ширина:
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            id="ellipseWidth"
                            value={ellipseWidth}
                            onChange={(e) => setEllipseWidth(Number.parseInt(e.target.value) || 0)}
                            className="w-16 border rounded px-2 py-1 text-sm"
                          />
                          <span className="ml-1 text-sm">м</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="ellipseHeight" className="block text-sm">
                          Высота:
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            id="ellipseHeight"
                            value={ellipseHeight}
                            onChange={(e) => setEllipseHeight(Number.parseInt(e.target.value) || 0)}
                            className="w-16 border rounded px-2 py-1 text-sm"
                          />
                          <span className="ml-1 text-sm">м</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {restrictionShape === "polygon" && (
                    <div className="ml-2 space-y-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                        onClick={handleStartDrawPolygon}
                        disabled={drawingPolygon}
                      >
                        <span className="mr-1">📐</span> Нарисовать зону на карте
                      </button>

                      {polygonPoints.length > 0 && (
                        <div className="text-sm space-y-1">
                          <div>Выделенная зона: {restrictedArea} м²</div>
                          <div>Количество точек: {polygonPoints.length}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-b">
            <h3 className="font-medium mb-2">Слои</h3>
            <div className="space-y-2">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <button
                    className="text-left flex-grow px-2 py-1 hover:bg-gray-100 rounded text-sm truncate flex items-center"
                    onClick={() => handleLayerClick(layer)}
                    title={`${layer.name}\n${layer.description}`}
                  >
                    {getLayerIcon(layer.type)}
                    <span className="ml-2">{layer.name}</span>
                  </button>
                  <button 
                    className="ml-2 p-1 rounded hover:bg-gray-200" 
                    onClick={() => handleToggleLayer(`${baseName}_${layer.id}`)}
                  >
                    {layer.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          className="absolute -right-10 top-4 bg-white p-2 rounded-r shadow-md"
          onClick={() => setSideMenuOpen(!sideMenuOpen)}
        >
          {sideMenuOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    )
  }

  // Добавляем функцию для получения иконок слоев
  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'height':
        return '🗺️';
      case 'spectral':
        return '🌈';
      case 'slope':
        return '⛰️';
      case 'shadows':
        return '🌓';
      case 'ice':
        return '❄️';
      default:
        return '📍';
    }
  };

  // Обновим функцию renderRestrictions для правильной привязки к координатам и обработки активной/неактивной зоны

  const renderRestrictions = () => {
    if (!restrictionEnabled) return null

    if (restrictionShape === "ellipse") {
      // Рендерим эллипс в центре карты
      const centerX = gridSize / 2
      const centerY = gridSize / 2
      const radiusX = ellipseWidth / (2 * Math.sqrt(cellSize))
      const radiusY = ellipseHeight / (2 * Math.sqrt(cellSize))

      return (
        <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
          {/* Затемнение всей карты */}
          <defs>
            <mask id="ellipseMask">
              <rect width="100%" height="100%" fill="white" />
              <ellipse
                cx={`${centerX * (100 / gridSize)}%`}
                cy={`${centerY * (100 / gridSize)}%`}
                rx={`${radiusX * (100 / gridSize)}%`}
                ry={`${radiusY * (100 / gridSize)}%`}
                fill="black"
              />
            </mask>
          </defs>

          {/* Затемненная область (все кроме эллипса) */}
          <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" mask="url(#ellipseMask)" />

          {/* Граница эллипса */}
          <ellipse
            cx={`${centerX * (100 / gridSize)}%`}
            cy={`${centerY * (100 / gridSize)}%`}
            rx={`${radiusX * (100 / gridSize)}%`}
            ry={`${radiusY * (100 / gridSize)}%`}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      )
    }

    if (restrictionShape === "polygon" && polygonPoints.length > 2) {
      // Создаем SVG-путь для полигона
      const points = polygonPoints.map((p) => `${p.x * (100 / gridSize)}% ${p.y * (100 / gridSize)}%`).join(", ")

      return (
        <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
          <defs>
            <mask id="polygonMask">
              <rect width="100%" height="100%" fill="white" />
              <polygon points={points} fill="black" />
            </mask>
          </defs>

          {/* Затемненная область (все кроме полигона) */}
          <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" mask="url(#polygonMask)" />

          {/* Граница полигона */}
          <polygon points={points} fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />

          {/* Точки полигона */}
          {polygonPoints.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={`${point.x * (100 / gridSize)}%`}
              cy={`${point.y * (100 / gridSize)}%`}
              r="4"
              fill="white"
            />
          ))}
        </svg>
      )
    }

    return null
  }

  // Declare the missing render functions
  const renderSaveDialog = () => {
    return (
      <>
        {showSaveDialog ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
              <h2 className="text-xl font-bold mb-4">Сохранить проект</h2>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                Имя проекта
              </label>
              <input
                type="text"
                id="projectName"
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border mb-4"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setShowSaveDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveProject}>Сохранить</Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const renderLayerInfo = () => {
    return (
      <>
        {selectedLayerInfo ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
              <h2 className="text-xl font-bold mb-4">{selectedLayerInfo.name}</h2>
              <p className="text-gray-700 mb-4">{selectedLayerInfo.description}</p>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedLayerInfo(null)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const renderHelpDialog = () => {
    return (
      <>
        {showHelpDialog ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
              <h2 className="text-xl font-bold mb-4">Справка</h2>
              <p className="text-gray-700 mb-4">
                Используйте этот инструмент для планирования размещения инфраструктуры лунной базы. Выберите участок
                поверхности, тип инфраструктуры и дополнительные параметры.
              </p>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowHelpDialog(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const renderLoadProjectDialog = () => {
    return (
      <>
        {showLoadProjectDialog ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
              <h2 className="text-xl font-bold mb-4">Загрузить проект</h2>
              {savedProjects.length > 0 ? (
                <div className="space-y-2">
                  {savedProjects.map((project) => (
                    <div key={project.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div>{project.name}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleLoadProject(project.id)}>
                          Загрузить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Нет сохраненных проектов</p>
              )}
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setShowLoadProjectDialog(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const renderObjectInfoDialog = () => {
    return (
      <>
        {selectedObjectInfo ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
              <h2 className="text-xl font-bold mb-4">{selectedObjectInfo.name}</h2>
              <p className="text-gray-700 mb-4">
                Тип: {selectedObjectInfo.type}
                <br />
                Координаты: {selectedObjectInfo.x}, {selectedObjectInfo.y}
              </p>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setSelectedObjectInfo(null)}>
                  Закрыть
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteObject(selectedObjectInfo.id)}>
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const renderUploadDialog = () => {
    return (
      <>
        {showUploadDialog ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
              <h2 className="text-xl font-bold mb-4">Загрузить рельеф</h2>
              <p className="text-gray-700 mb-4">Вы можете загрузить данные о рельефе в формате GeoTIFF.</p>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setShowUploadDialog(false)}>
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    setShowUploadDialog(false)
                    setUploadedAreas([...uploadedAreas, selectedArea])
                  }}
                >
                  Загрузить
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }
  
  // Add terrain upload dialog renderer
  const renderTerrainUploadDialog = () => {
    return (
      <>
        {showTerrainDialog ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
              <h2 className="text-xl font-bold mb-4">Загрузить рельеф</h2>
              <p className="text-gray-700 mb-4">Вы можете загрузить данные о рельефе в формате GeoTIFF.</p>
              
              <div className="mb-4">
                <label htmlFor="terrainName" className="block text-sm font-medium text-gray-700 mb-1">
                  Имя участка
                </label>
                <input
                  type="text"
                  id="terrainName"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={terrainUploadName}
                  onChange={(e) => setTerrainUploadName(e.target.value)}
                  placeholder="Введите название участка"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Выберите файл GeoTIFF
                </label>
                <div 
                  className={`border border-dashed border-gray-300 rounded-md p-4 text-center ${selectedFile ? 'bg-blue-50' : ''}`}
                  onDrop={(e) => handleFileDrop(e, 'terrain')}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    id="terrainFile"
                    className="hidden"
                    accept=".tif,.tiff,.geotiff"
                    onChange={(e) => handleFileSelect(e, 'terrain')}
                  />
                  <label 
                    htmlFor="terrainFile" 
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer inline-block"
                  >
                    Выбрать файл
                  </label>
                  <p className="text-sm text-gray-500 mt-2">или перетащите файл сюда</p>
                  
                  {selectedFile && (
                    <div className="mt-2 text-sm text-blue-600 flex items-center justify-center">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="truncate max-w-[250px]" title={selectedFile.name}>
                        {selectedFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2" 
                  onClick={() => {
                    setShowTerrainDialog(false)
                    setSelectedFile(null)
                    setTerrainUploadName("")
                  }}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleUploadTerrain}
                  disabled={!selectedFile || !terrainUploadName.trim()}
                >
                  Загрузить
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }
  
  // Add metadata upload dialog renderer
  const renderMetadataUploadDialog = () => {
    return (
      <>
        {showMetadataDialog ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
              <h2 className="text-xl font-bold mb-4">Загрузить метаданные</h2>
              <p className="text-gray-700 mb-4">Вы можете загрузить метаданные в формате TIFF Tags.</p>
              
              <div className="mb-4">
                <label htmlFor="metadataName" className="block text-sm font-medium text-gray-700 mb-1">
                  Имя метаданных
                </label>
                <input
                  type="text"
                  id="metadataName"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={metadataUploadName}
                  onChange={(e) => setMetadataUploadName(e.target.value)}
                  placeholder="Введите название метаданных"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Выберите файл с метаданными
                </label>
                <div 
                  className={`border border-dashed border-gray-300 rounded-md p-4 text-center ${selectedMetadataFile ? 'bg-blue-50' : ''}`}
                  onDrop={(e) => handleFileDrop(e, 'metadata')}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    id="metadataFile"
                    className="hidden"
                    accept=".tif,.tiff,.xml,.json"
                    onChange={(e) => handleFileSelect(e, 'metadata')}
                  />
                  <label 
                    htmlFor="metadataFile" 
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer inline-block"
                  >
                    Выбрать файл
                  </label>
                  <p className="text-sm text-gray-500 mt-2">или перетащите файл сюда</p>
                  
                  {selectedMetadataFile && (
                    <div className="mt-2 text-sm text-blue-600 flex items-center justify-center">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="truncate max-w-[250px]" title={selectedMetadataFile.name}>
                        {selectedMetadataFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2" 
                  onClick={() => {
                    setShowMetadataDialog(false)
                    setSelectedMetadataFile(null)
                    setMetadataUploadName("")
                  }}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleUploadMetadata}
                  disabled={!selectedMetadataFile || !metadataUploadName.trim()}
                >
                  Загрузить
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }
  
  // Add metadata editor dialog renderer
  const renderMetadataEditorDialog = () => {
    return (
      <>
        {showMetadataEditor && selectedMetadata ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-w-[90%] max-h-[90vh] flex flex-col">
              <h2 className="text-xl font-bold mb-4">Редактирование метаданных: {selectedMetadata.name}</h2>
              
              <div className="flex-grow overflow-y-auto mb-4">
                <textarea
                  className="w-full h-[400px] border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  value={editableMetadata}
                  onChange={(e) => setEditableMetadata(e.target.value)}
                />
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <p>Здесь вы можете редактировать метаданные в формате JSON. Внесите необходимые изменения и нажмите "Сохранить".</p>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setShowMetadataEditor(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveMetadata}>
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  useEffect(() => {
    // Set initial sideMenuOpen state based on screen width
    const handleResize = () => {
      setSideMenuOpen(window.innerWidth >= 768)
    }

    // Call handleResize on mount
    handleResize()

    // Add event listener for window resize
    window.addEventListener("resize", handleResize)

    // Clean up event listener on unmount
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Add new handler functions for terrain upload
  const handleUploadTerrain = () => {
    if (!terrainUploadName.trim()) {
      alert("Пожалуйста, введите имя участка")
      return
    }

    if (!selectedFile) {
      alert("Пожалуйста, выберите файл")
      return
    }

    // Create new terrain upload with 0% progress
    const newTerrainUpload: TerrainUpload = {
      id: `terrain_${Date.now()}`,
      name: terrainUploadName,
      date: new Date().toLocaleDateString(),
      loaded: false,
      progress: 0,
      heightDataLoaded: false,
      spectralDataLoaded: false,
      iceDataLoaded: false
    }

    // Add to terrain uploads
    const updatedTerrainUploads = [...terrainUploads, newTerrainUpload];
    setTerrainUploads(updatedTerrainUploads);
    
    // Start simulated upload process
    setUploadProgress(0)
    setCurrentUploadType("terrain")
    
    // Keep track of the current upload index
    const currentUploadIndex = updatedTerrainUploads.length - 1;
    
    // Simulate file processing with progress
    const simulateUpload = (currentProgress = 0) => {
      if (currentProgress <= 100) {
        setUploadProgress(currentProgress)
        
        // Update the progress of the current terrain upload
        setTerrainUploads(prev => {
          const updated = [...prev];
          if (updated[currentUploadIndex]) {
            updated[currentUploadIndex].progress = currentProgress;
          }
          return updated;
        });
        
        // Simulate processing phases
        if (currentProgress >= 30 && !updatedTerrainUploads[currentUploadIndex].heightDataLoaded) {
          setTerrainUploads(prev => {
            const updated = [...prev]
            if (updated[currentUploadIndex]) {
              updated[currentUploadIndex].heightDataLoaded = true
            }
            return updated
          })
        }
        
        if (currentProgress >= 60 && !updatedTerrainUploads[currentUploadIndex].spectralDataLoaded) {
          setTerrainUploads(prev => {
            const updated = [...prev]
            if (updated[currentUploadIndex]) {
              updated[currentUploadIndex].spectralDataLoaded = true
            }
            return updated
          })
        }
        
        if (currentProgress >= 90 && !updatedTerrainUploads[currentUploadIndex].iceDataLoaded) {
          setTerrainUploads(prev => {
            const updated = [...prev]
            if (updated[currentUploadIndex]) {
              updated[currentUploadIndex].iceDataLoaded = true
            }
            return updated
          })
        }
        
        // Mark as completed when done
        if (currentProgress === 100) {
          setTerrainUploads(prev => {
            const updated = [...prev]
            if (updated[currentUploadIndex]) {
              updated[currentUploadIndex].loaded = true;
              updated[currentUploadIndex].progress = 100;
            }
            return updated
          })
          
          // Automatically select the newly uploaded terrain
          setSelectedArea(terrainUploadName)
          if (!selectedAreas.includes(terrainUploadName)) {
            setSelectedAreas([...selectedAreas, terrainUploadName])
          }
          
          setCurrentUploadType(null)
          setShowTerrainDialog(false)
          setTerrainUploadName("") // Clear the input field for next upload
          setSelectedFile(null) // Clear selected file
          
          // Don't reset the upload progress - it should remain at 100%
        }
        
        setTimeout(() => simulateUpload(currentProgress + 5), 200)
      }
    }
    
    simulateUpload()
  }
  
  // Add handler for metadata upload
  const handleUploadMetadata = () => {
    if (!metadataUploadName.trim()) {
      alert("Пожалуйста, введите имя метаданных")
      return
    }
    
    if (!selectedMetadataFile) {
      alert("Пожалуйста, выберите файл")
      return
    }
    
    // Create sample metadata from TIFF
    const sampleMetadata = {
      ImageWidth: 2048,
      ImageLength: 2048,
      BitsPerSample: 32,
      Compression: "None",
      PhotometricInterpretation: "BlackIsZero",
      SamplesPerPixel: 1,
      PlanarConfiguration: "Contig",
      SampleFormat: "IEEEFP",
      ModelTiePointTag: [0, 0, 0, -80.5, -88.2, 0],
      ModelPixelScaleTag: [0.01, 0.01, 0],
      GeoAsciiParamsTag: "WGS 84|WGS 84|",
      GeoDoubleParamsTag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      GeoKeyDirectoryTag: [1, 1, 0, 15],
      GDAL_METADATA: "<GDALMetadata><Item name='AREA_OR_POINT'>Area</Item><Item name='altitude'>800</Item><Item name='illumination'>78</Item><Item name='slope'>2.3</Item><Item name='soil_type'>реголитовый</Item></GDALMetadata>",
      DateTime: new Date().toISOString(),
      Software: "Lunar Terrain Processor v2.3",
      CopyrightNotice: "© NASA/LRO 2023",
      FileName: selectedMetadataFile.name
    }
    
    const newMetadata: Metadata = {
      id: `metadata_${Date.now()}`,
      name: metadataUploadName,
      date: new Date().toLocaleDateString(),
      data: sampleMetadata
    }
    
    // Preserve the uploaded metadata
    const updatedMetadataUploads = [...metadataUploads, newMetadata];
    setMetadataUploads(updatedMetadataUploads)
    
    // Close dialog but don't reset selections immediately
    // This ensures data will be displayed properly
    setShowMetadataDialog(false)
    
    // Schedule clearing the form after a brief delay
    // This ensures the user can see the success before the form is cleared
    setTimeout(() => {
      setMetadataUploadName("")
      setSelectedMetadataFile(null)
    }, 500)
  }

  // Add handler for file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'terrain' | 'metadata') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (type === 'terrain') {
        setSelectedFile(files[0]);
        
        // Создаем FormData для отправки файла
        const formData = new FormData();
        formData.append('file', files[0]);
        
        try {
          // Отправляем файл на сервер для обработки
          const response = await fetch('/api/process-image', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error('Ошибка при обработке изображения');
          }
          
          const result = await response.json();
          const newBaseName = files[0].name.replace(/\.[^/.]+$/, ""); // Получаем имя файла без расширения
          setBaseName(newBaseName); // Шаг 2: Обновляем состояние baseName
          console.log("Base Name set to:", newBaseName); // Логирование для проверки
          
          const newLayers: Layer[] = [
            {
              id: "elevation",
              name: "Рельеф местности",
              description: "Отображает высоту поверхности Луны. Темные области - низменности, светлые - возвышенности.",
              enabled: true,
              imagePath: `/output/layers/${baseName}_elevation.png`, // Обновлено
              rawImagePath: `/output/images/${baseName}_elevation.png`, // Обновлено
              type: "height",
              isActive: true,
            },
            {
              id: "slope",
              name: "Наклон поверхности",
              description: "Отображает угол наклона поверхности. Полезно для определения пригодности участка для строительства.",
              enabled: false,
              imagePath: `/output/layers/${baseName}_slope.png`, // Обновлено
              rawImagePath: `/output/images/${baseName}_slope.png`, // Обновлено
              type: "slope",
              isActive: false,
            },
            {
              id: "illumination",
              name: "Освещенность",
              description: "Показывает уровень освещенности поверхности.",
              enabled: false,
              imagePath: `/output/layers/${baseName}_illumination.png`, // Обновлено
              rawImagePath: `/output/images/${baseName}_illumination.png`, // Обновлено
              type: "spectral",
              isActive: false,
            },
            {
              id: "shadows",
              name: "Тени",
              description: "Показывает затененные участки поверхности.",
              enabled: false,
              imagePath: `/output/layers/${baseName}_shadows.png`, // Обновлено
              rawImagePath: `/output/images/${baseName}_shadows.png`, // Обновлено
              type: "shadows",
              isActive: false,
            },
            {
              id: "ice",
              name: "Ледяные отложения",
              description: "Показывает предполагаемые места скопления водяного льда в кратерах.",
              enabled: false,
              imagePath: `/output/layers/${baseName}_ice_probability.png`, // Обновлено
              rawImagePath: `/output/images/${baseName}_ice_probability.png`, // Обновлено
              type: "ice",
              isActive: false,
            }
          ];
          
          console.log("Пути обновились!")
          setLayers(newLayers);
          
          // Показываем сообщение об успехе
          setErrorMessage("✅ Изображение успешно обработано");
          setTimeout(() => setErrorMessage(null), 3000);
          
        } catch (error) {
          console.error('Error:', error);
          setErrorMessage("❌ Ошибка при обработке изображения");
          setTimeout(() => setErrorMessage(null), 3000);
        }
      } else {
        setSelectedMetadataFile(files[0]);
      }
    }
  };

  // Add handler for file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, type: 'terrain' | 'metadata') => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      if (type === 'terrain') {
        setSelectedFile(files[0])
      } else {
        setSelectedMetadataFile(files[0])
      }
    }
  }

  // Add handler for drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Add handler for metadata editing
  const handleEditMetadata = (metadata: Metadata) => {
    setSelectedMetadata(metadata)
    setEditableMetadata(JSON.stringify(metadata.data, null, 2))
    setShowMetadataEditor(true)
  }
  
  // Add handler for saving edited metadata
  const handleSaveMetadata = () => {
    if (!selectedMetadata) return
    
    try {
      const parsedMetadata = JSON.parse(editableMetadata)
      
      const updatedMetadataUploads = metadataUploads.map(m => 
        m.id === selectedMetadata.id 
          ? { ...m, data: parsedMetadata } 
          : m
      )
      
      setMetadataUploads(updatedMetadataUploads)
      setShowMetadataEditor(false)
      setSelectedMetadata(null)
      setEditableMetadata("")
    } catch (error) {
      alert("Ошибка в формате JSON. Пожалуйста, проверьте данные.")
    }
  }

  // Add localStorage functionality to load saved state on component mount
  useEffect(() => {
    // Helper function to safely parse localStorage items
    const getSavedItem = <T,>(key: string, defaultValue: T): T => {
      try {
        const savedItem = localStorage.getItem(key);
        return savedItem ? JSON.parse(savedItem) : defaultValue;
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
      }
    };

    // Load state from localStorage
    setSelectedArea(getSavedItem('moonMap.selectedArea', 'shackleton'));
    setSelectedAreas(getSavedItem('moonMap.selectedAreas', ['shackleton']));
    setPlacedObjects(getSavedItem('moonMap.placedObjects', []));
    setRoutes(getSavedItem('moonMap.routes', []));
    setMeasurements(getSavedItem('moonMap.measurements', []));
    setSavedProjects(getSavedItem('moonMap.savedProjects', []));
    setCurrentProjectId(getSavedItem('moonMap.currentProjectId', null));
    setMapZoom(getSavedItem('moonMap.mapZoom', 1));
    setMapPosition(getSavedItem('moonMap.mapPosition', { x: 0, y: 0 }));
    setLayers(getSavedItem('moonMap.layers', layers));
    setSideMenuOpen(getSavedItem('moonMap.sideMenuOpen', true));
    setResourceSettings(getSavedItem('moonMap.resourceSettings', resourceSettings));
    setResourceStatus(getSavedItem('moonMap.resourceStatus', resourceStatus));
    setResourceAdvice(getSavedItem('moonMap.resourceAdvice', resourceAdvice));
    setAreaFilters(getSavedItem('moonMap.areaFilters', areaFilters));
    setObjectParams(getSavedItem('moonMap.objectParams', objectParams));
    setRestrictedArea(getSavedItem('moonMap.restrictedArea', 0));
    setRestrictedArea(getSavedItem('moonMap.restrictedArea', 0));
    setRestrictionShape(getSavedItem('moonMap.restrictionShape', 'ellipse'));
    setRestrictionEnabled(getSavedItem('moonMap.restrictionEnabled', false));
    setEllipseWidth(getSavedItem('moonMap.ellipseWidth', 120));
    setEllipseHeight(getSavedItem('moonMap.ellipseHeight', 60));
    setPolygonPoints(getSavedItem('moonMap.polygonPoints', []));
    setTerrainUploads(getSavedItem('moonMap.terrainUploads', []));
    setMetadataUploads(getSavedItem('moonMap.metadataUploads', []));
    setUploadedAreas(getSavedItem('moonMap.uploadedAreas', []));
  }, []);

  // Save placed objects whenever they change
  useEffect(() => {
    localStorage.setItem('moonMap.placedObjects', JSON.stringify(placedObjects));
  }, [placedObjects]);

  // Save routes whenever they change
  useEffect(() => {
    localStorage.setItem('moonMap.routes', JSON.stringify(routes));
  }, [routes]);

  // Save measurements whenever they change
  useEffect(() => {
    localStorage.setItem('moonMap.measurements', JSON.stringify(measurements));
  }, [measurements]);

  // Save projects whenever they change
  useEffect(() => {
    localStorage.setItem('moonMap.savedProjects', JSON.stringify(savedProjects));
    if (currentProjectId) {
      localStorage.setItem('moonMap.currentProjectId', JSON.stringify(currentProjectId));
    }
  }, [savedProjects, currentProjectId]);

  // Save map settings whenever they change
  useEffect(() => {
    localStorage.setItem('moonMap.mapZoom', JSON.stringify(mapZoom));
    localStorage.setItem('moonMap.mapPosition', JSON.stringify(mapPosition));
  }, [mapZoom, mapPosition]);

  // Save side menu state
  useEffect(() => {
    localStorage.setItem('moonMap.sideMenuOpen', JSON.stringify(sideMenuOpen));
  }, [sideMenuOpen]);

  // Save selected areas
  useEffect(() => {
    localStorage.setItem('moonMap.selectedArea', JSON.stringify(selectedArea));
    localStorage.setItem('moonMap.selectedAreas', JSON.stringify(selectedAreas));
  }, [selectedArea, selectedAreas]);

  // Save layers state
  useEffect(() => {
    localStorage.setItem('moonMap.layers', JSON.stringify(layers));
  }, [layers]);

  // Save resource settings and status
  useEffect(() => {
    localStorage.setItem('moonMap.resourceSettings', JSON.stringify(resourceSettings));
    localStorage.setItem('moonMap.resourceStatus', JSON.stringify(resourceStatus));
    localStorage.setItem('moonMap.resourceAdvice', JSON.stringify(resourceAdvice));
  }, [resourceSettings, resourceStatus, resourceAdvice]);

  // Save area filters and object params
  useEffect(() => {
    localStorage.setItem('moonMap.areaFilters', JSON.stringify(areaFilters));
    localStorage.setItem('moonMap.objectParams', JSON.stringify(objectParams));
  }, [areaFilters, objectParams]);

  // Save restriction settings
  useEffect(() => {
    localStorage.setItem('moonMap.restrictionEnabled', JSON.stringify(restrictionEnabled));
    localStorage.setItem('moonMap.restrictionShape', JSON.stringify(restrictionShape));
    localStorage.setItem('moonMap.ellipseWidth', JSON.stringify(ellipseWidth));
    localStorage.setItem('moonMap.ellipseHeight', JSON.stringify(ellipseHeight));
    localStorage.setItem('moonMap.polygonPoints', JSON.stringify(polygonPoints));
    localStorage.setItem('moonMap.restrictedArea', JSON.stringify(restrictedArea));
  }, [restrictionEnabled, restrictionShape, ellipseWidth, ellipseHeight, polygonPoints, restrictedArea]);

  // Save terrain and metadata uploads
  useEffect(() => {
    localStorage.setItem('moonMap.terrainUploads', JSON.stringify(terrainUploads));
    localStorage.setItem('moonMap.uploadedAreas', JSON.stringify(uploadedAreas));
  }, [terrainUploads, uploadedAreas]);

  useEffect(() => {
    localStorage.setItem('moonMap.metadataUploads', JSON.stringify(metadataUploads));
  }, [metadataUploads]);

  // Add cleanup for hover timer in useEffect
  useEffect(() => {
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
    }
  }, [hoverTimer])

  // Add new state for tile data
  const [areaData, setAreaData] = useState<AreaData | null>(null)
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null)

  // Add a function to load tile data based on selected area
  const loadAreaData = async (area: string) => {
    try {
      const response = await fetch(`/api/lunar-data?area=${area}`)
      if (!response.ok) {
        console.error(`Failed to load data for area ${area}`)
        return
      }
      const tiles = await response.json()
      setAreaData({
        name: area,
        description: `Данные для участка ${area}`,
        gridSize: 500,
        tiles: tiles
      })
    } catch (error) {
      console.error(`Error loading area data: ${error}`)
    }
  }
  
  // Update when selectedArea changes
  useEffect(() => {
    if (selectedArea) {
      loadAreaData(selectedArea)
    }
  }, [selectedArea])

  // В основном компоненте добавляем состояние для модального окна
  const [showTileModal, setShowTileModal] = useState(false);

  // Добавляем состояние для отображения координат при наведении
  const [hoveredTileInfo, setHoveredTileInfo] = useState<{
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  } | null>(null);

  // Добавляем компонент для отображения координат при наведении
  const renderHoveredTileInfo = () => {
    if (!hoveredTileInfo || !hoveredCellState || activeAnalysisTool !== "coordinates") return null;

    return (
      <div
        className="absolute bg-white px-2 py-1 rounded shadow-md text-xs z-50 pointer-events-none"
        style={{
          left: `${(hoveredCellState.x + 0.5) * (100 / 25)}%`,
          top: `${(hoveredCellState.y + 0.5) * (100 / 25)}%`,
          transform: "translate(-50%, -150%)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div className="font-medium">Координаты пикселей:</div>
        <div>X: {hoveredTileInfo.x_min}-{hoveredTileInfo.x_max}</div>
        <div>Y: {hoveredTileInfo.y_min}-{hoveredTileInfo.y_max}</div>
      </div>
    );
  };

  // Удаляем старый код renderTileInfo и showTileInfo
  // Добавляем новый компонент для отображения координат при наведении
  const HoveredTileInfo = ({ tile, position }: { 
    tile: { 
      pixel_coords: { 
        x_min: number; 
        x_max: number; 
        y_min: number; 
        y_max: number; 
      } 
    } | null; 
    position: { x: number; y: number } | null;
  }) => {
    if (!tile || !position || !tile.pixel_coords) return null;

    return (
      <div
        className="absolute bg-white px-2 py-1 rounded shadow-md text-xs z-50 pointer-events-none"
        style={{
          left: `${(position.x + 0.5) * (100 / 25)}%`,
          top: `${(position.y + 0.5) * (100 / 25)}%`,
          transform: "translate(-50%, -150%)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div className="font-medium">Координаты пикселей:</div>
        <div>X: {tile.pixel_coords.x_min}-{tile.pixel_coords.x_max}</div>
        <div>Y: {tile.pixel_coords.y_min}-{tile.pixel_coords.y_max}</div>
      </div>
    );
  };

  // В основном компоненте добавляем состояние для отображения координат при наведении
  const [hoveredTile, setHoveredTile] = useState<TileData | null>(null);

  // В основном компоненте добавляем состояния для просмотра изображений
  const [selectedImage, setSelectedImage] = useState<{path: string; title: string} | null>(null);

  // Добавляем эффект для обновления путей к изображениям при изменении selectedArea
  useEffect(() => {
    if (selectedArea) {
      setLayers(prevLayers => prevLayers.map(layer => {
        let filename;
        switch (layer.type) {
          case 'height':
            filename = 'elevation';
            break;
          case 'spectral':
            filename = 'illumination';
            break;
          case 'slope':
            filename = 'slope';
            break;
          case 'ice':
            filename = 'ice_probability';
            break;
          case 'shadows':
            filename = 'shadows';
            break;
          default:
            filename = layer.type;
        }
        return {
          ...layer,
          imagePath: `/output/layers/${selectedArea}_${filename}.png`
        };
      }));
    }
  }, [selectedArea]);

  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  // Обновляем обработчик клика на слой в боковом меню
  const handleLayerClick = (layer: Layer) => {
    console.log('Viewing layer with legend:', layer.id, 'using imagePath:', layer.imagePath);
    setSelectedImage({ 
      path: `/output/layers/${baseName}_${layer.id}.png`,
      title: layer.name 
    });
  };

  // Добавляем эффект для начального центрирования
  useEffect(() => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const initialX = (rect.width - TOTAL_SIZE) / 2;
      const initialY = (rect.height - TOTAL_SIZE) / 2;
      
      setMapPosition({
        x: initialX,
        y: initialY
      });
    }
  }, []);

  // Добавить после других useState:
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });

  // Добавить useEffect для обновления windowSize:
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Добавляем функцию проверки файлов
  const checkInputFiles = async () => {
    try {
      const response = await fetch('/api/check-input-files');
      if (!response.ok) {
        throw new Error('Failed to check input files');
      }
      const data = await response.json();
      
      // Обновляем список загруженных файлов
      const newTerrainUploads = data.files.map((file: { name: string, fullName: string }) => ({
        id: `terrain_${file.name}`,
        name: file.name,
        date: new Date().toLocaleDateString(),
        loaded: true,
        progress: 100,
        heightDataLoaded: true,
        spectralDataLoaded: true,
        iceDataLoaded: true
      }));
      
      setTerrainUploads(newTerrainUploads);
    } catch (error) {
      console.error('Error checking input files:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/" className="text-xl font-bold">
              🌕 Планировщик лунной базы
            </Link>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="font-medium">
              Главная
            </Link>
            <Link href="/moon-map" className="font-medium text-blue-600">
              Конструктор
            </Link>
            <Link href="/spectral-analysis" className="font-medium">
              Спектральный анализ
            </Link>
            <Link href="/requirements" className="font-medium">
              Требования к модулям
            </Link>
          </nav>
          <button className="md:hidden">Меню</button>
        </div>
      </header>

      <main className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Конструктор «Создание лунной базы»</h1>
            <p className="text-gray-600">
              Интерактивный инструмент для проектирования размещения инфраструктуры лунной базы с учетом реальных
              условий поверхности Луны.
            </p>
          </div>

          {/* Data Loading Panel */}
          <div className="mb-8 border rounded-lg p-6 shadow-sm bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Загрузка данных</h2>
              <Link href="/spectral-analysis" className="text-sm text-blue-600 hover:underline flex items-center">
                <span className="mr-1">ℹ️</span> О спектральном анализе
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <p className="text-gray-600 mb-4">
                  Выберите участок Южного полюса Луны для загрузки детальных данных о рельефе поверхности. Вы можете
                  выбрать несколько участков для планирования сложной базы. Данные включают высотные отметки,
                  спектральный анализ и информацию о наличии водяного льда.
                </p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    className={`px-4 py-2 ${
                      selectedAreas.includes("shackleton") 
                        ? "bg-blue-600 text-white" 
                        : filtersApplied && areaFilters.sunlight
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" 
                          : "bg-gray-100 text-gray-800"
                    } rounded-md hover:${filtersApplied && areaFilters.sunlight ? "" : "bg-blue-200"} transition-colors`}
                    onClick={() => {
                      // Если фильтр освещенности применен, то кратер Шеклтон недоступен
                      if (filtersApplied && areaFilters.sunlight) return;
                      
                      // Toggle selection for multi-select
                      if (selectedAreas.includes("shackleton")) {
                        setSelectedAreas(selectedAreas.filter(area => area !== "shackleton"))
                      } else {
                        setSelectedAreas([...selectedAreas, "shackleton"])
                      }
                      setSelectedArea("shackleton")
                    }}
                    disabled={filtersApplied && areaFilters.sunlight}
                  >
                    Кратер Шеклтон
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      selectedAreas.includes("cabeus") 
                        ? "bg-blue-600 text-white" 
                        : filtersApplied && areaFilters.sunlight
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" 
                          : "bg-gray-100 text-gray-800"
                    } rounded-md hover:${filtersApplied && areaFilters.sunlight ? "" : "bg-blue-200"} transition-colors`}
                    onClick={() => {
                      // Если фильтр освещенности применен, то кратер Кабеус недоступен
                      if (filtersApplied && areaFilters.sunlight) return;
                      
                      if (selectedAreas.includes("cabeus")) {
                        setSelectedAreas(selectedAreas.filter(area => area !== "cabeus"))
                      } else {
                        setSelectedAreas([...selectedAreas, "cabeus"])
                      }
                      setSelectedArea("cabeus")
                    }}
                    disabled={filtersApplied && areaFilters.sunlight}
                  >
                    Кратер Кабеус
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      selectedAreas.includes("haworth") 
                        ? "bg-blue-600 text-white" 
                        : filtersApplied && areaFilters.sunlight
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" 
                          : "bg-gray-100 text-gray-800"
                    } rounded-md hover:${filtersApplied && areaFilters.sunlight ? "" : "bg-blue-200"} transition-colors`}
                    onClick={() => {
                      // Если фильтр освещенности применен, то плато Хаворт недоступно
                      if (filtersApplied && areaFilters.sunlight) return;
                      
                      if (selectedAreas.includes("haworth")) {
                        setSelectedAreas(selectedAreas.filter(area => area !== "haworth"))
                      } else {
                        setSelectedAreas([...selectedAreas, "haworth"])
                      }
                      setSelectedArea("haworth")
                    }}
                    disabled={filtersApplied && areaFilters.sunlight}
                  >
                    Плато Хаворт
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      selectedAreas.includes("malapert") || (filtersApplied && areaFilters.sunlight) 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-800"
                    } rounded-md hover:bg-blue-200 transition-colors`}
                    onClick={() => {
                      if (selectedAreas.includes("malapert")) {
                        // Если фильтр освещенности применен, нельзя снять выбор с горы Малаперт
                        if (filtersApplied && areaFilters.sunlight) return;
                        
                        setSelectedAreas(selectedAreas.filter(area => area !== "malapert"))
                      } else {
                        setSelectedAreas([...selectedAreas, "malapert"])
                      }
                      setSelectedArea("malapert")
                    }}
                  >
                    Гора Малаперт
                  </button>
                  
                  {/* Display uploaded terrain areas as buttons with the same style */}
                  {terrainUploads.map((upload) => (
                    <button
                      key={upload.id}
                      className={`px-4 py-2 ${
                        selectedAreas.includes(upload.name) 
                          ? "bg-blue-600 text-white" 
                          : filtersApplied && areaFilters.sunlight
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" 
                            : "bg-gray-100 text-gray-800"
                      } rounded-md hover:${filtersApplied && areaFilters.sunlight ? "" : "bg-blue-200"} transition-colors`}
                      onClick={() => {
                        // Если фильтр освещенности применен, то загруженные участки недоступны
                        if (filtersApplied && areaFilters.sunlight) return;
                        
                        if (selectedAreas.includes(upload.name)) {
                          setSelectedAreas(selectedAreas.filter(area => area !== upload.name))
                        } else {
                          setSelectedAreas([...selectedAreas, upload.name])
                        }
                        setSelectedArea(upload.name)
                      }}
                      disabled={filtersApplied && areaFilters.sunlight}
                    >
                      {upload.name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setShowTerrainDialog(true)}
                  >
                    Загрузить рельеф
                  </button>
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setShowMetadataDialog(true)}
                  >
                    Загрузить метаданные
                  </button>
                  <button
                    className="px-6 py-2 ml-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setShowLoadProjectDialog(true)}
                  >
                    Загрузить сохранение
                  </button>
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={checkInputFiles}
                  >
                    Обновить список
                  </button>
                  <div>
                    <span className="text-green-600 flex items-center">
                      <Check className="h-5 w-5 mr-1" />
                      Данные для{" "}
                      {selectedAreas.length > 1 
                        ? "выбранных участков" 
                        : selectedArea === "shackleton"
                          ? "Кратера Шеклтон"
                          : selectedArea === "cabeus"
                            ? "Кратера Кабеус"
                            : selectedArea === "haworth"
                              ? "Плато Хаворт"
                              : selectedArea === "malapert"
                                ? "Горы Малаперт"
                                : selectedArea}{" "}
                      загружены
                    </span>

                    {metadataUploads.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Метаданные:</p>
                        <ul className="mt-1 space-y-1">
                          {metadataUploads.map((metadata) => (
                            <li key={metadata.id} className="text-sm text-green-600 flex items-center justify-between">
                              <div className="flex items-center">
                                <Check className="h-4 w-4 mr-1" />
                                {metadata.name}
                              </div>
                              <button 
                                className="text-blue-600 text-xs hover:underline"
                                onClick={() => handleEditMetadata(metadata)}
                              >
                                Редактировать
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 flex flex-col justify-center items-center">
                <div className="text-gray-500 mb-2">Прогресс загрузки данных</div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ 
                      width: currentUploadType === "terrain" 
                        ? `${uploadProgress}%` 
                        : terrainUploads.length > 0 
                          ? `${terrainUploads[terrainUploads.length - 1].progress}%` 
                          : "0%" 
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {currentUploadType === "terrain" 
                    ? `Загружено: ${uploadProgress}%`
                    : terrainUploads.length > 0
                      ? `Загружено: ${terrainUploads[terrainUploads.length - 1].progress}%`
                      : "Загружено: 0%"}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 w-full">
                  <div className={`p-2 rounded text-center text-xs ${
                    terrainUploads.length > 0 && terrainUploads[terrainUploads.length - 1].heightDataLoaded 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    Высота
                  </div>
                  <div className={`p-2 rounded text-center text-xs ${
                    terrainUploads.length > 0 && terrainUploads[terrainUploads.length - 1].spectralDataLoaded 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    Спектр
                  </div>
                  <div className={`p-2 rounded text-center text-xs ${
                    terrainUploads.length > 0 && terrainUploads[terrainUploads.length - 1].iceDataLoaded 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    Лед
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Area Filter Panel */}
          <div className="mb-8 border rounded-lg p-6 shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🏗️</span> Выбрать зону по условиям
            </h2>
            <p className="text-gray-600 mb-4">
              Отметьте необходимые условия для фильтрации подходящих участков на карте. Неподходящие участки будут
              затемнены, а подходящие подсвечены.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="sunlight"
                  checked={areaFilters.sunlight}
                  onCheckedChange={() => handleAreaFilterChange("sunlight")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="sunlight"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    🌞 Максимальная освещенность
                  </label>
                  <p className="text-xs text-muted-foreground">Более 90% солнечного дня</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="iceProximity"
                  checked={areaFilters.iceProximity}
                  onCheckedChange={() => handleAreaFilterChange("iceProximity")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="iceProximity"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    ❄️ Близость к залежам льда
                  </label>
                  <p className="text-xs text-muted-foreground">Для добывающих установок и жизнеобеспечения</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="flatTerrain"
                  checked={areaFilters.flatTerrain}
                  onCheckedChange={() => handleAreaFilterChange("flatTerrain")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="flatTerrain"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    🏔️ Ровный рельеф
                  </label>
                  <p className="text-xs text-muted-foreground">Наклон ≤7°</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="lavaTubes"
                  checked={areaFilters.lavaTubes}
                  onCheckedChange={() => handleAreaFilterChange("lavaTubes")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="lavaTubes"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    🌋 Наличие лавовых труб
                  </label>
                  <p className="text-xs text-muted-foreground">Подземные пещеры для естественной защиты</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="spaceportDistance"
                  checked={areaFilters.spaceportDistance}
                  onCheckedChange={() => handleAreaFilterChange("spaceportDistance")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="spaceportDistance"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    🚀 Удаленность от космодрома
                  </label>
                  <p className="text-xs text-muted-foreground">≥5 км для предотвращения вибраций</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="sufficientArea"
                  checked={areaFilters.sufficientArea}
                  onCheckedChange={() => handleAreaFilterChange("sufficientArea")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="sufficientArea"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    🏗️ Достаточная площадь
                  </label>
                  <p className="text-xs text-muted-foreground">≥1000 м² для крупных объектов</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => {
                  setAreaFilters({
                    sunlight: false,
                    iceProximity: false,
                    flatTerrain: false,
                    lavaTubes: false,
                    spaceportDistance: false,
                    sufficientArea: false,
                  });
                  // Сбрасываем состояние применения фильтров
                  setFiltersApplied(false);
                  
                  // Если пользователь сбросил фильтры, то восстанавливаем доступность всех участков
                  if (selectedAreas.length === 1 && selectedAreas[0] === "malapert") {
                    // Если была выбрана только гора Малаперт (из-за фильтра), добавляем Шеклтон
                    setSelectedAreas(["malapert", "shackleton"]);
                    // Можно оставить выбранным Малаперт или переключиться на Шеклтон
                    // setSelectedArea("shackleton");
                  }
                }}
              >
                Сбросить фильтры
              </Button>
              <Button onClick={handleApplyFilters}>Применить фильтры</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Constructor Form */}
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 shadow-sm bg-white">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  Параметры размещения
                  <button
                    className="ml-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                    onClick={() => setShowHelpDialog(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </button>
                </h2>

                {/* Surface Area Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Выбор участка поверхности</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                    value={selectedArea}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setBaseName(e.target.value);
                    }}
                  >
                    {/* Если применен фильтр освещённости, показываем только гору Малаперт */}
                    {filtersApplied && areaFilters.sunlight ? (
                      <option value="malapert">Гора Малаперт</option>
                    ) : (
                      selectedAreas.map(area => (
                        <option key={area} value={area}>
                          {area === "shackleton" 
                            ? "Кратер Шеклтон" 
                            : area === "cabeus" 
                              ? "Кратер Кабеус" 
                              : area === "haworth" 
                                ? "Плато Хаворт" 
                                : area === "malapert" 
                                  ? "Гора Малаперт" 
                                  : area}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {filtersApplied && areaFilters.sunlight 
                      ? "Доступна только гора Малаперт, так как применён фильтр максимальной освещенности" 
                      : "Выберите из списка для просмотра одного из участков базы"}
                  </p>
                </div>

                {/* Infrastructure Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип инфраструктуры</label>

                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-blue-700 mb-2">Обитаемые модули</h3>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        className={`p-2 border ${
                          selectedHabitableModule === "residential-ind"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("residential-ind", "habitable")}
                      >
                        <span className="text-xl mb-1">🏠</span>
                        Жилой (инд.)
                        <span className="text-xs text-gray-500">~20 м²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedHabitableModule === "residential-common"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("residential-common", "habitable")}
                      >
                        <span className="text-xl mb-1">🏘️</span>
                        Жилой (общий)
                        <span className="text-xs text-gray-500">100-150 м²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedHabitableModule === "sports" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("sports", "habitable")}
                      >
                        <span className="text-xl mb-1">🏃</span>
                        Спортивный
                        <span className="text-xs text-gray-500">80-120 м²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedHabitableModule === "administrative"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("administrative", "habitable")}
                      >
                        <span className="text-xl mb-1">🏢</span>
                        Административный
                        <span className="text-xs text-gray-500">Центральное</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedHabitableModule === "medical" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("medical", "habitable")}
                      >
                        <span className="text-xl mb-1">🏥</span>
                        Медицинский
                        <span className="text-xs text-gray-500">60-100 м²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedHabitableModule === "research" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("research", "habitable")}
                      >
                        <span className="text-xl mb-1">🔬</span>
                        Исследовательский
                        <span className="text-xs text-gray-500">100-150 м²</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-green-700 mb-2">Технологические объекты</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "repair" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("repair", "tech")}
                      >
                        <span className="text-xl mb-1">🔧</span>
                        Ремонтный модуль
                        <span className="text-xs text-gray-500">50-150 м²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "spaceport" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("spaceport", "tech")}
                      >
                        <span className="text-xl mb-1">🚀</span>
                        Космодром
                        <span className="text-xs text-gray-500">≥2 км²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "communication" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("communication", "tech")}
                      >
                        <span className="text-xl mb-1">📡</span>
                        Вышка связи
                        <span className="text-xs text-gray-500">15-25 м</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "plantation" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("plantation", "tech")}
                      >
                        <span className="text-xl mb-1">🌱</span>
                        Плантация
                        <span className="text-xs text-gray-500">200-500 м²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "waste" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("waste", "tech")}
                      >
                        <span className="text-xl mb-1">♻️</span>
                        Мусорный полигон
                        <span className="text-xs text-gray-500">≥3 км от жилья</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "production" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("production", "tech")}
                      >
                        <span className="text-xl mb-1">🏭</span>
                        Производство
                        <span className="text-xs text-gray-500">300-1000 м²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "astronomy" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("astronomy", "tech")}
                      >
                        <span className="text-xl mb-1">🔭</span>
                        Астрономическая площадка
                        <span className="text-xs text-gray-500">На возвышенностях</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "solar" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("solar", "tech")}
                      >
                        <span className="text-xl mb-1">☀️</span>
                        Солнечная электростанция
                        <span className="text-xs text-gray-500">500-2000 м²</span>
                      </button>
                      <button
                        className={`p-2 border ${
                          selectedTechObject === "mining" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        } rounded-md text-gray-700 text-sm flex flex-col items-center hover:bg-gray-50`}
                        onClick={() => handleInfrastructureSelect("mining", "tech")}
                      >
                        <span className="text-xl mb-1">⛏️</span>
                        Добывающая шахта
                        <span className="text-xs text-gray-500">Глубина льда ≤2 м</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Parameters */}
                {selectedInfrastructure && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium mb-2">Дополнительные параметры</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Checkbox
                          id="radiationProtection"
                          checked={objectParams.radiationProtection}
                          onCheckedChange={() => handleObjectParamChange("radiationProtection")}
                        />
                        <label htmlFor="radiation" className="text-sm text-gray-700 ml-2">
                          Защита от радиации
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="iceProximityParam"
                          checked={objectParams.iceProximity}
                          onCheckedChange={() => handleObjectParamChange("iceProximity")}
                        />
                        <label htmlFor="iceProximityParam" className="text-sm text-gray-700 ml-2">
                          Близость к залежам льда
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="sunlightAccess"
                          checked={objectParams.sunlightAccess}
                          onCheckedChange={() => handleObjectParamChange("sunlightAccess")}
                        />
                        <label htmlFor="sunlightAccess" className="text-sm text-gray-700 ml-2">
                          Доступ к солнечному свету
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="flatSurface"
                          checked={objectParams.flatSurface}
                          onCheckedChange={() => handleObjectParamChange("flatSurface")}
                        />
                        <label htmlFor="flatSurface" className="text-sm text-gray-700 ml-2">
                          Ровная поверхность
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parameters */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Площадь застройки (м²)</label>
                  <Slider
                    defaultValue={[areaSize]}
                    max={5000}
                    min={100}
                    step={100}
                    onValueChange={(value) => setAreaSize(value[0])}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>100</span>
                    <span>{areaSize}</span>
                    <span>5000</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Зона безопасности (м)</label>
                  <Slider
                    defaultValue={[safetyZone]}
                    max={100}
                    min={10}
                    step={5}
                    onValueChange={(value) => setSafetyZone(value[0])}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>10</span>
                    <span>{safetyZone}</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Place Object Button */}
                <div className="text-sm text-gray-600 mb-4">
                  <p>Выберите объект и разместите его на карте, кликнув по нужной клетке.</p>
                </div>

                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors mb-4 flex items-center justify-center"
                  onClick={handleAutoOptimize}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                    <path d="M16 21h5v-5"></path>
                  </svg>
                  Автооптимизация размещения
                </button>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-sm mb-2">Действия с проектом</h3>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-gray-100 text-gray-800 py-2 px-3 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                      onClick={() => setShowSaveDialog(true)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Сохранить
                    </button>
                  </div>
                </div>

                {/* Measurements Panel */}
                {measurements.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-medium text-sm mb-2">Измерения</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {measurements.map((m, index) => (
                        <div key={m.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="text-sm">
                            {index + 1}. {m.distance.toFixed(1)} м
                          </div>
                          <div className="flex items-center">
                            <div className="flex space-x-1 mr-2">
                              <button
                                className={`w-4 h-4 rounded-full ${m.color === "blue" ? "ring-2 ring-black" : ""}`}
                                style={{ backgroundColor: "blue" }}
                                onClick={() => handleChangeMeasurementColor(m.id, "blue")}
                              />
                              <button
                                className={`w-4 h-4 rounded-full ${m.color === "red" ? "ring-2 ring-black" : ""}`}
                                style={{ backgroundColor: "red" }}
                                onClick={() => handleChangeMeasurementColor(m.id, "red")}
                              />
                              <button
                                className={`w-4 h-4 rounded-full ${m.color === "green" ? "ring-2 ring-black" : ""}`}
                                style={{ backgroundColor: "green" }}
                                onClick={() => handleChangeMeasurementColor(m.id, "green")}
                              />
                            </div>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteMeasurement(m.id)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Map/Visualization */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-6 shadow-sm bg-white h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold">Визуализация размещения</h2>
                  </div>
                  <div className="flex gap-2">
                    <Tabs defaultValue="2d" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="2d">2D</TabsTrigger>
                        <TabsTrigger value="3d">3D</TabsTrigger>
                        <TabsTrigger value="real">Реальный снимок</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {/* Map/Visualization Tabs */}
                <div className="mb-4">
                  <Tabs defaultValue="2d" value={activeTab} onValueChange={setActiveTab}>
                    <TabsContent value="2d">
                      {/* 2D Map */}
                      {/* Обновить div с картой, добавив onClick */}
                      <div
                        ref={mapRef}
                        className="bg-gray-100 rounded-lg p-4 h-[500px] relative overflow-hidden"
                        onMouseDown={handleMapMouseDown}
                        onMouseMove={handleMapMouseMove}
                        onMouseUp={handleMapMouseUp}
                        onMouseLeave={handleMapMouseUp}
                        onClick={handleMapClick}
                      >
                        {/* Обновленная карта с сеткой */}
                        <div
                          className="absolute rounded-lg overflow-hidden"
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                            backgroundColor:
                              activeMapLayer === "height"
                                ? "bg-gradient-to-br from-blue-300 via-green-400 to-red-500"
                                : activeMapLayer === "spectral"
                                  ? "bg-gradient-to-br from-purple-300 via-purple-500 to-purple-700"
                                  : activeMapLayer === "slope"
                                    ? "bg-gradient-to-br from-green-300 via-yellow-400 to-red-500"
                                    : "bg-white",
                            opacity: 0.8,
                            transform: `scale(${mapZoom}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                            transformOrigin: "center",
                            transition: isDragging ? "none" : "transform 0.2s ease-out",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          {/* Рендер сетки */}
                          {renderGrid()}

                          {/* Рендер размещенных объектов */}
                          {renderPlacedObjects()}

                          {/* Update renderPlacementPreview with smooth transitions */}
                          {renderPlacementPreview()}

                          {/* Рендер маршрутов */}
                          {renderRoutes()}

                          {/* Рендер измерений */}
                          {renderMeasurements()}

                          {/* Рендер текущего измерения */}
                          {renderCurrentMeasurement()}

                          {/* Add coordinate tooltip with proper positioning */}
                          {activeAnalysisTool === "coordinates" && hoveredCell && (
                            <div
                              className="absolute bg-white px-2 py-1 rounded shadow-md text-xs z-50 pointer-events-none"
                              style={{
                                left: `${(hoveredCell.x + 0.5) * (100 / gridSize)}%`,
                                top: `${(hoveredCell.y + 0.5) * (100 / gridSize)}%`,
                                transform: "translate(-50%, -50%)",
                                minWidth: "100px",
                                textAlign: "center",
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              <div className="font-medium">Координаты:</div>
                              <div>X: {hoveredCell.x.toFixed(2)}</div>
                              <div>Y: {hoveredCell.y.toFixed(2)}</div>
                            </div>
                          )}

                          {/* Route drawing preview */}
                          {drawingRoute && routeStartObject && (
                            <div
                              className="absolute bg-red-500 w-3 h-3 rounded-full z-20"
                              style={{
                                left: `${(routeStartObject.x + routeStartObject.width / 2) * (100 / gridSize)}%`,
                                top: `${(routeStartObject.y + routeStartObject.height / 2) * (100 / gridSize)}%`,
                              }}
                            />
                          )}

                          {/* Filtered areas overlay */}
                          {filtersApplied && (
                            <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 z-20">
                              {Array.from({ length: 400 }).map((_, index) => {
                                // Определяем, является ли клетка частью горы Малаперт (примерно в правой верхней четверти)
                                const col = index % 20;
                                const row = Math.floor(index / 20);
                                const isMalapertArea = areaFilters.sunlight && 
                                  col >= 12 && col <= 19 && row >= 0 && row <= 7;
                                
                                return (
                                  <div
                                    key={`filter-${index}`}
                                    className={`${
                                      // Если фильтр освещенности активен, показываем только гору Малаперт
                                      areaFilters.sunlight
                                        ? isMalapertArea
                                          ? "bg-yellow-400 bg-opacity-20" // Область горы Малаперт (с максимальной освещенностью)
                                          : "bg-black bg-opacity-60"      // Остальные затемненные области
                                        : // Для других фильтров используем случайную генерацию как раньше
                                          Math.random() > 0.7 
                                            ? "bg-green-500 bg-opacity-20" 
                                            : "bg-black bg-opacity-40"
                                    }`}
                                  ></div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Рендер ограничений активной зоны */}
                        {renderRestrictions()}

                        {/* Error message */}
                        {errorMessage && (
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-md shadow-lg border-l-4 border-red-500 text-red-700 z-50">
                            {errorMessage}
                          </div>
                        )}

                        {/* Analysis tools */}
                        <div className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md z-30">
                          <div className="flex gap-2">{/* No buttons here now */}</div>
                        </div>

                        {/* Controls overlay */}
                        <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md z-30">
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={handleMapZoomIn}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleMapZoomOut}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </Button>
                            <Button variant="outline" size="icon" onClick={toggleFullScreen}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                              </svg>
                            </Button>
                          </div>
                        </div>

                        {/* Grid size indicator */}
                        <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md text-xs z-30">
                          Сетка: {gridSize}×{gridSize} (каждая клетка = {cellSize} м²)
                        </div>
                      </div>
                      {renderHoveredTileInfo()}
                    </TabsContent>

                    <TabsContent value="3d">
                      {/* 3D Map */}
                      <div className="bg-gray-100 rounded-lg p-4 h-[400px] relative flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-32 h-32 mx-auto bg-gray-300 rounded-full mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500"></div>
                            <div className="absolute w-16 h-16 bg-gray-200 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                          </div>
                          <p className="text-gray-600">3D-модель кратера Шеклтон</p>
                          <p className="text-sm text-gray-500 mt-2">Используйте мышь для вращения модели</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="real">
                      {/* Real Image */}
                      <div className="bg-gray-100 rounded-lg p-4 h-[400px] relative flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-full h-64 mx-auto bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900"></div>
                            <div className="absolute inset-0 opacity-30">
                              <div className="absolute w-20 h-20 bg-gray-600 rounded-full top-1/4 left-1/3"></div>
                              <div className="absolute w-32 h-32 bg-gray-600 rounded-full bottom-1/4 right-1/3"></div>
                              <div className="absolute w-16 h-16 bg-gray-600 rounded-full top-1/2 right-1/4"></div>
                            </div>
                          </div>
                          <p className="text-gray-600">Реальный снимок кратера Шеклтон</p>
                          <p className="text-sm text-gray-500 mt-2">Снимок с высоким разрешением</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Placement Criteria */}
                {showPlacementCriteria && (
                  <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Критерии размещения
                    </h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span>Герметичность</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span>Угол поверхности ≤ 7°</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span>Защита от радиации (слой реголита)</span>
                      </li>
                      <li className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>Удаленность от космодрома ≥5 км (фактически 4,5 км)</span>
                      </li>
                      <li className="flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-1" />
                        <span>Близость к медицинскому модулю ≤ 3 мин. (фактически 5 мин.)</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Route Planning */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Планирование маршрутов</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <select
                      className="flex-1 border-gray-300 rounded-md shadow-sm p-2 border text-sm"
                      value={routeStart || ""}
                      onChange={(e) => setRouteStart(e.target.value)}
                    >
                      <option value="">Выберите начальную точку</option>
                      {placedObjects.map((obj) => (
                        <option key={`start-${obj.id}`} value={obj.name}>
                          {obj.name}
                        </option>
                      ))}
                    </select>
                    <span className="flex items-center">→</span>
                    <select
                      className="flex-1 border-gray-300 rounded-md shadow-sm p-2 border text-sm"
                      value={routeEnd || ""}
                      onChange={(e) => setRouteEnd(e.target.value)}
                    >
                      <option value="">Выберите конечную точку</option>
                      {placedObjects.map((obj) => (
                        <option key={`end-${obj.id}`} value={obj.name}>
                          {obj.name}
                        </option>
                      ))}
                    </select>
                    <Button onClick={handleCreateRoute} disabled={!routeStart || !routeEnd || routeStart === routeEnd}>
                      Проложить
                    </Button>
                  </div>

                  {routes.length > 0 && (
                    <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                      <h4 className="font-medium mb-2">Список маршрутов:</h4>
                      <ul className="space-y-2">
                        {routes.map((route) => (
                          <li key={route.id} className="flex justify-between items-center">
                            <div>
                              {route.id}️⃣ {route.start} → {route.end} – {route.distance} м (~{route.time} мин.)
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditRoute(route.id)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Изменить
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDeleteRoute(route.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Удалить
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {routeError && (
                        <div className="mt-3 p-2 bg-red-50 text-red-700 rounded-md border border-red-200">
                          ❌ {routeError}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    <p>
                      Для создания маршрута вы также можете нажать кнопку "Создать маршрут" в панели инструментов и
                      выбрать два объекта на карте.
                    </p>
                    <p>Система автоматически проверит маршрут на наличие непроходимых участков.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Management Block */}
          <div className="mt-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setResourceBlockExpanded(!resourceBlockExpanded)}
            >
              <h3 className="font-medium">{resourceBlockExpanded ? "📊 Управление ресурсами" : "📊 Ресурсы"}</h3>
              <button className="text-gray-500 hover:text-gray-700">
                {resourceBlockExpanded ? "▲ Свернуть" : "▼ Развернуть"}
              </button>
            </div>

            {resourceBlockExpanded && (
              <div className="mt-3 max-h-80 overflow-y-auto border-t pt-3">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">Управление ресурсами</h4>
                    <p className="text-xs text-gray-500">
                      💡 1 человек = {resourceSettings.spacePerPerson} м² жилой площади (значение настраивается)
                    </p>
                  </div>
                  <button
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() => setShowResourceInfoModal(true)}
                  >
                    ℹ️ Подробнее
                  </button>
                </div>

                {/* Resources */}
                <div className="space-y-4">
                  {/* Water */}
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium flex items-center">
                        <span className="mr-2">💧</span> Вода
                      </h5>
                      <span className="text-sm">
                        {resourceStatus.water.current.toFixed(1)} / {resourceStatus.water.capacity.toFixed(1)} л
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${resourceStatus.water.percentage < 30 ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.min(resourceStatus.water.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Потребление: {resourceStatus.water.consumption.toFixed(1)} л/сутки</span>
                      <span>Хватит на: {resourceStatus.water.daysLeft.toFixed(1)} дней</span>
                    </div>
                    {resourceStatus.water.daysLeft < 3 && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-1 rounded flex items-center">
                        <span className="mr-1">⚠️</span> Критически низкий запас воды!
                      </div>
                    )}
                  </div>

                  {/* Oxygen */}
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium flex items-center">
                        <span className="mr-2">🫁</span> Кислород
                      </h5>
                      <span className="text-sm">
                        {resourceStatus.oxygen.current.toFixed(1)} / {resourceStatus.oxygen.capacity.toFixed(1)} кг
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${resourceStatus.oxygen.percentage < 30 ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(resourceStatus.oxygen.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Потребление: {resourceStatus.oxygen.consumption.toFixed(2)} кг/сутки</span>
                      <span>Хватит на: {resourceStatus.oxygen.daysLeft.toFixed(1)} дней</span>
                    </div>
                  </div>

                  {/* Food */}
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium flex items-center">
                        <span className="mr-2">🥦</span> Еда
                      </h5>
                      <span className="text-sm">
                        {resourceStatus.food.current.toFixed(1)} / {resourceStatus.food.capacity.toFixed(1)} кг
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${resourceStatus.food.percentage < 30 ? "bg-red-500" : "bg-yellow-500"}`}
                        style={{ width: `${Math.min(resourceStatus.food.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Потребление: {resourceStatus.food.consumption.toFixed(2)} кг/сутки</span>
                      <span>Хватит на: {resourceStatus.food.daysLeft.toFixed(1)} дней</span>
                    </div>
                    {resourceStatus.food.production > 0 && (
                      <div className="mt-1 text-xs text-green-600">
                        Производство: {resourceStatus.food.production.toFixed(2)} кг/сутки (фермы)
                      </div>
                    )}
                  </div>

                  {/* Energy */}
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium flex items-center">
                        <span className="mr-2">⚡</span> Энергия
                      </h5>
                      <span className="text-sm">
                        {resourceStatus.energy.current.toFixed(1)} / {resourceStatus.energy.capacity.toFixed(1)} кВт·ч
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${resourceStatus.energy.percentage < 30 ? "bg-red-500" : "bg-yellow-400"}`}
                        style={{ width: `${Math.min(resourceStatus.energy.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Потребление: {resourceStatus.energy.consumption.toFixed(1)} кВт·ч/сутки</span>
                      <span>Хватит на: {resourceStatus.energy.daysLeft.toFixed(1)} дней</span>
                    </div>
                    <div className="mt-1 text-xs text-green-600">
                      Производство: {resourceStatus.energy.production.toFixed(1)} кВт·ч/сутки (солнечные панели)
                    </div>
                    {resourceStatus.energy.daysLeft < 14 && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-1 rounded flex items-center">
                        <span className="mr-1">⚠️</span> Недостаточная автономность (требуется 14 дней)
                      </div>
                    )}
                  </div>

                  {/* Waste */}
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium flex items-center">
                        <span className="mr-2">🔁</span> Отходы
                      </h5>
                      <span className="text-sm">{resourceStatus.waste.current.toFixed(1)}% переработки</span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${resourceStatus.waste.percentage < 70 ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(resourceStatus.waste.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Генерация: {resourceStatus.waste.generation.toFixed(1)} кг/сутки</span>
                      <span>Переработка: {resourceStatus.waste.recycling.toFixed(1)} кг/сутки</span>
                    </div>
                  </div>

                  {/* System Advice */}
                  {resourceAdvice.length > 0 && (
                    <div className="mt-4 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                      <h5 className="font-medium mb-2">💡 Советы системы:</h5>
                      <ul className="space-y-2 text-sm">
                        {resourceAdvice.map((advice, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-yellow-600">•</span>
                            <span>{advice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Resource Info Modal */}
          {showResourceInfoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Подробнее о системе управления ресурсами</h2>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Общая логика</h3>
                  <p className="text-gray-700 mb-2">
                    Система рассчитывает потребление, генерацию и переработку ресурсов, основываясь на:
                  </p>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Экипаже</li>
                    <li>Размещённых объектах</li>
                    <li>Текущем рельефе и освещении</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Формулы расчета</h3>
                  <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-md">
                    <p>
                      <strong>Кислород:</strong> O₂_потребление = 0.84 кг × Кол-во человек + промышленность
                    </p>
                    <p>
                      <strong>Вода:</strong> Потребление = 3.54 л/чел/сутки, переработка ~90–95% в модулях очистки
                    </p>
                    <p>
                      <strong>Еда:</strong> 0.62 кг/чел/сутки, может генерироваться в фермах
                    </p>
                    <p>
                      <strong>Энергия:</strong> Производится солнечными панелями / ядерным модулем, потребляется всеми
                      системами
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Допущения</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                    <li>Расходы усреднены</li>
                    <li>Все модули работают, если не указано иное</li>
                    <li>Освещение – по данным карты</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Ресурсы – Полный перечень</h3>
                  <div className="space-y-4">
                    <div className="p-2 bg-blue-50 rounded-md">
                      <h4 className="font-medium">💧 Вода</h4>
                      <ul className="text-sm space-y-1">
                        <li>
                          <strong>Единицы:</strong> литры (л)
                        </li>
                        <li>
                          <strong>Потребление:</strong> экипаж, фермы, системы охлаждения
                        </li>
                        <li>
                          <strong>Генерация:</strong> очистка, лёд, импорт
                        </li>
                        <li>
                          <strong>Норма:</strong> 3.54 л/чел/сутки
                        </li>
                        <li>
                          <strong>Очистка:</strong> до 95%
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 bg-blue-50 rounded-md">
                      <h4 className="font-medium">🫁 Кислород</h4>
                      <ul className="text-sm space-y-1">
                        <li>
                          <strong>Единицы:</strong> килограммы (кг)
                        </li>
                        <li>
                          <strong>Потребление:</strong> экипаж, плавильные и медицинские модули
                        </li>
                        <li>
                          <strong>Генерация:</strong> электролиз, растения, реголит
                        </li>
                        <li>
                          <strong>Норма:</strong> 0.84 кг/чел/сутки
                        </li>
                        <li>
                          <strong>Очистка:</strong> рециркуляция воздуха (до 90%)
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 bg-blue-50 rounded-md">
                      <h4 className="font-medium">🥦 Еда</h4>
                      <ul className="text-sm space-y-1">
                        <li>
                          <strong>Единицы:</strong> килограммы (кг)
                        </li>
                        <li>
                          <strong>Потребление:</strong> только экипаж
                        </li>
                        <li>
                          <strong>Генерация:</strong> гидропоника, запасы
                        </li>
                        <li>
                          <strong>Норма:</strong> 0.62 кг/чел/сутки
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 bg-blue-50 rounded-md">
                      <h4 className="font-medium">⚡ Энергия</h4>
                      <ul className="text-sm space-y-1">
                        <li>
                          <strong>Единицы:</strong> кВт·ч
                        </li>
                        <li>
                          <strong>Потребление:</strong> всё – от очистки до обогрева
                        </li>
                        <li>
                          <strong>Генерация:</strong> солнечные панели, ядерный модуль, аккумуляторы
                        </li>
                        <li>
                          <strong>Автономность:</strong> запас на 14 дней обязателен
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 bg-blue-50 rounded-md">
                      <h4 className="font-medium">🔁 Отходы</h4>
                      <ul className="text-sm space-y-1">
                        <li>
                          <strong>Единицы:</strong> %
                        </li>
                        <li>
                          <strong>Генерация:</strong> еда, бытовые, медотходы
                        </li>
                        <li>
                          <strong>Утилизация:</strong> термодеструкция, сепарация, 3D-печать
                        </li>
                        <li>
                          <strong>Норма:</strong> до 90% переработки
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    onClick={() => setShowResourceInfoModal(false)}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Export and Reporting Panel */}
          <div className="mt-8 border rounded-lg p-6 shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">📊</span> Экспорт и отчетность
            </h2>
            <p className="text-gray-600 mb-4">
              Выделите участок на карте и создайте подробный отчёт с данными о рельефе, наличии льда и других
              характеристиках.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Экспорт данных</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    onClick={() => handleExport("GeoTIFF")}
                  >
                    GeoTIFF
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    onClick={() => handleExport("GeoJSON")}
                  >
                    GeoJSON
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    onClick={() => handleExport("PDF")}
                  >
                    PDF
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Генерация отчета</h3>
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                  onClick={handleCreateReport}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Создать отчет
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Отчет будет содержать данные о выбранном участке, размещенных объектах и маршрутах.
                </p>
              </div>
            </div>
          </div>

          {/* Import and Save Panel */}
          <div className="mt-8 border rounded-lg p-6 shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">💾</span> Импорт и сохранение
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Сохранение проекта</h3>
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Сохранить проект
                </button>
                <p className="text-xs text-gray-500 mt-2">Сохраните текущий проект для продолжения работы позже.</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Загрузка проекта</h3>
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                  onClick={() => setShowLoadProjectDialog(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Загрузить проект
                </button>
                <p className="text-xs text-gray-500 mt-2">Загрузите ранее сохраненный проект для продолжения работы.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Render all dialogs */}
      {renderSideMenu()}
      {renderSaveDialog()}
      {renderLayerInfo()}
      {renderHelpDialog()}
      {renderLoadProjectDialog()}
      {renderObjectInfoDialog()}
      {renderUploadDialog()}
      {renderTerrainUploadDialog()}
      {renderMetadataUploadDialog()}
      {renderMetadataEditorDialog()}
      
      {/* Добавляем модальное окно в конец, перед закрывающим тегом */}
      {showTileModal && (
        <TileInfoModal
          tile={selectedTile}
          onClose={() => {
            setShowTileModal(false);
            setSelectedTile(null);
          }}
        />
      )}
      {/* В JSX добавляем компонент HoveredTileInfo */}
      {hoveredTile && (
        <HoveredTileInfo tile={hoveredTile} position={hoveredCellState} />
      )}
      
      {/* Добавляем модальное окно для просмотра изображений */}
      {selectedImage && (
        <ImageViewerModal
          imagePath={selectedImage.path}
          title={selectedImage.title}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <Footer />
    </div>
  )
}

