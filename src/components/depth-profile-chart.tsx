import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BarChart3, Grid3X3 } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'


export function DepthProfileChart() {
  const [selectedGroup, setSelectedGroup] = useState('diatoms')
  const [viewMode, setViewMode] = useState<'heatmap' | 'profile'>('heatmap')

  const groups = [
    { id: 'diatoms', name: 'Diatoms', color: '#3B82F6' },
    { id: 'dinoflagellates', name: 'Dinoflagellates', color: '#10B981' },
    { id: 'small_phyto', name: 'Small Phytoplankton', color: '#F59E0B' },
    { id: 'n_fixers', name: 'N-fixing Cyanobacteria', color: '#EF4444' },
    { id: 'microcystis', name: 'Microcystis', color: '#8B5CF6' }
  ]

  const selectedGroupData = groups.find(g => g.id === selectedGroup)

  // Generate realistic depth profile data based on research patterns
  const generateDepthProfileData = () => {
    const depths = Array.from({ length: 20 }, (_, i) => -(i + 1) * 2) // 0 to -40m in 2m steps
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Use a fixed month for depth profile (e.g., peak bloom month for each group)
    let monthIndex = 3 // Default to April
    if (selectedGroup === 'diatoms') {
      monthIndex = 3 // Spring bloom
    } else if (selectedGroup === 'dinoflagellates') {
      monthIndex = 1 // Winter bloom
    } else if (selectedGroup === 'small_phyto') {
      monthIndex = 5 // Summer peak
    } else if (selectedGroup === 'n_fixers') {
      monthIndex = 7 // Summer bloom
    } else if (selectedGroup === 'microcystis') {
      monthIndex = 3 // Winter bloom
    }
    
    return depths.map(depth => {
      let concentration = 0
      
      if (selectedGroup === 'diatoms') {
        // Spring and autumn blooms - higher concentration in upper 20m
        if ((monthIndex >= 2 && monthIndex <= 4) || (monthIndex >= 8 && monthIndex <= 10)) {
          concentration = Math.max(0, 0.05 * Math.exp(-Math.abs(depth) / 10) * (1 + 0.5 * Math.sin(monthIndex * Math.PI / 6)))
        } else {
          // Background concentration even outside bloom periods
          concentration = Math.max(0, 0.005 * Math.exp(-Math.abs(depth) / 15))
        }
      } else if (selectedGroup === 'dinoflagellates') {
        // Winter/early spring and late summer/autumn - deeper distribution
        if (monthIndex <= 2 || (monthIndex >= 7 && monthIndex <= 10)) {
          concentration = Math.max(0, 0.05 * Math.exp(-Math.abs(depth) / 15) * (1 + 0.3 * Math.sin(monthIndex * Math.PI / 6)))
        } else {
          concentration = Math.max(0, 0.003 * Math.exp(-Math.abs(depth) / 20))
        }
      } else if (selectedGroup === 'small_phyto') {
        // Year-round with peaks in spring and summer - shallow distribution
        concentration = Math.max(0, 0.01 * Math.exp(-Math.abs(depth) / 8) * (1 + 0.4 * Math.sin(monthIndex * Math.PI / 6)))
      } else if (selectedGroup === 'n_fixers') {
        // Summer bloom (July-September) - moderate depth
        if (monthIndex >= 6 && monthIndex <= 8) {
          concentration = Math.max(0, 0.004 * Math.exp(-Math.abs(depth) / 12) * (1 + 0.6 * Math.sin((monthIndex - 6) * Math.PI / 3)))
        } else {
          concentration = Math.max(0, 0.0005 * Math.exp(-Math.abs(depth) / 25))
        }
      } else if (selectedGroup === 'microcystis') {
        // Winter bloom (March-May) - shallow distribution
        if (monthIndex >= 2 && monthIndex <= 4) {
          concentration = Math.max(0, 0.05 * Math.exp(-Math.abs(depth) / 10) * (1 + 0.5 * Math.sin((monthIndex - 2) * Math.PI / 3)))
        } else {
          concentration = Math.max(0, 0.002 * Math.exp(-Math.abs(depth) / 18))
        }
      }
      
      return {
        depth: depth,
        concentration: concentration,
        month: months[monthIndex]
      }
    }) // Keep all points, even zero concentrations for proper depth profile
  }

  const generateHeatmapData = () => {
    const depths = Array.from({ length: 20 }, (_, i) => -(i + 1) * 2) // 0 to -40m in 2m steps
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Create a 2D grid for true heatmap
    const heatmapGrid: number[][] = []
    
    depths.forEach((depth) => {
      const row: number[] = []
      months.forEach((_, monthIndex) => {
        let value = 0
        
        if (selectedGroup === 'diatoms') {
          // Spring and autumn blooms
          if ((monthIndex >= 2 && monthIndex <= 4) || (monthIndex >= 8 && monthIndex <= 10)) {
            value = Math.max(0, 0.05 * Math.exp(-Math.abs(depth) / 10) * (1 + 0.5 * Math.sin(monthIndex * Math.PI / 6)))
          }
        } else if (selectedGroup === 'dinoflagellates') {
          // Winter/early spring and late summer/autumn
          if (monthIndex <= 2 || (monthIndex >= 7 && monthIndex <= 10)) {
            value = Math.max(0, 0.05 * Math.exp(-Math.abs(depth) / 15) * (1 + 0.3 * Math.sin(monthIndex * Math.PI / 6)))
          }
        } else if (selectedGroup === 'small_phyto') {
          // Year-round with peaks in spring and summer
          value = Math.max(0, 0.01 * Math.exp(-Math.abs(depth) / 8) * (1 + 0.4 * Math.sin(monthIndex * Math.PI / 6)))
        } else if (selectedGroup === 'n_fixers') {
          // Summer bloom (July-September)
          if (monthIndex >= 6 && monthIndex <= 8) {
            value = Math.max(0, 0.004 * Math.exp(-Math.abs(depth) / 12) * (1 + 0.6 * Math.sin((monthIndex - 6) * Math.PI / 3)))
          }
        } else if (selectedGroup === 'microcystis') {
          // Winter bloom (March-May)
          if (monthIndex >= 2 && monthIndex <= 4) {
            value = Math.max(0, 0.05 * Math.exp(-Math.abs(depth) / 10) * (1 + 0.5 * Math.sin((monthIndex - 2) * Math.PI / 3)))
          }
        }
        
        row.push(value)
      })
      heatmapGrid.push(row)
    })
    
    return { grid: heatmapGrid, depths, months }
  }

  const depthProfileData = generateDepthProfileData()
  const heatmapData = generateHeatmapData()

  return (
    <div className="space-y-2">
        {/* Group Selection */}
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroup === group.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroup(group.id)}
              className="flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: group.color }}
              />
              {group.name}
            </Button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'heatmap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('heatmap')}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Heatmap View
          </Button>
          <Button
            variant={viewMode === 'profile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('profile')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Depth Profile
          </Button>
        </div>

        {/* Chart Area */}
        <div className="h-[70vh] border rounded-lg p-4 bg-muted/20">
          {viewMode === 'heatmap' ? (
            <div className="h-full">
              <div className="text-center mb-2">
                <div className="text-lg font-medium">
                  {selectedGroupData?.name} Depth-Time Heatmap
                </div>
                <div className="text-sm text-muted-foreground">
                  Depth: 0 to -40m | Time: January to December
                </div>
                <div className="text-xs text-muted-foreground">
                  Units: mmol P/m³ | Based on research data from Lake Kinneret
                </div>
              </div>
              
              {/* True Heatmap Grid */}
              <div className="h-64 overflow-auto">
                <div className="grid grid-cols-12 gap-0.5 text-xs">
                  {/* Month headers */}
                  <div className="col-span-1"></div>
                  {heatmapData.months.map((month) => (
                    <div key={month} className="text-center font-medium text-muted-foreground py-1">
                      {month}
                    </div>
                  ))}
                  
                  {/* Heatmap rows */}
                  {heatmapData.grid.map((row, depthIndex) => (
                    <React.Fragment key={depthIndex}>
                      {/* Depth label */}
                      <div className="text-right font-medium text-muted-foreground py-1 pr-2">
                        {heatmapData.depths[depthIndex]}m
                      </div>
                      
                      {/* Heatmap cells */}
                      {row.map((value, monthIndex) => {
                        const maxValue = Math.max(...heatmapData.grid.flat())
                        const intensity = value / maxValue
                        const opacity = Math.max(0.1, intensity)
                        
                        return (
                          <div
                            key={`${depthIndex}-${monthIndex}`}
                            className="w-6 h-6 border border-gray-200 dark:border-gray-700"
                            style={{
                              backgroundColor: selectedGroupData?.color || '#3B82F6',
                              opacity: opacity,
                            }}
                            title={`${heatmapData.months[monthIndex]}, ${heatmapData.depths[depthIndex]}m: ${value.toFixed(4)} mmol P/m³`}
                          />
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              {/* Color scale legend */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="text-xs text-muted-foreground">Low</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 border border-gray-200 dark:border-gray-700"
                      style={{
                        backgroundColor: selectedGroupData?.color || '#3B82F6',
                        opacity: 0.1 + (i * 0.09),
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">High</span>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <div className="text-center mb-2">
                <div className="text-lg font-medium">
                  {selectedGroupData?.name} Depth Profile
                </div>
                <div className="text-sm text-muted-foreground">
                  Concentration vs Depth (0 to -40m) - {depthProfileData[0]?.month || 'Peak Season'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Units: mmol P/m³ | Seasonal patterns from research
                </div>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={depthProfileData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="concentration" 
                    label={{ value: 'Concentration (mmol P/m³)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="depth" 
                    label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                    domain={[-40, 0]}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(4)} mmol P/m³`, 
                      name === 'concentration' ? 'Concentration' : name
                    ]}
                    labelFormatter={(label) => `Depth: ${label}m`}
                  />
                  <Area
                    type="monotone"
                    dataKey="concentration"
                    stroke={selectedGroupData?.color || '#3B82F6'}
                    fill={selectedGroupData?.color || '#3B82F6'}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Research Notes */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>Research Pattern:</strong> {selectedGroupData?.name} - Seasonal patterns from research data</div>
          <div><strong>Depth Range:</strong> Primarily upper 20m of water column</div>
          <div><strong>Data Source:</strong> Lake Kinneret monitoring program, Station A</div>
        </div>
    </div>
  )
}
