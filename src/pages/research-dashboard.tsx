import { useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DepthProfileChart } from '@/components/depth-profile-chart'
import { ZooplanktonChart } from '@/components/zooplankton-chart'
import { EnhancedMapView } from '@/components/enhanced-map-view'
import { FigureFrame } from '@/components/figure-frame'
import { TrendingUp } from 'lucide-react'
import mapData from '@/data/maps.json'
import researchParams from '@/data/research-parameters.json'

export function ResearchDashboardPage() {
  
  // Refs for export
  const depthProfileRef = useRef<HTMLDivElement>(null)
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="phytoplankton" className="text-xs sm:text-sm">Phytoplankton</TabsTrigger>
          <TabsTrigger value="zooplankton" className="text-xs sm:text-sm">Zooplankton</TabsTrigger>
          <TabsTrigger value="spatial" className="text-xs sm:text-sm">Spatial</TabsTrigger>
          <TabsTrigger value="parameters" className="text-xs sm:text-sm">Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="phytoplankton" className="space-y-6">
          <FigureFrame
            ref={depthProfileRef}
            title="Phytoplankton Depth-Time Analysis"
            subtitle="Seasonal patterns and depth distribution of phytoplankton groups based on research data"
            caption="Biomass (mmol P/m³) across depth (m) and months; depth increases downward."
            units="mmol P/m³"
            source="Lake Kinneret monitoring program, Station A"
            pageName="research"
            figureKey="depth-time-heatmap"
            supportsSVG={true}
          >
            <div>
              <DepthProfileChart
                title="Phytoplankton Depth-Time Analysis"
                description="Seasonal patterns and depth distribution of phytoplankton groups based on research data"
              />
            </div>
          </FigureFrame>
          
          <Card>
            <CardHeader>
              <CardTitle>Research-Based Parameter Ranges</CardTitle>
              <CardDescription>
                Physiological parameters from Table 7 of the research study
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(researchParams.phytoplanktonGroups).map(([key, group]) => (
                  <Card key={key}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.hebrewName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>μ (max growth):</strong> {group.mu.value} {group.mu.unit}
                      </div>
                      <div className="text-sm">
                        <strong>N:P ratio:</strong> {group.rnp.value} {group.rnp.unit}
                      </div>
                      <div className="text-sm">
                        <strong>Si:P ratio:</strong> {group.rsip.value} {group.rsip.unit}
                      </div>
                      <div className="text-sm">
                        <strong>KsP:</strong> {group.ksP.value} {group.ksP.unit}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {group.seasonalPattern}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zooplankton" className="space-y-6">
          <FigureFrame
            ref={zooplanktonRef}
            title="Zooplankton Dynamics"
            subtitle="Predator-prey relationships and seasonal patterns based on research findings"
            caption="Predator–prey dynamics; model lines vs observations."
            units="mmol C/m³"
            source="Lake Kinneret monitoring program"
            pageName="research"
            figureKey="zooplankton-dynamics"
            supportsSVG={true}
          >
            <div>
              <ZooplanktonChart
                title="Zooplankton Dynamics"
                description="Predator-prey relationships and seasonal patterns based on research findings"
              />
            </div>
          </FigureFrame>
        </TabsContent>

        <TabsContent value="spatial" className="space-y-6">
          <FigureFrame
            ref={spatialMapRef}
            title="Spatial Patterns"
            subtitle="Biomass heatmap showing seasonal variations"
            caption="Biomass heatmap; legend shows mmol P/m³."
            units="mmol P/m³"
            source="Lake Kinneret monitoring program"
            pageName="research"
            figureKey="spatial-patterns"
            supportsSVG={false}
          >
            <div>
              <EnhancedMapView data={mapData} />
            </div>
          </FigureFrame>
          
          <Card>
            <CardHeader>
              <CardTitle>Spatial Pattern Analysis</CardTitle>
              <CardDescription>
                Seasonal variations in biomass distribution from research findings
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-6">
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
