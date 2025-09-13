import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, Line, BarChart, Bar } from 'recharts'
import { useDataStore } from '@/store/data-store'
import { Button } from '@/components/ui/button'
import { RAGChat } from '@/components/rag'

const colors = {
  diatoms: '#2563EB',
  dinoflagellates: '#10B981',
  small_phyto: '#F59E0B',
  n_fixers: '#EF4444',
  microcystis: '#8B5CF6',
}

// PCA calculation functions following lecture methodology
const standardizeData = (data: number[][]) => {
  const n = data.length
  
  // Calculate means and standard deviations
  const means = data[0].map((_, j) => 
    data.reduce((sum, row) => sum + row[j], 0) / n
  )
  
  const stds = data[0].map((_, j) => {
    const variance = data.reduce((sum, row) => sum + Math.pow(row[j] - means[j], 2), 0) / (n - 1)
    return Math.sqrt(variance)
  })
  
  // Standardize: z = (x - mean) / std
  return data.map(row => 
    row.map((val, j) => (val - means[j]) / stds[j])
  )
}

const calculateCovarianceMatrix = (standardizedData: number[][]) => {
  const n = standardizedData.length
  const p = standardizedData[0].length
  
  const cov = Array(p).fill(null).map(() => Array(p).fill(0))
  
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += standardizedData[k][i] * standardizedData[k][j]
      }
      cov[i][j] = sum / (n - 1)
    }
  }
  
  return cov
}

const calculateEigenvalues = (matrix: number[][]) => {
  // Simplified eigenvalue calculation for 2x2 matrix
  const a = matrix[0][0]
  const b = matrix[0][1]
  const c = matrix[1][0]
  const d = matrix[1][1]
  
  const trace = a + d
  const det = a * d - b * c
  
  const discriminant = trace * trace - 4 * det
  const sqrtDisc = Math.sqrt(discriminant)
  
  const lambda1 = (trace + sqrtDisc) / 2
  const lambda2 = (trace - sqrtDisc) / 2
  
  return [Math.max(lambda1, lambda2), Math.min(lambda1, lambda2)]
}

const calculateEigenvectors = (matrix: number[][], eigenvalues: number[]) => {
  const [lambda1, lambda2] = eigenvalues
  const eigenvectors = []
  
  // Calculate eigenvectors for each eigenvalue
  for (const lambda of [lambda1, lambda2]) {
    const a = matrix[0][0] - lambda
    const b = matrix[0][1]
    const c = matrix[1][0]
    const d = matrix[1][1] - lambda
    
    // Solve (A - λI)v = 0
    let v1, v2
    if (Math.abs(b) > 1e-10) {
      v1 = 1
      v2 = -a / b
    } else if (Math.abs(c) > 1e-10) {
      v1 = -d / c
      v2 = 1
    } else {
      v1 = 1
      v2 = 0
    }
    
    // Normalize
    const norm = Math.sqrt(v1 * v1 + v2 * v2)
    eigenvectors.push([v1 / norm, v2 / norm])
  }
  
  return eigenvectors
}

