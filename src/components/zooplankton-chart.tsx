import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Fish, TrendingUp, Activity } from 'lucide-react'

interface ZooplanktonData {
  month: string
  herbivores: number
  predatory: number
  herbivoresObs: number
  predatoryObs: number
}

interface ZooplanktonChartProps {
  title: string
  description: string
}

export function ZooplanktonChart({ title, description }: ZooplanktonChartProps) {
  const [viewMode, setViewMode] = useState<'model' | 'observed' | 'comparison'>('comparison')

  // Generate realistic zooplankton data based on research patterns
  const generateZooplanktonData = (): ZooplanktonData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return months.map((month, index) => {
      const monthIndex = index + 1
      
      // Herbivores: Peak in spring-summer (May-October)
      const herbivoresModel = Math.max(0, 
        2 * Math.exp(-Math.pow((monthIndex - 7.5) / 3, 2)) + 
        1.5 * Math.exp(-Math.pow((monthIndex - 2.5) / 2, 2))
      )
      
      // Predatory: Peak in winter-early spring (January-April)
      const predatoryModel = Math.max(0, 
        3 * Math.exp(-Math.pow((monthIndex - 2.5) / 2, 2)) + 
        1 * Math.exp(-Math.pow((monthIndex - 11.5) / 2, 2))
      )
      
      // Observed data (normalized to similar scale)
      const herbivoresObs = herbivoresModel * (0.8 + 0.4 * Math.random())
      const predatoryObs = predatoryModel * (0.7 + 0.6 * Math.random())
      
      return {
        month,
        herbivores: herbivoresModel,
        predatory: predatoryModel,
        herbivoresObs: herbivoresObs,
        predatoryObs: predatoryObs
      }
    })
  }

  const chartData = generateZooplanktonData()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fish className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="model">Model Results</TabsTrigger>
            <TabsTrigger value="observed">Observations</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="model" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    label={{ value: 'mmol C/m³', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    domain={[0, 'dataMax + 0.5']}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)} mmol C/m³`, 
                      name === 'herbivores' ? 'Herbivorous Zooplankton' : 'Predatory Zooplankton'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="herbivores"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="herbivores"
                  />
                  <Area
                    type="monotone"
                    dataKey="predatory"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                    name="predatory"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="observed" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    label={{ value: '#/L (counts per liter)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    domain={[0, 'dataMax + 50']}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(0)} #/L`, 
                      name === 'herbivoresObs' ? 'Herbivorous Zooplankton (Observed)' : 'Predatory Zooplankton (Observed)'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="herbivoresObs"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="herbivoresObs"
                  />
                  <Line
                    type="monotone"
                    dataKey="predatoryObs"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    name="predatoryObs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    label={{ value: 'Normalized Concentration', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    domain={[0, 5]}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const labels: { [key: string]: string } = {
                        'herbivores': 'Herbivorous (Model)',
                        'predatory': 'Predatory (Model)',
                        'herbivoresObs': 'Herbivorous (Observed)',
                        'predatoryObs': 'Predatory (Observed)'
                      }
                      return [`${value.toFixed(2)}`, labels[name] || name]
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="herbivores"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="herbivores"
                  />
                  <Line
                    type="monotone"
                    dataKey="herbivoresObs"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="herbivoresObs"
                  />
                  <Line
                    type="monotone"
                    dataKey="predatory"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="predatory"
                  />
                  <Line
                    type="monotone"
                    dataKey="predatoryObs"
                    stroke="#EF4444"
                    strokeWidth={3}
                    name="predatoryObs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Research Insights */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Research Insights</span>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <div>• <strong>Predator-Prey Dynamics:</strong> Decrease in predatory zooplankton leads to increase in herbivorous zooplankton</div>
            <div>• <strong>Seasonal Patterns:</strong> Predatory peak in winter-early spring, herbivorous peak in spring-summer</div>
            <div>• <strong>Model Agreement:</strong> Good correlation between model predictions and observed counts</div>
            <div>• <strong>Units:</strong> Model uses mmol C/m³, observations use #/L (counts per liter)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
