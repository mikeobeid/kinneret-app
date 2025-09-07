import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapMarker {
  id: string
  position: [number, number]
  title: string
  description?: string
  color?: string
}

interface MapViewProps {
  title?: string
  description?: string
  center: [number, number]
  zoom?: number
  rasterUrl?: string
  rasterBounds?: [[number, number], [number, number]]
  markers?: MapMarker[]
  height?: number
  className?: string
}

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  
  return null
}

export function MapView({
  title = 'Map View',
  description,
  center,
  zoom = 10,
  rasterUrl,
  rasterBounds,
  markers = [],
  height = 400,
  className = ''
}: MapViewProps) {
  return (
    <Card className={`rounded-2xl shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height }} className="rounded-b-2xl overflow-hidden">
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-2xl"
          >
            <MapController center={center} zoom={zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Raster overlay */}
            {rasterUrl && rasterBounds && (
              <ImageOverlay
                url={rasterUrl}
                bounds={rasterBounds}
                opacity={0.7}
              />
            )}
            
            {/* Markers */}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={marker.color ? new L.DivIcon({
                  className: 'custom-marker',
                  html: `<div style="background-color: ${marker.color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                }) : undefined}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{marker.title}</h3>
                    {marker.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {marker.description}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
