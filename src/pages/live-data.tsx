import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { EnhancedMapView } from '@/components/enhanced-map-view'
import { FigureFrame } from '@/components/figure-frame'
import { MapPin, BarChart3, Clock, Map } from 'lucide-react'
import mapData from '@/data/maps.json'

export function LiveDataPage() {
  const [selectedMarker, setSelectedMarker] = useState<typeof mapData.stations[0] | null>(null)
  
  // Refs for export
  const mapViewRef = useRef<HTMLDivElement>(null)


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Data</h1>
          <p className="text-muted-foreground">
            Interactive Kinneret biogeochemical insights — groups, seasons, and nutrient scenarios.
          </p>
        </div>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">
            <Map className="mr-2 h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="chart">
            <BarChart3 className="mr-2 h-4 w-4" />
            Chart View
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <FigureFrame
            ref={mapViewRef}
            title="Live Data Map View"
            subtitle="Interactive map showing current monitoring stations and data"
            caption="Live data map view with current raster + markers + legend."
            units="mmol P/m³"
            source="Lake Kinneret monitoring program"
            pageName="live-data"
            figureKey="map-view"
            supportsSVG={false}
          >
            <div>
              <EnhancedMapView data={mapData} />
            </div>
          </FigureFrame>
          
          {/* Station Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Stations</CardTitle>
              <CardDescription>
                Click on a station to view detailed data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mapData.stations.map((station) => (
                  <Button
                    key={station.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMarker(station)}
                    className={selectedMarker?.id === station.id ? 'bg-primary text-primary-foreground' : ''}
                    aria-label={`Select ${station.name} station`}
                  >
                    {station.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedMarker && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedMarker.name} - Current Data</CardTitle>
                <CardDescription>
                  Latest measurements from this monitoring station
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Station Data</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Station</span>
                        <span className="font-medium">{selectedMarker.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Group</span>
                        <span className="font-medium">{selectedMarker.group}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Intensity</span>
                        <span className="font-medium">{selectedMarker.intensity.toFixed(3)} {mapData.legend.units}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Sample Metadata</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Position</span>
                        <span className="font-medium">{selectedMarker.position[0].toFixed(3)}, {selectedMarker.position[1].toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Note</span>
                        <span className="font-medium">Sample metadata here</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Data Visualization</CardTitle>
              <CardDescription>
                Live charts showing current phytoplankton concentrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Live Charts</p>
                    <p className="text-muted-foreground">
                      Real-time data visualization would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temporal Data Analysis</CardTitle>
              <CardDescription>
                Historical trends and patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Timeline View</p>
                    <p className="text-muted-foreground">
                      Time-series data visualization would be shown here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Demo rendering for calibration preview—replace with dataset v1.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}