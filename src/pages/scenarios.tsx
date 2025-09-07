import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw, Download } from 'lucide-react'
import { useDataStore } from '@/store/data-store'
import { LazyChart } from '@/components/lazy-chart'
import { FigureFrame } from '@/components/figure-frame'

// Mock data for groups and their parameters
const groups = [
  {
    name: 'Diatoms',
    params: {
      mu: { value: 0.8, min: 0.1, max: 2.0, step: 0.1, description: 'Maximum growth rate (day⁻¹)' },
      KsP: { value: 0.5, min: 0.1, max: 2.0, step: 0.1, description: 'P half-saturation constant' },
      KsN: { value: 0.3, min: 0.1, max: 1.0, step: 0.1, description: 'N half-saturation constant' },
      KsFe: { value: 0.2, min: 0.05, max: 0.5, step: 0.05, description: 'Fe half-saturation constant' },
      Rnp: { value: 0.6, min: 0.1, max: 1.0, step: 0.1, description: 'N:P ratio' },
      Rfep: { value: 0.1, min: 0.01, max: 0.2, step: 0.01, description: 'Fe:P ratio' },
      Rsip: { value: 0.8, min: 0.1, max: 2.0, step: 0.1, description: 'Si:P ratio' }
    }
  },
  {
    name: 'Dinoflagellates',
    params: {
      mu: { value: 1.2, min: 0.1, max: 2.0, step: 0.1, description: 'Maximum growth rate (day⁻¹)' },
      KsP: { value: 0.4, min: 0.1, max: 2.0, step: 0.1, description: 'P half-saturation constant' },
      KsN: { value: 0.2, min: 0.1, max: 1.0, step: 0.1, description: 'N half-saturation constant' },
      KsFe: { value: 0.15, min: 0.05, max: 0.5, step: 0.05, description: 'Fe half-saturation constant' },
      Rnp: { value: 0.7, min: 0.1, max: 1.0, step: 0.1, description: 'N:P ratio' },
      Rfep: { value: 0.08, min: 0.01, max: 0.2, step: 0.01, description: 'Fe:P ratio' }
    }
  },
  {
    name: 'Small Phytoplankton',
    params: {
      mu: { value: 1.0, min: 0.1, max: 2.0, step: 0.1, description: 'Maximum growth rate (day⁻¹)' },
      KsP: { value: 0.6, min: 0.1, max: 2.0, step: 0.1, description: 'P half-saturation constant' },
      KsN: { value: 0.4, min: 0.1, max: 1.0, step: 0.1, description: 'N half-saturation constant' },
      KsFe: { value: 0.25, min: 0.05, max: 0.5, step: 0.05, description: 'Fe half-saturation constant' },
      Rnp: { value: 0.5, min: 0.1, max: 1.0, step: 0.1, description: 'N:P ratio' },
      Rfep: { value: 0.12, min: 0.01, max: 0.2, step: 0.01, description: 'Fe:P ratio' }
    }
  },
  {
    name: 'N-fixers',
    params: {
      mu: { value: 0.6, min: 0.1, max: 2.0, step: 0.1, description: 'Maximum growth rate (day⁻¹)' },
      KsP: { value: 0.3, min: 0.1, max: 2.0, step: 0.1, description: 'P half-saturation constant' },
      KsFe: { value: 0.3, min: 0.05, max: 0.5, step: 0.05, description: 'Fe half-saturation constant' },
      Rnp: { value: 0.8, min: 0.1, max: 1.0, step: 0.1, description: 'N:P ratio' },
      Rfep: { value: 0.15, min: 0.01, max: 0.2, step: 0.01, description: 'Fe:P ratio' }
    }
  },
  {
    name: 'Microcystis',
    params: {
      mu: { value: 0.9, min: 0.1, max: 2.0, step: 0.1, description: 'Maximum growth rate (day⁻¹)' },
      KsP: { value: 0.7, min: 0.1, max: 2.0, step: 0.1, description: 'P half-saturation constant' },
      KsN: { value: 0.5, min: 0.1, max: 1.0, step: 0.1, description: 'N half-saturation constant' },
      KsFe: { value: 0.18, min: 0.05, max: 0.5, step: 0.05, description: 'Fe half-saturation constant' },
      Rnp: { value: 0.4, min: 0.1, max: 1.0, step: 0.1, description: 'N:P ratio' },
      Rfep: { value: 0.06, min: 0.01, max: 0.2, step: 0.01, description: 'Fe:P ratio' }
    }
  }
]

