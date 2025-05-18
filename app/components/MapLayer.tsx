"use client"

import * as React from 'react'
import Image from 'next/image'
import { cn } from "@/lib/utils"

interface MapLayerProps {
  layerId: string
  imagePath: string
  isActive: boolean
  opacity?: number
  className?: string
  type: 'height' | 'spectral' | 'slope' | 'ice' | 'shadows'
}

export const MapLayer: React.FC<MapLayerProps> = ({ 
  layerId, 
  imagePath, 
  isActive,
  opacity = 0.8,
  className,
  type 
}) => {
  if (!isActive) return null;

  // Определяем стили для разных типов слоев
  const layerStyles = {
    height: "brightness-110 contrast-110",
    spectral: "brightness-105 contrast-105 saturate-150",
    slope: "brightness-100 contrast-120",
    ice: "brightness-105 contrast-110 saturate-110",
    shadows: "brightness-95 contrast-115"
  };

  return (
    <div 
      className={cn(
        "absolute inset-0 w-full h-full",
        className
      )}
      style={{ opacity }}
    >
      <Image
        src={imagePath}
        alt={`Map layer ${layerId}`}
        fill
        className={cn(
          "object-cover",
          layerStyles[type]
        )}
        priority
        quality={90}
        unoptimized={true}
      />
    </div>
  )
} 