import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import tilesData from '@/data/tiles.json'
import './LiveKinneret.css'

interface LiveKinneretProps {
  className?: string
  onMapReady?: (map: maplibregl.Map) => void
}

export interface LiveKinneretRef {
  addWindSource: (windData: any) => void
  addTemperatureRaster: (rasterUrl: string, opacity?: number) => void
  updateLayerOpacity: (layerId: string, opacity: number) => void
  getMap: () => maplibregl.Map | null
}

export const LiveKinneret = forwardRef<LiveKinneretRef, LiveKinneretProps>(({ className = '', onMapReady }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Create map instance with a simple style that doesn't require external tiles
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            name: 'OpenStreetMap Style',
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: [tilesData.basemapUrl],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [
              {
                id: 'osm-layer',
                type: 'raster',
                source: 'osm-tiles',
                paint: {
                  'raster-opacity': 1
                }
              }
            ]
          },
          center: tilesData.center as [number, number],
          zoom: tilesData.zoom,
          maxZoom: 18,
          minZoom: 3
        })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
    
    // Add fullscreen control
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right')

    // Add scale control
    map.current.addControl(new maplibregl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-left')

    // Add lake mask overlay
    map.current.on('load', () => {
      if (!map.current) return

      try {
        // Add lake mask source
        map.current.addSource('lake-mask', {
          type: 'geojson',
          data: tilesData.lakeMaskGeoJSON
        })

        // Add lake outline
        map.current.addLayer({
          id: 'lake-outline',
          type: 'line',
          source: 'lake-mask',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3,
            'line-opacity': 0.8
          }
        })

        // Add lake fill (transparent for visibility)
        map.current.addLayer({
          id: 'lake-fill',
          type: 'fill',
          source: 'lake-mask',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.3
          }
        })

        // Add bathymetric contours
        map.current.addSource('bathy-contours', {
          type: 'geojson',
          data: tilesData.bathyContours
        })

        map.current.addLayer({
          id: 'bathy-contours',
          type: 'line',
          source: 'bathy-contours',
          paint: {
            'line-color': '#6b7280',
            'line-width': 1,
            'line-opacity': 0.6,
            'line-dasharray': [2, 2]
          }
        })

        setIsMapLoaded(true)
        onMapReady?.(map.current)
      } catch (error) {
        console.error('Error adding map layers:', error)
        // Still set map as loaded even if layers fail
        setIsMapLoaded(true)
        onMapReady?.(map.current)
      }
    })

    // Handle style loading errors
        map.current.on('error', (e) => {
          console.error('Map error:', e)
          // If tiles fail to load, fall back to a simple style
          if (map.current) {
            map.current.setStyle({
              version: 8,
              name: 'Fallback Style',
              sources: {},
              layers: [
                {
                  id: 'background',
                  type: 'background',
                  paint: {
                    'background-color': '#e8f4fd'
                  }
                }
              ]
            })
          }
        })

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onMapReady])

  // Add wind source to map
  const addWindSource = useCallback((windData: any) => {
    if (!map.current || !isMapLoaded) return

    // Remove existing wind source if it exists
    if (map.current.getSource('wind-data')) {
      map.current.removeLayer('wind-particles')
      map.current.removeSource('wind-data')
    }

    // Add wind data source
    map.current.addSource('wind-data', {
      type: 'raster',
      tiles: [windData.tileUrl],
      tileSize: 256
    })

    // Add wind visualization layer
    map.current.addLayer({
      id: 'wind-particles',
      type: 'raster',
      source: 'wind-data',
      paint: {
        'raster-opacity': 0.7
      }
    })
  }, [isMapLoaded])

  // Add temperature raster to map
  const addTemperatureRaster = useCallback((rasterUrl: string, opacity: number = 0.7) => {
    if (!map.current || !isMapLoaded) return

    try {
      // Remove existing temperature layer if it exists
      if (map.current.getSource('temperature-raster')) {
        map.current.removeLayer('temperature-layer')
        map.current.removeSource('temperature-raster')
      }

      // Add temperature raster source
      map.current.addSource('temperature-raster', {
        type: 'raster',
        tiles: [rasterUrl],
        tileSize: 256
      })

      // Add temperature visualization layer
      map.current.addLayer({
        id: 'temperature-layer',
        type: 'raster',
        source: 'temperature-raster',
        paint: {
          'raster-opacity': opacity
        }
      })
    } catch (error) {
      console.error('Error adding temperature raster:', error)
    }
  }, [isMapLoaded])

  // Update layer opacity
  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    if (!map.current) return
    
    map.current.setPaintProperty(layerId, 'raster-opacity', opacity)
  }, [])

  // Expose map methods via ref
  useImperativeHandle(ref, () => ({
    addWindSource,
    addTemperatureRaster,
    updateLayerOpacity,
    getMap: () => map.current
  }))

  return (
    <div className={`kinneret-map ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      

      <div className="scale-bar">
        Scale: 1:50,000
      </div>

      <div className="north-arrow" />

      <div className="legend">
        <h4>Temperature</h4>
        <div className="legend-scale" />
        <div className="legend-labels">
          <span>10°C</span>
          <span>30°C</span>
        </div>
      </div>
    </div>
  )
})

export default LiveKinneret
