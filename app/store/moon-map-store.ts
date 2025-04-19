import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MoonMapState {
  // Map state
  mapPosition: { x: number; y: number }
  mapZoom: number
  gridSize: number
  cellSize: number
  isDragging: boolean
  dragStart: { x: number; y: number } | null
  hoveredCell: { x: number; y: number } | null
  activeAnalysisTool: string | null
  activeMapLayer: string
  restrictionEnabled: boolean
  restrictionShape: string
  ellipseWidth: number
  ellipseHeight: number
  polygonPoints: { x: number; y: number }[]
  drawingPolygon: boolean
  drawingRoute: boolean
  routeStartObject: any | null
  routeEndObject: any | null
  filtersApplied: boolean
  isMeasuring: boolean
  measurementStart: { x: number; y: number } | null
  measurements: any[]
  routes: any[]
  placedObjects: any[]
  selectedInfrastructure: string | null
  showCoordinateInfo: boolean
  clickedPointInfo: any | null
  showHelpDialog: boolean
  selectedLayerInfo: any | null
  restrictedArea: number
  showPlacementCriteria: boolean

  // Actions
  setMapPosition: (position: { x: number; y: number }) => void
  setMapZoom: (zoom: number) => void
  setIsDragging: (isDragging: boolean) => void
  setDragStart: (start: { x: number; y: number } | null) => void
  setHoveredCell: (cell: { x: number; y: number } | null) => void
  setActiveAnalysisTool: (tool: string | null) => void
  setActiveMapLayer: (layer: string) => void
  setRestrictionEnabled: (enabled: boolean) => void
  setRestrictionShape: (shape: string) => void
  setEllipseWidth: (width: number) => void
  setEllipseHeight: (height: number) => void
  setPolygonPoints: (points: { x: number; y: number }[]) => void
  setDrawingPolygon: (drawing: boolean) => void
  setDrawingRoute: (drawing: boolean) => void
  setRouteStartObject: (object: any | null) => void
  setRouteEndObject: (object: any | null) => void
  setFiltersApplied: (applied: boolean) => void
  setIsMeasuring: (measuring: boolean) => void
  setMeasurementStart: (start: { x: number; y: number } | null) => void
  setMeasurements: (measurements: any[]) => void
  setRoutes: (routes: any[]) => void
  setPlacedObjects: (objects: any[]) => void
  setSelectedInfrastructure: (infrastructure: string | null) => void
  setShowCoordinateInfo: (show: boolean) => void
  setClickedPointInfo: (info: any | null) => void
  setShowHelpDialog: (show: boolean) => void
  setSelectedLayerInfo: (info: any | null) => void
  setRestrictedArea: (area: number) => void
  setShowPlacementCriteria: (show: boolean) => void
}

export const useMoonMapStore = create<MoonMapState>()(
  persist(
    (set) => ({
      // Initial state
      mapPosition: { x: 0, y: 0 },
      mapZoom: 1,
      gridSize: 20,
      cellSize: 10,
      isDragging: false,
      dragStart: null,
      hoveredCell: null,
      activeAnalysisTool: null,
      activeMapLayer: 'height',
      restrictionEnabled: false,
      restrictionShape: 'ellipse',
      ellipseWidth: 10,
      ellipseHeight: 10,
      polygonPoints: [],
      drawingPolygon: false,
      drawingRoute: false,
      routeStartObject: null,
      routeEndObject: null,
      filtersApplied: false,
      isMeasuring: false,
      measurementStart: null,
      measurements: [],
      routes: [],
      placedObjects: [],
      selectedInfrastructure: null,
      showCoordinateInfo: false,
      clickedPointInfo: null,
      showHelpDialog: false,
      selectedLayerInfo: null,
      restrictedArea: 0,
      showPlacementCriteria: false,

      // Actions
      setMapPosition: (position) => set({ mapPosition: position }),
      setMapZoom: (zoom) => set({ mapZoom: zoom }),
      setIsDragging: (isDragging) => set({ isDragging }),
      setDragStart: (start) => set({ dragStart: start }),
      setHoveredCell: (cell) => set({ hoveredCell: cell }),
      setActiveAnalysisTool: (tool) => set({ activeAnalysisTool: tool }),
      setActiveMapLayer: (layer) => set({ activeMapLayer: layer }),
      setRestrictionEnabled: (enabled) => set({ restrictionEnabled: enabled }),
      setRestrictionShape: (shape) => set({ restrictionShape: shape }),
      setEllipseWidth: (width) => set({ ellipseWidth: width }),
      setEllipseHeight: (height) => set({ ellipseHeight: height }),
      setPolygonPoints: (points) => set({ polygonPoints: points }),
      setDrawingPolygon: (drawing) => set({ drawingPolygon: drawing }),
      setDrawingRoute: (drawing) => set({ drawingRoute: drawing }),
      setRouteStartObject: (object) => set({ routeStartObject: object }),
      setRouteEndObject: (object) => set({ routeEndObject: object }),
      setFiltersApplied: (applied) => set({ filtersApplied: applied }),
      setIsMeasuring: (measuring) => set({ isMeasuring: measuring }),
      setMeasurementStart: (start) => set({ measurementStart: start }),
      setMeasurements: (measurements) => set({ measurements }),
      setRoutes: (routes) => set({ routes }),
      setPlacedObjects: (objects) => set({ placedObjects: objects }),
      setSelectedInfrastructure: (infrastructure) => set({ selectedInfrastructure: infrastructure }),
      setShowCoordinateInfo: (show) => set({ showCoordinateInfo: show }),
      setClickedPointInfo: (info) => set({ clickedPointInfo: info }),
      setShowHelpDialog: (show) => set({ showHelpDialog: show }),
      setSelectedLayerInfo: (info) => set({ selectedLayerInfo: info }),
      setRestrictedArea: (area) => set({ restrictedArea: area }),
      setShowPlacementCriteria: (show) => set({ showPlacementCriteria: show }),
    }),
    {
      name: 'moon-map-storage',
      partialize: (state) => ({
        placedObjects: state.placedObjects,
        routes: state.routes,
        measurements: state.measurements,
      }),
    }
  )
) 