import React, { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HeatLegend } from '@/components/heat-legend'
import { cn } from '@/lib/utils'

interface HeatmapData {
  lat: number
  lng: number
  value: number
}

interface KinneretHeatmapProps {
  data: HeatmapData[]
  title?: string
  description?: string
  season?: 'winter' | 'summer'
  className?: string
  height?: number
}

// Kinneret lake bounds and center
const KINNERET_BOUNDS: [[number, number], [number, number]] = [
  [32.65, 35.55], // Southwest
  [32.95, 35.65]  // Northeast
]

const KINNERET_CENTER: [number, number] = [32.8, 35.6]

// Generate heatmap data based on season
const generateHeatmapData = (season: 'winter' | 'summer'): HeatmapData[] => {
  const data: HeatmapData[] = []
  const latStep = 0.01
  const lngStep = 0.01
  
  // Define the lake area more precisely
  const lakeBounds = {
    latMin: 32.65,
    latMax: 32.95,
    lngMin: 35.55,
    lngMax: 35.65
  }
  
  for (let lat = lakeBounds.latMin; lat <= lakeBounds.latMax; lat += latStep) {
    for (let lng = lakeBounds.lngMin; lng <= lakeBounds.lngMax; lng += lngStep) {
      // Check if point is within lake area (simplified ellipse)
      const centerLat = 32.8
      const centerLng = 35.6
      const latDist = Math.abs(lat - centerLat)
      const lngDist = Math.abs(lng - centerLng)
      
      // Simple lake shape approximation
      if (latDist < 0.15 && lngDist < 0.05) {
        let value = 0
        
        if (season === 'winter') {
          // Winter pattern: higher values in center and south
          const distFromCenter = Math.sqrt(latDist * latDist + lngDist * lngDist)
          const southFactor = Math.max(0, 1 - (lat - 32.7) / 0.25) // Higher in south
          value = Math.max(0, (0.045 * Math.exp(-distFromCenter / 0.1) * southFactor) + 
                             (Math.random() - 0.5) * 0.005)
        } else {
          // Summer pattern: higher values along western coast
          const westFactor = Math.max(0, 1 - Math.abs(lng - 35.55) / 0.1) // Higher on west
          const centerFactor = Math.max(0, 1 - Math.sqrt(latDist * latDist + lngDist * lngDist) / 0.15)
          value = Math.max(0, (0.015 * westFactor * centerFactor) + 
                             (Math.random() - 0.5) * 0.002)
        }
        
        if (value > 0.001) { // Only include meaningful values
          data.push({ lat, lng, value })
        }
      }
    }
  }
  
  return data
}

// Lake Kinneret - improved shape with wider north and pointed south
const LAKE_KINNERET_POLYGON = [
  [32.65, 35.58], [32.67, 35.57], [32.70, 35.56], [32.73, 35.55], [32.76, 35.55],
  [32.79, 35.56], [32.82, 35.57], [32.85, 35.59], [32.88, 35.61], [32.91, 35.63],
  [32.94, 35.65], [32.95, 35.67], [32.95, 35.69], [32.94, 35.71], [32.91, 35.73],
  [32.88, 35.74], [32.85, 35.75], [32.82, 35.75], [32.79, 35.74], [32.76, 35.73],
  [32.73, 35.71], [32.70, 35.69], [32.67, 35.67], [32.65, 35.64], [32.65, 35.58]
]

// Custom Leaflet layer with proper canvas masking
class HeatmapLayer extends L.Layer {
  private data: HeatmapData[]
  private season: 'winter' | 'summer'
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private maskCanvas: HTMLCanvasElement
  private maskCtx: CanvasRenderingContext2D

  constructor(data: HeatmapData[], season: 'winter' | 'summer') {
    super()
    this.data = data
    this.season = season
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.maskCanvas = document.createElement('canvas')
    this.maskCtx = this.maskCanvas.getContext('2d')!
  }

  onAdd(map: L.Map): this {
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.zIndex = '400'
    
    map.getPanes().overlayPane.appendChild(this.canvas)
    map.on('viewreset', this.update, this)
    map.on('zoom', this.update, this)
    map.on('move', this.update, this)
    
    this.update()
    return this
  }

  onRemove(map: L.Map): this {
    map.getPanes().overlayPane.removeChild(this.canvas)
    map.off('viewreset', this.update, this)
    map.off('zoom', this.update, this)
    map.off('move', this.update, this)
    return this
  }

