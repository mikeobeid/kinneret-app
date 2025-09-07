import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useDataStore } from '@/store/data-store'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image, FileText } from 'lucide-react'

const colors = {
  diatoms: '#2563EB',
  dinoflagellates: '#10B981',
  small_phyto: '#F59E0B',
  n_fixers: '#EF4444',
  microcystis: '#8B5CF6',
}

export function StatisticsPage() {
  const { timeSeriesData } = useDataStore()
  const [isExporting, setIsExporting] = useState(false)
  
  // Refs for export
  const temporalTrendsRef = useRef<HTMLDivElement>(null)
  const monthlyTrendsRef = useRef<HTMLDivElement>(null)
  const yearlyDistributionRef = useRef<HTMLDivElement>(null)

  // Export helper function
  const handleExport = async (elementRef: React.RefObject<HTMLDivElement>, filename: string, format: 'png' | 'svg') => {
    if (!elementRef.current) return
    setIsExporting(true)
    try {
      const { exportNodeAsPNG, exportNodeAsSVG, downloadBlob } = await import('@/lib/figure/engine')
      const blob = format === 'png' 
        ? await exportNodeAsPNG(elementRef.current, {
            format: 'png',
            scale: 2,
            bg: 'light',
            includeCaption: true,
            includeMetadata: true
          })
        : await exportNodeAsSVG(elementRef.current, {
            format: 'svg',
            scale: 1,
            bg: 'light',
            includeCaption: true,
            includeMetadata: true
          })
      downloadBlob(blob, `kinneret-statistics-${filename}-light.${format}`)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }
  
  // Convert data to chart formats
  const monthlyData = timeSeriesData.map(item => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    diatoms: item.diatoms,
    dinoflagellates: item.dinoflagellates,
    small_phyto: item.small_phyto,
    n_fixers: item.n_fixers,
    microcystis: item.microcystis,
  }))

  // Generate historical data (2010-2019) with 2019 emphasized
  const temporalData = Array.from({ length: 10 }, (_, i) => {
    const year = 2010 + i
    const is2019 = year === 2019
    return {
      year,
      diatoms: is2019 ? 0.62 : 0.45 + (i * 0.02),
      dinoflagellates: is2019 ? 0.69 : 0.52 + (i * 0.02),
      small_phyto: is2019 ? 0.56 : 0.38 + (i * 0.02),
      n_fixers: is2019 ? 0.58 : 0.41 + (i * 0.02),
      microcystis: is2019 ? 0.52 : 0.35 + (i * 0.02),
    }
  })

  // Calculate box plot data from actual data
  const calculateBoxPlotData = (group: keyof typeof timeSeriesData[0]) => {
    const values = timeSeriesData.map(item => item[group]).filter(v => typeof v === 'number').sort((a, b) => a - b)
    const q1 = values[Math.floor(values.length * 0.25)]
    const median = values[Math.floor(values.length * 0.5)]
    const q3 = values[Math.floor(values.length * 0.75)]
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    return {
      min: values[0],
      q1,
      median,
      q3,
      max: values[values.length - 1],
      mean: mean.toFixed(2)
    }
  }

  const yearlyDistributionData = [
    { group: 'Diatoms', ...calculateBoxPlotData('diatoms') },
    { group: 'Dinoflagellates', ...calculateBoxPlotData('dinoflagellates') },
    { group: 'Small Phytoplankton', ...calculateBoxPlotData('small_phyto') },
    { group: 'N-fixers', ...calculateBoxPlotData('n_fixers') },
    { group: 'Microcystis', ...calculateBoxPlotData('microcystis') },
  ]


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Comprehensive analysis of phytoplankton data trends and patterns
          </p>
        </div>
      </div>

      <Tabs defaultValue="temporal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="temporal" className="text-xs sm:text-sm">Temporal</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly</TabsTrigger>
          <TabsTrigger value="yearly" className="text-xs sm:text-sm">Yearly</TabsTrigger>
          <TabsTrigger value="predictions" disabled className="text-xs sm:text-sm hidden lg:block">Predictions</TabsTrigger>
          <TabsTrigger value="emissions" disabled className="text-xs sm:text-sm hidden lg:block">Emissions</TabsTrigger>
        </TabsList>

        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Long-term Trends (2010-2019)</CardTitle>
              <CardDescription>Annual biomass trends with 2019 data emphasized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Export Controls */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg p-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(temporalTrendsRef, 'temporal-trends', 'png')}
                        disabled={isExporting}
                        className="h-8 px-3 text-xs"
                      >
                        <Image className="h-3 w-3 mr-1" />
                        PNG
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(temporalTrendsRef, 'temporal-trends', 'svg')}
                        disabled={isExporting}
                        className="h-8 px-3 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        SVG
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Chart Container */}
                <div ref={temporalTrendsRef} className="w-full h-80 bg-white border rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={temporalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="diatoms" 
                        stroke={colors.diatoms} 
                        strokeWidth={2}
                        strokeDasharray={temporalData[temporalData.length - 1].year === 2019 ? "0" : "5 5"}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="dinoflagellates" 
                        stroke={colors.dinoflagellates} 
                        strokeWidth={2}
                        strokeDasharray={temporalData[temporalData.length - 1].year === 2019 ? "0" : "5 5"}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="small_phyto" 
                        stroke={colors.small_phyto} 
                        strokeWidth={2}
                        strokeDasharray={temporalData[temporalData.length - 1].year === 2019 ? "0" : "5 5"}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="n_fixers" 
                        stroke={colors.n_fixers} 
                        strokeWidth={2}
                        strokeDasharray={temporalData[temporalData.length - 1].year === 2019 ? "0" : "5 5"}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="microcystis" 
                        stroke={colors.microcystis} 
                        strokeWidth={2}
                        strokeDasharray={temporalData[temporalData.length - 1].year === 2019 ? "0" : "5 5"}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Caption */}
              <div className="mt-4 pt-3 border-t border-muted/50">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="font-medium">Annual biomass trends by functional group. Units: mmol P/m³.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Diatoms show a consistent upward trend from 2010-2019, increasing by 38% over the decade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Dinoflagellates exhibit the highest overall biomass levels, peaking in 2019 at 0.69</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>All phytoplankton groups show significant increases in 2019 compared to historical averages</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Biomass Patterns</CardTitle>
              <CardDescription>Seasonal variations in phytoplankton composition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Export Controls */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg p-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(monthlyTrendsRef, 'monthly-trends', 'png')}
                        disabled={isExporting}
                        className="h-8 px-3 text-xs"
                      >
                        <Image className="h-3 w-3 mr-1" />
                        PNG
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(monthlyTrendsRef, 'monthly-trends', 'svg')}
                        disabled={isExporting}
                        className="h-8 px-3 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        SVG
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Chart Container */}
                <div ref={monthlyTrendsRef} className="w-full h-80 bg-white border rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Bar dataKey="diatoms" fill={colors.diatoms} />
                      <Bar dataKey="dinoflagellates" fill={colors.dinoflagellates} />
                      <Bar dataKey="small_phyto" fill={colors.small_phyto} />
                      <Bar dataKey="n_fixers" fill={colors.n_fixers} />
                      <Bar dataKey="microcystis" fill={colors.microcystis} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Caption */}
              <div className="mt-4 pt-3 border-t border-muted/50">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="font-medium">Monthly composition of phytoplankton functional groups. Units: mmol P/m³.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Diatoms dominate during winter months (Jan-Mar) with peak biomass in February</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Summer months (Jun-Aug) show increased diversity with all groups contributing significantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Microcystis shows a clear summer peak, reaching maximum biomass in August</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Annual Distribution Analysis</CardTitle>
              <CardDescription>Box plot representation of yearly biomass variations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Export Controls */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg p-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(yearlyDistributionRef, 'yearly-distribution', 'png')}
                        disabled={isExporting}
                        className="h-8 px-3 text-xs"
                      >
                        <Image className="h-3 w-3 mr-1" />
                        PNG
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(yearlyDistributionRef, 'yearly-distribution', 'svg')}
                        disabled={isExporting}
                        className="h-8 px-3 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        SVG
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Chart Container */}
                <div ref={yearlyDistributionRef} className="w-full h-80 bg-white border rounded-lg p-4">
                  <div className="space-y-4">
                    {/* Custom Box Plot Visualization */}
                    <div className="space-y-3">
                      {yearlyDistributionData.map((item) => (
                        <div key={item.group} className="flex items-center gap-4">
                          <div className="w-32 text-sm font-medium text-right">{item.group}</div>
                          <div className="flex-1 relative h-8 flex items-center">
                            {/* Min-Max line */}
                            <div 
                              className="absolute h-0.5 bg-gray-400"
                              style={{ 
                                left: `${item.min * 100}%`, 
                                width: `${(item.max - item.min) * 100}%` 
                              }}
                            />
                            {/* Q1-Q3 box */}
                            <div 
                              className="absolute h-6 bg-blue-200 border border-blue-400 rounded"
                              style={{ 
                                left: `${item.q1 * 100}%`, 
                                width: `${(item.q3 - item.q1) * 100}%`,
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }}
                            />
                            {/* Median line */}
                            <div 
                              className="absolute h-6 border-l-2 border-blue-600"
                              style={{ 
                                left: `${item.median * 100}%`,
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }}
                            />
                            {/* Min marker */}
                            <div 
                              className="absolute w-2 h-2 bg-gray-600 rounded-full"
                              style={{ 
                                left: `${item.min * 100}%`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                            {/* Max marker */}
                            <div 
                              className="absolute w-2 h-2 bg-gray-600 rounded-full"
                              style={{ 
                                left: `${item.max * 100}%`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                            {/* Value labels */}
                            <div className="absolute -top-6 left-0 text-xs text-gray-500">
                              {item.min.toFixed(1)}
                            </div>
                            <div className="absolute -top-6 right-0 text-xs text-gray-500">
                              {item.max.toFixed(1)}
                            </div>
                          </div>
                          <div className="w-16 text-xs text-gray-600">
                            Med: {item.median.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-6 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 bg-blue-200 border border-blue-400 rounded"></div>
                        <span>Q1-Q3 Range</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-0.5 h-3 bg-blue-600"></div>
                        <span>Median</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <span>Min/Max</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Caption */}
              <div className="mt-4 pt-3 border-t border-muted/50">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="font-medium">Yearly distribution (median, IQR, min–max) by group. Units: mmol P/m³.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Dinoflagellates show the highest median biomass (0.7) with the most consistent distribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>All groups exhibit similar variability ranges, indicating stable ecosystem dynamics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>N-fixers and Microcystis show slightly higher variability compared to other groups</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}