export function DashboardPage() {
  const { timeSeriesData } = useDataStore()
  const [pcaView, setPcaView] = useState<'biplot' | 'scree' | 'loadings'>('biplot')

  // Create ecological data matrix for PCA (sites × variables)
  const ecologicalData = useMemo(() => {
    // Group data by month to create "sites" (each month is a site)
    const monthlyData = timeSeriesData.reduce((acc, item) => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(item)
      return acc
    }, {} as Record<string, typeof timeSeriesData>)

    // Calculate monthly averages and create data matrix
    const sites = Object.keys(monthlyData).sort()
    const variables = ['diatoms', 'dinoflagellates', 'small_phyto', 'n_fixers', 'microcystis']
    
    const dataMatrix = sites.map(site => {
      const monthData = monthlyData[site]
      return variables.map(variable => {
        const values = monthData.map(item => item[variable as keyof typeof item]).filter(v => typeof v === 'number')
        return values.reduce((sum, val) => sum + val, 0) / values.length
      })
    })

    return { sites, variables, dataMatrix }
  }, [timeSeriesData])

  // Perform PCA analysis following lecture methodology
  const pcaResults = useMemo(() => {
    const { dataMatrix, variables } = ecologicalData
    
    if (dataMatrix.length < 2 || dataMatrix[0].length < 2) {
      return null
    }

    // Step 1: Standardize the data
    const standardizedData = standardizeData(dataMatrix)
    
    // Step 2: Calculate covariance matrix
    const covMatrix = calculateCovarianceMatrix(standardizedData)
    
    // Step 3: Calculate eigenvalues and eigenvectors
    const eigenvalues = calculateEigenvalues(covMatrix)
    const eigenvectors = calculateEigenvectors(covMatrix, eigenvalues)
    
    // Step 4: Calculate explained variance
    const totalVariance = eigenvalues.reduce((sum, val) => sum + val, 0)
    const explainedVariance = eigenvalues.map(val => val / totalVariance)
    
    // Step 5: Project data onto principal components
    const pcScores = standardizedData.map(row => [
      row[0] * eigenvectors[0][0] + row[1] * eigenvectors[0][1],
      row[0] * eigenvectors[1][0] + row[1] * eigenvectors[1][1]
    ])
    
    // Calculate loadings (correlation between variables and PCs)
    const loadings = variables.map((_, i) => [
      eigenvectors[0][i] * Math.sqrt(eigenvalues[0]),
      eigenvectors[1][i] * Math.sqrt(eigenvalues[1])
    ])

    return {
      pcScores,
      eigenvalues,
      explainedVariance,
      loadings,
      standardizedData
    }
  }, [ecologicalData])

  // Prepare data for visualizations
  const pcaData = useMemo(() => {
    if (!pcaResults) return []
    
    return ecologicalData.sites.map((site, index) => ({
      site,
      pc1: pcaResults.pcScores[index][0],
      pc2: pcaResults.pcScores[index][1],
      // Determine dominant group for coloring
      group: ecologicalData.variables.reduce((maxVar: number, _var: string, i: number) => 
        Math.abs(pcaResults.loadings[i][0]) > Math.abs(pcaResults.loadings[maxVar][0]) ? i : maxVar
      , 0)
    }))
  }, [pcaResults, ecologicalData])

  const screeData = useMemo(() => {
    if (!pcaResults) return []
    
    return pcaResults.eigenvalues.map((eigenvalue: number, index: number) => ({
      component: `PC${index + 1}`,
      eigenvalue,
      explainedVariance: pcaResults.explainedVariance[index] * 100,
      cumulative: pcaResults.explainedVariance.slice(0, index + 1).reduce((sum: number, val: number) => sum + val, 0) * 100
    }))
  }, [pcaResults])

  const loadingsData = useMemo(() => {
    if (!pcaResults) return []
    
    return ecologicalData.variables.map((variable: string, index: number) => ({
      variable,
      pc1: pcaResults.loadings[index][0],
      pc2: pcaResults.loadings[index][1],
      magnitude: Math.sqrt(pcaResults.loadings[index][0] ** 2 + pcaResults.loadings[index][1] ** 2)
    }))
  }, [pcaResults, ecologicalData])

  // Calculate statistics from actual data
  const calculateStats = (group: keyof typeof timeSeriesData[0]) => {
    const values = timeSeriesData.map((item: any) => item[group]).filter((v: any) => typeof v === 'number')
    const mean = values.reduce((sum: number, val: number) => sum + val, 0) / values.length
    const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    return { mean: mean.toFixed(2), stdDev: stdDev.toFixed(2) }
  }

  const diatomsStats = calculateStats('diatoms')
  const dinoflagellatesStats = calculateStats('dinoflagellates')
  const smallPhytoStats = calculateStats('small_phyto')
  const nFixersStats = calculateStats('n_fixers')
  const microcystisStats = calculateStats('microcystis')

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Interactive Kinneret biogeochemical insights — groups, seasons, and nutrient scenarios.
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Data Overview</TabsTrigger>
          <TabsTrigger value="rag">RAG Analysis</TabsTrigger>
          <TabsTrigger value="results">Model Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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

        <TabsContent value="rag" className="space-y-4">
          <RAGChat className="min-h-0" />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {/* PCA View Controls */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={pcaView === 'biplot' ? 'default' : 'outline'}
              onClick={() => setPcaView('biplot')}
              size="sm"
              className="px-3 sm:px-6 text-xs sm:text-sm"
            >
              Biplot
            </Button>
            <Button 
              variant={pcaView === 'scree' ? 'default' : 'outline'}
              onClick={() => setPcaView('scree')}
              size="sm"
              className="px-3 sm:px-6 text-xs sm:text-sm"
            >
              Scree Plot
            </Button>
            <Button 
              variant={pcaView === 'loadings' ? 'default' : 'outline'}
              onClick={() => setPcaView('loadings')}
              size="sm"
              className="px-3 sm:px-6 text-xs sm:text-sm"
            >
              Loadings
            </Button>
          </div>

          {/* PCA Biplot */}
          {pcaView === 'biplot' && (
            <div className="space-y-3">
              <div className="text-center">
                <h2 className="text-xl font-bold">PCA Biplot</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Principal component analysis of phytoplankton groups (PC1: {pcaResults?.explainedVariance[0] ? (pcaResults.explainedVariance[0] * 100).toFixed(1) : 0}%, PC2: {pcaResults?.explainedVariance[1] ? (pcaResults.explainedVariance[1] * 100).toFixed(1) : 0}%)
                </p>
                <p className="text-xs text-muted-foreground">
                  PCA biplot showing samples (points) and variables (arrows). Arrows indicate variable loadings on principal components.
                </p>
                <p className="text-xs text-muted-foreground">
                  Units: dimensionless | Based on research data from Lake Kinneret
                </p>
              </div>
              
              <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={pcaData} margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="pc1" 
                      name="PC1" 
                      label={{ value: 'PC1', position: 'insideBottom', offset: -10 }}
                      tick={{ fontSize: 12 }}
                      domain={[-3, 3]}
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="pc2" 
                      name="PC2" 
                      label={{ value: 'PC2', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                      domain={[-2, 2]}
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [value.toFixed(3), name]}
                      labelFormatter={(label) => `Site: ${label}`}
                    />
                    <Scatter dataKey="pc2" fill="#8884d8">
                      {pcaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(colors)[entry.group]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              {/* Variable loadings as arrows below the chart */}
              {pcaResults && (
                <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3">Variable Loadings (Arrows)</h4>
                  <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    {loadingsData.map((loading, index) => (
                      <div key={loading.variable} className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-4 h-0.5" 
                            style={{ backgroundColor: Object.values(colors)[index] }}
                          />
                          <div 
                            className="w-0 h-0 border-l-2 border-b-2 border-r-0 border-t-0"
                            style={{ 
                              borderLeftColor: Object.values(colors)[index],
                              borderBottomColor: Object.values(colors)[index],
                              transform: 'rotate(-45deg)',
                              width: '6px',
                              height: '6px'
                            }}
                          />
                        </div>
                        <span className="font-medium text-sm">{loading.variable}</span>
                        <span className="text-xs text-muted-foreground">
                          PC1: {loading.pc1.toFixed(2)}, PC2: {loading.pc2.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scree Plot */}
          {pcaView === 'scree' && (
            <div className="space-y-3">
              <div className="text-center">
                <h2 className="text-xl font-bold">Scree Plot</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Explained variance by principal components
                </p>
                <p className="text-xs text-muted-foreground">
                  Scree plot showing individual and cumulative explained variance for each principal component.
                </p>
                <p className="text-xs text-muted-foreground">
                  Units: % | Based on research data from Lake Kinneret
                </p>
              </div>
              
              <div className="h-[350px] sm:h-[400px] lg:h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={screeData} margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="component" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ value: 'Explained Variance (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                    />
                    <Bar dataKey="explainedVariance" fill="#3B82F6" />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Loadings Plot */}
          {pcaView === 'loadings' && (
            <div className="space-y-3">
              <div className="text-center">
                <h2 className="text-xl font-bold">Variable Loadings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Correlation between variables and principal components
                </p>
                <p className="text-xs text-muted-foreground">
                  Loadings plot showing how strongly each variable contributes to each principal component.
                </p>
                <p className="text-xs text-muted-foreground">
                  Units: dimensionless | Based on research data from Lake Kinneret
                </p>
              </div>
              
              <div className="h-[350px] sm:h-[400px] lg:h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={loadingsData} margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="pc1" 
                      name="PC1 Loading"
                      label={{ value: 'PC1 Loading', position: 'insideBottom', offset: -10 }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="pc2" 
                      name="PC2 Loading"
                      label={{ value: 'PC2 Loading', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [value.toFixed(3), name]}
                      labelFormatter={(label) => `Variable: ${label}`}
                    />
                    <Scatter dataKey="pc2" fill="#8884d8">
                      {loadingsData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(colors)[index]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* PCA Interpretation */}
          {pcaResults && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="text-base font-semibold mb-3">PCA Interpretation</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Ecological interpretation of principal component analysis results
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Explained Variance</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>PC1:</span>
                      <span className="font-medium">{(pcaResults.explainedVariance[0] * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PC2:</span>
                      <span className="font-medium">{(pcaResults.explainedVariance[1] * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold">{((pcaResults.explainedVariance[0] + pcaResults.explainedVariance[1]) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Variable Contributions</h4>
                  <div className="space-y-1 text-xs">
                    {loadingsData.map((loading) => (
                      <div key={loading.variable} className="flex justify-between">
                        <span className="font-medium">{loading.variable}:</span> 
                        <span>PC1: {loading.pc1.toFixed(2)}, PC2: {loading.pc2.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}