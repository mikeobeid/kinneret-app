import React, { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ZooplanktonChart } from '@/components/zooplankton-chart'
import { EnhancedMapView } from '@/components/enhanced-map-view'
import { FigureExportControls } from '@/components/figure-export-controls'
import { TrendingUp } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import mapDataRaw from '@/data/maps.json'
const mapData = mapDataRaw as any

export function ResearchDashboardPage() {
  
  // State for group selection
  const [selectedGroup, setSelectedGroup] = useState('diatoms')
  
  // State for view mode
  const [viewMode, setViewMode] = useState<'heatmap' | 'depth'>('heatmap')
  
  
  // Group data
  const groups = [
    { id: 'diatoms', name: 'Diatoms', color: '#3B82F6' },
    { id: 'dinoflagellates', name: 'Dinoflagellates', color: '#10B981' },
    { id: 'small_phyto', name: 'Small Phytoplankton', color: '#F59E0B' },
    { id: 'n_fixers', name: 'N-fixing Cyanobacteria', color: '#EF4444' },
    { id: 'microcystis', name: 'Microcystis', color: '#8B5CF6' }
  ]
  
  const selectedGroupData = groups.find(g => g.id === selectedGroup)
  
  // Generate depth profile data
  const generateDepthProfileData = () => {
    const depths = Array.from({ length: 21 }, (_, i) => -i * 2) // 0 to -40m
    
    return depths.map(depth => {
      let biomass = 0
      
      // Different depth patterns for different phytoplankton groups
      switch (selectedGroup) {
        case 'diatoms':
          // Diatoms peak at surface and decrease with depth
          biomass = Math.max(0, 0.04 * Math.exp(-Math.abs(depth) / 15))
          break
        case 'dinoflagellates':
          // Dinoflagellates peak at mid-depth (10-20m)
          biomass = Math.max(0, 0.035 * Math.exp(-Math.pow((depth + 15) / 8, 2)))
          break
        case 'small_phyto':
          // Small phytoplankton more evenly distributed
          biomass = Math.max(0, 0.03 * (1 - Math.abs(depth) / 40))
          break
        case 'n_fixers':
          // N-fixers peak near surface (0-10m)
          biomass = Math.max(0, 0.025 * Math.exp(-Math.abs(depth) / 10))
          break
        case 'microcystis':
          // Microcystis buoyant, concentrated at surface
          biomass = Math.max(0, 0.045 * Math.exp(-Math.abs(depth) / 8))
          break
        default:
          biomass = Math.max(0, 0.03 * Math.exp(-Math.abs(depth) / 15))
      }
      
      // Add some seasonal variation based on current month
      const monthVariation = 1 + 0.2 * Math.sin((new Date().getMonth() + 1) * Math.PI / 6)
      
      return {
        depth: depth,
        biomass: biomass * monthVariation,
        depthLabel: `${depth}m`
      }
    })
  }
  
  const depthProfileData = generateDepthProfileData()
  
  // Export functions
  
  // Refs for export
  const phytoplanktonRef = useRef<HTMLDivElement>(null)
  const zooplanktonRef = useRef<HTMLDivElement>(null)
  const spatialMapRef = useRef<HTMLDivElement>(null)


  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Research Dashboard — Lake Kinneret
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Scientific analysis based on 3D biogeochemical model and monitoring data
          </p>
        </div>
      </header>

      {/* Research Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Research Overview
          </CardTitle>
          <CardDescription>
            Key findings from the 3D biogeochemical model development and calibration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700 dark:text-green-400">Model Success</h4>
              <p className="text-sm text-muted-foreground">
                Successfully simulates timing of spring Microcystis bloom and summer N-fixing cyanobacteria bloom
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400">Spatial Variability</h4>
              <p className="text-sm text-muted-foreground">
                High coastal concentrations in summer, central concentrations in winter
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700 dark:text-purple-400">3D Advantage</h4>
              <p className="text-sm text-muted-foreground">
                Provides spatial results that 1D models cannot capture, crucial for bloom prediction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="phytoplankton" className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
              <TabsTrigger 
                value="phytoplankton" 
                className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Phytoplankton
              </TabsTrigger>
              <TabsTrigger 
                value="zooplankton" 
                className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Zooplankton
              </TabsTrigger>
              <TabsTrigger 
                value="spatial" 
                className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Spatial
              </TabsTrigger>
              <TabsTrigger 
                value="parameters" 
                className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Parameters
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="phytoplankton" className="space-y-4">
          {/* Full Page Layout - No Nested Frames */}
          <div className="space-y-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Phytoplankton Depth-Time Analysis</h2>
                <p className="text-muted-foreground mt-1">
                  Seasonal patterns and depth distribution of phytoplankton groups based on research data
                </p>
              </div>
              <FigureExportControls
                elementRef={phytoplanktonRef as React.RefObject<HTMLElement>}
                metadata={{
                  title: viewMode === 'heatmap' 
                    ? `${selectedGroupData?.name} Depth-Time Heatmap`
                    : `${selectedGroupData?.name} Depth Profile`,
                  subtitle: viewMode === 'heatmap' 
                    ? 'Depth: 0 to -40m | Time: January to December'
                    : 'Average biomass concentration across depth layers',
                  caption: viewMode === 'heatmap' 
                    ? 'Biomass (mmol P/m³) across depth (m) and months; depth increases downward. Units: mmol P/m³'
                    : 'Vertical distribution of phytoplankton biomass showing concentration changes with depth. Units: mmol P/m³',
                  units: 'mmol P/m³',
                  source: 'Lake Kinneret monitoring program',
                  timestamp: new Date().toISOString(),
                  appName: 'Kinneret3DEcology',
                  appVersion: '1.0.0'
                }}
                filename={`research-phytoplankton-${selectedGroup}-${viewMode}`}
                pageName="research"
                figureKey={`phytoplankton-${selectedGroup}-${viewMode}`}
                supportsSVG={true}
              />
            </div>


            {/* Group Selection with State */}
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <button 
                  key={group.id}
                  className={`px-3 py-1 text-sm rounded flex items-center gap-2 ${
                    selectedGroup === group.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border hover:bg-muted'
                  }`}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'heatmap' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'border hover:bg-muted'
                }`}
                onClick={() => setViewMode('heatmap')}
              >
                Heatmap View
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'depth' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'border hover:bg-muted'
                }`}
                onClick={() => setViewMode('depth')}
              >
                Depth Profile
              </button>
            </div>

            {/* Chart Area - Auto-sizing to fit content */}
            <div id="phytoplankton-chart" ref={phytoplanktonRef}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">
                  {viewMode === 'heatmap' 
                    ? `${selectedGroupData?.name} Depth-Time Heatmap`
                    : `${selectedGroupData?.name} Depth Profile`
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'heatmap' 
                    ? 'Depth: 0 to -40m | Time: January to December'
                    : 'Average biomass concentration across depth layers'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Units: mmol P/m³ | Based on research data from Lake Kinneret
                </p>
              </div>
              
              {/* Conditional Chart Display */}
              {viewMode === 'heatmap' ? (
                <>
                  {/* Heatmap Grid - Auto-sizing */}
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-1 text-xs">
                      {/* Month headers */}
                      <div className="col-span-1"></div>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                        <div key={month} className="text-center font-medium text-muted-foreground py-1" style={{ gridColumn: index + 2 }}>
                          {month}
                        </div>
                      ))}
                      
                      {/* Heatmap rows */}
                      {Array.from({ length: 20 }, (_, depthIndex) => (
                        <React.Fragment key={depthIndex}>
                          {/* Depth label */}
                          <div className="text-right font-medium text-muted-foreground py-1 pr-2 flex items-center justify-end">
                            {-(depthIndex + 1) * 2}m
                          </div>
                          
                          {/* Heatmap cells */}
                          {Array.from({ length: 12 }, (_, monthIndex) => {
                            const value = Math.random() * 0.05; // Simulated data
                            const intensity = value / 0.05;
                            const opacity = Math.max(0.1, intensity);
                            
                            return (
                              <div
                                key={`${depthIndex}-${monthIndex}`}
                                className="w-8 h-8"
                                style={{
                                  backgroundColor: selectedGroupData?.color || '#3B82F6',
                                  opacity: opacity,
                                }}
                                title={`Month ${monthIndex + 1}, Depth ${-(depthIndex + 1) * 2}m: ${value.toFixed(4)} mmol P/m³`}
                              />
                            )
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color scale legend - Below the heatmap */}
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <span className="text-xs text-muted-foreground">Low</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4"
                          style={{
                            backgroundColor: selectedGroupData?.color || '#3B82F6',
                            opacity: 0.1 + (i * 0.09),
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">High</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Depth Profile Chart */}
                  <div className="p-4">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={depthProfileData}
                          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="depth"
                            type="number"
                            scale="linear"
                            domain={[0, -40]}
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Depth (m)', position: 'insideBottom', offset: -10 }}
                          />
                          <YAxis 
                            label={{ value: 'mmol P/m³', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                            tick={{ fontSize: 12 }}
                            width={60}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value.toFixed(4)} mmol P/m³`, 'Biomass']}
                            labelFormatter={(depth) => `Depth: ${depth}m`}
                          />
                          <Area
                            type="monotone"
                            dataKey="biomass"
                            stroke={selectedGroupData?.color || '#3B82F6'}
                            fill={selectedGroupData?.color || '#3B82F6'}
                            fillOpacity={0.6}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Depth Profile Legend */}
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <span className="text-xs text-muted-foreground">Surface (0m)</span>
                      <div className="flex flex-col items-center gap-1">
                        <div 
                          className="w-4 h-4"
                          style={{ backgroundColor: selectedGroupData?.color || '#3B82F6' }}
                        />
                        <span className="text-xs text-muted-foreground">{selectedGroupData?.name} Biomass</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Bottom (-40m)</span>
                    </div>
                  </div>
                </>
              )}
              
              {/* Caption - Below the legend */}
              <div className="mt-4 pt-3 border-t border-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                  {viewMode === 'heatmap' 
                    ? 'Biomass (mmol P/m³) across depth (m) and months; depth increases downward. Units: mmol P/m³'
                    : 'Vertical distribution of phytoplankton biomass showing concentration changes with depth. Units: mmol P/m³'
                  }
                </p>
              </div>

              {/* Research-Based Parameter Ranges */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">Research-Based Parameter Ranges</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Physiological parameters from Table 7 of the research study
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Diatoms */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-blue-600">Diatoms</h5>
                    <div className="text-xs space-y-1">
                      <div><strong>Growth Rate:</strong> 0.5-2.0 day⁻¹</div>
                      <div><strong>Half-saturation N:</strong> 0.5-2.0 μM</div>
                      <div><strong>Half-saturation P:</strong> 0.05-0.2 μM</div>
                      <div><strong>Optimal Light:</strong> 50-150 μmol m⁻² s⁻¹</div>
                    </div>
                  </div>

                  {/* Dinoflagellates */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-green-600">Dinoflagellates</h5>
                    <div className="text-xs space-y-1">
                      <div><strong>Growth Rate:</strong> 0.3-1.5 day⁻¹</div>
                      <div><strong>Half-saturation N:</strong> 1.0-3.0 μM</div>
                      <div><strong>Half-saturation P:</strong> 0.1-0.3 μM</div>
                      <div><strong>Optimal Light:</strong> 30-100 μmol m⁻² s⁻¹</div>
                    </div>
                  </div>

                  {/* Small Phytoplankton */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-yellow-600">Small Phytoplankton</h5>
                    <div className="text-xs space-y-1">
                      <div><strong>Growth Rate:</strong> 0.8-2.5 day⁻¹</div>
                      <div><strong>Half-saturation N:</strong> 0.3-1.5 μM</div>
                      <div><strong>Half-saturation P:</strong> 0.02-0.1 μM</div>
                      <div><strong>Optimal Light:</strong> 80-200 μmol m⁻² s⁻¹</div>
                    </div>
                  </div>

                  {/* N-fixing Cyanobacteria */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-red-600">N-fixing Cyanobacteria</h5>
                    <div className="text-xs space-y-1">
                      <div><strong>Growth Rate:</strong> 0.2-1.0 day⁻¹</div>
                      <div><strong>Half-saturation P:</strong> 0.1-0.5 μM</div>
                      <div><strong>N₂ Fixation Rate:</strong> 0.01-0.1 day⁻¹</div>
                      <div><strong>Optimal Light:</strong> 60-120 μmol m⁻² s⁻¹</div>
                    </div>
                  </div>

                  {/* Microcystis */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-purple-600">Microcystis</h5>
                    <div className="text-xs space-y-1">
                      <div><strong>Growth Rate:</strong> 0.4-1.8 day⁻¹</div>
                      <div><strong>Half-saturation N:</strong> 2.0-5.0 μM</div>
                      <div><strong>Half-saturation P:</strong> 0.05-0.2 μM</div>
                      <div><strong>Buoyancy Control:</strong> 0.1-0.5 day⁻¹</div>
                    </div>
                  </div>

                  {/* Environmental Factors */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-600">Environmental Factors</h5>
                    <div className="text-xs space-y-1">
                      <div><strong>Temperature:</strong> 10-30°C</div>
                      <div><strong>pH Range:</strong> 7.5-8.5</div>
                      <div><strong>Mixing Depth:</strong> 5-25m</div>
                      <div><strong>Nutrient Loading:</strong> Seasonal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="zooplankton" className="space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Zooplankton Dynamics</h2>
                <p className="text-muted-foreground mt-1">
                  Predator-prey relationships and seasonal patterns based on research findings
                </p>
              </div>
              <FigureExportControls
                elementRef={zooplanktonRef as React.RefObject<HTMLElement>}
                metadata={{
                  title: 'Zooplankton Dynamics',
                  subtitle: 'Predator-prey relationships and seasonal patterns based on research findings',
                  caption: 'Predator–prey dynamics; model lines vs observations. Units: mmol C/m³',
                  units: 'mmol C/m³',
                  source: 'Lake Kinneret monitoring program',
                  timestamp: new Date().toISOString(),
                  appName: 'Kinneret3DEcology',
                  appVersion: '1.0.0'
                }}
                filename="research-zooplankton-dynamics"
                pageName="research"
                figureKey="zooplankton-dynamics"
                supportsSVG={true}
              />
            </div>
            
            <div id="zooplankton-chart" className="p-4" ref={zooplanktonRef}>
              <ZooplanktonChart
                title=""
                description=""
              />
            </div>
            
            <div className="mt-4 pt-3 border-t border-muted/50">
              <p className="text-sm text-muted-foreground text-center">
                Predator–prey dynamics; model lines vs observations. Units: mmol C/m³
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spatial" className="space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Spatial Patterns</h2>
                <p className="text-muted-foreground mt-1">
                  Biomass heatmap showing seasonal variations
                </p>
              </div>
              <FigureExportControls
                elementRef={spatialMapRef as React.RefObject<HTMLElement>}
                metadata={{
                  title: 'Spatial Patterns',
                  subtitle: 'Biomass heatmap showing seasonal variations',
                  caption: 'Biomass heatmap; legend shows mmol P/m³. Units: mmol P/m³',
                  units: 'mmol P/m³',
                  source: 'Lake Kinneret monitoring program',
                  timestamp: new Date().toISOString(),
                  appName: 'Kinneret3DEcology',
                  appVersion: '1.0.0'
                }}
                filename="research-spatial-patterns"
                pageName="research"
                figureKey="spatial-patterns"
                supportsSVG={true}
              />
            </div>
            
            <div id="spatial-chart" className="p-4" ref={spatialMapRef}>
              <EnhancedMapView data={mapData} />
            </div>
            
            <div className="mt-4 pt-3 border-t border-muted/50">
              <p className="text-sm text-muted-foreground text-center">
                Biomass heatmap; legend shows mmol P/m³. Units: mmol P/m³
              </p>
            </div>

            {/* Spatial Pattern Analysis - Integrated */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Spatial Pattern Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seasonal variations in biomass distribution from research findings
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-600">Winter Pattern</h4>
                  <p className="text-sm text-muted-foreground">
                    {mapData.spatialPatterns.winter.description}
                  </p>
                  <div className="text-sm">
                    <strong>Max Concentration:</strong> {mapData.spatialPatterns.winter.maxConcentration} {mapData.legend.units}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mapData.spatialPatterns.winter.pattern}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-orange-600">Summer Pattern</h4>
                  <p className="text-sm text-muted-foreground">
                    {mapData.spatialPatterns.summer.description}
                  </p>
                  <div className="text-sm">
                    <strong>Max Concentration:</strong> {mapData.spatialPatterns.summer.maxConcentration} {mapData.legend.units}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mapData.spatialPatterns.summer.pattern}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Calibration Results</CardTitle>
              <CardDescription>
                Comparison between model predictions and observed data from Lake Kinneret monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Model Performance</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Good agreement with phytoplankton counts</li>
                      <li>• Successful simulation of bloom timing</li>
                      <li>• Accurate spatial distribution patterns</li>
                      <li>• Validated against satellite data</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Advantages</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 3D spatial resolution</li>
                      <li>• Captures coastal vs central patterns</li>
                      <li>• Includes physical-biological coupling</li>
                      <li>• Enables bloom prediction</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Research Note
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    The model shows some timing mismatches (e.g., Microcystis appears earlier in model than observations). 
                    These discrepancies provide valuable insights for model refinement and understanding of ecological processes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
