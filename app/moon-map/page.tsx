"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check, X, Save, Edit, Trash2, ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react"

// Определение типов объектов и их размеров
interface ObjectSize {
  width: number
  height: number
  safetyZone: number
}

interface PlacedObject {
  id: number
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
  id: number
  start: string
  end: string
  startObj: PlacedObject | null
  endObj: PlacedObject | null
  distance: number
  time: number
}

interface Measurement {
  id: number
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
}

export default function MoonMapPage() {
  // Основные состояния
  const [activeTab, setActiveTab] = useState("2d")
  const [selectedArea, setSelectedArea] = useState("shackleton")
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string | null>(null)
  const [selectedHabitableModule, setSelectedHabitableModule] = useState<string | null>(null)
  const [selectedTechObject, setSelectedTechObject] = useState<string | null>(null)
  const [areaSize, setAreaSize] = useState(500)
  const [safetyZone, setSafetyZone] = useState(100)
  const [activeAnalysisTool, setActiveAnalysisTool] = useState<string | null>(null)
  const [activeMapLayer, setActiveMapLayer] = useState("default")
  const [showPlacementCriteria, setShowPlacementCriteria] = useState(false)
  const [routeStart, setRouteStart] = useState<string | null>(null)
  const [routeEnd, setRouteEnd] = useState<string | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([])
  const [draggedObject, setDraggedObject] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [cellSize] = useState(10) // 10m² per cell
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  // Update the initial state of sideMenuOpen
  const [sideMenuOpen, setSideMenuOpen] = useState(true)
  const [projectName, setProjectName] = useState("")
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [measurementStart, setMeasurementStart] = useState<{ x: number; y: number } | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showLoadProjectDialog, setShowLoadProjectDialog] = useState(false)
  const [selectedObjectInfo, setSelectedObjectInfo] = useState<PlacedObject | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [resourceBlockExpanded, setResourceBlockExpanded] = useState(false)
  const [showResourceInfoModal, setShowResourceInfoModal] = useState(false)
  const [filtersApplied, setFiltersApplied] = useState(false)
  const [selectedLayerInfo, setSelectedLayerInfo] = useState<Layer | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadedAreas, setUploadedAreas] = useState<string[]>([])

  // Add the necessary state variables at the top of the component
  // Find the section with state variables and add these:
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

  // Add resource status state
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

  // Add resource advice state
  const [resourceAdvice, setResourceAdvice] = useState([
    "Добавьте аккумуляторы для увеличения автономности до 14 дней",
    "Рекомендуется установить дополнительный модуль переработки отходов",
    "Жилая площадь достаточна для текущего экипажа (6 человек)",
  ])

  // Добавить после объявления других состояний, примерно в строке 100
  const [showCoordinateInfo, setShowCoordinateInfo] = useState(false)
  const [clickedPointInfo, setClickedPointInfo] = useState<{
    x: number
    y: number
    height: number
    illumination: number
    slope: number
    soil: string
  } | null>(null)

  // Добавить новые состояния после объявления других состояний, примерно в строке 110
  const [restrictionEnabled, setRestrictionEnabled] = useState(false)
  const [restrictionShape, setRestrictionShape] = useState<"ellipse" | "polygon">("ellipse")
  const [ellipseWidth, setEllipseWidth] = useState(120)
  const [ellipseHeight, setEllipseHeight] = useState(60)
  const [drawingPolygon, setDrawingPolygon] = useState(false)
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([])
  const [restrictedArea, setRestrictedArea] = useState(0)

  // Рассчитываем размер сетки на основе площади
  const gridSize = Math.ceil(Math.sqrt(areaSize / cellSize))

  // Ссылки на DOM элементы
  const mapRef = useRef<HTMLDivElement>(null)

  // Состояния для навигации по карте
  const [mapZoom, setMapZoom] = useState(1)
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [drawingRoute, setDrawingRoute] = useState(false)
  const [routeStartObject, setRouteStartObject] = useState<PlacedObject | null>(null)
  const [routeEndObject, setRouteEndObject] = useState<PlacedObject | null>(null)

  // Слои карты
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "nomenclature",
      name: "Nomenclature (Номенклатура)",
      description:
        "Отображает названия лунных объектов, утверждённые Международным астрономическим союзом (IAU). Включает кратеры, горы, долины, моря и другие географические объекты. Позволяет ориентироваться на поверхности Луны и учитывать географические особенности при строительстве.",
      enabled: false,
    },
    {
      id: "3d-printing",
      name: "3D Printing Sites",
      description:
        "Слой с готовыми 3D-моделями объектов Луны, подходящими для 3D-печати. Позволяет визуализировать потенциальные конструкции лунной базы.",
      enabled: false,
    },
    {
      id: "moon-map",
      name: "Карта Луны с топонимами",
      description:
        "Отображает названия морей, кратеров и гор (например, Oceanus Procellarum, Mare Tranquillitatis, Copernicus). Используется для навигации и планирования посадочных миссий.",
      enabled: true,
    },
    {
      id: "spole-psrs",
      name: "SPOLE PSRs (80S to 90S)",
      description:
        "Отображает вечно затенённые регионы (Permanently Shadowed Regions) в полярных областях Луны. В этих зонах может находиться водяной лёд – критичный ресурс для жизнеобеспечения. Температурные условия делают эти зоны непригодными для некоторых видов инфраструктуры.",
      enabled: false,
    },
    {
      id: "south-pole-geomorphic",
      name: "South Pole Geomorphic Map",
      description:
        "Подробная геоморфологическая карта Южного полюса Луны. Показывает различные типы поверхности, что важно для размещения зданий и техники.",
      enabled: false,
    },
    {
      id: "pit-locations",
      name: "Pit Locations",
      description:
        "Показывает лунные ямы (pits) – входы в подземные лавовые тоннели. Ямы могут быть использованы как естественные укрытия от радиации. Исследование тоннелей поможет выяснить историю вулканической активности Луны.",
      enabled: false,
    },
    {
      id: "wrinkle-ridges",
      name: "Wrinkle Ridges",
      description: "Складчатые хребты в лунных морях, образовавшиеся в результате тектонических процессов.",
      enabled: false,
    },
    {
      id: "lobate-scarps",
      name: "Lobate Scarps",
      description: "Лобатные уступы – малые разломы, появившиеся из-за сжатия коры Луны.",
      enabled: false,
    },
    {
      id: "polar-scarp",
      name: "Polar Scarp Locations",
      description: "Уступы в полярных областях Луны.",
      enabled: false,
    },
    {
      id: "malapert-3d",
      name: "A3: 3D Models at Malapert",
      description: "Отображает 3D-модели объектов в районе Malapert Massif, одном из перспективных мест посадки.",
      enabled: false,
    },
  ])

  // Фильтры для выбора зоны по условиям
  const [areaFilters, setAreaFilters] = useState({
    sunlight: false,
    iceProximity: false,
    flatTerrain: false,
    lavaTubes: false,
    spaceportDistance: false,
    sufficientArea: false,
  })

  const objectSizes = {
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

  const objectNames = {
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

  const objectColors = {
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
  const handleInfrastructureSelect = (type: string, category: "habitable" | "tech") => {
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
    if (x < 0 || y < 0 || x + width > gridSize || y + height > gridSize) {
      return false
    }

    // Проверка, находится ли объект внутри активной зоны, если ограничение включено
    if (restrictionEnabled) {
      // Проверяем все углы объекта
      const corners = [
        { x, y },
        { x: x + width, y },
        { x, y: y + height },
        { x: x + width, y: y + height },
      ]

      // Для эллипса
      if (restrictionShape === "ellipse") {
        const centerX = gridSize / 2
        const centerY = gridSize / 2
        const radiusX = ellipseWidth / (2 * Math.sqrt(cellSize))
        const radiusY = ellipseHeight / (2 * Math.sqrt(cellSize))

        // Проверяем, находятся ли все углы внутри эллипса
        const allCornersInside = corners.every((corner) => {
          const normalizedX = (corner.x - centerX) / radiusX
          const normalizedY = (corner.y - centerY) / radiusY
          return normalizedX * normalizedX + normalizedY * normalizedY <= 1
        })

        if (!allCornersInside) {
          setErrorMessage("❌ Объект должен быть полностью внутри активной зоны")
          setTimeout(() => setErrorMessage(null), 3000)
          return false
        }
      }

      // Для полигона
      if (restrictionShape === "polygon" && polygonPoints.length > 2) {
        // Функция для проверки, находится ли точка внутри полигона
        const isPointInPolygon = (point: { x: number; y: number }, polygon: { x: number; y: number }[]) => {
          let inside = false
          for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x,
              yi = polygon[i].y
            const xj = polygon[j].x,
              yj = polygon[j].y

            const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
            if (intersect) inside = !inside
          }
          return inside
        }

        // Проверяем, находятся ли все углы внутри полигона
        const allCornersInside = corners.every((corner) => isPointInPolygon(corner, polygonPoints))

        if (!allCornersInside) {
          setErrorMessage("❌ Объект должен быть полностью внутри активной зоны")
          setTimeout(() => setErrorMessage(null), 3000)
          return false
        }
      }
    }

    // Проверка пересечения с другими объектами и их зонами безопасности
    for (const obj of placedObjects) {
      // Проверка пересечения самих объектов
      if (x < obj.x + obj.width && x + width > obj.x && y < obj.y + obj.height && y + height > obj.y) {
        return false
      }

      // Проверка пересечения с зоной безопасности
      if (
        x < obj.x + obj.width + obj.safetyZone &&
        x + width > obj.x - obj.safetyZone &&
        y < obj.y + obj.height + obj.safetyZone &&
        y + height > obj.y - obj.safetyZone
      ) {
        setErrorMessage(`❌ Объект слишком близко к ${obj.name}`)
        setTimeout(() => setErrorMessage(null), 3000)
        return false
      }
    }

    return true
  }

  // Обработчик размещения объекта
  const handlePlaceObject = (x: number, y: number) => {
    if (!selectedInfrastructure) return

    const { width, height, safetyZone } = objectSizes[selectedInfrastructure]

    if (canPlaceObject(x, y, width, height, safetyZone)) {
      const newObject: PlacedObject = {
        id: Date.now(),
        type: selectedInfrastructure,
        name: objectNames[selectedInfrastructure],
        x,
        y,
        width,
        height,
        safetyZone,
        color: objectColors[selectedInfrastructure] || "bg-gray-500",
      }

      setPlacedObjects([...placedObjects, newObject])
      setSelectedInfrastructure(null)
      setSelectedHabitableModule(null)
      setSelectedTechObject(null)
      setDraggedObject(null)
      setShowPlacementCriteria(false)
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
      for (let y = 0; y < gridSize && !placed; y++) {
        for (let x = 0; x < gridSize && !placed; x++) {
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
    if (x < 0 || y < 0 || x + width > gridSize || y + height > gridSize) {
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
  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left mouse button
      if (activeAnalysisTool === "ruler" && !isMeasuring) {
        // Start measuring
        setIsMeasuring(true)
        const rect = mapRef.current?.getBoundingClientRect()
        if (rect) {
          const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize)
          const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize)
          setMeasurementStart({ x, y })
        }
      } else if (!isMeasuring) {
        // Start dragging
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }
  }

  // Обновить функцию handleMapMouseMove
  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / mapZoom
      const dy = (e.clientY - dragStart.y) / mapZoom
      setMapPosition({
        x: mapPosition.x + dx,
        y: mapPosition.y + dy,
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    // Update hovered cell
    const rect = mapRef.current?.getBoundingClientRect()
    if (rect) {
      const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize)
      const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize)
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        setHoveredCell({ x, y })
      } else {
        setHoveredCell(null)
      }
    }
  }

  const handleMapMouseUp = (e: React.MouseEvent) => {
    if (isMeasuring && measurementStart) {
      // Finish measuring
      const rect = mapRef.current?.getBoundingClientRect()
      if (rect) {
        const endX = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize)
        const endY = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize)

        // Calculate distance in meters (each cell is 10m²)
        const distance = Math.sqrt(
          Math.pow((endX - measurementStart.x) * Math.sqrt(cellSize), 2) +
            Math.pow((endY - measurementStart.y) * Math.sqrt(cellSize), 2),
        )

        // Add measurement
        const newMeasurement: Measurement = {
          id: Date.now(),
          startX: measurementStart.x,
          startY: measurementStart.y,
          endX,
          endY,
          distance,
          color: "blue",
        }

        setMeasurements([...measurements, newMeasurement])
        setIsMeasuring(false)
        setMeasurementStart(null)
      }
    }

    setIsDragging(false)
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

  // Обновить handleMapClick для поддержки рисования полигона
  const handleMapClick = (e: React.MouseEvent) => {
    if (drawingPolygon) {
      handlePolygonClick(e)
      return
    }

    if (activeAnalysisTool === "coordinates") {
      const rect = mapRef.current?.getBoundingClientRect()
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * gridSize
        const y = ((e.clientY - rect.top) / rect.height) * gridSize

        // Генерируем случайные данные для демонстрации
        setClickedPointInfo({
          x: Number.parseFloat(x.toFixed(2)),
          y: Number.parseFloat(y.toFixed(2)),
          height: Math.floor(Math.random() * 500), // Случайная высота от 0 до 500 м
          illumination: Math.floor(Math.random() * 100), // Случайная освещенность от 0 до 100%
          slope: Number.parseFloat((Math.random() * 7).toFixed(1)), // Случайный уклон от 0 до 7 градусов
          soil: ["пылевой", "каменистый", "реголитовый", "песчаный"][Math.floor(Math.random() * 4)], // Случайный тип грунта
        })
        setShowCoordinateInfo(true)
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
  const handleObjectClick = (obj: PlacedObject) => {
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
          id: Date.now(),
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
    if (routeStart && routeEnd) {
      // Find the objects
      const startObj = placedObjects.find((obj) => obj.name === routeStart)
      const endObj = placedObjects.find((obj) => obj.name === routeEnd)

      if (!startObj || !endObj) {
        setRouteError("Не удалось найти выбранные объекты")
        setTimeout(() => setRouteError(null), 5000)
        return
      }

      // Simulate route validation
      if (Math.random() > 0.8) {
        setRouteError("Непроходимая зона: маршрут пересекает участок с крутым уклоном")
        setTimeout(() => setRouteError(null), 5000)
        return
      }

      // Calculate distance
      const distance = Math.sqrt(
        Math.pow((endObj.x - startObj.x) * Math.sqrt(cellSize), 2) +
          Math.pow((endObj.y - startObj.y) * Math.sqrt(cellSize), 2),
      ).toFixed(0)

      const time = Math.ceil(Number.parseInt(distance) / 80) // Assuming 80m per minute walking speed

      const newRoute: Route = {
        id: Date.now(),
        start: routeStart,
        end: routeEnd,
        startObj,
        endObj,
        distance: Number.parseInt(distance),
        time: time,
      }

      setRoutes([...routes, newRoute])
      setRouteStart(null)
      setRouteEnd(null)
      setRouteError(null)
    }
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
    // In a real application, this would filter the map data based on selected criteria
    alert("Фильтры применены. Подходящие участки подсвечены зеленым, неподходящие затемнены.")
  }

  // Обработчик редактирования маршрута
  const handleEditRoute = (routeId: number) => {
    const route = routes.find((r) => r.id === routeId)
    if (route) {
      setRouteStart(route.start)
      setRouteEnd(route.end)
      setRoutes(routes.filter((r) => r.id !== routeId))
    }
  }

  // Обработчик удаления маршрута
  const handleDeleteRoute = (routeId: number) => {
    setRoutes(routes.filter((r) => r.id !== routeId))
  }

  // Обработчик удаления объекта
  const handleDeleteObject = (objectId: number) => {
    // Remove the object
    setPlacedObjects(placedObjects.filter((obj) => obj.id !== objectId))

    // Remove any routes that use this object
    const objToRemove = placedObjects.find((obj) => obj.id === objectId)
    if (objToRemove) {
      setRoutes(routes.filter((route) => route.start !== objToRemove.name && route.end !== objToRemove.name))
    }
  }

  // Обработчик удаления измерения
  const handleDeleteMeasurement = (measurementId: number) => {
    setMeasurements(measurements.filter((m) => m.id !== measurementId))
  }

  // Обработчик изменения цвета измерения
  const handleChangeMeasurementColor = (measurementId: number, color: string) => {
    setMeasurements(measurements.map((m) => (m.id === measurementId ? { ...m, color } : m)))
  }

  // Обработчик сохранения проекта
  const handleSaveProject = () => {
    if (!projectName.trim()) {
      alert("Пожалуйста, введите имя проекта")
      return
    }

    // Create a new project
    const newProject: SavedProject = {
      id: currentProjectId || `project_${Date.now()}`,
      name: projectName,
      date: new Date().toLocaleDateString(),
      objects: placedObjects,
      routes: routes,
      measurements: measurements,
      areaSize: areaSize,
      safetyZone: safetyZone,
    }

    // Update or add to saved projects
    const updatedProjects = currentProjectId
      ? savedProjects.map((p) => (p.id === currentProjectId ? newProject : p))
      : [...savedProjects, newProject]

    setSavedProjects(updatedProjects)
    setCurrentProjectId(newProject.id)

    // Save to localStorage
    localStorage.setItem("lunarBaseProjects", JSON.stringify(updatedProjects))

    setShowSaveDialog(false)
    setErrorMessage("✅ Проект успешно сохранен!")
    setTimeout(() => setErrorMessage(null), 3000)
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
      setCurrentProjectId(project.id)
      setProjectName(project.name)

      setErrorMessage("✅ Проект успешно загружен!")
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  // Обработчик переключения слоя
  const handleToggleLayer = (layerId: string) => {
    setLayers(layers.map((layer) => (layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer)))
  }

  // Обработчик выбора слоя для просмотра информации
  const handleSelectLayerInfo = (layer: Layer) => {
    setSelectedLayerInfo(layer)
  }

  // Функция для переключения в полноэкранный режим
  const toggleFullScreen = () => {
    const mapElement = mapRef.current

    if (!mapElement) return

    if (!document.fullscreenElement) {
      mapElement.requestFullscreen().then(() => {
        setIsFullScreen(true)
        setSideMenuOpen(true) // Open side menu when entering full screen
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false)
          setSideMenuOpen(false) // Close side menu when exiting full screen
        })
      }
    }
  }

  // Теперь обновим функцию renderGrid, чтобы отображать клетки по-разному в зависимости от того,
  // находятся ли они внутри активной зоны или нет:

  const renderGrid = () => {
    const cells = []

    // Функция для проверки, находится ли точка внутри полигона
    const isPointInPolygon = (point: { x: number; y: number }, polygon: { x: number; y: number }[]) => {
      if (polygon.length < 3) return false
      let inside = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x,
          yi = polygon[i].y
        const xj = polygon[j].x,
          yj = polygon[j].y

        const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
        if (intersect) inside = !inside
      }
      return inside
    }

    // Функция для проверки, находится ли точка внутри эллипса
    const isPointInEllipse = (
      point: { x: number; y: number },
      center: { x: number; y: number },
      radiusX: number,
      radiusY: number,
    ) => {
      const normalizedX = (point.x - center.x) / radiusX
      const normalizedY = (point.y - center.y) / radiusY
      return normalizedX * normalizedX + normalizedY * normalizedY <= 1
    }

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Проверяем, находится ли клетка внутри активной зоны
        let isInActiveZone = true

        if (restrictionEnabled) {
          if (restrictionShape === "ellipse") {
            const centerX = gridSize / 2
            const centerY = gridSize / 2
            const radiusX = ellipseWidth / (2 * Math.sqrt(cellSize))
            const radiusY = ellipseHeight / (2 * Math.sqrt(cellSize))

            isInActiveZone = isPointInEllipse({ x, y }, { x: centerX, y: centerY }, radiusX, radiusY)
          } else if (restrictionShape === "polygon" && polygonPoints.length > 2) {
            isInActiveZone = isPointInPolygon({ x, y }, polygonPoints)
          }
        }

        const cellClass =
          isInActiveZone || !restrictionEnabled
            ? "border border-gray-300 hover:bg-blue-100 hover:bg-opacity-30 transition-colors"
            : "border border-gray-300 bg-gray-500 bg-opacity-50"

        cells.push(
          <div
            key={`cell-${x}-${y}`}
            className={cellClass}
            style={{ gridColumn: `${x + 1} / span 1`, gridRow: `${y + 1} / span 1` }}
            onClick={() => {
              if (selectedInfrastructure && (isInActiveZone || !restrictionEnabled)) {
                handlePlaceObject(x, y)
              }
            }}
            onMouseEnter={() => setHoveredCell({ x, y })}
            onMouseLeave={() => setHoveredCell(null)}
          />,
        )
      }
    }
    return cells
  }

  // Рендер размещенных объектов
  const renderPlacedObjects = () => {
    const elements = []

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
            />,
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
          onClick={() => {
            handleObjectClick(obj)
          }}
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
        </div>,
      )
    })

    return elements
  }

  // Рендер предпросмотра размещения
  const renderPlacementPreview = () => {
    if (!hoveredCell || !selectedInfrastructure) return null

    const { width, height, safetyZone } = objectSizes[selectedInfrastructure]
    const { x, y } = hoveredCell

    const canPlace = canPlaceObject(x, y, width, height, safetyZone)

    return (
      <div
        className={`${canPlace ? "bg-green-300 bg-opacity-50" : "bg-red-300 bg-opacity-50"} rounded-md border-2 ${canPlace ? "border-green-500" : "border-red-500"}`}
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
    if (!isMeasuring || !measurementStart || !hoveredCell) return null

    return (
      <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
        <line
          x1={`${(measurementStart.x + 0.5) * (100 / gridSize)}%`}
          y1={`${(measurementStart.y + 0.5) * (100 / gridSize)}%`}
          x2={`${(hoveredCell.x + 0.5) * (100 / gridSize)}%`}
          y2={`${(hoveredCell.y + 0.5) * (100 / gridSize)}%`}
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
                    className="text-left flex-grow px-2 py-1 hover:bg-gray-100 rounded text-sm truncate"
                    onClick={() => handleSelectLayerInfo(layer)}
                    title={layer.name}
                  >
                    {layer.name}
                  </button>
                  <button className="ml-2 p-1 rounded hover:bg-gray-200" onClick={() => handleToggleLayer(layer.id)}>
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
                      selectedArea === "shackleton" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    } rounded-md hover:bg-blue-200 transition-colors`}
                    onClick={() => setSelectedArea("shackleton")}
                  >
                    Кратер Шеклтон
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      selectedArea === "cabeus" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    } rounded-md hover:bg-blue-200 transition-colors`}
                    onClick={() => setSelectedArea("cabeus")}
                  >
                    Кратер Кабеус
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      selectedArea === "haworth" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    } rounded-md hover:bg-blue-200 transition-colors`}
                    onClick={() => setSelectedArea("haworth")}
                  >
                    Плато Хаворт
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      selectedArea === "malapert" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    } rounded-md hover:bg-blue-200 transition-colors`}
                    onClick={() => setSelectedArea("malapert")}
                  >
                    Гора Малаперт
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    Загрузить рельеф
                  </button>
                  <button
                    className="px-6 py-2 ml-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setShowLoadProjectDialog(true)}
                  >
                    Загрузить сохранение
                  </button>
                  <div>
                    <span className="text-green-600 flex items-center">
                      <Check className="h-5 w-5 mr-1" />
                      Данные для{" "}
                      {selectedArea === "shackleton"
                        ? "Кратера Шеклтон"
                        : selectedArea === "cabeus"
                          ? "Кратера Кабеус"
                          : selectedArea === "haworth"
                            ? "Плато Хаворт"
                            : "Горы Малаперт"}{" "}
                      загружены
                    </span>

                    {uploadedAreas.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Загруженные участки:</p>
                        <ul className="mt-1 space-y-1">
                          {uploadedAreas.map((area, index) => (
                            <li key={index} className="text-sm text-green-600 flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              {area}
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
                  <div className="h-full bg-blue-600 rounded-full w-full"></div>
                </div>
                <div className="mt-2 text-sm text-gray-600">Загружено: 100% (245 МБ)</div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                    <span>Высотные данные</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                    <span>Спектральный анализ</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>
                    <span>Данные о льде</span>
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
                onClick={() =>
                  setAreaFilters({
                    sunlight: false,
                    iceProximity: false,
                    flatTerrain: false,
                    lavaTubes: false,
                    spaceportDistance: false,
                    sufficientArea: false,
                  })
                }
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
                    onChange={(e) => setSelectedArea(e.target.value)}
                  >
                    <option value="shackleton">Кратер Шеклтон</option>
                    <option value="cabeus">Кратер Кабеус</option>
                    <option value="haworth">Плато Хаворт</option>
                    <option value="malapert">Гора Малаперт</option>
                    <option value="shoemaker">Кратер Шумейкер</option>
                    <option value="loaded">Загруженный участок</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Выберите из списка наиболее пригодных зон Южного полюса</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Площадь (м²)</label>
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

                          {/* Рендер предпросмотра размещения */}
                          {renderPlacementPreview()}

                          {/* Рендер маршрутов */}
                          {renderRoutes()}

                          {/* Рендер измерений */}
                          {renderMeasurements()}

                          {/* Рендер текущего измерения */}
                          {renderCurrentMeasurement()}

                          {/* Добавить отображение координат при наведении: */}
                          {activeAnalysisTool === "coordinates" && hoveredCell && (
                            <div
                              className="absolute bg-white px-2 py-1 rounded shadow-md text-xs z-50"
                              style={{
                                left: `${hoveredCell.x * (100 / gridSize)}%`,
                                top: `${hoveredCell.y * (100 / gridSize)}%`,
                                transform: "translate(10px, 10px)",
                              }}
                            >
                              X: {hoveredCell.x.toFixed(2)}, Y: {hoveredCell.y.toFixed(2)}
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
                              {Array.from({ length: 400 }).map((_, index) => (
                                <div
                                  key={`filter-${index}`}
                                  className={`${
                                    // Randomly determine if area matches filters for demo purposes
                                    Math.random() > 0.7 ? "bg-green-500 bg-opacity-20" : "bg-black bg-opacity-40"
                                  }`}
                                ></div>
                              ))}
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

      {renderSideMenu()}
      {renderSaveDialog()}
      {renderLayerInfo()}
      {renderHelpDialog()}
      {renderLoadProjectDialog()}
      {renderObjectInfoDialog()}
      {renderUploadDialog()}
      {/* Добавить сообщение о рисовании полигона, если активно */}
      {drawingPolygon && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-md shadow-lg border-l-4 border-blue-500 text-blue-700 z-50">
          Кликайте на карту, чтобы добавить точки. Замкните полигон, кликнув на первую точку.
        </div>
      )}

      {/* Coordinate Info Popup */}
      {showCoordinateInfo && clickedPointInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]">
            <h2 className="text-xl font-bold mb-4">Информация о точке</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">Координаты:</div>
                <div className="font-medium">
                  X: {clickedPointInfo.x}, Y: {clickedPointInfo.y}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">Высота:</div>
                <div className="font-medium">{clickedPointInfo.height} м</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">Освещенность:</div>
                <div className="font-medium">{clickedPointInfo.illumination}%</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">Уклон:</div>
                <div className="font-medium">{clickedPointInfo.slope}°</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">Тип грунта:</div>
                <div className="font-medium">{clickedPointInfo.soil}</div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowCoordinateInfo(false)}>Закрыть</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

