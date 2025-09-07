import { useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts'
import { useDataStore } from '@/store/data-store'
import { FigureFrame } from '@/components/figure-frame'

const pcaData = [
  { x: 0.2, y: 0.8, group: 'diatoms' },
  { x: 0.3, y: 0.7, group: 'diatoms' },
  { x: 0.4, y: 0.6, group: 'diatoms' },
  { x: 0.6, y: 0.4, group: 'dinoflagellates' },
  { x: 0.7, y: 0.3, group: 'dinoflagellates' },
  { x: 0.8, y: 0.2, group: 'dinoflagellates' },
  { x: 0.5, y: 0.5, group: 'small_phyto' },
  { x: 0.6, y: 0.6, group: 'small_phyto' },
  { x: 0.4, y: 0.4, group: 'small_phyto' },
  { x: 0.3, y: 0.2, group: 'n_fixers' },
  { x: 0.2, y: 0.3, group: 'n_fixers' },
  { x: 0.1, y: 0.1, group: 'microcystis' },
  { x: 0.2, y: 0.1, group: 'microcystis' },
]

const colors = {
  diatoms: '#2563EB',
  dinoflagellates: '#10B981',
  small_phyto: '#F59E0B',
  n_fixers: '#EF4444',
  microcystis: '#8B5CF6',
}

export function DashboardPage() {
  const { timeSeriesData } = useDataStore()
  
  // Refs for export
  const biomassTimelineRef = useRef<HTMLDivElement>(null)
  const biomassChartRef = useRef<HTMLDivElement>(null)
  const pcaAnalysisRef = useRef<HTMLDivElement>(null)

  
  // Convert data to chart format
  const biomassData = timeSeriesData.map(item => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    diatoms: item.diatoms,
    dinoflagellates: item.dinoflagellates,
    small_phyto: item.small_phyto,
    n_fixers: item.n_fixers,
    microcystis: item.microcystis,
  }))

  // Calculate statistics from actual data
  const calculateStats = (group: keyof typeof timeSeriesData[0]) => {
    const values = timeSeriesData.map(item => item[group]).filter(v => typeof v === 'number')
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    return { mean: mean.toFixed(2), stdDev: stdDev.toFixed(2) }
  }

  const diatomsStats = calculateStats('diatoms')
  const dinoflagellatesStats = calculateStats('dinoflagellates')
  const smallPhytoStats = calculateStats('small_phyto')
  const nFixersStats = calculateStats('n_fixers')
  const microcystisStats = calculateStats('microcystis')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Interactive Kinneret biogeochemical insights — groups, seasons, and nutrient scenarios.
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Data Overview</TabsTrigger>
          <TabsTrigger value="regional" disabled>Regional Analysis</TabsTrigger>
          <TabsTrigger value="results">Model Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Concentration Statistics</CardTitle>
                <CardDescription>
                  Summary statistics for phytoplankton groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Diatoms</span>
                    <span className="font-medium">{diatomsStats.mean} ± {diatomsStats.stdDev}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dinoflagellates</span>
                    <span className="font-medium">{dinoflagellatesStats.mean} ± {dinoflagellatesStats.stdDev}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Small Phytoplankton</span>
                    <span className="font-medium">{smallPhytoStats.mean} ± {smallPhytoStats.stdDev}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">N-fixers</span>
                    <span className="font-medium">{nFixersStats.mean} ± {nFixersStats.stdDev}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Microcystis</span>
                    <span className="font-medium">{microcystisStats.mean} ± {microcystisStats.stdDev}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Coverage</CardTitle>
                <CardDescription>
                  Spatial distribution of sampling points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Samples</span>
                    <span className="font-medium">{timeSeriesData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sampling Points</span>
                    <span className="font-medium">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Coverage Area</span>
                    <span className="font-medium">166 km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Depth Range</span>
                    <span className="font-medium">0-43 m</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Scatter/Heat Timeline Placeholder */}
            <FigureFrame
              ref={biomassTimelineRef}
              title="Biomass Timeline"
              subtitle="Temporal distribution of phytoplankton biomass"
              caption="Demo rendering for calibration preview—replace with dataset v1."
              units="mmol P/m³"
              source="Lake Kinneret monitoring program"
              pageName="dashboard"
              figureKey="biomass-timeline"
              supportsSVG={true}
            >
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Demo rendering for calibration preview—replace with dataset v1.</p>
              </div>
            </FigureFrame>

            {/* Line Chart */}
            <FigureFrame
              ref={biomassChartRef}
              title="Biomass (mmol P/m³)"
              subtitle="Monthly trends for phytoplankton groups"
              caption="Monthly trends for phytoplankton groups."
              units="mmol P/m³"
              source="Lake Kinneret monitoring program"
              pageName="dashboard"
              figureKey="biomass-chart"
              supportsSVG={true}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={biomassData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="diatoms" stroke={colors.diatoms} strokeWidth={2} />
                    <Line type="monotone" dataKey="dinoflagellates" stroke={colors.dinoflagellates} strokeWidth={2} />
                    <Line type="monotone" dataKey="small_phyto" stroke={colors.small_phyto} strokeWidth={2} />
                    <Line type="monotone" dataKey="n_fixers" stroke={colors.n_fixers} strokeWidth={2} />
                    <Line type="monotone" dataKey="microcystis" stroke={colors.microcystis} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </FigureFrame>
          </div>

          {/* PCA Dot Cloud */}
          <FigureFrame
            ref={pcaAnalysisRef}
            title="PCA Analysis"
            subtitle="Principal component analysis of phytoplankton groups"
            caption="Principal component analysis of phytoplankton groups."
            units="dimensionless"
            source="Lake Kinneret monitoring program"
            pageName="dashboard"
            figureKey="pca-analysis"
            supportsSVG={true}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={pcaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" name="PC1" domain={[0, 1]} />
                  <YAxis type="number" dataKey="y" name="PC2" domain={[0, 1]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter dataKey="y" fill="#8884d8">
                    {pcaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[entry.group as keyof typeof colors]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </FigureFrame>
        </TabsContent>
      </Tabs>
    </div>
  )
}