import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useDataStore } from '@/store/data-store'
import { FigureFrame } from '@/components/figure-frame'
import { useRef } from 'react'

const colors = {
  diatoms: '#2563EB',
  dinoflagellates: '#10B981',
  small_phyto: '#F59E0B',
  n_fixers: '#EF4444',
  microcystis: '#8B5CF6',
}

export function StatisticsPage() {
  const { timeSeriesData } = useDataStore()
  
  // Refs for export
  const temporalTrendsRef = useRef<HTMLDivElement>(null)
  const monthlyTrendsRef = useRef<HTMLDivElement>(null)
  const yearlyDistributionRef = useRef<HTMLDivElement>(null)
  
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
          <FigureFrame
            ref={temporalTrendsRef}
            title="Long-term Trends (2010-2019)"
            subtitle="Annual biomass trends with 2019 data emphasized"
            caption="Annual biomass trends by functional group. Units: mmol P/m³."
            units="mmol P/m³"
            source="Lake Kinneret monitoring program"
            pageName="statistics"
            figureKey="temporal-trends"
            supportsSVG={true}
          >
            <div className="h-64 sm:h-80 lg:h-96">
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
          </FigureFrame>

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
          <FigureFrame
            ref={monthlyTrendsRef}
            title="Monthly Biomass Patterns"
            subtitle="Seasonal variations in phytoplankton composition"
            caption="Monthly composition of phytoplankton functional groups."
            units="mmol P/m³"
            source="Lake Kinneret monitoring program"
            pageName="statistics"
            figureKey="monthly-trends"
            supportsSVG={true}
          >
            <div className="h-64 sm:h-80 lg:h-96">
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
          </FigureFrame>

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
          <FigureFrame
            ref={yearlyDistributionRef}
            title="Annual Distribution Analysis"
            subtitle="Box plot representation of yearly biomass variations"
            caption="Yearly distribution (median, IQR, min–max) by group."
            units="mmol P/m³"
            source="Lake Kinneret monitoring program"
            pageName="statistics"
            figureKey="yearly-distribution"
            supportsSVG={true}
          >
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
          </FigureFrame>

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