// Mock data for nutrients
const nutrients = {
  P: { value: 0.5, min: 0.1, max: 2.0, step: 0.1, unit: 'mmol P/m³' },
  N: { value: 0.8, min: 0.1, max: 3.0, step: 0.1, unit: 'mmol P/m³' },
  Fe: { value: 0.1, min: 0.01, max: 0.5, step: 0.01, unit: 'mmol P/m³' },
  Si: { value: 1.2, min: 0.1, max: 5.0, step: 0.1, unit: 'mmol P/m³' }
}

// Function to get base results data from data store
const getBaseResultsData = (data: any[]) => {
  return data.map(item => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    diatoms: item.diatoms,
    dinoflagellates: item.dinoflagellates,
    small_phyto: item.small_phyto,
    n_fixers: item.n_fixers,
    microcystis: item.microcystis,
  }))
}

const colors = {
  diatoms: '#2563EB',
  dinoflagellates: '#10B981',
  small_phyto: '#F59E0B',
  n_fixers: '#EF4444',
  microcystis: '#8B5CF6',
}

// Function to calculate simulation results based on parameters
const calculateSimulationResults = (groupParams: typeof groups, nutrientValues: typeof nutrients, baseData: any[]) => {
  return baseData.map(monthData => {
    const results: any = { month: monthData.month }
    
    // Calculate biomass for each group based on parameters and nutrients
    Object.keys(monthData).forEach(groupKey => {
      if (groupKey === 'month') return
      
      const group = groupParams.find(g => g.name.toLowerCase().replace(' ', '_') === groupKey)
      if (!group) return
      
      // Get base value
      let baseValue = monthData[groupKey as keyof typeof monthData] as number
      
      // Apply nutrient effects
      const pEffect = Math.min(nutrientValues.P.value / 0.5, 2) // P effect (0.5 is baseline)
      const nEffect = Math.min(nutrientValues.N.value / 0.8, 2) // N effect (0.8 is baseline)
      const feEffect = Math.min(nutrientValues.Fe.value / 0.1, 2) // Fe effect (0.1 is baseline)
      const siEffect = Math.min(nutrientValues.Si.value / 1.2, 2) // Si effect (1.2 is baseline)
      
      // Apply growth rate effect
      const muEffect = group.params.mu.value / 0.8 // Growth rate effect (0.8 is baseline)
      
      // Calculate final biomass with all effects
      let finalValue = baseValue * muEffect * pEffect * nEffect * feEffect
      
      // Apply group-specific effects
      if (groupKey === 'diatoms') {
        finalValue *= siEffect // Diatoms are silica-dependent
      }
      if (groupKey === 'n_fixers') {
        finalValue *= (2 - nEffect) // N-fixers benefit from low N
      }
      if (groupKey === 'microcystis') {
        finalValue *= Math.pow(pEffect, 1.5) // Microcystis is very P-sensitive
      }
      
      // Normalize to 0-1 range
      results[groupKey] = Math.min(Math.max(finalValue, 0), 1)
    })
    
    return results
  })
}

