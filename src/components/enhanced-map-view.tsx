import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, ImageOverlay, CircleMarker, Popup, useMap } from 'react-leaflet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BiomassLegend } from '@/components/biomass-legend'
import { Snowflake, Sun, Layout, Maximize2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapData {
  lake: string
  bbox: [number, number, number, number] // [south, west, north, east]
  rasters: Array<{
    id: string
    title: string
    url: string
  }>
  legend: {
    min: number
    max: number
    units: string
  }
  stations: Array<{
    id: string
    name: string
    position: [number, number]
    group: string
    intensity: number
  }>
}

interface EnhancedMapViewProps {
  data: MapData
  className?: string
}

// Component to sync map views
function MapSync({ targetMap }: { targetMap: L.Map | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (!targetMap) return

    const syncMaps = () => {
      if (map.getZoom() !== targetMap.getZoom()) {
        targetMap.setZoom(map.getZoom())
      }
      if (!map.getCenter().equals(targetMap.getCenter())) {
        targetMap.setView(map.getCenter(), map.getZoom())
      }
    }

    map.on('moveend', syncMaps)
    map.on('zoomend', syncMaps)

    return () => {
      map.off('moveend', syncMaps)
      map.off('zoomend', syncMaps)
    }
  }, [map, targetMap])

  return null
}

export function EnhancedMapView({ data, className }: EnhancedMapViewProps) {
  const [selectedRaster, setSelectedRaster] = useState(data.rasters[0].id)
  const [layoutMode, setLayoutMode] = useState<'single' | 'side-by-side'>('single')
  const [mapRefs, setMapRefs] = useState<{ [key: string]: L.Map | null }>({})

  // Calculate map bounds from bbox [south, west, north, east]
  const bounds: [[number, number], [number, number]] = [
    [data.bbox[0], data.bbox[1]], // SW corner
    [data.bbox[2], data.bbox[3]]  // NE corner
  ]

  // Calculate center point
  const center: [number, number] = [
    (data.bbox[0] + data.bbox[2]) / 2, // lat center
    (data.bbox[1] + data.bbox[3]) / 2  // lng center
  ]

  // Calculate appropriate zoom level
  const calculateZoom = () => {
    const latDiff = data.bbox[2] - data.bbox[0]
    const lngDiff = data.bbox[3] - data.bbox[1]
    const maxDiff = Math.max(latDiff, lngDiff)
    
    if (maxDiff > 0.3) return 9
    if (maxDiff > 0.15) return 10
    if (maxDiff > 0.075) return 11
    return 12
  }

  const selectedRasterData = data.rasters.find(r => r.id === selectedRaster) || data.rasters[0]

  const MapComponent = ({ 
    id, 
    rasterId, 
    syncTarget 
  }: { 
    id: string
    rasterId: string
    syncTarget?: L.Map | null 
  }) => {
    const mapRef = useRef<L.Map>(null)
    
    useEffect(() => {
      if (mapRef.current) {
        setMapRefs(prev => ({ ...prev, [id]: mapRef.current }))
      }
    }, [id])

    return (
      <div className="relative w-full h-full">
        <MapContainer
          ref={mapRef}
          center={center}
          zoom={calculateZoom()}
          minZoom={8}
          maxZoom={16}
          className="w-full h-full rounded-lg"
          zoomControl={true}
          scrollWheelZoom={true}
          style={{ height: '500px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <ImageOverlay
            url={data.rasters.find(r => r.id === rasterId)?.url || ''}
            bounds={bounds}
            opacity={0.95}
            zIndex={100}
            interactive={false}
          />
          
          {data.stations.map((station) => (
            <CircleMarker
              key={station.id}
              center={station.position}
              radius={8}
              pathOptions={{
                color: '#dc2626',
                weight: 2,
                fillColor: '#dc2626',
                fillOpacity: 0.8
              }}
              eventHandlers={{
                mouseover: (e) => {
                  const marker = e.target
                  marker.setRadius(10)
                },
                mouseout: (e) => {
                  const marker = e.target
                  marker.setRadius(8)
                }
              }}
            >
              <Popup>
                <div className="p-2">
                  <div className="font-semibold">Station {station.id}</div>
                  <div className="text-sm text-gray-600">Group: {station.group}</div>
                  <div className="text-sm text-gray-600">
                    Intensity: {station.intensity.toFixed(3)} {data.legend.units}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Sample metadata here
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          
          {syncTarget && <MapSync targetMap={syncTarget} />}
        </MapContainer>
        
        {/* Legend */}
        <div className="absolute top-4 right-4 z-[1000]">
          <BiomassLegend
            min={data.legend.min}
            max={data.legend.max}
            units={data.legend.units}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Biomass Heatmap — Lake {data.lake}
        </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Seasonal view (Winter / Summer)
            </p>
            <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Layout:</span>
            <Button
              variant={layoutMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('single')}
              className="flex items-center gap-1"
            >
              <Maximize2 className="h-3 w-3" />
              Toggle
            </Button>
            <Button
              variant={layoutMode === 'side-by-side' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('side-by-side')}
              className="flex items-center gap-1"
            >
              <Layout className="h-3 w-3" />
              Side-by-Side
            </Button>
          </div>
        </div>
      </div>

      {/* Season Switcher */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Season selection">
            {data.rasters.map((raster) => (
              <Button
                key={raster.id}
                variant={selectedRaster === raster.id ? 'default' : 'outline'}
                onClick={() => setSelectedRaster(raster.id)}
                className="flex items-center gap-2"
                role="tab"
                aria-selected={selectedRaster === raster.id}
                aria-label={`Select ${raster.title}`}
              >
                {raster.id === 'winter' ? (
                  <Snowflake className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                {raster.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Map</CardTitle>
          <CardDescription>
            {layoutMode === 'side-by-side' 
              ? 'Side-by-side comparison of winter and summer biomass'
              : `Currently showing ${selectedRasterData.title}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {layoutMode === 'side-by-side' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Snowflake className="h-4 w-4" />
                  Winter Biomass
                </h3>
                <MapComponent 
                  id="winter" 
                  rasterId="winter" 
                  syncTarget={mapRefs.summer}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Summer Biomass
                </h3>
                <MapComponent 
                  id="summer" 
                  rasterId="summer" 
                  syncTarget={mapRefs.winter}
                />
              </div>
            </div>
          ) : (
            <MapComponent 
              id="single" 
              rasterId={selectedRaster}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