  private update = () => {
    const map = this._map!
    const size = map.getSize()
    
    // Set canvas sizes
    this.canvas.width = size.x
    this.canvas.height = size.y
    this.maskCanvas.width = size.x
    this.maskCanvas.height = size.y
    
    // Clear canvases
    this.ctx.clearRect(0, 0, size.x, size.y)
    this.maskCtx.clearRect(0, 0, size.x, size.y)
    
    // Create mask (lake shape)
    this.maskCtx.fillStyle = 'white'
    this.maskCtx.beginPath()
    const firstPoint = map.latLngToContainerPoint([LAKE_KINNERET_POLYGON[0][0], LAKE_KINNERET_POLYGON[0][1]])
    this.maskCtx.moveTo(firstPoint.x, firstPoint.y)
    
    for (let i = 1; i < LAKE_KINNERET_POLYGON.length; i++) {
      const point = map.latLngToContainerPoint([LAKE_KINNERET_POLYGON[i][0], LAKE_KINNERET_POLYGON[i][1]])
      this.maskCtx.lineTo(point.x, point.y)
    }
    this.maskCtx.closePath()
    this.maskCtx.fill()
    
    // Draw heatmap on main canvas
    const maxValue = Math.max(...this.data.map(d => d.value))
    
    this.data.forEach(point => {
      const mapPoint = map.latLngToContainerPoint([point.lat, point.lng])
      const intensity = point.value / maxValue
      
      // Color based on season and intensity
      let color: string
      if (this.season === 'winter') {
        if (intensity > 0.8) color = '#dc2626'
        else if (intensity > 0.6) color = '#f59e0b'
        else if (intensity > 0.4) color = '#22c55e'
        else if (intensity > 0.2) color = '#3b82f6'
        else color = '#93c5fd'
      } else {
        if (intensity > 0.8) color = '#dc2626'
        else if (intensity > 0.6) color = '#f59e0b'
        else if (intensity > 0.4) color = '#22c55e'
        else if (intensity > 0.2) color = '#3b82f6'
        else color = '#93c5fd'
      }
      
      // Create radial gradient
      const gradient = this.ctx.createRadialGradient(
        mapPoint.x, mapPoint.y, 0,
        mapPoint.x, mapPoint.y, 50
      )
      
      const alpha1 = Math.floor(intensity * 0.8 * 255).toString(16).padStart(2, '0')
      const alpha2 = Math.floor(intensity * 0.3 * 255).toString(16).padStart(2, '0')
      
      gradient.addColorStop(0, color + alpha1)
      gradient.addColorStop(0.7, color + alpha2)
      gradient.addColorStop(1, color + '00')
      
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(mapPoint.x - 50, mapPoint.y - 50, 100, 100)
    })
    
    // Apply mask using composite operation
    this.ctx.globalCompositeOperation = 'source-in'
    this.ctx.drawImage(this.maskCanvas, 0, 0)
    this.ctx.globalCompositeOperation = 'source-over'
  }
}

// Heatmap overlay component using custom layer
function HeatmapOverlay({ data, season }: { data: HeatmapData[], season: 'winter' | 'summer' }) {
  const map = useMap()
  
  useEffect(() => {
    const heatmapLayer = new HeatmapLayer(data, season)
    heatmapLayer.addTo(map)
    
    return () => {
      map.removeLayer(heatmapLayer)
    }
  }, [data, season, map])
  
  return null
}

export function KinneretHeatmap({
  data,
  title = 'Lake Kinneret Heatmap',
  description,
  season = 'winter',
  className,
  height = 500
}: KinneretHeatmapProps) {
  const [selectedSeason, setSelectedSeason] = useState<'winter' | 'summer'>(season)
  
  const heatmapData = useMemo(() => {
    return generateHeatmapData(selectedSeason)
  }, [selectedSeason])
  
  const maxValue = Math.max(...heatmapData.map(d => d.value))
  const minValue = Math.min(...heatmapData.map(d => d.value))
  
  return (
    <Card className={cn("rounded-2xl shadow-sm", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedSeason === 'winter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeason('winter')}
            >
              Winter
            </Button>
            <Button
              variant={selectedSeason === 'summer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeason('summer')}
            >
              Summer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative" style={{ height: `${height}px` }}>
          <MapContainer
            center={KINNERET_CENTER}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <HeatmapOverlay data={heatmapData} season={selectedSeason} />
          </MapContainer>
          
          {/* Legend */}
          <div className="absolute top-4 right-4 z-[1000]">
            <HeatLegend
              title={`${selectedSeason === 'winter' ? 'Winter' : 'Summer'} Biomass`}
              min={minValue}
              max={maxValue}
              unit=" mmol P/m³"
              colors={['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
