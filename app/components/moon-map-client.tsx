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
    ice_probability: {
      mean: number;
      max: number;
      min: number;
    };
  };
}

interface AreaData {
  name?: string;
  description?: string;
  gridSize?: number;
  tiles: TileData[];
}

export default function MoonMapClient() {
  // ... rest of the component code ...
} 