export function ScenariosPage() {
  const { timeSeriesData } = useDataStore()
  const baseResultsData = getBaseResultsData(timeSeriesData)
  
  const [groupParams, setGroupParams] = useState(groups)
  const [nutrientValues, setNutrientValues] = useState(nutrients)
  const [isRunning, setIsRunning] = useState(false)
  const [resultsData, setResultsData] = useState(baseResultsData)
  
  // Refs for export
  const modelResultsRef = useRef<HTMLDivElement>(null)


  const updateGroupParam = (groupIndex: number, paramName: string, value: number) => {
    setGroupParams(prev => prev.map((group, index) => {
      if (index === groupIndex) {
        return {
          ...group,
          params: {
            ...group.params,
            [paramName]: {
              ...group.params[paramName as keyof typeof group.params],
              value
            }
          }
        } as typeof group
      }
      return group
    }))
  }

  const updateNutrient = (nutrient: string, value: number) => {
    setNutrientValues(prev => ({ ...prev, [nutrient]: { ...prev[nutrient as keyof typeof prev], value } }))
  }

  const runScenario = () => {
    setIsRunning(true)
    // Simulate model run with actual calculation
    setTimeout(() => {
      const newResults = calculateSimulationResults(groupParams, nutrientValues, baseResultsData)
      setResultsData(newResults)
      setIsRunning(false)
    }, 2000)
  }

  const resetToDefaults = () => {
    setGroupParams(groups)
    setNutrientValues(nutrients)
    setResultsData(getBaseResultsData(timeSeriesData))
  }

  const exportScenario = () => {
    const scenarioData = {
      timestamp: new Date().toISOString(),
      parameters: {
        nutrients: nutrientValues,
        groups: groupParams.map(group => ({
          name: group.name,
          params: group.params
        }))
      },
      results: resultsData,
      metadata: {
        description: "Kinneret BioGeo Lab Scenario Export",
        version: "1.0.0"
      }
    }

    const dataStr = JSON.stringify(scenarioData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kinneret-scenario-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getDominantGroup = (month: string) => {
    const data = resultsData.find(d => d.month === month)
    if (!data) return 'N/A'
    
    const values = Object.entries(data).filter(([key]) => key !== 'month')
    const max = Math.max(...values.map(([, value]) => value as number))
    const dominant = values.find(([, value]) => value === max)?.[0]
    
    return dominant || 'N/A'
  }

  const getSeasonalDominance = () => {
    const winter = ['Dec', 'Jan', 'Feb'].map(getDominantGroup)
    const spring = ['Mar', 'Apr', 'May'].map(getDominantGroup)
    const summer = ['Jun', 'Jul', 'Aug'].map(getDominantGroup)
    const fall = ['Sep', 'Oct', 'Nov'].map(getDominantGroup)
    
    return { winter, spring, summer, fall }
  }

  const seasonalDominance = getSeasonalDominance()

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Scenarios</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Interactive Kinneret biogeochemical insights — groups, seasons, and nutrient scenarios.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Left Column - Parameters */}
        <div className="space-y-6">
                     {/* Global Nutrients */}
           <Card>
             <CardHeader>
               <CardTitle>Global Nutrient Concentrations</CardTitle>
               <CardDescription>
                 Set ambient nutrient levels for the simulation
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               {Object.entries(nutrientValues).map(([nutrient, config]) => (
                 <div key={nutrient} className="space-y-2">
                   <div className="flex justify-between items-center">
                     <label 
                       htmlFor={`nutrient-${nutrient}`}
                       className="text-sm font-medium"
                     >
                       {nutrient}
                     </label>
                     <span 
                       className="text-sm text-muted-foreground"
                       aria-live="polite"
                       aria-label={`Current ${nutrient} value`}
                     >
                       {config.value} {config.unit}
                     </span>
                   </div>
                   <Slider
                     id={`nutrient-${nutrient}`}
                     value={[config.value]}
                     onValueChange={([value]) => updateNutrient(nutrient, value)}
                     min={config.min}
                     max={config.max}
                     step={config.step}
                     className="w-full"
                     aria-label={`Adjust ${nutrient} concentration from ${config.min} to ${config.max} ${config.unit}`}
                   />
                 </div>
               ))}
             </CardContent>
           </Card>

                     {/* Group Parameters */}
           <Card>
             <CardHeader>
               <CardTitle>Phytoplankton Group Parameters</CardTitle>
               <CardDescription>
                 Configure growth and nutrient uptake parameters for each group
               </CardDescription>
             </CardHeader>
             <CardContent>
               <Accordion type="single" collapsible className="w-full">
                 {groupParams.map((group, groupIndex) => (
                   <AccordionItem key={group.name} value={group.name}>
                     <AccordionTrigger 
                       className="text-sm"
                       aria-label={`Expand ${group.name} parameters`}
                     >
                       {group.name}
                     </AccordionTrigger>
                     <AccordionContent className="space-y-4">
                       {Object.entries(group.params).map(([paramName, config]) => (
                         <div key={paramName} className="space-y-2">
                           <div className="flex justify-between items-center">
                             <div>
                               <label 
                                 htmlFor={`${group.name}-${paramName}`}
                                 className="text-sm font-medium"
                               >
                                 {paramName}
                               </label>
                               <p className="text-xs text-muted-foreground">{config.description}</p>
                             </div>
                             <span 
                               className="text-sm text-muted-foreground"
                               aria-live="polite"
                               aria-label={`Current ${paramName} value`}
                             >
                               {config.value}
                             </span>
                           </div>
                           <Slider
                             id={`${group.name}-${paramName}`}
                             value={[config.value]}
                             onValueChange={([value]) => updateGroupParam(groupIndex, paramName, value)}
                             min={config.min}
                             max={config.max}
                             step={config.step}
                             className="w-full"
                             aria-label={`Adjust ${paramName} for ${group.name} from ${config.min} to ${config.max}`}
                           />
                         </div>
                       ))}
                     </AccordionContent>
                   </AccordionItem>
                 ))}
               </Accordion>
             </CardContent>
           </Card>

                     {/* Control Buttons */}
           <div className="flex gap-2" role="group" aria-label="Scenario controls">
             <Button 
               onClick={runScenario} 
               disabled={isRunning} 
               className="flex-1"
               aria-label={isRunning ? 'Running scenario simulation' : 'Run scenario simulation'}
             >
               <Play className="mr-2 h-4 w-4" />
               {isRunning ? 'Running...' : 'Run Scenario'}
             </Button>
             <Button 
               onClick={resetToDefaults} 
               variant="outline"
               aria-label="Reset all parameters to default values"
             >
               <RotateCcw className="mr-2 h-4 w-4" />
               Reset
             </Button>
             <Button 
               variant="outline" 
               onClick={exportScenario}
               aria-label="Export scenario data as JSON file"
             >
               <Download className="mr-2 h-4 w-4" />
               Export
             </Button>
           </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
                     {/* Results Chart */}
           <FigureFrame
             ref={modelResultsRef}
             title="Model Results"
             subtitle="12-month biomass simulation results"
             caption="Simulated biomass under current parameter set; % change vs baseline noted in legend."
             units="mmol P/m³"
             source="Lake Kinneret monitoring program"
             pageName="scenarios"
             figureKey="model-results"
             supportsSVG={true}
           >
             <div className="h-64 sm:h-80" role="img" aria-label="Phytoplankton biomass simulation chart showing monthly data for five groups">
               <LazyChart data={resultsData} colors={colors} height={320} />
             </div>
           </FigureFrame>

          {/* Delta vs Baseline */}
          <Card>
            <CardHeader>
              <CardTitle>Delta vs Baseline</CardTitle>
              <CardDescription>
                Changes from default parameter values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupParams.map((group, index) => (
                  <div key={group.name} className="flex justify-between items-center">
                    <span className="text-sm">{group.name}</span>
                    <div className="flex gap-1">
                      {Object.entries(group.params).map(([paramName, config]) => {
                        const original = groups[index]?.params[paramName as keyof typeof groups[0]['params']]?.value || 0
                        const delta = config.value - original
                        const isPositive = delta > 0
                        
                        if (Math.abs(delta) < 0.01) return null
                        
                        return (
                          <Badge 
                            key={paramName}
                            variant={isPositive ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {paramName}: {isPositive ? '+' : ''}{delta.toFixed(1)}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Dominance */}
          <Card>
            <CardHeader>
              <CardTitle>Dominant Group per Season</CardTitle>
              <CardDescription>
                Most abundant phytoplankton group by season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(seasonalDominance).map(([season, groups]) => (
                  <div key={season} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">{season}</h4>
                    <div className="flex flex-wrap gap-1">
                      {groups.map((group, index) => (
                        <Badge 
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}