// API structure for future server-side biomass model

export interface BiomassPredictionRequest {
  month: number // 1-12
  depth: number // meters
  env: {
    temperature: number // °C
    windSpeed: number // m/s
    windDirection: number // degrees
    light: number // 0-1
    phosphorus: number // mmol P/m³
    nitrogen: number // mmol N/m³
    silicon: number // mmol Si/m³
  }
  group: string // phytoplankton group ID
}

export interface BiomassPredictionResponse {
  grid: number[][] // 2D array of biomass values
  units: string // e.g., "mmol P/m³"
  metadata: {
    group: string
    month: number
    depth: number
    env: BiomassPredictionRequest['env']
    gridSize: { width: number, height: number }
    bounds: { minLng: number, maxLng: number, minLat: number, maxLat: number }
    timestamp: string
    modelVersion: string
  }
}

// Feature flag for server model
export const USE_SERVER_MODEL = false // Set to true to use server model

// Client-side model fallback
export async function predictBiomass(
  request: BiomassPredictionRequest
): Promise<BiomassPredictionResponse> {
  
  if (USE_SERVER_MODEL) {
    return await predictBiomassServer(request)
  } else {
    return await predictBiomassClient(request)
  }
}

// Server-side prediction (placeholder)
async function predictBiomassServer(
  request: BiomassPredictionRequest
): Promise<BiomassPredictionResponse> {
  
  try {
    const response = await fetch('/api/biomass/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Server prediction failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Validate response structure
    if (!result.grid || !Array.isArray(result.grid) || !result.units) {
      throw new Error('Invalid server response format')
    }

    return result as BiomassPredictionResponse

  } catch (error) {
    console.warn('Server prediction failed, falling back to client model:', error)
    return await predictBiomassClient(request)
  }
}

// Client-side prediction (current implementation)
async function predictBiomassClient(
  request: BiomassPredictionRequest
): Promise<BiomassPredictionResponse> {
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const { env, group, month, depth } = request
  
  // Import the client-side model
  const { generateBiomassHeatmap } = await import('@/lib/biomass/response')
  
  // Create environmental conditions object
  const environmentalConditions = {
    temperature: env.temperature,
    windSpeed: env.windSpeed,
    windDirection: env.windDirection,
    light: env.light,
    phosphorus: env.phosphorus,
    nitrogen: env.nitrogen,
    silicon: env.silicon,
    depth,
    month
  }
  
  // Generate biomass heatmap
  const grid = generateBiomassHeatmap(group, environmentalConditions, 50, 40)
  
  return {
    grid,
    units: 'mmol P/m³',
    metadata: {
      group,
      month,
      depth,
      env,
      gridSize: { width: 50, height: 40 },
      bounds: { minLng: 35.55, maxLng: 35.65, minLat: 32.65, maxLat: 32.95 },
      timestamp: new Date().toISOString(),
      modelVersion: 'client-v1.0'
    }
  }
}

// Batch prediction for multiple groups
export async function predictBiomassBatch(
  requests: BiomassPredictionRequest[]
): Promise<BiomassPredictionResponse[]> {
  
  const promises = requests.map(request => predictBiomass(request))
  return Promise.all(promises)
}

// Health check for server model
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    return response.ok
  } catch (error) {
    return false
  }
}

// Model performance metrics
export interface ModelMetrics {
  latency: number // milliseconds
  accuracy: number // 0-1
  throughput: number // predictions per second
  lastUpdated: string
}

export async function getModelMetrics(): Promise<ModelMetrics> {
  try {
    const response = await fetch('/api/model/metrics')
    
    if (!response.ok) {
      throw new Error('Failed to fetch model metrics')
    }
    
    return await response.json()
  } catch (error) {
    // Return default metrics for client model
    return {
      latency: 100,
      accuracy: 0.85,
      throughput: 10,
      lastUpdated: new Date().toISOString()
    }
  }
}

// Model configuration
export interface ModelConfig {
  useServerModel: boolean
  serverEndpoint: string
  timeout: number // milliseconds
  retryAttempts: number
  cacheEnabled: boolean
  cacheTimeout: number // milliseconds
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  useServerModel: USE_SERVER_MODEL,
  serverEndpoint: '/api/biomass/predict',
  timeout: 1000,
  retryAttempts: 3,
  cacheEnabled: true,
  cacheTimeout: 300000 // 5 minutes
}

// Update model configuration
export function updateModelConfig(config: Partial<ModelConfig>): void {
  Object.assign(DEFAULT_MODEL_CONFIG, config)
}
